from datetime import datetime, timedelta, timezone
import jwt
from pwdlib import PasswordHash
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db import get_db
from app.models import User
password_hash=PasswordHash.recommended()
bearer=HTTPBearer(auto_error=False)
def hash_password(password:str)->str: return password_hash.hash(password)
def verify_password(password:str,hashed:str)->bool: return password_hash.verify(password,hashed)
def create_token(user:User)->str:
    now=datetime.now(timezone.utc)
    return jwt.encode({"sub":user.id,"roles":user.roles,"iat":now,"exp":now+timedelta(minutes=settings.access_token_minutes)},settings.jwt_secret,algorithm="HS256")
def current_user(credentials:HTTPAuthorizationCredentials|None=Depends(bearer),db:Session=Depends(get_db))->User:
    if not credentials: raise HTTPException(401,"Authentication required")
    try: payload=jwt.decode(credentials.credentials,settings.jwt_secret,algorithms=["HS256"]); user=db.get(User,payload.get("sub"))
    except jwt.PyJWTError: user=None
    if not user or user.status!="ACTIVE": raise HTTPException(401,"Invalid or expired access token")
    return user
def require_roles(*roles):
    def guard(user:User=Depends(current_user)):
        if not set(user.roles).intersection(roles): raise HTTPException(403,"You do not have permission to perform this action")
        return user
    return guard
