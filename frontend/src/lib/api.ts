import type {
  User,
  Course,
  Assignment,
  Submission,
  Recommendation,
  AlertItem,
  Intervention,
  StudentInsights,
  AttendanceRecord,
  AttendanceResponse,
  AttendanceStats,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = 'API_ERROR'
  ) {
    super(message);
  }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('aurora_auth_token');
}

export function setStoredToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem('aurora_auth_token', token);
  else localStorage.removeItem('aurora_auth_token');
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');

  const token = getStoredToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
    });
  } catch {
    throw new ApiError(0, 'The backend API is unavailable. Check if the server is running on port 8000.', 'OFFLINE');
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    let code = 'API_ERROR';
    try {
      const body = await response.json();
      message = body?.detail ?? body?.message ?? message;
      code = body?.code ?? code;
    } catch {}
    throw new ApiError(response.status, message, code);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

// Authentication
export async function login(email: string, password: string): Promise<{ accessToken: string; tokenType: string; user: User }> {
  const res = await apiRequest<{ accessToken: string; tokenType: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setStoredToken(res.accessToken);
  return res;
}

export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>('/auth/me');
}

// Courses
export async function getCourses(page = 1, pageSize = 200): Promise<{ items: Course[]; page: number; pageSize: number; total: number }> {
  return apiRequest<{ items: Course[]; page: number; pageSize: number; total: number }>(`/courses?page=${page}&pageSize=${pageSize}`);
}

export async function createCourse(data: { code: string; title: string; description: string; term: string }): Promise<Course> {
  return apiRequest<Course>('/courses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getCourse(courseId: string): Promise<Course> {
  return apiRequest<Course>(`/courses/${courseId}`);
}

// Assignments
export async function getCourseAssignments(courseId: string, page = 1, pageSize = 200): Promise<{ items: Assignment[]; page: number; pageSize: number; total: number }> {
  return apiRequest<{ items: Assignment[]; page: number; pageSize: number; total: number }>(`/courses/${courseId}/assignments?page=${page}&pageSize=${pageSize}`);
}

export async function createAssignment(
  courseId: string,
  data: {
    title: string;
    instructions: string;
    dueAt: string;
    maxScore: number;
    topicTags: string[];
    rubric: { criterion: string; points: number }[];
  }
): Promise<Assignment> {
  return apiRequest<Assignment>(`/courses/${courseId}/assignments`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Submissions
export async function getSubmissions(assignmentId: string): Promise<{ items: Submission[]; page: number; pageSize: number; total: number }> {
  return apiRequest<{ items: Submission[]; page: number; pageSize: number; total: number }>(`/assignments/${assignmentId}/submissions`);
}

export async function getAllSubmissions(courseId?: string, page = 1, pageSize = 500): Promise<{ items: Submission[]; page: number; pageSize: number; total: number }> {
  const query = courseId ? `?courseId=${encodeURIComponent(courseId)}&page=${page}&pageSize=${pageSize}` : `?page=${page}&pageSize=${pageSize}`;
  return apiRequest<{ items: Submission[]; page: number; pageSize: number; total: number }>(`/submissions${query}`);
}

export async function submitAssignment(
  assignmentId: string,
  data: { content: string; fileUrl?: string | null }
): Promise<Submission> {
  return apiRequest<Submission>(`/assignments/${assignmentId}/submissions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function gradeSubmission(
  submissionId: string,
  data: { score: number; feedback: string; publish: boolean }
): Promise<Submission> {
  return apiRequest<Submission>(`/submissions/${submissionId}/grade`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Recommendations
export async function getRecommendations(): Promise<Recommendation[]> {
  return apiRequest<Recommendation[]>('/recommendations');
}

export async function updateRecommendationStatus(
  recommendationId: string,
  status: 'IN_PROGRESS' | 'COMPLETED' | 'DISMISSED'
): Promise<{ id: string; status: string }> {
  return apiRequest<{ id: string; status: string }>(`/recommendations/${recommendationId}/status`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
}

// Alerts
export async function getAlerts(): Promise<AlertItem[]> {
  return apiRequest<AlertItem[]>('/alerts');
}

export async function acknowledgeAlert(alertId: string): Promise<{ id: string; acknowledgedAt: string }> {
  return apiRequest<{ id: string; acknowledgedAt: string }>(`/alerts/${alertId}/acknowledge`, {
    method: 'POST',
  });
}

// Interventions
export async function getInterventions(): Promise<Intervention[]> {
  return apiRequest<Intervention[]>('/interventions');
}

export async function createIntervention(data: {
  studentId: string;
  courseId: string;
  type: string;
  ownerId: string;
  dueAt: string;
  notes: string;
}): Promise<Intervention> {
  return apiRequest<Intervention>('/interventions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateIntervention(
  id: string,
  data: { status?: string; notes?: string; outcome?: string }
): Promise<Intervention> {
  return apiRequest<Intervention>(`/interventions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Admin Users
export async function getAdminUsers(page = 1, pageSize = 200): Promise<{ items: User[]; page: number; pageSize: number; total: number }> {
  return apiRequest<{ items: User[]; page: number; pageSize: number; total: number }>(`/admin/users?page=${page}&pageSize=${pageSize}`);
}

export async function createAdminUser(data: {
  name: string;
  email: string;
  password?: string;
  roles: string[];
  status: string;
}): Promise<User> {
  return apiRequest<User>('/admin/users', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      password: data.password || 'UserDemo2026!',
    }),
  });
}

export async function updateAdminUser(
  userId: string,
  data: { roles?: string[]; status?: string; name?: string }
): Promise<User> {
  return apiRequest<User>(`/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Insights & Analytics
export async function getStudentInsights(courseId: string, studentId: string): Promise<StudentInsights> {
  return apiRequest<StudentInsights>(`/courses/${courseId}/students/${studentId}/insights`);
}

export async function getCourseAnalytics(courseId: string): Promise<{
  courseId: string;
  enrollment: number;
  completionRate: number;
  riskDistribution: { LOW: number; MEDIUM: number; HIGH: number };
}> {
  return apiRequest(`/courses/${courseId}/analytics`);
}

// ── Attendance Endpoints ──────────────────────────────────────────────────
export async function getCourseAttendance(
  courseId: string,
  options: {
    date?: string;
    studentId?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<AttendanceResponse> {
  const params = new URLSearchParams();
  if (options.date) params.set('date', options.date);
  if (options.studentId) params.set('studentId', options.studentId);
  if (options.status) params.set('status', options.status);
  params.set('page', String(options.page || 1));
  params.set('pageSize', String(options.pageSize || 100));

  return apiRequest<AttendanceResponse>(`/courses/${courseId}/attendance?${params.toString()}`);
}

export async function recordAttendance(
  courseId: string,
  data: {
    studentId: string;
    date: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    remarks?: string;
  }
): Promise<AttendanceRecord> {
  return apiRequest<AttendanceRecord>(`/courses/${courseId}/attendance`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function recordBatchAttendance(
  courseId: string,
  data: {
    date: string;
    records: Array<{
      studentId: string;
      status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
      remarks?: string;
    }>;
  }
): Promise<{ status: string; date: string; created: number; updated: number; total: number }> {
  return apiRequest(`/courses/${courseId}/attendance/batch`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function patchAttendance(
  attendanceId: string,
  data: {
    status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    remarks?: string;
  }
): Promise<AttendanceRecord> {
  return apiRequest<AttendanceRecord>(`/attendance/${attendanceId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getAttendanceSummary(): Promise<AttendanceStats> {
  return apiRequest<AttendanceStats>('/attendance/summary');
}
