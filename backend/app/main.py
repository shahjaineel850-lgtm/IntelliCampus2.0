from datetime import datetime, timezone
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, Depends, HTTPException, Query, Response
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from sqlalchemy import select
from app.core.config import settings
from app.db import Base, engine, get_db
from app.models import User, Course, Assignment, Submission, Recommendation, Alert, Intervention, Attendance
from app.schemas import (
    LoginIn, LoginOut, CourseIn, AssignmentIn, SubmissionIn,
    GradeIn, StatusIn, InterventionIn, InterventionPatch, UserIn,
    AttendanceIn, AttendanceBatchIn, AttendancePatch
)
from app.security import hash_password, verify_password, create_token, current_user, require_roles

app=FastAPI(title="Aurora Classroom API",version="0.1.0",description="PS-04 academic collaboration prototype API")
origins=[x.strip() for x in settings.cors_origins.split(",") if x.strip()]
app.add_middleware(CORSMiddleware,allow_origins=origins,allow_credentials=True,allow_methods=["GET","POST","PATCH","OPTIONS"],allow_headers=["Authorization","Content-Type","Accept"])
Base.metadata.create_all(bind=engine)
ROLE_VALUES={"STUDENT","FACULTY","DEAN","ADMIN"}
def utcnow(): return datetime.now(timezone.utc).isoformat()
def paginate_items(items,page_num,page_size,total): return {"items":items,"page":page_num,"pageSize":page_size,"total":total}
def user_out(u): return {"id":u.id,"name":u.name,"email":u.email,"roles":u.roles,"status":u.status}
def course_out(c): return {"id":c.id,"code":c.code,"title":c.title,"description":c.description,"term":c.term,"facultyIds":c.faculty_ids or [],"studentIds":c.student_ids or []}
def assignment_out(a): return {"id":a.id,"courseId":a.course_id,"title":a.title,"instructions":a.instructions,"dueAt":a.due_at,"maxScore":a.max_score,"topicTags":a.topic_tags or [],"rubric":a.rubric or [],"status":a.status}
def submission_out(s): return {"id":s.id,"assignmentId":s.assignment_id,"studentId":s.student_id,"submittedAt":s.submitted_at,"status":s.status,"content":s.content,"fileUrl":s.file_url,"score":s.score,"feedback":s.feedback,"gradedAt":s.graded_at}
def attendance_out(a, student=None):
    return {
        "id": a.id,
        "courseId": a.course_id,
        "studentId": a.student_id,
        "studentName": student.name if student else None,
        "studentEmail": student.email if student else None,
        "date": a.date,
        "status": a.status,
        "remarks": a.remarks or "",
        "recordedBy": a.recorded_by,
        "createdAt": a.created_at
    }
def can_access_course(user,course):
    if not course: return False
    roles = set(user.roles if isinstance(user.roles, list) else [])
    if "ADMIN" in roles or "DEAN" in roles: return True
    if "FACULTY" in roles and user.id in (course.faculty_ids or []): return True
    if "STUDENT" in roles and user.id in (course.student_ids or []): return True
    return False

def seed_if_demo():
    if not settings.demo_mode: return
    with next(get_db()) as db:
        if db.scalar(select(User.id).limit(1)): return
        faculty=User(name="Ananya Shah",email="faculty@aurora.demo",password_hash=hash_password("FacultyDemo2026!"),roles=["FACULTY"])
        student=User(name="Jaineel Shah",email="student@aurora.demo",password_hash=hash_password("StudentDemo2026!"),roles=["STUDENT"])
        dean=User(name="Dr. Mehta",email="dean@aurora.demo",password_hash=hash_password("DeanDemo2026!"),roles=["DEAN"])
        admin=User(name="Platform Admin",email="admin@aurora.demo",password_hash=hash_password("AdminDemo2026!"),roles=["ADMIN"])
        db.add_all([faculty,student,dean,admin]); db.flush()
        course=Course(code="CS204",title="Data Structures & Algorithms",description="Algorithm design, complexity, and problem solving.",term="Fall 2026",faculty_ids=[faculty.id],student_ids=[student.id]); db.add(course); db.flush()
        assignments = []
        for i, title in enumerate(["Algorithm Complexity Quiz", "Divide & Conquer Lab", "Dynamic Programming Problem Set"]):
            a = Assignment(course_id=course.id, title=title, instructions="Course assignment instructions and criteria.", due_at=f"2026-10-{5+i*2:02d}T23:59:00Z", max_score=100, topic_tags=["Algorithm Complexity", "Dynamic Programming"], rubric=[{"criterion": "Reasoning", "points": 50}, {"criterion": "Correctness", "points": 50}])
            db.add(a)
            assignments.append(a)
        db.flush()
        for i, a in enumerate(assignments):
            db.add(Submission(assignment_id=a.id, student_id=student.id, submitted_at=f"2026-10-{7+i*2:02d}T12:00:00Z", status="LATE", content=f"Demo submission for {a.title}"))
        db.add(Recommendation(student_id=student.id,course_id=course.id,title="Memoization micro-modules and targeted practice",reason="Recent assessment evidence suggests more practice may help.",topic="Dynamic Programming",practice_items=["Review memoization worked example","Complete three targeted questions"],status="NEW"))
        db.add(Alert(course_id=course.id,student_id=student.id,type="REPEATED_LATE_SUBMISSION",severity="HIGH",title="Consider a one-to-one tutoring check-in",description="Three consecutive late assignments and a 52% Algorithm Complexity score.",evidence=["assessmentScore:52%","consecutiveLateAssignments:3","topics: Dynamic Programming, Graph Theory"]))
        db.add(Intervention(student_id=student.id,course_id=course.id,type="TUTORING",owner_id=faculty.id,due_at="2026-10-16T12:00:00Z",status="PLANNED",notes="Discuss algorithms study plan and time management."))
        db.commit()
try: seed_if_demo()
except Exception: pass

@app.get("/health")
def health(): return {"status":"ok","service":"aurora-classroom-api"}
@app.post("/api/v1/auth/login",response_model=LoginOut)
def login(payload:LoginIn,db:Session=Depends(get_db)):
    user=db.scalar(select(User).where(User.email==payload.email.lower().strip()))
    if not user or not verify_password(payload.password,user.password_hash): raise HTTPException(401,"Invalid email or password")
    if user.status!="ACTIVE": raise HTTPException(403,"Your account is suspended. Please contact platform administration.")
    return {"accessToken":create_token(user),"tokenType":"Bearer","user":user_out(user)}
@app.post("/api/v1/auth/refresh")
def refresh(): raise HTTPException(501,"Refresh sessions are not configured in this prototype; sign in again.")
@app.post("/api/v1/auth/logout",status_code=204)
def logout(user:User=Depends(current_user)): return Response(status_code=204)
@app.get("/api/v1/auth/me")
def me(user:User=Depends(current_user)): return user_out(user)

@app.get("/api/v1/courses")
def list_courses(page:int=Query(1,ge=1),pageSize:int=Query(100,ge=1,le=1000),db:Session=Depends(get_db),user:User=Depends(current_user)):
    rows=list(db.scalars(select(Course).order_by(Course.code)).all()); rows=[c for c in rows if can_access_course(user,c)]
    return page_fn(rows,page,pageSize,course_out)
def page_fn(rows,page_num,page_size,serializer): return paginate_items([serializer(x) for x in rows[(page_num-1)*page_size:page_num*page_size]],page_num,page_size,len(rows))
@app.post("/api/v1/courses")
def create_course(payload:CourseIn,db:Session=Depends(get_db),user:User=Depends(require_roles("ADMIN","DEAN"))):
    c=Course(code=payload.code.strip().upper(),title=payload.title.strip(),description=payload.description,term=payload.term,faculty_ids=[]); db.add(c); db.commit(); db.refresh(c); return course_out(c)
@app.get("/api/v1/courses/{courseId}")
def get_course(courseId:str,db:Session=Depends(get_db),user:User=Depends(current_user)):
    c=db.get(Course,courseId)
    if not c: raise HTTPException(404,"Course not found")
    if not can_access_course(user,c): raise HTTPException(403,"Course access denied")
    return course_out(c)
@app.patch("/api/v1/courses/{courseId}")
def patch_course(courseId:str,payload:dict,db:Session=Depends(get_db),user:User=Depends(require_roles("ADMIN","DEAN","FACULTY"))):
    c=db.get(Course,courseId)
    if not c: raise HTTPException(404,"Course not found")
    if "FACULTY" in user.roles and user.id not in (c.faculty_ids or []): raise HTTPException(403,"Course access denied")
    for key,attr in [("title","title"),("description","description"),("term","term")]:
        if key in payload: setattr(c,attr,str(payload[key])[:1000])
    db.commit();db.refresh(c);return course_out(c)

@app.get("/api/v1/courses/{courseId}/assignments")
def list_assignments(courseId:str,page:int=Query(1,ge=1),pageSize:int=Query(100,ge=1,le=1000),db:Session=Depends(get_db),user:User=Depends(current_user)):
    c=db.get(Course,courseId)
    if not c: raise HTTPException(404,"Course not found")
    if not can_access_course(user,c): raise HTTPException(403,"Course access denied")
    rows=list(db.scalars(select(Assignment).where(Assignment.course_id==courseId)).all());return paginate_items([assignment_out(a) for a in rows[(page-1)*pageSize:page*pageSize]],page,pageSize,len(rows))
@app.post("/api/v1/courses/{courseId}/assignments")
def create_assignment(courseId:str,payload:AssignmentIn,db:Session=Depends(get_db),user:User=Depends(require_roles("FACULTY","ADMIN"))):
    c=db.get(Course,courseId)
    if not c: raise HTTPException(404,"Course not found")
    if "ADMIN" not in user.roles and user.id not in (c.faculty_ids or []): raise HTTPException(403,"Course access denied")
    a=Assignment(course_id=courseId,title=payload.title.strip(),instructions=payload.instructions,due_at=payload.dueAt,max_score=payload.maxScore,topic_tags=payload.topicTags,rubric=payload.rubric);db.add(a);db.commit();db.refresh(a);return assignment_out(a)
@app.get("/api/v1/assignments/{assignmentId}")
def get_assignment(assignmentId:str,db:Session=Depends(get_db),user:User=Depends(current_user)):
    a=db.get(Assignment,assignmentId)
    if not a: raise HTTPException(404,"Assignment not found")
    c=db.get(Course,a.course_id)
    if not c or not can_access_course(user,c): raise HTTPException(403,"Assignment access denied")
    return assignment_out(a)
@app.get("/api/v1/assignments/{assignmentId}/submissions")
def list_submissions(assignmentId:str,db:Session=Depends(get_db),user:User=Depends(current_user)):
    a=db.get(Assignment,assignmentId)
    if not a: raise HTTPException(404,"Assignment not found")
    c=db.get(Course,a.course_id)
    if not c or not can_access_course(user,c): raise HTTPException(403,"Assignment access denied")
    rows=list(db.scalars(select(Submission).where(Submission.assignment_id==assignmentId)).all())
    if "STUDENT" in user.roles and "FACULTY" not in user.roles: rows=[s for s in rows if s.student_id==user.id]
    return paginate_items([submission_out(s) for s in rows],1,max(1,len(rows)),len(rows))
@app.get("/api/v1/submissions")
def list_all_submissions(courseId:str|None=None,page:int=Query(1,ge=1),pageSize:int=Query(100,ge=1,le=1000),db:Session=Depends(get_db),user:User=Depends(current_user)):
    stmt=select(Submission)
    if "STUDENT" in user.roles and "FACULTY" not in user.roles:
        stmt=stmt.where(Submission.student_id==user.id)
    if courseId:
        stmt=stmt.join(Assignment,Submission.assignment_id==Assignment.id).where(Assignment.course_id==courseId)
    rows=list(db.scalars(stmt.order_by(Submission.submitted_at.desc())).all())
    return paginate_items([submission_out(s) for s in rows[(page-1)*pageSize:page*pageSize]],page,pageSize,len(rows))
@app.post("/api/v1/assignments/{assignmentId}/submissions")
def submit_assignment(assignmentId:str,payload:SubmissionIn,db:Session=Depends(get_db),user:User=Depends(require_roles("STUDENT"))):
    a=db.get(Assignment,assignmentId)
    if not a: raise HTTPException(404,"Assignment not found")
    c=db.get(Course,a.course_id)
    if not c or user.id not in (c.student_ids or []): raise HTTPException(403,"Course membership required")
    existing=db.scalar(select(Submission).where(Submission.assignment_id==assignmentId,Submission.student_id==user.id))
    if existing: raise HTTPException(409,"A submission already exists; revision workflow is not enabled")
    if payload.fileUrl and not payload.fileUrl.startswith("https://"): raise HTTPException(422,"Only HTTPS file URLs are accepted")
    s=Submission(assignment_id=assignmentId,student_id=user.id,submitted_at=utcnow(),status="SUBMITTED",content=payload.content,file_url=payload.fileUrl);db.add(s);db.commit();db.refresh(s);return submission_out(s)
@app.get("/api/v1/submissions/{submissionId}")
def get_submission(submissionId:str,db:Session=Depends(get_db),user:User=Depends(current_user)):
    s=db.get(Submission,submissionId)
    if not s: raise HTTPException(404,"Submission not found")
    a=db.get(Assignment,s.assignment_id)
    if not a: raise HTTPException(404,"Assignment not found")
    c=db.get(Course,a.course_id)
    if user.id!=s.student_id and (not c or not ("ADMIN" in user.roles or "DEAN" in user.roles or ("FACULTY" in user.roles and user.id in (c.faculty_ids or [])))): raise HTTPException(403,"Submission access denied")
    return submission_out(s)
@app.patch("/api/v1/submissions/{submissionId}/grade")
def grade_submission(submissionId:str,payload:GradeIn,db:Session=Depends(get_db),user:User=Depends(require_roles("FACULTY","ADMIN"))):
    s=db.get(Submission,submissionId)
    if not s: raise HTTPException(404,"Submission not found")
    a=db.get(Assignment,s.assignment_id)
    if not a: raise HTTPException(404,"Assignment not found")
    c=db.get(Course,a.course_id)
    if not c or ("ADMIN" not in user.roles and user.id not in (c.faculty_ids or [])): raise HTTPException(403,"Course access denied")
    if payload.score>a.max_score: raise HTTPException(422,"Score cannot exceed assignment maximum")
    s.score=payload.score;s.feedback=payload.feedback;s.graded_at=utcnow() if payload.publish else None;s.status="GRADED" if payload.publish else "DRAFT_FEEDBACK";db.commit();db.refresh(s);return submission_out(s)

@app.get("/api/v1/recommendations")
def recommendations(db:Session=Depends(get_db),user:User=Depends(current_user)):
    stmt=select(Recommendation)
    roles=set(user.roles if isinstance(user.roles, list) else [])
    if "STUDENT" in roles and "FACULTY" not in roles: stmt=stmt.where(Recommendation.student_id==user.id)
    elif "FACULTY" in roles and "ADMIN" not in roles and "DEAN" not in roles:
        courses=list(db.scalars(select(Course)).all())
        user_cids=[c.id for c in courses if user.id in (c.faculty_ids or [])]
        stmt=stmt.where(Recommendation.course_id.in_(user_cids)) if user_cids else stmt.where(Recommendation.id=="__none__")
    rows=db.scalars(stmt).all()
    return [{"id":r.id,"studentId":r.student_id,"courseId":r.course_id,"title":r.title,"reason":r.reason,"topic":r.topic,"resourceIds":r.resource_ids,"practiceItems":r.practice_items,"status":r.status,"createdAt":r.created_at} for r in rows]
@app.post("/api/v1/recommendations/{recommendationId}/status")
def recommendation_status(recommendationId:str,payload:StatusIn,db:Session=Depends(get_db),user:User=Depends(current_user)):
    if payload.status not in {"IN_PROGRESS","COMPLETED","DISMISSED"}: raise HTTPException(422,"Unsupported recommendation status")
    r=db.get(Recommendation,recommendationId)
    if not r: raise HTTPException(404,"Recommendation not found")
    if r.student_id!=user.id and not set(user.roles).intersection({"FACULTY","ADMIN"}): raise HTTPException(403,"Recommendation access denied")
    r.status=payload.status;db.commit();return {"id":r.id,"status":r.status}
@app.get("/api/v1/alerts")
def alerts(db:Session=Depends(get_db),user:User=Depends(current_user)):
    stmt=select(Alert)
    roles=set(user.roles if isinstance(user.roles, list) else [])
    if "STUDENT" in roles and "FACULTY" not in roles: stmt=stmt.where(Alert.student_id==user.id)
    elif "FACULTY" in roles and "ADMIN" not in roles and "DEAN" not in roles:
        courses=list(db.scalars(select(Course)).all())
        user_cids=[c.id for c in courses if user.id in (c.faculty_ids or [])]
        stmt=stmt.where(Alert.course_id.in_(user_cids)) if user_cids else stmt.where(Alert.id=="__none__")
    rows=db.scalars(stmt).all()
    return [{"id":a.id,"courseId":a.course_id,"studentId":a.student_id,"type":a.type,"severity":a.severity,"title":a.title,"description":a.description,"evidence":a.evidence,"createdAt":a.created_at,"acknowledgedAt":a.acknowledged_at} for a in rows]
@app.post("/api/v1/alerts/{alertId}/acknowledge")
def acknowledge_alert(alertId:str,db:Session=Depends(get_db),user:User=Depends(require_roles("FACULTY","DEAN","ADMIN"))):
    a=db.get(Alert,alertId)
    if not a: raise HTTPException(404,"Alert not found")
    c=db.get(Course,a.course_id)
    if "ADMIN" not in user.roles and "DEAN" not in user.roles and (not c or user.id not in (c.faculty_ids or [])): raise HTTPException(403,"Alert access denied")
    if not a.acknowledged_at: a.acknowledged_at=utcnow();a.acknowledged_by=user.id;db.commit()
    return {"id":a.id,"acknowledgedAt":a.acknowledged_at}
@app.get("/api/v1/interventions")
def interventions(db:Session=Depends(get_db),user:User=Depends(current_user)):
    stmt=select(Intervention)
    roles=set(user.roles if isinstance(user.roles, list) else [])
    if "STUDENT" in roles and "FACULTY" not in roles: stmt=stmt.where(Intervention.student_id==user.id)
    elif "FACULTY" in roles and "ADMIN" not in roles and "DEAN" not in roles:
        courses=list(db.scalars(select(Course)).all())
        user_cids=[c.id for c in courses if user.id in (c.faculty_ids or [])]
        stmt=stmt.where(Intervention.course_id.in_(user_cids)) if user_cids else stmt.where(Intervention.id=="__none__")
    rows=db.scalars(stmt).all()
    return [{"id":i.id,"studentId":i.student_id,"courseId":i.course_id,"type":i.type,"ownerId":i.owner_id,"dueAt":i.due_at,"status":i.status,"notes":i.notes,"outcome":i.outcome,"createdAt":i.created_at} for i in rows]
@app.post("/api/v1/interventions")
def create_intervention(payload:InterventionIn,db:Session=Depends(get_db),user:User=Depends(require_roles("FACULTY","ADMIN"))):
    c=db.get(Course,payload.courseId); student=db.get(User,payload.studentId); owner=db.get(User,payload.ownerId)
    if not c or not student or not owner: raise HTTPException(404,"Course, student, or owner not found")
    if "ADMIN" not in user.roles and user.id not in (c.faculty_ids or []): raise HTTPException(403,"Course access denied")
    if "STUDENT" not in student.roles: raise HTTPException(422,"Intervention target must be a student")
    i=Intervention(student_id=payload.studentId,course_id=payload.courseId,type=payload.type,owner_id=payload.ownerId,due_at=payload.dueAt,notes=payload.notes);db.add(i);db.commit();db.refresh(i);return {"id":i.id,"studentId":i.student_id,"courseId":i.course_id,"type":i.type,"ownerId":i.owner_id,"dueAt":i.due_at,"status":i.status,"notes":i.notes,"outcome":i.outcome,"createdAt":i.created_at}
@app.patch("/api/v1/interventions/{interventionId}")
def patch_intervention(interventionId:str,payload:InterventionPatch,db:Session=Depends(get_db),user:User=Depends(require_roles("FACULTY","ADMIN"))):
    i=db.get(Intervention,interventionId)
    if not i: raise HTTPException(404,"Intervention not found")
    c=db.get(Course,i.course_id)
    if "ADMIN" not in user.roles and (not c or user.id not in (c.faculty_ids or [])): raise HTTPException(403,"Intervention access denied")
    data=payload.model_dump(exclude_unset=True)
    if "status" in data and data["status"] not in {"PLANNED","IN_PROGRESS","COMPLETED","CANCELLED"}: raise HTTPException(422,"Unsupported intervention status")
    for key,value in data.items():
        attr_name = "due_at" if key == "dueAt" else str(key)
        setattr(i, attr_name, value)
    db.commit();db.refresh(i);return {"id":i.id,"studentId":i.student_id,"courseId":i.course_id,"type":i.type,"ownerId":i.owner_id,"dueAt":i.due_at,"status":i.status,"notes":i.notes,"outcome":i.outcome,"createdAt":i.created_at}

@app.get("/api/v1/admin/users")
def admin_users(page_num:int=Query(1,alias="page",ge=1),page_size:int=Query(100,alias="pageSize",ge=1,le=1000),db:Session=Depends(get_db),user:User=Depends(require_roles("ADMIN"))):
    rows=list(db.scalars(select(User).order_by(User.name)).all());return paginate_items([user_out(u) for u in rows[(page_num-1)*page_size:page_num*page_size]],page_num,page_size,len(rows))
@app.post("/api/v1/admin/users")
def create_user(payload:UserIn,db:Session=Depends(get_db),user:User=Depends(require_roles("ADMIN"))):
    roles=set(payload.roles)
    if not roles or not roles.issubset(ROLE_VALUES): raise HTTPException(422,"One or more roles are invalid")
    email=payload.email.lower().strip()
    if db.scalar(select(User.id).where(User.email==email)): raise HTTPException(409,"Email already exists")
    u=User(name=payload.name.strip(),email=email,password_hash=hash_password(payload.password),roles=sorted(roles),status=payload.status);db.add(u);db.commit();db.refresh(u);return user_out(u)
@app.patch("/api/v1/admin/users/{userId}")
def patch_user(userId:str,payload:dict,db:Session=Depends(get_db),user:User=Depends(require_roles("ADMIN"))):
    u=db.get(User,userId)
    if not u: raise HTTPException(404,"User not found")
    if "roles" in payload:
        roles=set(payload["roles"])
        if not roles or not roles.issubset(ROLE_VALUES): raise HTTPException(422,"One or more roles are invalid")
        u.roles=sorted(roles)
    if "status" in payload:
        if payload["status"] not in {"ACTIVE","SUSPENDED"}: raise HTTPException(422,"Invalid status")
        u.status=payload["status"]
    if "name" in payload: u.name=str(payload["name"])[:120]
    db.commit();db.refresh(u);return user_out(u)

# Explicit prototype placeholders preserve the documented routes while returning a clear response.
@app.get("/api/v1/courses/{courseId}/resources")
def list_resources(courseId:str,db:Session=Depends(get_db),user:User=Depends(current_user)):
    c=db.get(Course,courseId)
    if not c: raise HTTPException(404,"Course not found")
    if not can_access_course(user,c): raise HTTPException(403,"Course access denied")
    return paginate_items([],1,20,0)
@app.post("/api/v1/courses/{courseId}/resources")
def create_resource(courseId:str,user:User=Depends(require_roles("FACULTY","ADMIN"))): raise HTTPException(501,"Resource persistence is not enabled in this prototype")
@app.get("/api/v1/courses/{courseId}/assessments")
def assessments(courseId:str,user:User=Depends(current_user)): return paginate_items([],1,20,0)
@app.post("/api/v1/courses/{courseId}/assessments")
def create_assessment(courseId:str,user:User=Depends(require_roles("FACULTY","ADMIN"))): raise HTTPException(501,"Assessment persistence is not enabled in this prototype")
@app.get("/api/v1/assessments/{assessmentId}/results")
def assessment_results(assessmentId:str,user:User=Depends(current_user)): return paginate_items([],1,20,0)
@app.get("/api/v1/analytics/me")
def analytics_me(user:User=Depends(current_user)): return {"userId":user.id,"courseProgress":74,"topicScores":[{"topic":"Algorithm Complexity","score":52,"evidenceCount":1,"updatedAt":utcnow()}],"note":"Prototype summary; full event-derived analytics is not enabled."}
@app.get("/api/v1/courses/{courseId}/analytics")
def course_analytics(courseId:str,user:User=Depends(require_roles("FACULTY","DEAN","ADMIN"))): return {"courseId":courseId,"enrollment":1,"completionRate":86,"riskDistribution":{"LOW":8,"MEDIUM":3,"HIGH":1},"note":"Aggregate prototype values; connect analytics service for live derivation."}
@app.get("/api/v1/courses/{courseId}/students/{studentId}/insights")
def student_insights(courseId:str,studentId:str,user:User=Depends(require_roles("FACULTY","DEAN","ADMIN"))): return {"studentId":studentId,"courseId":courseId,"riskLevel":"HIGH","riskScore":78,"indicators":[{"code":"ASSESSMENT_LOW","label":"Algorithm Complexity score","value":"52%","weight":0.4,"contribution":21,"window":"latest assessment","evidence":["Algorithm Complexity Quiz"],"description":"Assessment score is below the review threshold."},{"code":"LATE_STREAK","label":"Consecutive late assignments","value":3,"weight":0.35,"contribution":35,"window":"last 3 assignments","evidence":["Submission history"],"description":"Three consecutive assignments were submitted late."}],"topicScores":[{"topic":"Dynamic Programming","score":48,"evidenceCount":2,"updatedAt":utcnow()},{"topic":"Graph Theory","score":55,"evidenceCount":2,"updatedAt":utcnow()}],"engagementTrend":[],"updatedAt":utcnow(),"method":"Illustrative rule-based prototype; review context before acting."}
@app.get("/api/v1/announcements")
def announcements(user:User=Depends(current_user)): return paginate_items([],1,20,0)
@app.post("/api/v1/announcements")
def create_announcement(user:User=Depends(require_roles("FACULTY","ADMIN"))): raise HTTPException(501,"Announcement persistence is not enabled in this prototype")

# ── ATTENDANCE FEATURE ────────────────────────────────────────────────────────
@app.get("/api/v1/courses/{courseId}/attendance")
def get_course_attendance(
    courseId: str,
    date: str | None = None,
    studentId: str | None = None,
    status: str | None = None,
    page: int = Query(1, ge=1),
    pageSize: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    user: User = Depends(current_user)
):
    c = db.get(Course, courseId)
    if not c: raise HTTPException(404, "Course not found")
    if not can_access_course(user, c): raise HTTPException(403, "Course access denied")

    stmt = select(Attendance).where(Attendance.course_id == courseId)
    roles = set(user.roles if isinstance(user.roles, list) else [])
    if "STUDENT" in roles and "FACULTY" not in roles and "ADMIN" not in roles and "DEAN" not in roles:
        stmt = stmt.where(Attendance.student_id == user.id)
    elif studentId:
        stmt = stmt.where(Attendance.student_id == studentId)

    if date:
        stmt = stmt.where(Attendance.date == date)
    if status:
        stmt = stmt.where(Attendance.status == status.upper())

    all_rows = list(db.scalars(stmt.order_by(Attendance.date.desc(), Attendance.created_at.desc())).all())

    # Compute comprehensive attendance statistics
    total_records = len(all_rows)
    present_cnt = sum(1 for r in all_rows if r.status == "PRESENT")
    late_cnt = sum(1 for r in all_rows if r.status == "LATE")
    absent_cnt = sum(1 for r in all_rows if r.status == "ABSENT")
    excused_cnt = sum(1 for r in all_rows if r.status == "EXCUSED")
    attendance_rate = round(((present_cnt + (late_cnt * 0.5)) / max(1, total_records)) * 100, 1) if total_records > 0 else 100.0

    unique_dates = sorted(list(set(r.date for r in all_rows)), reverse=True)
    stats = {
        "totalRecords": total_records,
        "totalSessions": len(unique_dates),
        "present": present_cnt,
        "late": late_cnt,
        "absent": absent_cnt,
        "excused": excused_cnt,
        "attendanceRate": attendance_rate,
        "dates": unique_dates[:15]
    }

    # Slice for requested page
    paged = all_rows[(page - 1) * pageSize : page * pageSize]

    # Batch load student user metadata to populate studentName and email
    student_ids = {r.student_id for r in paged}
    student_map = {}
    if student_ids:
        st_rows = db.scalars(select(User).where(User.id.in_(student_ids))).all()
        student_map = {s.id: s for s in st_rows}

    items = [attendance_out(r, student_map.get(r.student_id)) for r in paged]
    res = paginate_items(items, page, pageSize, total_records)
    res["stats"] = stats
    return res

@app.post("/api/v1/courses/{courseId}/attendance")
def record_attendance(
    courseId: str,
    payload: AttendanceIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("FACULTY", "ADMIN", "DEAN"))
):
    c = db.get(Course, courseId)
    if not c: raise HTTPException(404, "Course not found")
    if "ADMIN" not in user.roles and "DEAN" not in user.roles and user.id not in (c.faculty_ids or []):
        raise HTTPException(403, "Course access denied")

    target_student = db.get(User, payload.studentId)
    if not target_student: raise HTTPException(404, "Student not found")

    valid_status = {"PRESENT", "ABSENT", "LATE", "EXCUSED"}
    status = payload.status.upper()
    if status not in valid_status:
        raise HTTPException(422, f"Invalid status '{payload.status}'. Must be one of {valid_status}")

    # Upsert attendance record for date
    existing = db.scalar(
        select(Attendance).where(
            Attendance.course_id == courseId,
            Attendance.student_id == payload.studentId,
            Attendance.date == payload.date
        )
    )
    if existing:
        existing.status = status
        existing.remarks = payload.remarks
        existing.recorded_by = user.id
        db.commit()
        db.refresh(existing)
        return attendance_out(existing, target_student)

    rec = Attendance(
        course_id=courseId,
        student_id=payload.studentId,
        date=payload.date,
        status=status,
        remarks=payload.remarks,
        recorded_by=user.id
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return attendance_out(rec, target_student)

@app.post("/api/v1/courses/{courseId}/attendance/batch")
def record_batch_attendance(
    courseId: str,
    payload: AttendanceBatchIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("FACULTY", "ADMIN", "DEAN"))
):
    c = db.get(Course, courseId)
    if not c: raise HTTPException(404, "Course not found")
    if "ADMIN" not in user.roles and "DEAN" not in user.roles and user.id not in (c.faculty_ids or []):
        raise HTTPException(403, "Course access denied")

    valid_status = {"PRESENT", "ABSENT", "LATE", "EXCUSED"}
    updated = 0
    created = 0
    for item in payload.records:
        st = item.status.upper()
        if st not in valid_status: continue
        existing = db.scalar(
            select(Attendance).where(
                Attendance.course_id == courseId,
                Attendance.student_id == item.studentId,
                Attendance.date == payload.date
            )
        )
        if existing:
            existing.status = st
            existing.remarks = item.remarks
            existing.recorded_by = user.id
            updated += 1
        else:
            rec = Attendance(
                course_id=courseId,
                student_id=item.studentId,
                date=payload.date,
                status=st,
                remarks=item.remarks,
                recorded_by=user.id
            )
            db.add(rec)
            created += 1
    db.commit()
    return {"status": "ok", "date": payload.date, "created": created, "updated": updated, "total": created + updated}

@app.patch("/api/v1/attendance/{attendanceId}")
def patch_attendance(
    attendanceId: str,
    payload: AttendancePatch,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("FACULTY", "ADMIN", "DEAN"))
):
    rec = db.get(Attendance, attendanceId)
    if not rec: raise HTTPException(404, "Attendance record not found")
    c = db.get(Course, rec.course_id)
    if "ADMIN" not in user.roles and "DEAN" not in user.roles and (not c or user.id not in (c.faculty_ids or [])):
        raise HTTPException(403, "Course access denied")

    if payload.status is not None:
        st = payload.status.upper()
        if st not in {"PRESENT", "ABSENT", "LATE", "EXCUSED"}:
            raise HTTPException(422, "Invalid attendance status")
        rec.status = st
    if payload.remarks is not None:
        rec.remarks = payload.remarks
    rec.recorded_by = user.id
    db.commit()
    db.refresh(rec)
    student = db.get(User, rec.student_id)
    return attendance_out(rec, student)

@app.get("/api/v1/attendance/summary")
def attendance_summary(db: Session = Depends(get_db), user: User = Depends(current_user)):
    roles = set(user.roles if isinstance(user.roles, list) else [])
    if "STUDENT" in roles and "FACULTY" not in roles and "ADMIN" not in roles and "DEAN" not in roles:
        records = list(db.scalars(select(Attendance).where(Attendance.student_id == user.id)).all())
        total = len(records)
        present = sum(1 for r in records if r.status == "PRESENT")
        late = sum(1 for r in records if r.status == "LATE")
        absent = sum(1 for r in records if r.status == "ABSENT")
        excused = sum(1 for r in records if r.status == "EXCUSED")
        rate = round(((present + (late * 0.5)) / max(1, total)) * 100, 1) if total > 0 else 100.0
        return {
            "overallRate": rate,
            "totalSessions": total,
            "present": present,
            "late": late,
            "absent": absent,
            "excused": excused,
        }
    else:
        all_courses = list(db.scalars(select(Course)).all())
        courses = [c for c in all_courses if can_access_course(user, c)]
        course_ids = [c.id for c in courses]
        records = list(db.scalars(select(Attendance).where(Attendance.course_id.in_(course_ids))).all()) if course_ids else []
        total = len(records)
        present = sum(1 for r in records if r.status == "PRESENT")
        late = sum(1 for r in records if r.status == "LATE")
        absent = sum(1 for r in records if r.status == "ABSENT")
        excused = sum(1 for r in records if r.status == "EXCUSED")
        rate = round(((present + (late * 0.5)) / max(1, total)) * 100, 1) if total > 0 else 100.0
        return {
            "overallRate": rate,
            "totalSessions": len(set(r.date for r in records)),
            "totalRecords": total,
            "present": present,
            "late": late,
            "absent": absent,
            "excused": excused,
        }
