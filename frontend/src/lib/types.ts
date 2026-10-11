export type Role = 'STUDENT' | 'FACULTY' | 'DEAN' | 'ADMIN';

export type User = {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  status: string;
};

export type Course = {
  id: string;
  code: string;
  title: string;
  description: string;
  term: string;
  facultyIds: string[];
  studentIds?: string[];
  progress?: number;
  students?: number;
};

export type AssignmentRubric = {
  criterion: string;
  points: number;
};

export type Assignment = {
  id: string;
  courseId: string;
  title: string;
  instructions: string;
  dueAt: string;
  maxScore: number;
  topicTags: string[];
  rubric: AssignmentRubric[];
  status: string;
};

export type Submission = {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: string;
  status: 'SUBMITTED' | 'LATE' | 'GRADED' | 'DRAFT_FEEDBACK';
  content: string;
  fileUrl?: string | null;
  score?: number | null;
  feedback?: string | null;
  gradedAt?: string | null;
};

export type Recommendation = {
  id: string;
  studentId?: string;
  courseId?: string;
  title: string;
  reason: string;
  topic: string;
  practiceItems?: string[];
  resourceIds?: string[];
  status: 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'DISMISSED';
  createdAt: string;
};

export type AlertItem = {
  id: string;
  courseId?: string;
  studentId?: string;
  type?: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  evidence: string[];
  createdAt?: string;
  acknowledgedAt?: string | null;
};

export type Intervention = {
  id: string;
  studentId: string;
  courseId: string;
  type: string;
  ownerId: string;
  dueAt: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes: string;
  outcome?: string;
  createdAt: string;
};

export type RiskIndicator = {
  code: string;
  label: string;
  value: string | number;
  weight: number;
  contribution: number;
  window: string;
  evidence: string[];
  description: string;
};

export type TopicScore = {
  topic: string;
  score: number;
  evidenceCount?: number;
  updatedAt?: string;
};

export type StudentInsights = {
  studentId: string;
  courseId: string;
  riskLevel: string;
  riskScore: number;
  indicators: RiskIndicator[];
  topicScores: TopicScore[];
  method?: string;
};

export type AttendanceRecord = {
  id: string;
  courseId: string;
  studentId: string;
  studentName?: string | null;
  studentEmail?: string | null;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
  recordedBy?: string | null;
  createdAt: string;
};

export type AttendanceStats = {
  totalRecords: number;
  totalSessions: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  attendanceRate: number;
  dates?: string[];
};

export type AttendanceResponse = {
  items: AttendanceRecord[];
  page: number;
  pageSize: number;
  total: number;
  stats?: AttendanceStats;
};
