from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Any
class LoginIn(BaseModel): email: EmailStr; password: str = Field(min_length=8,max_length=128)
class UserOut(BaseModel): model_config=ConfigDict(from_attributes=True); id:str; name:str; email:str; roles:list[str]; status:str
class LoginOut(BaseModel): accessToken:str; tokenType:str="Bearer"; user:UserOut
class CourseIn(BaseModel): code:str=Field(min_length=2,max_length=30); title:str=Field(min_length=2,max_length=180); description:str=""; term:str="Fall 2026"
class AssignmentIn(BaseModel): title:str=Field(min_length=2,max_length=180); instructions:str=""; dueAt:str=""; maxScore:float=Field(gt=0,le=1000); topicTags:list[str]=[]; rubric:list[dict[str,Any]]=[]
class SubmissionIn(BaseModel): content:str=Field(default="",max_length=30000); fileUrl:str|None=None
class GradeIn(BaseModel): score:float=Field(ge=0,le=1000); feedback:str=Field(min_length=1,max_length=10000); publish:bool=True
class StatusIn(BaseModel): status:str
class InterventionIn(BaseModel): studentId:str; courseId:str; type:str; ownerId:str; dueAt:str=""; notes:str=""
class InterventionPatch(BaseModel): status:str|None=None; dueAt:str|None=None; notes:str|None=None; outcome:str|None=None
class UserIn(BaseModel): name:str=Field(min_length=2,max_length=120); email:EmailStr; password:str=Field(min_length=12,max_length=128); roles:list[str]; status:str="ACTIVE"
class AttendanceIn(BaseModel):
    studentId: str
    date: str = Field(min_length=8, max_length=20)
    status: str = Field(default="PRESENT")
    remarks: str = ""
class AttendanceBatchItem(BaseModel):
    studentId: str
    status: str = "PRESENT"
    remarks: str = ""
class AttendanceBatchIn(BaseModel):
    date: str = Field(min_length=8, max_length=20)
    records: list[AttendanceBatchItem]
class AttendancePatch(BaseModel):
    status: str | None = None
    remarks: str | None = None
