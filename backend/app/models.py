import uuid
from datetime import datetime, timezone
from typing import Optional
# pyrefly: ignore [missing-import]
from sqlalchemy import String, DateTime, ForeignKey, Text, Float, JSON, UniqueConstraint
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped, mapped_column
from app.db import Base

def uid(): return str(uuid.uuid4())
def now(): return datetime.now(timezone.utc)
class User(Base):
    __tablename__="users"
    id: Mapped[str]=mapped_column(String(36),primary_key=True,default=uid)
    name: Mapped[str]=mapped_column(String(120))
    email: Mapped[str]=mapped_column(String(254),unique=True,index=True)
    password_hash: Mapped[str]=mapped_column(String(255))
    roles: Mapped[list]=mapped_column(JSON,default=list)
    status: Mapped[str]=mapped_column(String(20),default="ACTIVE")
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now)
class Course(Base):
    __tablename__="courses"
    id: Mapped[str]=mapped_column(String(36),primary_key=True,default=uid)
    code: Mapped[str]=mapped_column(String(30),index=True)
    title: Mapped[str]=mapped_column(String(180))
    description: Mapped[str]=mapped_column(Text,default="")
    term: Mapped[str]=mapped_column(String(60),default="Fall 2026")
    faculty_ids: Mapped[list]=mapped_column(JSON,default=list)
    student_ids: Mapped[list]=mapped_column(JSON,default=list)
    status: Mapped[str]=mapped_column(String(20),default="ACTIVE")
class Assignment(Base):
    __tablename__="assignments"
    id: Mapped[str]=mapped_column(String(36),primary_key=True,default=uid)
    course_id: Mapped[str]=mapped_column(ForeignKey("courses.id"),index=True)
    title: Mapped[str]=mapped_column(String(180))
    instructions: Mapped[str]=mapped_column(Text,default="")
    due_at: Mapped[str]=mapped_column(String(40),default="")
    max_score: Mapped[float]=mapped_column(Float,default=100)
    topic_tags: Mapped[list]=mapped_column(JSON,default=list)
    rubric: Mapped[list]=mapped_column(JSON,default=list)
    status: Mapped[str]=mapped_column(String(20),default="PUBLISHED")
class Submission(Base):
    __tablename__="submissions"
    __table_args__=(UniqueConstraint("assignment_id","student_id",name="uq_submission_student_assignment"),)
    id: Mapped[str]=mapped_column(String(36),primary_key=True,default=uid)
    assignment_id: Mapped[str]=mapped_column(ForeignKey("assignments.id"),index=True)
    student_id: Mapped[str]=mapped_column(ForeignKey("users.id"),index=True)
    submitted_at: Mapped[str]=mapped_column(String(40),default="")
    status: Mapped[str]=mapped_column(String(20),default="SUBMITTED")
    content: Mapped[str]=mapped_column(Text,default="")
    file_url: Mapped[Optional[str]]=mapped_column(String(500),nullable=True)
    score: Mapped[Optional[float]]=mapped_column(Float,nullable=True)
    feedback: Mapped[Optional[str]]=mapped_column(Text,nullable=True)
    graded_at: Mapped[Optional[str]]=mapped_column(String(40),nullable=True)
class Recommendation(Base):
    __tablename__="recommendations"
    id: Mapped[str]=mapped_column(String(36),primary_key=True,default=uid)
    student_id: Mapped[str]=mapped_column(ForeignKey("users.id"),index=True)
    course_id: Mapped[str]=mapped_column(ForeignKey("courses.id"),index=True)
    title: Mapped[str]=mapped_column(String(180))
    reason: Mapped[str]=mapped_column(Text)
    topic: Mapped[str]=mapped_column(String(120))
    resource_ids: Mapped[list]=mapped_column(JSON,default=list)
    practice_items: Mapped[list]=mapped_column(JSON,default=list)
    status: Mapped[str]=mapped_column(String(20),default="NEW")
    created_at: Mapped[str]=mapped_column(String(40),default=lambda:now().isoformat())
class Alert(Base):
    __tablename__="alerts"
    id: Mapped[str]=mapped_column(String(36),primary_key=True,default=uid)
    course_id: Mapped[str]=mapped_column(ForeignKey("courses.id"),index=True)
    student_id: Mapped[str]=mapped_column(ForeignKey("users.id"),index=True)
    type: Mapped[str]=mapped_column(String(60))
    severity: Mapped[str]=mapped_column(String(20))
    title: Mapped[str]=mapped_column(String(180))
    description: Mapped[str]=mapped_column(Text)
    evidence: Mapped[list]=mapped_column(JSON,default=list)
    created_at: Mapped[str]=mapped_column(String(40),default=lambda:now().isoformat())
    acknowledged_at: Mapped[Optional[str]]=mapped_column(String(40),nullable=True)
    acknowledged_by: Mapped[Optional[str]]=mapped_column(String(36),nullable=True)
class Intervention(Base):
    __tablename__="interventions"
    id: Mapped[str]=mapped_column(String(36),primary_key=True,default=uid)
    student_id: Mapped[str]=mapped_column(ForeignKey("users.id"),index=True)
    course_id: Mapped[str]=mapped_column(ForeignKey("courses.id"),index=True)
    type: Mapped[str]=mapped_column(String(60))
    owner_id: Mapped[str]=mapped_column(ForeignKey("users.id"))
    due_at: Mapped[str]=mapped_column(String(40),default="")
    status: Mapped[str]=mapped_column(String(30),default="PLANNED")
    notes: Mapped[str]=mapped_column(Text,default="")
    outcome: Mapped[Optional[str]]=mapped_column(Text,nullable=True)
    created_at: Mapped[str]=mapped_column(String(40),default=lambda:now().isoformat())

class Attendance(Base):
    __tablename__ = "attendance"
    __table_args__ = (UniqueConstraint("course_id", "student_id", "date", name="uq_attendance_course_student_date"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    course_id: Mapped[str] = mapped_column(ForeignKey("courses.id"), index=True)
    student_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    date: Mapped[str] = mapped_column(String(20), index=True)
    status: Mapped[str] = mapped_column(String(20), default="PRESENT")
    remarks: Mapped[str] = mapped_column(Text, default="")
    recorded_by: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[str] = mapped_column(String(40), default=lambda: now().isoformat())
