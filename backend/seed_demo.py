"""
Aurora Academic Platform - Rich Scaled Demo Seed Script
Run: venv_new\\Scripts\\python.exe seed_demo.py
Wipes existing data and inserts a scalable dataset with 1000+ records.
"""
import sys, uuid, random
sys.path.insert(0, ".")

from datetime import datetime, timezone, timedelta
from app.db import engine, Base, get_db
from app.models import User, Course, Assignment, Submission, Recommendation, Alert, Intervention, Attendance
from app.security import hash_password

def uid(): return str(uuid.uuid4())
def utcnow(): return datetime.now(timezone.utc).isoformat()

def get_feedback(score):
    if score >= 90: return "Excellent work! Thorough analysis, clear structure, and all edge cases addressed."
    if score >= 75: return "Good effort. Minor gaps in reasoning — review the boundary conditions."
    if score >= 60: return "Satisfactory. Revisit core concepts and attempt the practice problems."
    if score >= 45: return "Below expectations. Significant conceptual gaps identified — attend office hours."
    return "Critical: Key fundamentals are missing. Immediate tutoring intervention recommended."

# Wipe and recreate tables
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print("Tables reset.")

db = next(get_db())

# ── USERS ──────────────────────────────────────────────────────────────────
admin = User(id=uid(), name="Platform Admin",   email="admin@aurora.demo",  password_hash=hash_password("AdminDemo2026!"),  roles=["ADMIN"])
dean  = User(id=uid(), name="Dr. Priya Mehta",  email="dean@aurora.demo",   password_hash=hash_password("DeanDemo2026!"),   roles=["DEAN"])
f1    = User(id=uid(), name="Prof. Ananya Shah", email="ananya@aurora.demo", password_hash=hash_password("Faculty2026!"),    roles=["FACULTY"])
f2    = User(id=uid(), name="Prof. Rohan Verma", email="rohan@aurora.demo",  password_hash=hash_password("Faculty2026!"),    roles=["FACULTY"])
f3    = User(id=uid(), name="Prof. Neha Kapoor", email="neha@aurora.demo",   password_hash=hash_password("Faculty2026!"),    roles=["FACULTY"])
faculty_demo = User(id=uid(), name="Prof. Ananya Shah", email="faculty@aurora.demo", password_hash=hash_password("FacultyDemo2026!"), roles=["FACULTY"])

student_demo = User(id=uid(), name="Jaineel Shah", email="student@aurora.demo", password_hash=hash_password("StudentDemo2026!"), roles=["STUDENT"])

student_names = [
    ("Jaineel Shah",   "jaineel@aurora.demo"),
    ("Aarav Patel",    "aarav@aurora.demo"),
    ("Diya Krishnan",  "diya@aurora.demo"),
    ("Kabir Sharma",   "kabir@aurora.demo"),
    ("Priya Nair",     "priya@aurora.demo"),
    ("Arjun Mehta",    "arjun@aurora.demo"),
    ("Riya Gupta",     "riya@aurora.demo"),
    ("Vikram Rao",     "vikram@aurora.demo"),
    ("Sneha Iyer",     "sneha@aurora.demo"),
    ("Harsh Malhotra", "harsh@aurora.demo"),
    ("Tanvi Desai",    "tanvi@aurora.demo"),
    ("Rohan Joshi",    "rohanjs@aurora.demo"),
    ("Ananya Roy",     "ananya.r@aurora.demo"),
    ("Ishaan Verma",   "ishaan@aurora.demo"),
    ("Meera Nambiar",  "meera@aurora.demo"),
    ("Kavya Pillai",   "kavya@aurora.demo"),
    ("Aditya Kulkarni","aditya@aurora.demo"),
    ("Tara Sen",       "tara@aurora.demo"),
    ("Siddharth Jain", "sid@aurora.demo"),
    ("Natasha Banerji","natasha@aurora.demo"),
    ("Varun Bhatia",   "varun@aurora.demo"),
    ("Shruti Rao",     "shruti@aurora.demo"),
    ("Gaurav Seth",    "gaurav@aurora.demo"),
    ("Pooja Hegde",    "pooja@aurora.demo"),
    ("Devansh Bose",   "devansh@aurora.demo"),
]

students = [student_demo] + [
    User(id=uid(), name=n, email=e, password_hash=hash_password("Student2026!"), roles=["STUDENT"])
    for n, e in student_names
]

faculty_list = [f1, f2, f3, faculty_demo]
all_users = [admin, dean] + faculty_list + students
db.add_all(all_users)
db.flush()
print(f"  {len(all_users)} users created.")

# ── COURSES ────────────────────────────────────────────────────────────────
student_ids = [st.id for st in students]

course_catalog = [
    ("CS204", "Data Structures & Algorithms", "Algorithm design, complexity analysis, trees, graphs, sorting, and dynamic programming.", "Fall 2026", [f1.id, faculty_demo.id]),
    ("CS301", "Database Management Systems", "Relational databases, SQL, normalization, transactions, indexing, and NoSQL fundamentals.", "Fall 2026", [f2.id]),
    ("CS312", "Operating Systems", "Process management, virtual memory, concurrency, multi-threading, file systems, and deadlocks.", "Fall 2026", [f1.id, f3.id]),
    ("CS401", "Machine Learning & AI", "Supervised learning, deep neural networks, model optimization, feature engineering, and evaluation.", "Fall 2026", [f3.id, faculty_demo.id]),
    ("CS210", "Computer Networks & Protocols", "TCP/IP architecture, socket programming, routing protocols, TLS/SSL, and cloud networks.", "Fall 2026", [f2.id]),
    ("CS101", "Introduction to Computer Science", "Foundations of computational problem solving, Python programming, logic, and data abstraction.", "Fall 2026", [f1.id]),
    ("CS220", "Computer Organization & Architecture", "Digital logic, processor datapath, pipelining, cache memory hierarchy, and assembly language.", "Fall 2026", [f2.id]),
    ("CS330", "Software Engineering Principles", "Agile methodologies, test-driven development, CI/CD pipelines, software architecture, and design patterns.", "Fall 2026", [faculty_demo.id, f3.id]),
    ("CS340", "Full-Stack Web Technologies", "Modern frontend frameworks, RESTful APIs, state management, asynchronous programming, and web security.", "Fall 2026", [f1.id]),
    ("CS420", "Cloud Computing & Distributed Systems", "Microservices, containerization with Docker, Kubernetes, distributed consensus, and serverless.", "Fall 2026", [f2.id, faculty_demo.id]),
    ("CS450", "Cybersecurity & Network Defense", "Cryptography, threat modeling, vulnerability analysis, ethical hacking, and secure software development.", "Fall 2026", [f3.id]),
    ("CS460", "Compiler Design & Languages", "Lexical analysis, parsing, syntax-directed translation, intermediate code generation, and optimization.", "Fall 2026", [f1.id]),
    ("CS480", "Mobile Application Development", "Cross-platform mobile applications, responsive UI, device sensors, offline storage, and state architecture.", "Fall 2026", [f2.id]),
    ("DS201", "Data Analysis & Statistics", "Exploratory data analysis, hypothesis testing, probability distributions, regression, and data storytelling.", "Fall 2026", [f3.id]),
    ("DS301", "Big Data Analytics & Spark", "Distributed data processing with Apache Spark, Hadoop ecosystem, stream processing, and data lakes.", "Fall 2026", [faculty_demo.id]),
    ("DS401", "Natural Language Processing", "Text preprocessing, transformer models, BERT, large language models, sentiment analysis, and tokenization.", "Fall 2026", [f3.id]),
    ("SE301", "Human-Computer Interaction (HCI)", "User experience research, interaction design, usability heuristics, accessibility, and UI prototyping.", "Fall 2026", [f1.id]),
    ("SE401", "DevOps & Infrastructure as Code", "Terraform, Ansible, observability, logging, metrics, automated testing, and release engineering.", "Fall 2026", [f2.id]),
    ("AI201", "Ethics in AI & Data Privacy", "Algorithmic fairness, bias mitigation, privacy regulations (GDPR), explainability, and governance.", "Fall 2026", [f3.id, faculty_demo.id]),
    ("CS490", "Senior Capstone Project", "Comprehensive industry project with team-based milestones, code review, and final presentation.", "Fall 2026", [f1.id, f2.id, faculty_demo.id]),
]

courses = []
for code, title, desc, term, fac_ids in course_catalog:
    # Ensure student_demo (Jaineel Shah) is enrolled in the first 12 courses
    enrolled_count = min(len(student_ids), random.randint(12, 22))
    enrolled = [student_demo.id] + random.sample([sid for sid in student_ids if sid != student_demo.id], enrolled_count - 1)
    c = Course(id=uid(), code=code, title=title, description=desc, term=term, faculty_ids=fac_ids, student_ids=enrolled)
    db.add(c)
    courses.append(c)

db.flush()
print(f"  {len(courses)} courses created.")

# ── ASSIGNMENTS ────────────────────────────────────────────────────────────
assignments = []

assignment_templates = {
    "CS204": [
        ("Algorithm Complexity & Big-O Quiz", "2026-10-05T23:59:00Z", ["Algorithm Complexity", "Big-O Notation"], 100),
        ("Divide & Conquer Lab", "2026-10-12T23:59:00Z", ["Divide & Conquer", "Recursion"], 100),
        ("Dynamic Programming Problem Set", "2026-10-19T23:59:00Z", ["Dynamic Programming", "Memoization"], 100),
        ("Graph Traversal & Shortest Path", "2026-10-26T23:59:00Z", ["Graph Theory", "BFS", "Dijkstra"], 100),
        ("Midterm Exam: Trees & Heaps", "2026-11-02T23:59:00Z", ["Binary Trees", "Heaps"], 100),
    ],
    "CS301": [
        ("ER Diagram Design & Schema Modeling", "2026-10-08T23:59:00Z", ["ER Modelling", "Database Design"], 100),
        ("Advanced SQL & Subqueries Lab", "2026-10-15T23:59:00Z", ["SQL", "Joins", "Aggregations"], 100),
        ("Relational Normalization Worksheet", "2026-10-22T23:59:00Z", ["Normalization", "1NF", "BCNF"], 100),
        ("ACID Transactions & Locking Protocols", "2026-10-29T23:59:00Z", ["Transactions", "ACID", "Concurrency"], 100),
    ],
    "CS312": [
        ("CPU Scheduling Simulation (Round Robin)", "2026-10-10T23:59:00Z", ["CPU Scheduling", "Simulation"], 100),
        ("Virtual Memory & Paging Lab", "2026-10-17T23:59:00Z", ["Memory Management", "Paging"], 100),
        ("POSIX Threads Concurrency Assignment", "2026-10-24T23:59:00Z", ["Concurrency", "Semaphores", "Mutex"], 100),
        ("Deadlock Detection & Prevention Exercise", "2026-10-31T23:59:00Z", ["Deadlocks", "Bankers Algorithm"], 100),
    ],
    "CS401": [
        ("Linear & Logistic Regression from Scratch", "2026-10-09T23:59:00Z", ["Regression", "Optimization"], 100),
        ("Decision Trees & Ensemble Kaggle Challenge", "2026-10-16T23:59:00Z", ["Random Forest", "Gradient Boosting"], 100),
        ("Multi-Layer Perceptron Implementation", "2026-10-23T23:59:00Z", ["Deep Learning", "Backpropagation"], 100),
        ("Convolutional Neural Networks for Vision", "2026-10-30T23:59:00Z", ["CNN", "Image Classification"], 100),
    ],
    "CS210": [
        ("Socket Programming with Python", "2026-10-07T23:59:00Z", ["Sockets", "TCP/IP"], 100),
        ("Packet Inspection & Wireshark Analysis", "2026-10-14T23:59:00Z", ["Wireshark", "DNS", "HTTP"], 100),
        ("Subnetting & CIDR Routing Lab", "2026-10-21T23:59:00Z", ["Subnetting", "Routing"], 100),
        ("TLS Handshake & Security Analysis", "2026-10-28T23:59:00Z", ["TLS", "Cryptography"], 100),
    ],
}

# Generic fallback for other courses to ensure 4 assignments per course
generic_topics = [
    ("Milestone 1: Foundations & Architecture", "2026-10-06T23:59:00Z", ["Fundamentals", "Architecture"]),
    ("Milestone 2: Core Implementation & Tests", "2026-10-13T23:59:00Z", ["Implementation", "Unit Testing"]),
    ("Milestone 3: Advanced Optimization & Metrics", "2026-10-20T23:59:00Z", ["Optimization", "Benchmarking"]),
    ("Milestone 4: Final Deliverable & Report", "2026-10-27T23:59:00Z", ["Documentation", "Case Study"]),
]

for course in courses:
    templates = assignment_templates.get(course.code, generic_topics)
    for title, due, tags, *extra in templates:
        max_s = extra[0] if extra else 100
        a = Assignment(
            id=uid(),
            course_id=course.id,
            title=title,
            instructions=f"Complete all components of '{title}'. Provide clean code, rigorous proofs, and concise analysis.",
            due_at=due,
            max_score=max_s,
            topic_tags=tags,
            rubric=[
                {"criterion": "Technical Correctness", "points": 50},
                {"criterion": "Methodology & Reasoning", "points": 30},
                {"criterion": "Clarity & Code Quality", "points": 20},
            ],
            status="PUBLISHED"
        )
        db.add(a)
        assignments.append((course, a))

db.flush()
print(f"  {len(assignments)} assignments created across {len(courses)} courses.")

# ── SUBMISSIONS (Target: 1,000+ realistic submissions) ──────────────────────
sub_count = 0
base_date = datetime(2026, 10, 1, 9, 0, 0, tzinfo=timezone.utc)

for course, assignment in assignments:
    # Get all enrolled students for this course
    enrolled_ids = course.student_ids or []
    for sid in enrolled_ids:
        # Generate submissions for enrolled students
        student_obj = next((s for s in students if s.id == sid), None)
        if not student_obj:
            continue
        
        # Vary score realistically based on student and assignment
        rand_val = random.random()
        if sid == student_demo.id:
            # Jaineel has realistic varied scores
            score = random.choice([82, 88, 74, 91, 68, 85, 78, 95])
        elif rand_val < 0.15:
            # At risk student
            score = random.randint(30, 55)
        elif rand_val < 0.70:
            # Average to good
            score = random.randint(65, 88)
        else:
            # Top performer
            score = random.randint(89, 99)

        is_late = (score < 60 and random.random() < 0.5)
        status = "LATE" if is_late else ("GRADED" if random.random() < 0.85 else "SUBMITTED")
        
        # Stagger submission date
        offset_days = random.randint(3, 25)
        sub_time = (base_date + timedelta(days=offset_days, hours=random.randint(1, 12))).isoformat()
        grade_time = (base_date + timedelta(days=offset_days + 2, hours=random.randint(1, 8))).isoformat() if status == "GRADED" else None

        sub = Submission(
            id=uid(),
            assignment_id=assignment.id,
            student_id=student_obj.id,
            submitted_at=sub_time,
            status=status,
            content=f"Solution submitted by {student_obj.name} for '{assignment.title}'. Implemented core logic, passed all test suites, and verified complexity constraints.",
            file_url=f"https://storage.aurora.academic/submissions/{assignment.id}_{student_obj.id}.pdf" if random.random() < 0.5 else None,
            score=float(score) if status == "GRADED" else None,
            feedback=get_feedback(score) if status == "GRADED" else None,
            graded_at=grade_time
        )
        db.add(sub)
        sub_count += 1

db.flush()
print(f"  {sub_count} submissions created.")

# ── RECOMMENDATIONS ────────────────────────────────────────────────────────
recs = [
    Recommendation(id=uid(), student_id=student_demo.id, course_id=courses[0].id,
                   title="Dynamic Programming micro-module & practice set",
                   reason="Scores below 70% on DP problem sets indicate opportunity to master memoization vs tabulation.",
                   topic="Dynamic Programming",
                   practice_items=["Review: Memoization transition tables", "Practice: LeetCode Coin Change & 0/1 Knapsack", "Analyze: Space optimization techniques"],
                   status="NEW"),
    Recommendation(id=uid(), student_id=student_demo.id, course_id=courses[1].id,
                   title="SQL Query Indexing and Window Functions",
                   reason="Partial credit on advanced SQL subqueries — explore execution plans and EXPLAIN ANALYZE.",
                   topic="SQL Optimization",
                   practice_items=["Practice: Window functions (RANK, ROW_NUMBER)", "Read: PostgreSQL B-Tree index internals", "Benchmark: 10 query optimization problems"],
                   status="IN_PROGRESS"),
    Recommendation(id=uid(), student_id=students[3].id, course_id=courses[0].id,
                   title="Algorithm Complexity fundamentals review",
                   reason="Assessment scores consistently below 50%. Big-O classifications need reinforcement.",
                   topic="Algorithm Complexity",
                   practice_items=["Read: Asymptotic complexity cheat sheet", "Complete: 15 recurrence relation exercises", "Manual code tracing practice"],
                   status="IN_PROGRESS"),
    Recommendation(id=uid(), student_id=students[6].id, course_id=courses[2].id,
                   title="Paging & TLB Hit Rate simulation practice",
                   reason="Page replacement algorithms showed misunderstandings on LRU cache simulation.",
                   topic="Memory Management",
                   practice_items=["Trace LRU and FIFO on 10 page streams", "Calculate effective memory access times", "Read OS Virtual Memory Chapter 8"],
                   status="NEW"),
    Recommendation(id=uid(), student_id=students[8].id, course_id=courses[3].id,
                   title="Gradient Descent Convergence & Learning Rates",
                   reason="Loss function exploded during neural net training lab — review learning rate scheduling.",
                   topic="Optimization",
                   practice_items=["Implement Adam optimizer from scratch", "Compare batch vs stochastic gradient descent", "Tune learning rate with warm restarts"],
                   status="COMPLETED"),
    Recommendation(id=uid(), student_id=students[11].id, course_id=courses[0].id,
                   title="Emergency: Core DS&A concepts intervention",
                   reason="Critical low scores across foundational assessments. Faculty meeting requested.",
                   topic="All Topics",
                   practice_items=["Attend faculty 1-on-1 office hours", "Complete remedial worksheets", "Daily structured practice schedule"],
                   status="NEW"),
]
db.add_all(recs)
db.flush()
print(f"  {len(recs)} recommendations created.")

# ── ALERTS ─────────────────────────────────────────────────────────────────
alerts = [
    Alert(id=uid(), course_id=courses[0].id, student_id=student_demo.id,
          type="LATE_SUBMISSION_WATCH", severity="MEDIUM",
          title="Upcoming deadline notification in Data Structures",
          description="Graph Traversal assignment is due in 3 days. Course activity indicates active preparation.",
          evidence=["assignmentDue:3days", "currentScore:82%", "courseCode:CS204"],
          created_at="2026-10-23T08:00:00Z"),
    Alert(id=uid(), course_id=courses[0].id, student_id=students[3].id,
          type="ASSESSMENT_LOW", severity="HIGH",
          title="Critical score — Kabir Sharma below 45% in CS204",
          description="Average score of 42% across assignments. Immediate faculty tutoring recommended.",
          evidence=["avgScore:42%", "lowestScore:34%", "atRiskAssignments:4"],
          created_at="2026-10-21T08:00:00Z"),
    Alert(id=uid(), course_id=courses[0].id, student_id=students[11].id,
          type="ASSESSMENT_LOW", severity="HIGH",
          title="CRITICAL: Rohan Joshi at severe academic risk",
          description="Scores range 30-38%. No upward trend observed. Dean & faculty notification sent.",
          evidence=["avgScore:33%", "lowestScore:30%", "trend:declining"],
          created_at="2026-10-22T08:00:00Z"),
    Alert(id=uid(), course_id=courses[1].id, student_id=students[9].id,
          type="ENGAGEMENT_DROP", severity="MEDIUM",
          title="Harsh Malhotra — engagement drop detected in DBMS",
          description="Submission timestamps indicate late night submissions with incomplete test coverage.",
          evidence=["avgScore:58%", "engagementScore:low", "lastSubmission:LATE"],
          created_at="2026-10-19T08:00:00Z"),
    Alert(id=uid(), course_id=courses[2].id, student_id=students[6].id,
          type="ASSESSMENT_LOW", severity="MEDIUM",
          title="Riya Gupta — Virtual Memory lab below threshold",
          description="Score of 54% on Virtual Memory lab. Concurrency concepts require review.",
          evidence=["labScore:54%", "avgScore:62%"],
          created_at="2026-10-16T08:00:00Z"),
]
db.add_all(alerts)
db.flush()
print(f"  {len(alerts)} alerts created.")

# ── INTERVENTIONS ──────────────────────────────────────────────────────────
interventions = [
    Intervention(id=uid(), student_id=students[3].id, course_id=courses[0].id,
                 type="TUTORING", owner_id=f1.id,
                 due_at="2026-10-28T14:00:00Z", status="IN_PROGRESS",
                 notes="Weekly 1-on-1 tutoring sessions on Big-O complexity and recursion trees.",
                 created_at="2026-10-20T09:00:00Z"),
    Intervention(id=uid(), student_id=students[11].id, course_id=courses[0].id,
                 type="COUNSELLING", owner_id=dean.id,
                 due_at="2026-10-25T11:00:00Z", status="COMPLETED",
                 notes="Academic advisement session to address schedule conflicts and study skills.",
                 outcome="Student agreed to reduced course load and assigned graduate teaching assistant mentor.",
                 created_at="2026-10-22T09:00:00Z"),
    Intervention(id=uid(), student_id=student_demo.id, course_id=courses[0].id,
                 type="PEER_SUPPORT", owner_id=f1.id,
                 due_at="2026-10-30T16:00:00Z", status="PLANNED",
                 notes="Pair Jaineel with top performing study cohort for collaborative problem solving.",
                 created_at="2026-10-21T10:00:00Z"),
    Intervention(id=uid(), student_id=students[9].id, course_id=courses[1].id,
                 type="TUTORING", owner_id=f2.id,
                 due_at="2026-10-29T15:00:00Z", status="PLANNED",
                 notes="Database normalization and SQL join query review with worked exercises.",
                 created_at="2026-10-18T10:00:00Z"),
]
db.add_all(interventions)
db.flush()
print(f"  {len(interventions)} interventions created.")

# ── ATTENDANCE SESSIONS ──────────────────────────────────────────────────
attendance_dates = [
    "2026-09-07", "2026-09-10", "2026-09-14", "2026-09-17", "2026-09-21",
    "2026-09-24", "2026-09-28", "2026-10-01", "2026-10-05", "2026-10-08",
    "2026-10-12", "2026-10-15"
]

attendance_records = []
for course in courses:
    instructor_id = course.faculty_ids[0] if course.faculty_ids else faculty_demo.id
    enrolled_sids = course.student_ids or [st.id for st in students[:12]]
    for dt in attendance_dates:
        for sid in enrolled_sids:
            r = random.random()
            if sid == student_demo.id:
                if r < 0.88:
                    status = "PRESENT"
                    remarks = "Active participation in discussion" if random.random() < 0.25 else ""
                elif r < 0.94:
                    status = "LATE"
                    remarks = "Arrived 10 minutes late due to transit"
                elif r < 0.98:
                    status = "EXCUSED"
                    remarks = "Collegiate Hackathon representation"
                else:
                    status = "ABSENT"
                    remarks = "Unexcused absence"
            else:
                if r < 0.82:
                    status = "PRESENT"
                    remarks = ""
                elif r < 0.90:
                    status = "LATE"
                    remarks = "Late entry to lecture"
                elif r < 0.96:
                    status = "ABSENT"
                    remarks = "Unnotified absence"
                else:
                    status = "EXCUSED"
                    remarks = "Medical appointment notice"

            attendance_records.append(Attendance(
                id=uid(),
                course_id=course.id,
                student_id=sid,
                date=dt,
                status=status,
                remarks=remarks,
                recorded_by=instructor_id,
                created_at=f"{dt}T09:30:00Z"
            ))

db.add_all(attendance_records)
db.commit()
print(f"  {len(attendance_records)} attendance records created.")

print()
print("=" * 64)
print("  Aurora High-Capacity Database Seeded Successfully!")
print("=" * 64)
print()
print("  LOGIN CREDENTIALS")
print("  Role     | Email                   | Password")
print("  ---------+-------------------------+----------------")
print("  ADMIN    | admin@aurora.demo       | AdminDemo2026!")
print("  DEAN     | dean@aurora.demo        | DeanDemo2026!")
print("  FACULTY  | faculty@aurora.demo     | FacultyDemo2026!")
print("  FACULTY  | ananya@aurora.demo      | Faculty2026!")
print("  STUDENT  | student@aurora.demo     | StudentDemo2026!")
print("  STUDENT  | jaineel@aurora.demo     | Student2026!")
print()
print("  DATA SCALE SUMMARY")
print(f"  Users:         {len(all_users)}")
print(f"  Courses:       {len(courses)}")
print(f"  Assignments:   {len(assignments)}")
print(f"  Submissions:   {sub_count}")
print(f"  Attendance:    {len(attendance_records)}  (Total database records: {len(all_users) + len(courses) + len(assignments) + sub_count + len(attendance_records):,})")
print(f"  Recommendations:{len(recs)}")
print(f"  Alerts:        {len(alerts)}")
print(f"  Interventions: {len(interventions)}")
print("=" * 64)
