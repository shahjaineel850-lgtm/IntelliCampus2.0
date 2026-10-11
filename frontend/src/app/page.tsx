'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Edit3,
  ExternalLink,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  MessageSquareText,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type {
  Role,
  User,
  Course,
  Assignment,
  Submission,
  Recommendation,
  AlertItem,
  Intervention,
  StudentInsights,
  AttendanceRecord,
  AttendanceStats,
} from '@/lib/types';

import {
  login,
  getCurrentUser,
  getCourses,
  createCourse,
  getCourseAssignments,
  createAssignment,
  getSubmissions,
  getAllSubmissions,
  submitAssignment,
  gradeSubmission,
  getRecommendations,
  updateRecommendationStatus,
  getAlerts,
  acknowledgeAlert,
  getInterventions,
  createIntervention,
  updateIntervention,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  getStudentInsights,
  getCourseAttendance,
  recordAttendance,
  patchAttendance,
  getAttendanceSummary,
  setStoredToken,
  getStoredToken,
} from '@/lib/api';

const ROLE_ACCOUNTS: Record<Role, { email: string; pass: string; label: string; name: string; initials: string }> = {
  STUDENT: { email: 'student@aurora.demo', pass: 'StudentDemo2026!', label: 'Student', name: 'Jaineel Shah', initials: 'JS' },
  FACULTY: { email: 'faculty@aurora.demo', pass: 'FacultyDemo2026!', label: 'Faculty', name: 'Ananya Shah', initials: 'AS' },
  DEAN: { email: 'dean@aurora.demo', pass: 'DeanDemo2026!', label: 'Dean', name: 'Dr. Mehta', initials: 'DM' },
  ADMIN: { email: 'admin@aurora.demo', pass: 'AdminDemo2026!', label: 'Admin', name: 'Platform Admin', initials: 'AD' },
};

const activityData = [
  { week: 'W1', score: 48 },
  { week: 'W2', score: 54 },
  { week: 'W3', score: 51 },
  { week: 'W4', score: 63 },
  { week: 'W5', score: 68 },
  { week: 'W6', score: 74 },
  { week: 'W7', score: 71 },
  { week: 'W8', score: 82 },
];

const topicData = [
  { topic: 'Algorithms', score: 52 },
  { topic: 'Graph theory', score: 61 },
  { topic: 'Databases', score: 78 },
  { topic: 'Web tech', score: 88 },
];

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('STUDENT');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState('Overview');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Live Backend State
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [insights, setInsights] = useState<StudentInsights | null>(null);

  // Attendance State & Filtering (supports 1000+ sessions)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [attSearch, setAttSearch] = useState('');
  const [attDateFilter, setAttDateFilter] = useState('ALL');
  const [attStatusFilter, setAttStatusFilter] = useState('ALL');
  const [attPage, setAttPage] = useState(1);
  const attPerPage = 10;
  const [showMarkAttModal, setShowMarkAttModal] = useState(false);
  const [markAttStudentId, setMarkAttStudentId] = useState('');
  const [markAttDate, setMarkAttDate] = useState('2026-10-15');
  const [markAttStatus, setMarkAttStatus] = useState<'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'>('PRESENT');
  const [markAttRemarks, setMarkAttRemarks] = useState('');

  // Pagination & Filtering for High Capacity (1000+ items)
  const [courseSearch, setCourseSearch] = useState('');
  const [coursePage, setCoursePage] = useState(1);
  const coursesPerPage = 6;

  const [assignPage, setAssignPage] = useState(1);
  const assignsPerPage = 8;

  const [subSearch, setSubSearch] = useState('');
  const [subPage, setSubPage] = useState(1);
  const subsPerPage = 10;

  // Modals & Action States
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState<Assignment | null>(null);
  const [showGradeModal, setShowGradeModal] = useState<Submission | null>(null);
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Form states
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseTerm, setNewCourseTerm] = useState('Fall 2026');

  const [newAssignTitle, setNewAssignTitle] = useState('');
  const [newAssignInstructions, setNewAssignInstructions] = useState('');
  const [newAssignDue, setNewAssignDue] = useState('2026-10-25T23:59:00Z');
  const [newAssignMaxScore, setNewAssignMaxScore] = useState(100);
  const [newAssignTags, setNewAssignTags] = useState('Algorithm Complexity, Dynamic Programming');

  const [submitContent, setSubmitContent] = useState('');
  const [submitFileUrl, setSubmitFileUrl] = useState('');

  const [gradeScore, setGradeScore] = useState(85);
  const [gradeFeedback, setGradeFeedback] = useState('');

  const [intervType, setIntervType] = useState('TUTORING');
  const [intervDue, setIntervDue] = useState('2026-10-20T12:00:00Z');
  const [intervNotes, setIntervNotes] = useState('');

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('STUDENT');

  const isStudent = role === 'STUDENT';
  const isFaculty = role === 'FACULTY';
  const isDean = role === 'DEAN';
  const isAdmin = role === 'ADMIN';

  function toast(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3500);
  }

  function handleLogout() {
    setStoredToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aurora_user');
    }
    router.push('/login');
  }

  // Switch role session and reload live data
  async function switchRole(newRole: Role) {
    setLoading(true);
    setRole(newRole);
    try {
      const creds = ROLE_ACCOUNTS[newRole];
      const res = await login(creds.email, creds.pass);
      setCurrentUser(res.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('aurora_user', JSON.stringify(res.user));
      }
      toast(`Switched to ${creds.label} account (${res.user.name})`);
      await loadLiveData(newRole, res.user);
    } catch (err: any) {
      toast(`Login error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Active course selection with live dynamic data fetch
  async function handleSelectCourse(course: Course) {
    setSelectedCourse(course);
    setLoading(true);
    try {
      const aRes = await getCourseAssignments(course.id, 1, 200);
      setAssignments(aRes.items);
      setAssignPage(1);

      try {
        const subRes = await getAllSubmissions(course.id, 1, 500);
        setSubmissions(subRes.items);
        setSubPage(1);
      } catch {
        const subPromises = aRes.items.slice(0, 10).map((a) => getSubmissions(a.id));
        const subResults = await Promise.allSettled(subPromises);
        const allSubs: Submission[] = [];
        for (const r of subResults) {
          if (r.status === 'fulfilled') allSubs.push(...r.value.items);
        }
        setSubmissions(allSubs);
      }

      if (role === 'FACULTY' || role === 'DEAN') {
        try {
          const insRes = await getStudentInsights(course.id, 'student_scenario');
          setInsights(insRes);
        } catch {}
      }

      // Fetch attendance records for the selected course
      try {
        const attRes = await getCourseAttendance(course.id, { page: 1, pageSize: 300 });
        setAttendanceRecords(attRes.items);
        setAttendanceStats(attRes.stats || null);
        setAttPage(1);
      } catch {}

      toast(`Active Course: ${course.code} · ${course.title}`);
    } catch (err: any) {
      toast(`Failed to load course details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Load all live domain data from backend efficiently
  async function loadLiveData(currentRole = role, user = currentUser) {
    try {
      // 1. Fetch courses
      const cRes = await getCourses(1, 200);
      setCourses(cRes.items);
      const defaultCourse = cRes.items[0] || null;
      setSelectedCourse(defaultCourse);

      // 2. Fetch assignments if course exists
      if (defaultCourse) {
        const aRes = await getCourseAssignments(defaultCourse.id, 1, 200);
        setAssignments(aRes.items);

        // Fetch submissions via bulk endpoint (avoids N+1 sequential loop)
        try {
          const subRes = await getAllSubmissions(defaultCourse.id, 1, 500);
          setSubmissions(subRes.items);
        } catch {
          const subPromises = aRes.items.slice(0, 10).map((a) => getSubmissions(a.id));
          const subResults = await Promise.allSettled(subPromises);
          const allSubs: Submission[] = [];
          for (const r of subResults) {
            if (r.status === 'fulfilled') allSubs.push(...r.value.items);
          }
          setSubmissions(allSubs);
        }

        // Fetch attendance for default course
        try {
          const attRes = await getCourseAttendance(defaultCourse.id, { page: 1, pageSize: 300 });
          setAttendanceRecords(attRes.items);
          setAttendanceStats(attRes.stats || null);
          setAttPage(1);
        } catch {}

        // Fetch student insights for faculty/dean
        if (currentRole === 'FACULTY' || currentRole === 'DEAN') {
          try {
            const insRes = await getStudentInsights(defaultCourse.id, 'student_scenario');
            setInsights(insRes);
          } catch {}
        }
      }

      // 3. Fetch recommendations
      try {
        const rRes = await getRecommendations();
        setRecommendations(rRes);
      } catch {}

      // 4. Fetch alerts
      try {
        const alRes = await getAlerts();
        setAlerts(alRes);
      } catch {}

      // 5. Fetch interventions
      try {
        const intRes = await getInterventions();
        setInterventions(intRes);
      } catch {}

      // 6. Fetch admin users if Admin
      if (currentRole === 'ADMIN') {
        try {
          const uRes = await getAdminUsers(1, 200);
          setAdminUsers(uRes.items);
        } catch {}
      }
    } catch (err: any) {
      console.error('Failed to load live data:', err);
    }
  }

  // Initial mount: check auth token or redirect to login
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.replace('/login');
      return;
    }

    setLoading(true);
    getCurrentUser()
      .then((user) => {
        setCurrentUser(user);
        const userRole = (user.roles?.[0] as Role) || 'STUDENT';
        setRole(userRole);
        return loadLiveData(userRole, user);
      })
      .catch((err) => {
        console.error('Session expired or invalid:', err);
        setStoredToken(null);
        router.replace('/login');
      })
      .finally(() => {
        setLoading(false);
        setCheckingAuth(false);
      });
  }, [router]);

  const menu = useMemo(() => {
    const common = [
      ['Overview', LayoutDashboard],
      ['Courses', BookOpen],
      ['Assignments', ClipboardCheck],
      ['Attendance', CalendarDays],
      ['Submissions', Award],
    ] as const;

    if (isStudent)
      return [
        ...common,
        ['My progress', Activity],
        ['Recommendations', Sparkles],
        ['Notifications', Bell],
      ] as const;
    if (isFaculty)
      return [
        ...common,
        ['Students & Risk', Users],
        ['Interventions', LifeBuoy],
        ['Alerts', Bell],
      ] as const;
    if (isDean)
      return [
        ['Overview', LayoutDashboard],
        ['Cohort analytics', Activity],
        ['Courses', BookOpen],
        ['Attendance', CalendarDays],
        ['Interventions', LifeBuoy],
        ['Alerts', Bell],
      ] as const;
    return [
      ['Overview', LayoutDashboard],
      ['Users & roles', Users],
      ['Courses', BookOpen],
      ['Assignments', ClipboardCheck],
      ['Attendance', CalendarDays],
      ['Platform settings', Settings2],
    ] as const;
  }, [role, isStudent, isFaculty, isDean]);

  // Actions
  async function handleCreateCourse(e: React.FormEvent) {
    e.preventDefault();
    try {
      const created = await createCourse({
        code: newCourseCode.trim().toUpperCase(),
        title: newCourseTitle.trim(),
        description: newCourseDesc.trim(),
        term: newCourseTerm,
      });
      setCourses([created, ...courses]);
      setSelectedCourse(created);
      setShowCreateCourse(false);
      setNewCourseCode('');
      setNewCourseTitle('');
      setNewCourseDesc('');
      toast(`Course ${created.code} successfully created in database!`);
    } catch (err: any) {
      toast(`Error creating course: ${err.message}`);
    }
  }

  async function handleCreateAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCourse) {
      toast('Please select a course first.');
      return;
    }
    try {
      const tags = newAssignTags.split(',').map((t) => t.trim()).filter(Boolean);
      const created = await createAssignment(selectedCourse.id, {
        title: newAssignTitle.trim(),
        instructions: newAssignInstructions.trim() || 'Complete the assignment according to rubric instructions.',
        dueAt: newAssignDue,
        maxScore: Number(newAssignMaxScore),
        topicTags: tags,
        rubric: [
          { criterion: 'Technical Reasoning', points: Math.floor(newAssignMaxScore / 2) },
          { criterion: 'Solution Correctness', points: Math.ceil(newAssignMaxScore / 2) },
        ],
      });
      setAssignments([created, ...assignments]);
      setShowCreateAssignment(false);
      setNewAssignTitle('');
      setNewAssignInstructions('');
      toast(`Assignment "${created.title}" saved to course ${selectedCourse.code}!`);
    } catch (err: any) {
      toast(`Error creating assignment: ${err.message}`);
    }
  }

  async function handleSubmitAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!showSubmitModal) return;
    try {
      const sub = await submitAssignment(showSubmitModal.id, {
        content: submitContent.trim() || 'Student submission content.',
        fileUrl: submitFileUrl.trim() || null,
      });
      setSubmissions([sub, ...submissions.filter((s) => s.id !== sub.id)]);
      setShowSubmitModal(null);
      setSubmitContent('');
      setSubmitFileUrl('');
      toast(`Assignment submitted successfully! Status: ${sub.status}`);
    } catch (err: any) {
      toast(`Submission error: ${err.message}`);
    }
  }

  async function handleGradeSubmission(e: React.FormEvent) {
    e.preventDefault();
    if (!showGradeModal) return;
    try {
      const graded = await gradeSubmission(showGradeModal.id, {
        score: Number(gradeScore),
        feedback: gradeFeedback.trim() || 'Good effort. Review rubric breakdown.',
        publish: true,
      });
      setSubmissions(submissions.map((s) => (s.id === graded.id ? graded : s)));
      setShowGradeModal(null);
      setGradeFeedback('');
      toast(`Submission graded with score ${graded.score} and published!`);
    } catch (err: any) {
      toast(`Grading error: ${err.message}`);
    }
  }

  async function handleUpdateRecommendation(recId: string, status: 'IN_PROGRESS' | 'COMPLETED' | 'DISMISSED') {
    try {
      await updateRecommendationStatus(recId, status);
      setRecommendations(recommendations.map((r) => (r.id === recId ? { ...r, status } : r)));
      toast(`Recommendation marked as ${status.replace('_', ' ')}.`);
    } catch (err: any) {
      toast(`Error updating recommendation: ${err.message}`);
    }
  }

  async function handleAcknowledgeAlert(alertId: string) {
    try {
      const res = await acknowledgeAlert(alertId);
      setAlerts(alerts.map((a) => (a.id === alertId ? { ...a, acknowledgedAt: res.acknowledgedAt } : a)));
      toast('Alert acknowledged successfully.');
    } catch (err: any) {
      toast(`Error acknowledging alert: ${err.message}`);
    }
  }

  async function handleCreateIntervention(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      const created = await createIntervention({
        courseId: selectedCourse.id,
        studentId: currentUser?.id || 'student_id',
        type: intervType,
        ownerId: currentUser?.id || 'owner_id',
        dueAt: intervDue,
        notes: intervNotes.trim() || 'Academic tutoring check-in planned.',
      });
      setInterventions([created, ...interventions]);
      setShowInterventionModal(false);
      setIntervNotes('');
      toast('New academic intervention planned and assigned!');
    } catch (err: any) {
      toast(`Error planning intervention: ${err.message}`);
    }
  }

  async function handleToggleInterventionStatus(intId: string, currentStatus: string) {
    const nextStatus = currentStatus === 'PLANNED' ? 'IN_PROGRESS' : currentStatus === 'IN_PROGRESS' ? 'COMPLETED' : 'PLANNED';
    try {
      const updated = await updateIntervention(intId, { status: nextStatus });
      setInterventions(interventions.map((i) => (i.id === intId ? { ...i, status: updated.status } : i)));
      toast(`Intervention status changed to ${nextStatus}.`);
    } catch (err: any) {
      toast(`Error updating intervention: ${err.message}`);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    try {
      const created = await createAdminUser({
        name: newUserName.trim(),
        email: newUserEmail.trim().toLowerCase(),
        roles: [newUserRole],
        status: 'ACTIVE',
      });
      setAdminUsers([created, ...adminUsers]);
      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      toast(`User ${created.name} (${created.email}) created successfully!`);
    } catch (err: any) {
      toast(`Error creating user: ${err.message}`);
    }
  }

  async function handleToggleUserStatus(u: User) {
    const nextStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const updated = await updateAdminUser(u.id, { status: nextStatus });
      setAdminUsers(adminUsers.map((usr) => (usr.id === u.id ? updated : usr)));
      toast(`User ${u.name} is now ${nextStatus}.`);
    } catch (err: any) {
      toast(`Error updating user status: ${err.message}`);
    }
  }

  async function handleMarkAttendance(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCourse) {
      toast('Please select a course first.');
      return;
    }
    if (!markAttStudentId) {
      toast('Please select a student.');
      return;
    }
    try {
      const rec = await recordAttendance(selectedCourse.id, {
        studentId: markAttStudentId,
        date: markAttDate,
        status: markAttStatus,
        remarks: markAttRemarks.trim(),
      });
      const exists = attendanceRecords.some((r) => r.id === rec.id || (r.studentId === rec.studentId && r.date === rec.date));
      if (exists) {
        setAttendanceRecords(attendanceRecords.map((r) => (r.id === rec.id || (r.studentId === rec.studentId && r.date === rec.date) ? rec : r)));
      } else {
        setAttendanceRecords([rec, ...attendanceRecords]);
      }
      setShowMarkAttModal(false);
      setMarkAttRemarks('');
      toast(`Attendance recorded for ${rec.studentName || 'Student'} on ${rec.date} (${rec.status})`);
      const attRes = await getCourseAttendance(selectedCourse.id, { page: 1, pageSize: 300 });
      setAttendanceStats(attRes.stats || null);
    } catch (err: any) {
      toast(`Error marking attendance: ${err.message}`);
    }
  }

  async function handleQuickStatusChange(rec: AttendanceRecord, newStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') {
    try {
      await patchAttendance(rec.id, { status: newStatus });
      setAttendanceRecords(attendanceRecords.map((r) => (r.id === rec.id ? { ...r, status: newStatus } : r)));
      toast(`Attendance updated: ${rec.studentName || 'Student'} marked as ${newStatus}.`);
      if (selectedCourse) {
        const attRes = await getCourseAttendance(selectedCourse.id, { page: 1, pageSize: 300 });
        setAttendanceStats(attRes.stats || null);
      }
    } catch (err: any) {
      toast(`Error updating status: ${err.message}`);
    }
  }

  // High Capacity Search & Pagination Memoizations
  const filteredAttendance = useMemo(() => {
    return attendanceRecords.filter((rec) => {
      if (attDateFilter !== 'ALL' && rec.date !== attDateFilter) return false;
      if (attStatusFilter !== 'ALL' && rec.status !== attStatusFilter) return false;
      if (attSearch.trim()) {
        const q = attSearch.toLowerCase();
        const matchesName = (rec.studentName || '').toLowerCase().includes(q);
        const matchesEmail = (rec.studentEmail || '').toLowerCase().includes(q);
        const matchesRemarks = (rec.remarks || '').toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesRemarks) return false;
      }
      return true;
    });
  }, [attendanceRecords, attDateFilter, attStatusFilter, attSearch]);

  const paginatedAttendance = useMemo(() => {
    const start = (attPage - 1) * attPerPage;
    return filteredAttendance.slice(start, start + attPerPage);
  }, [filteredAttendance, attPage, attPerPage]);

  const totalAttPages = Math.max(1, Math.ceil(filteredAttendance.length / attPerPage));

  const filteredCourses = useMemo(() => {
    return courses.filter((c) =>
      `${c.code} ${c.title} ${c.description} ${c.term}`.toLowerCase().includes(courseSearch.toLowerCase())
    );
  }, [courses, courseSearch]);

  const paginatedCourses = useMemo(() => {
    const start = (coursePage - 1) * coursesPerPage;
    return filteredCourses.slice(start, start + coursesPerPage);
  }, [filteredCourses, coursePage]);

  const totalCoursePages = Math.max(1, Math.ceil(filteredCourses.length / coursesPerPage));

  const filteredAssignments = useMemo(() => {
    const q = (query || '').toLowerCase();
    return assignments.filter((a) =>
      `${a.title} ${a.instructions} ${a.topicTags?.join(' ')}`.toLowerCase().includes(q)
    );
  }, [assignments, query]);

  const paginatedAssignments = useMemo(() => {
    const start = (assignPage - 1) * assignsPerPage;
    return filteredAssignments.slice(start, start + assignsPerPage);
  }, [filteredAssignments, assignPage]);

  const totalAssignPages = Math.max(1, Math.ceil(filteredAssignments.length / assignsPerPage));

  const filteredSubmissions = useMemo(() => {
    const q = subSearch.toLowerCase();
    return submissions.filter((s) => {
      const a = assignments.find((asg) => asg.id === s.assignmentId);
      return `${s.content} ${s.status} ${s.feedback || ''} ${a?.title || ''}`.toLowerCase().includes(q);
    });
  }, [submissions, assignments, subSearch]);

  const paginatedSubmissions = useMemo(() => {
    const start = (subPage - 1) * subsPerPage;
    return filteredSubmissions.slice(start, start + subsPerPage);
  }, [filteredSubmissions, subPage]);

  const totalSubPages = Math.max(1, Math.ceil(filteredSubmissions.length / subsPerPage));

  if (checkingAuth && !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7F4]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#0B6B69] border-t-transparent" />
          <span className="text-xs font-bold text-[#64748B]">Loading Aurora Classroom...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7F4] text-[#17233B]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-xl focus:bg-white focus:p-3 focus:shadow-lg"
      >
        Skip to main content
      </a>

      <div className="flex min-h-screen">
        {/* Mobile Navigation Drawer Overlay */}
        {mobileOpen && (
          <button
            aria-label="Close navigation overlay"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-30 bg-[#17233B]/40 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-[#DCE4E1] bg-white px-4 py-5 transition-transform duration-200 lg:static lg:translate-x-0`}
        >
          {/* Logo Brand */}
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B6B69] text-white shadow-sm">
              <GraduationCap size={24} />
            </div>
            <div>
              <div className="text-[17px] font-extrabold tracking-tight text-[#17233B]">
                aurora<span className="text-[#0B6B69]">.</span>
              </div>
              <div className="text-[10px] font-bold tracking-[.18em] text-[#64748B]">CLASSROOM</div>
            </div>
            <button
              className="ml-auto rounded-lg p-1 text-[#64748B] hover:bg-slate-100 lg:hidden"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            >
              <X size={19} />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="mb-2 px-3 text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">Workspace</div>
          <nav aria-label="Main navigation" className="space-y-1">
            {menu.map(([label, Icon]) => (
              <button
                key={label}
                onClick={() => {
                  setActive(label);
                  setMobileOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                  active === label
                    ? 'bg-[#e6f6ef] font-bold text-[#0B6B69]'
                    : 'text-[#64748B] hover:bg-[#F5F7F4] hover:text-[#17233B]'
                }`}
              >
                <Icon size={18} className={active === label ? 'text-[#0B6B69]' : 'text-[#64748B]'} />
                <span>{label}</span>
                {label === 'Alerts' && alerts.filter((a) => !a.acknowledgedAt).length > 0 && (
                  <span className="ml-auto rounded-full bg-[#F07865] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {alerts.filter((a) => !a.acknowledgedAt).length}
                  </span>
                )}
                {label === 'Submissions' && submissions.filter((s) => s.status !== 'GRADED').length > 0 && (
                  <span className="ml-auto rounded-full bg-[#0B6B69] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {submissions.filter((s) => s.status !== 'GRADED').length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Sidebar Footer & Active User Card */}
          <div className="mt-auto pt-4">
            <div className="mb-4 rounded-2xl border border-[#DCE4E1] bg-[#f3f8f5] p-3.5">
              <div className="mb-1 flex items-center gap-2 text-xs font-bold text-[#17233B]">
                <Sparkles size={15} className="text-[#0B6B69]" />
                Live Academic Sync
              </div>
              <p className="text-[11px] leading-4 text-[#64748B]">
                Connected to FastAPI backend with live SQLite persistence.
              </p>
            </div>

            <div className="flex items-center gap-3 border-t border-[#DCE4E1] px-1 pt-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d9eee5] text-xs font-extrabold text-[#0B6B69]">
                {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : ROLE_ACCOUNTS[role].initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold text-[#17233B]">
                  {currentUser?.name || ROLE_ACCOUNTS[role].name}
                </div>
                <div className="text-[10px] font-medium text-[#64748B]">{ROLE_ACCOUNTS[role]?.label || 'User'} Account</div>
              </div>
              <button
                onClick={handleLogout}
                title="Log Out"
                className="rounded-lg p-1.5 text-[#64748B] hover:bg-red-50 hover:text-red-600 transition"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main id="main" className="min-w-0 flex-1">
          {/* Header Bar */}
          <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-[#DCE4E1] bg-white/95 px-4 backdrop-blur md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                aria-label="Open navigation"
                className="rounded-lg p-2 text-[#64748B] hover:bg-[#F5F7F4] lg:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Menu size={20} />
              </button>
              <div className="hidden text-xs text-[#64748B] sm:block">
                Aurora Classroom <span className="mx-2">/</span>
                <span className="font-bold text-[#17233B]">{active}</span>
              </div>
              <div className="text-sm font-bold text-[#17233B] sm:hidden">{active}</div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search Bar */}
              <label className="hidden items-center gap-2 rounded-xl border border-[#DCE4E1] bg-[#F5F7F4] px-3 py-2 md:flex">
                <Search size={15} className="text-[#64748B]" />
                <input
                  aria-label="Search items"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search assignments, topics..."
                  className="w-36 bg-transparent text-xs text-[#17233B] outline-none placeholder:text-[#64748B]"
                />
              </label>

              {/* Authenticated User Status Badge (Role selector removed from dashboard) */}
              <div className="flex items-center gap-2 rounded-xl border border-[#DCE4E1] bg-[#F5F7F4]/80 px-3 py-1.5 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-extrabold text-[#17233B]">
                  {currentUser?.name || ROLE_ACCOUNTS[role]?.name || 'User'}
                </span>
                <span className="rounded-md bg-[#e6f6ef] px-2 py-0.5 text-[10px] font-black uppercase text-[#0B6B69]">
                  {role}
                </span>
              </div>

              {/* Notifications Icon Button */}
              <button
                aria-label="Notifications"
                onClick={() => setActive('Notifications')}
                className="relative rounded-xl border border-[#DCE4E1] p-2.5 text-[#17233B] hover:bg-[#F5F7F4]"
              >
                <Bell size={17} />
                {alerts.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#F07865]" />}
              </button>

              <button
                title="Refresh Live Data"
                onClick={() => loadLiveData()}
                className="rounded-xl border border-[#DCE4E1] p-2.5 text-[#64748B] hover:bg-[#F5F7F4] hover:text-[#0B6B69]"
              >
                <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
              </button>

              {/* Log Out Button */}
              <button
                title="Sign Out"
                onClick={handleLogout}
                className="rounded-xl border border-[#DCE4E1] p-2.5 text-[#64748B] hover:bg-red-50 hover:text-red-600 transition"
              >
                <LogOut size={17} />
              </button>
            </div>
          </header>

          {/* Main Body */}
          <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-8 md:py-8">
            {/* View Title & Top Actions */}
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  {isStudent
                    ? 'STUDENT ACADEMIC PORTAL'
                    : isFaculty
                    ? 'FACULTY INSTRUCTION WORKSPACE'
                    : isDean
                    ? 'INSTITUTION COHORT INTELLIGENCE'
                    : 'PLATFORM MANAGEMENT CONSOLE'}
                </div>
                <h1 className="text-[26px] font-extrabold tracking-tight text-[#17233B] sm:text-[32px]">
                  {isStudent
                    ? `Welcome back, ${currentUser?.name || 'Jaineel'} 👋`
                    : isFaculty
                    ? `Faculty Hub: ${currentUser?.name || 'Prof. Shah'}`
                    : isDean
                    ? 'Dean Academic Overview'
                    : 'Platform Control Center'}
                </h1>
                <p className="mt-1 text-sm text-[#64748B]">
                  {isStudent
                    ? 'Track your course assignments, view rubric feedback, and build topic mastery.'
                    : isFaculty
                    ? 'Monitor student submissions, apply rubric-based grading, and review explainable risk signals.'
                    : isDean
                    ? 'Review college-wide enrollment, submission timeliness, and intervention outcomes.'
                    : 'Manage user access, configure course workspaces, and maintain platform stability.'}
                </p>
              </div>

              {/* Action Buttons (Rendered only on Overview so they never duplicate with tab-specific headers) */}
              {active === 'Overview' && (
                <div className="flex flex-wrap gap-2">
                  {(isFaculty || isAdmin) && (
                    <button
                      onClick={() => setShowCreateAssignment(true)}
                      className="flex items-center gap-2 rounded-xl bg-[#0B6B69] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#095957]"
                    >
                      <Plus size={15} /> Create Assignment
                    </button>
                  )}
                  {(isAdmin || isDean) && (
                    <button
                      onClick={() => setShowCreateCourse(true)}
                      className="flex items-center gap-2 rounded-xl border border-[#DCE4E1] bg-white px-4 py-2.5 text-xs font-bold text-[#17233B] shadow-sm hover:bg-[#F5F7F4]"
                    >
                      <Plus size={15} /> Add Course
                    </button>
                  )}
                  {isFaculty && (
                    <button
                      onClick={() => setShowInterventionModal(true)}
                      className="flex items-center gap-2 rounded-xl border border-[#DCE4E1] bg-white px-4 py-2.5 text-xs font-bold text-[#17233B] shadow-sm hover:bg-[#F5F7F4]"
                    >
                      <LifeBuoy size={15} /> Plan Intervention
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => setShowAddUserModal(true)}
                      className="flex items-center gap-2 rounded-xl bg-[#0B6B69] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#095957]"
                    >
                      <Plus size={15} /> Add User
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* TAB: OVERVIEW */}
            {active === 'Overview' && (
              <>
                {/* 4 Top KPI Cards */}
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
                  <StatCard
                    title={isDean ? 'Active Students' : isAdmin ? 'Platform Users' : isFaculty ? 'Enrolled Students' : 'Courses Enrolled'}
                    value={isDean ? '1,284' : isAdmin ? `${adminUsers.length || 4}` : isFaculty ? '126' : `${courses.length}`}
                    delta="+8% this month"
                    positive={true}
                    icon={<Users size={18} />}
                    sub={courses.length > 0 ? courses[0].code : 'Active term'}
                  />
                  <StatCard
                    title={isDean ? 'Completion Rate' : isAdmin ? 'Active Courses' : isFaculty ? 'Submissions Awaiting Grade' : 'Assignments Due'}
                    value={isDean ? '86%' : isAdmin ? `${courses.length}` : isFaculty ? `${submissions.filter((s) => s.status !== 'GRADED').length}` : `${assignments.length}`}
                    delta={isStudent ? '1 quiz pending' : 'Requires review'}
                    positive={true}
                    icon={<ClipboardCheck size={18} />}
                    sub={isStudent ? 'Check submission deadlines' : 'From active courses'}
                  />
                  <StatCard
                    title={isDean ? 'Students Needing Support' : isAdmin ? 'System Alerts' : isFaculty ? 'At-Risk Signals' : 'Current Average'}
                    value={isDean ? '94' : isAdmin ? `${alerts.length}` : isFaculty ? `${alerts.length}` : '78%'}
                    delta={isFaculty ? '1 Critical signal' : '↑ 4% from last quiz'}
                    positive={!isFaculty}
                    icon={<Activity size={18} />}
                    sub="Algorithm Complexity · 52%"
                  />
                  <StatCard
                    title={isDean ? 'Interventions Active' : isAdmin ? 'API Service' : isFaculty ? 'Interventions Planned' : 'Active Recommendations'}
                    value={isDean ? '72%' : isAdmin ? 'Healthy' : isFaculty ? `${interventions.length}` : `${recommendations.length}`}
                    delta={isAdmin ? 'All endpoints 200' : 'Personalized'}
                    positive={true}
                    icon={<Sparkles size={18} />}
                    sub={isStudent ? 'Memoization focus' : 'Tracked in database'}
                  />
                </div>

                {/* Charts Grid */}
                <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]">
                  <section className="panel rounded-2xl border border-[#DCE4E1] bg-white p-5 sm:p-6 shadow-sm">
                    <div className="mb-5 flex items-start justify-between">
                      <div>
                        <h2 className="text-base font-extrabold text-[#17233B]">Learning Momentum & Trends</h2>
                        <p className="mt-1 text-xs text-[#64748B]">Assessment performance over the last 8 weeks</p>
                      </div>
                      <span className="rounded-lg bg-[#e6f6ef] p-2 text-[#0B6B69]">
                        <ArrowUpRight size={17} />
                      </span>
                    </div>
                    <div className="mb-4 flex items-end gap-3">
                      <span className="text-3xl font-extrabold text-[#17233B]">82%</span>
                      <span className="mb-1 flex items-center gap-1 text-xs font-bold text-[#0B6B69]">
                        <ArrowUpRight size={14} /> +11.4% <span className="font-normal text-[#64748B]">vs. baseline</span>
                      </span>
                    </div>
                    <div className="h-[210px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activityData} margin={{ top: 8, right: 4, left: -26, bottom: 0 }}>
                          <defs>
                            <linearGradient id="progFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#0B6B69" stopOpacity={0.22} />
                              <stop offset="95%" stopColor="#0B6B69" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="#e8eeeb" strokeDasharray="4 4" vertical={false} />
                          <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                          <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #DCE4E1', fontSize: 12 }} formatter={(v) => [`${v}%`, 'Score']} />
                          <Area type="monotone" dataKey="score" stroke="#0B6B69" strokeWidth={2.5} fill="url(#progFill)" activeDot={{ r: 5, fill: '#0B6B69' }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </section>

                  <section className="panel rounded-2xl border border-[#DCE4E1] bg-white p-5 sm:p-6 shadow-sm">
                    <div className="mb-5 flex items-start justify-between">
                      <div>
                        <h2 className="text-base font-extrabold text-[#17233B]">Topic Confidence & Mastery</h2>
                        <p className="mt-1 text-xs text-[#64748B]">Topic-level strengths and growth areas</p>
                      </div>
                      <span className="rounded-lg bg-[#e6f6ef] p-2 text-[#0B6B69]">
                        <Activity size={17} />
                      </span>
                    </div>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topicData} layout="vertical" margin={{ top: 4, right: 10, left: 6, bottom: 0 }}>
                          <CartesianGrid stroke="#e8eeeb" strokeDasharray="4 4" horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                          <YAxis type="category" dataKey="topic" width={88} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                          <Tooltip formatter={(v) => [`${v}%`, 'Mastery']} />
                          <Bar dataKey="score" fill="#0B6B69" radius={[0, 6, 6, 0]} barSize={16} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3 rounded-xl border border-[#ffe082] bg-[#fff9c4]/40 p-3">
                      <div className="flex items-start gap-2">
                        <Sparkles size={16} className="mt-0.5 shrink-0 text-[#b78103]" />
                        <div>
                          <p className="text-xs font-bold text-[#17233B]">Focus Area: Algorithm Complexity (52%)</p>
                          <p className="mt-0.5 text-[11px] leading-4 text-[#64748B]">
                            Worked example drills available under Recommendations.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Dual Column: Assignments & Support Signals */}
                <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_1fr]">
                  {/* Left Column: Live Assignments */}
                  <section className="panel rounded-2xl border border-[#DCE4E1] bg-white shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between border-b border-[#DCE4E1] p-5 sm:px-6">
                      <div>
                        <h2 className="text-base font-extrabold text-[#17233B]">
                          {isFaculty ? 'Assignments & Submissions' : 'Your Course Assignments'}
                        </h2>
                        <p className="mt-0.5 text-xs text-[#64748B]">
                          Live assignments in {selectedCourse?.code || 'CS204'}
                        </p>
                      </div>
                      <button
                        onClick={() => setActive('Assignments')}
                        className="flex items-center gap-1 text-xs font-bold text-[#0B6B69] hover:underline"
                      >
                        View all <ArrowRight size={14} />
                      </button>
                    </div>

                    <div className="divide-y divide-[#DCE4E1]">
                      {assignments.length === 0 ? (
                        <div className="p-8 text-center text-xs text-[#64748B]">
                          No assignments found. Use "+ Create Assignment" to add one!
                        </div>
                      ) : (
                        assignments.map((a) => {
                          const sub = submissions.find((s) => s.assignmentId === a.id);
                          return (
                            <div
                              key={a.id}
                              className="flex items-center justify-between gap-4 p-4 hover:bg-[#F5F7F4]/60 transition"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6f6ef] text-[#0B6B69]">
                                  <FileText size={18} />
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-[#17233B]">{a.title}</div>
                                  <div className="mt-0.5 text-[11px] text-[#64748B]">
                                    Due: {a.dueAt ? new Date(a.dueAt).toLocaleDateString() : 'Upcoming'} · Max Score: {a.maxScore}
                                  </div>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {a.topicTags?.map((tag) => (
                                      <span key={tag} className="rounded-md bg-[#F5F7F4] px-1.5 py-0.5 text-[10px] font-semibold text-[#64748B]">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {sub ? (
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                                      sub.status === 'GRADED'
                                        ? 'bg-[#e6f8ef] text-[#176a4e]'
                                        : sub.status === 'LATE'
                                        ? 'bg-[#fff0ed] text-[#a93628]'
                                        : 'bg-[#fff7df] text-[#8a6410]'
                                    }`}
                                  >
                                    {sub.status === 'GRADED' ? `Score: ${sub.score}/${a.maxScore}` : sub.status}
                                  </span>
                                ) : isStudent ? (
                                  <button
                                    onClick={() => setShowSubmitModal(a)}
                                    className="rounded-lg bg-[#0B6B69] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#095957]"
                                  >
                                    Submit
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-[#64748B]">No submissions</span>
                                )}

                                {isFaculty && sub && (
                                  <button
                                    onClick={() => {
                                      setShowGradeModal(sub);
                                      setGradeScore(sub.score || 85);
                                      setGradeFeedback(sub.feedback || '');
                                    }}
                                    className="rounded-lg border border-[#DCE4E1] bg-white px-2.5 py-1.5 text-xs font-bold text-[#0B6B69] hover:bg-[#F5F7F4]"
                                  >
                                    <Edit3 size={13} className="inline mr-1" />
                                    Grade
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </section>

                  {/* Right Column: Support Signals / Recommendations */}
                  <section className="panel rounded-2xl border border-[#DCE4E1] bg-white p-5 sm:p-6 shadow-sm">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h2 className="text-base font-extrabold text-[#17233B]">
                          {isFaculty ? 'Explainable Student Risk Alert' : 'Personalized Remediation'}
                        </h2>
                        <p className="mt-0.5 text-xs text-[#64748B]">
                          {isFaculty ? 'Signal backed by transparent signals' : 'Recommended practice for your active topics'}
                        </p>
                      </div>
                      <span className="rounded-lg bg-[#e6f6ef] p-2 text-[#0B6B69]">
                        <Sparkles size={17} />
                      </span>
                    </div>

                    {isFaculty ? (
                      /* Faculty Risk Card */
                      <div className="space-y-3">
                        <div className="rounded-xl border border-[#f4c6bf] bg-[#fff8f6] p-4">
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded-full bg-[#fff0ed] px-2.5 py-1 text-[10px] font-extrabold text-[#a93628]">
                              CRITICAL · REVIEW CONTEXT
                            </span>
                            <span className="text-xs font-extrabold text-[#17233B]">
                              Risk Score: {insights?.riskScore || 78}/100
                            </span>
                          </div>

                          <h3 className="mt-3 text-sm font-extrabold text-[#17233B]">
                            Priya Sharma / Jaineel Shah: Late Submissions & Concept Difficulty
                          </h3>
                          <p className="mt-1 text-xs leading-5 text-[#64748B]">
                            Learner has a 52% Algorithm Complexity score and 3 consecutive late assignments.
                          </p>

                          <div className="mt-3 space-y-1.5 border-t border-[#f4c6bf]/60 pt-3 text-xs">
                            <div className="flex items-center gap-2 text-[#17233B]">
                              <Check size={14} className="text-[#F07865]" />
                              <span>Assessment score: <b>52%</b> (class benchmark 76%)</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#17233B]">
                              <Check size={14} className="text-[#F07865]" />
                              <span>Consecutive late submissions: <b>3</b></span>
                            </div>
                            <div className="flex items-center gap-2 text-[#17233B]">
                              <Check size={14} className="text-[#F07865]" />
                              <span>Struggle topics: <b>Dynamic Programming, Graph Theory</b></span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setShowInterventionModal(true);
                              setIntervNotes('Schedule 1-on-1 tutoring on Dynamic Programming and recursion transition.');
                            }}
                            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#0B6B69] py-2.5 text-xs font-bold text-white hover:bg-[#095957]"
                          >
                            Plan 1-on-1 Tutoring Check-in <ArrowRight size={14} />
                          </button>
                        </div>

                        {alerts.map((al) => (
                          <div key={al.id} className="flex items-center justify-between rounded-xl border border-[#DCE4E1] p-3 text-xs">
                            <div>
                              <div className="font-bold text-[#17233B]">{al.title}</div>
                              <div className="text-[11px] text-[#64748B]">{al.description}</div>
                            </div>
                            <button
                              onClick={() => handleAcknowledgeAlert(al.id)}
                              className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                                al.acknowledgedAt
                                  ? 'bg-[#e6f8ef] text-[#176a4e]'
                                  : 'border border-[#DCE4E1] text-[#0B6B69] hover:bg-[#F5F7F4]'
                              }`}
                            >
                              {al.acknowledgedAt ? 'Acknowledged ✓' : 'Acknowledge'}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Student Recommendation Card */
                      <div className="space-y-3">
                        {recommendations.map((rec) => (
                          <div key={rec.id} className="rounded-xl border border-[#DCE4E1] p-4">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6f6ef] text-[#0B6B69]">
                                <BookOpen size={17} />
                              </div>
                              <div>
                                <span className="rounded-full bg-[#e6f8ef] px-2 py-0.5 text-[10px] font-bold text-[#176a4e]">
                                  {rec.topic}
                                </span>
                                <h3 className="mt-0.5 text-xs font-extrabold text-[#17233B]">{rec.title}</h3>
                              </div>
                            </div>

                            <p className="mt-2.5 text-xs leading-5 text-[#64748B]">{rec.reason}</p>

                            {rec.practiceItems && rec.practiceItems.length > 0 && (
                              <div className="mt-3 space-y-1.5 rounded-lg bg-[#F5F7F4] p-2.5 text-xs">
                                <div className="text-[11px] font-bold text-[#17233B]">Actionable Practice Items:</div>
                                {rec.practiceItems.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-[#64748B]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#0B6B69]" />
                                    <span>{item}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="mt-3.5 flex gap-2">
                              <button
                                onClick={() =>
                                  handleUpdateRecommendation(
                                    rec.id,
                                    rec.status === 'IN_PROGRESS' ? 'COMPLETED' : 'IN_PROGRESS'
                                  )
                                }
                                className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                                  rec.status === 'COMPLETED'
                                    ? 'bg-[#e6f8ef] text-[#176a4e]'
                                    : 'bg-[#0B6B69] text-white hover:bg-[#095957]'
                                }`}
                              >
                                {rec.status === 'COMPLETED'
                                  ? 'Completed ✓'
                                  : rec.status === 'IN_PROGRESS'
                                  ? 'Mark Completed'
                                  : 'Start Practice'}
                              </button>
                              {rec.status !== 'COMPLETED' && (
                                <button
                                  onClick={() => handleUpdateRecommendation(rec.id, 'DISMISSED')}
                                  className="rounded-xl border border-[#DCE4E1] px-3 py-2 text-xs font-bold text-[#64748B] hover:bg-[#F5F7F4]"
                                >
                                  Dismiss
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              </>
            )}

            {/* TAB: COURSES */}
            {active === 'Courses' && (
              <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#17233B]">
                      Course Workspaces ({courses.length})
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Active course: <span className="font-bold text-[#0B6B69]">{selectedCourse?.code || 'None'} - {selectedCourse?.title || ''}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 rounded-xl border border-[#DCE4E1] bg-white px-3 py-1.5 shadow-sm">
                      <Search size={14} className="text-[#64748B]" />
                      <input
                        value={courseSearch}
                        onChange={(e) => {
                          setCourseSearch(e.target.value);
                          setCoursePage(1);
                        }}
                        placeholder="Search courses..."
                        className="w-36 bg-transparent text-xs text-[#17233B] outline-none placeholder:text-[#64748B]"
                      />
                    </label>
                    {(isAdmin || isDean) && (
                      <button
                        onClick={() => setShowCreateCourse(true)}
                        className="flex items-center gap-2 rounded-xl bg-[#0B6B69] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#095957]"
                      >
                        <Plus size={15} /> Add Course
                      </button>
                    )}
                  </div>
                </div>

                {/* Course Cards Grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {paginatedCourses.map((c) => {
                    const isActive = selectedCourse?.id === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCourse(c)}
                        className={`cursor-pointer rounded-2xl border p-5 transition shadow-sm ${
                          isActive
                            ? 'border-[#0B6B69] bg-emerald-50/40 ring-2 ring-[#0B6B69]'
                            : 'border-[#DCE4E1] bg-white hover:border-[#0B6B69]/50 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="rounded-lg bg-[#e6f6ef] px-2.5 py-1 text-xs font-extrabold text-[#0B6B69]">
                            {c.code}
                          </span>
                          <div className="flex items-center gap-2">
                            {isActive && (
                              <span className="rounded-full bg-[#0B6B69] px-2 py-0.5 text-[10px] font-bold text-white">
                                Active Course
                              </span>
                            )}
                            <span className="text-[11px] font-semibold text-[#64748B]">{c.term}</span>
                          </div>
                        </div>
                        <h3 className="mt-3 text-base font-extrabold text-[#17233B]">{c.title}</h3>
                        <p className="mt-1 text-xs text-[#64748B] line-clamp-2">{c.description || 'No course overview provided.'}</p>

                        <div className="mt-4 flex items-center justify-between border-t border-[#DCE4E1] pt-3 text-xs text-[#64748B]">
                          <span>{assignments.filter((a) => a.courseId === c.id).length} Assignments</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectCourse(c);
                            }}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                              isActive
                                ? 'bg-[#0B6B69] text-white shadow-sm'
                                : 'bg-[#e6f6ef] text-[#0B6B69] hover:bg-[#0B6B69] hover:text-white'
                            }`}
                          >
                            {isActive ? 'Active Course ✓' : 'Select Course →'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Course Pagination Controls */}
                {totalCoursePages > 1 && (
                  <div className="flex items-center justify-between border-t border-[#DCE4E1] pt-4 text-xs">
                    <span className="text-[#64748B]">
                      Showing {(coursePage - 1) * coursesPerPage + 1} -{' '}
                      {Math.min(coursePage * coursesPerPage, filteredCourses.length)} of {filteredCourses.length} courses
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={coursePage === 1}
                        onClick={() => setCoursePage((p) => Math.max(1, p - 1))}
                        className="rounded-xl border border-[#DCE4E1] bg-white px-3 py-1.5 font-bold text-[#17233B] hover:bg-[#F5F7F4] disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <span className="font-bold text-[#0B6B69]">
                        {coursePage} / {totalCoursePages}
                      </span>
                      <button
                        disabled={coursePage === totalCoursePages}
                        onClick={() => setCoursePage((p) => Math.min(totalCoursePages, p + 1))}
                        className="rounded-xl border border-[#DCE4E1] bg-white px-3 py-1.5 font-bold text-[#17233B] hover:bg-[#F5F7F4] disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* Active Selected Course Detailed Workspace */}
                {selectedCourse && (
                  <div className="rounded-2xl border border-[#0B6B69]/30 bg-white p-6 shadow-sm">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-[#0B6B69] px-2 py-0.5 text-xs font-bold text-white">Active</span>
                          <span className="text-xs font-bold text-[#0B6B69]">{selectedCourse.code} · {selectedCourse.term}</span>
                        </div>
                        <h3 className="mt-1 text-lg font-extrabold text-[#17233B]">{selectedCourse.title}</h3>
                        <p className="text-xs text-[#64748B]">{selectedCourse.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {(isFaculty || isAdmin) && (
                          <button
                            onClick={() => setShowCreateAssignment(true)}
                            className="flex items-center gap-1.5 rounded-xl bg-[#0B6B69] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#095957]"
                          >
                            <Plus size={14} /> New Assignment
                          </button>
                        )}
                        <button
                          onClick={() => setActive('Assignments')}
                          className="rounded-xl border border-[#DCE4E1] bg-[#F5F7F4] px-3.5 py-2 text-xs font-bold text-[#17233B] hover:bg-white"
                        >
                          View In Assignments →
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-[#DCE4E1] pt-4">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] mb-3">
                        Assignments in {selectedCourse.code} ({assignments.filter((a) => a.courseId === selectedCourse.id).length})
                      </h4>
                      <div className="space-y-2">
                        {assignments.filter((a) => a.courseId === selectedCourse.id).length === 0 ? (
                          <div className="p-4 text-center text-xs text-[#64748B]">No assignments in this course yet.</div>
                        ) : (
                          assignments
                            .filter((a) => a.courseId === selectedCourse.id)
                            .map((a) => (
                              <div key={a.id} className="flex items-center justify-between rounded-xl border border-[#DCE4E1] p-3 text-xs">
                                <div>
                                  <div className="font-bold text-[#17233B]">{a.title}</div>
                                  <div className="text-[11px] text-[#64748B]">
                                    Due: {a.dueAt ? new Date(a.dueAt).toLocaleDateString() : 'Upcoming'} · Max score: {a.maxScore}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {isStudent && (
                                    <button
                                      onClick={() => setShowSubmitModal(a)}
                                      className="rounded-lg bg-[#0B6B69] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#095957]"
                                    >
                                      Submit Work
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: ASSIGNMENTS */}
            {active === 'Assignments' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#17233B]">
                      Assignments ({filteredAssignments.length})
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Course tasks, rubrics, and submission windows
                    </p>
                  </div>
                  {(isFaculty || isAdmin) && (
                    <button
                      onClick={() => setShowCreateAssignment(true)}
                      className="flex items-center gap-2 rounded-xl bg-[#0B6B69] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#095957]"
                    >
                      <Plus size={15} /> Create Assignment
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {paginatedAssignments.map((a) => {
                    const sub = submissions.find((s) => s.assignmentId === a.id);
                    return (
                      <div key={a.id} className="rounded-2xl border border-[#DCE4E1] bg-white p-5 shadow-sm">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="rounded-lg bg-[#e6f6ef] px-2 py-0.5 text-xs font-extrabold text-[#0B6B69]">
                                Max: {a.maxScore} pts
                              </span>
                              <span className="text-xs font-semibold text-[#64748B]">Due: {new Date(a.dueAt).toLocaleString()}</span>
                            </div>
                            <h3 className="mt-2 text-base font-extrabold text-[#17233B]">{a.title}</h3>
                            <p className="mt-1 text-xs text-[#64748B]">{a.instructions}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            {sub ? (
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                                  sub.status === 'GRADED'
                                    ? 'bg-[#e6f8ef] text-[#176a4e]'
                                    : sub.status === 'LATE'
                                    ? 'bg-[#fff0ed] text-[#a93628]'
                                    : 'bg-[#fff7df] text-[#8a6410]'
                                }`}
                              >
                                {sub.status} {sub.score ? `· ${sub.score}/${a.maxScore}` : ''}
                              </span>
                            ) : isStudent ? (
                              <button
                                onClick={() => setShowSubmitModal(a)}
                                className="rounded-xl bg-[#0B6B69] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#095957]"
                              >
                                Submit Assignment
                              </button>
                            ) : (
                              <span className="text-xs text-[#64748B]">Awaiting student submissions</span>
                            )}
                          </div>
                        </div>

                        {/* Rubric Criteria Breakdown */}
                        {a.rubric && a.rubric.length > 0 && (
                          <div className="mt-4 border-t border-[#DCE4E1] pt-3">
                            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B] mb-2">
                              Rubric Assessment Criteria:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {a.rubric.map((r, i) => (
                                <span key={i} className="rounded-lg bg-[#F5F7F4] px-2.5 py-1 text-xs font-semibold text-[#17233B]">
                                  {r.criterion}: <b>{r.points} pts</b>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Assignment Pagination Controls */}
                {totalAssignPages > 1 && (
                  <div className="flex items-center justify-between border-t border-[#DCE4E1] pt-4 text-xs">
                    <span className="text-[#64748B]">
                      Showing {(assignPage - 1) * assignsPerPage + 1} -{' '}
                      {Math.min(assignPage * assignsPerPage, filteredAssignments.length)} of {filteredAssignments.length} assignments
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={assignPage === 1}
                        onClick={() => setAssignPage((p) => Math.max(1, p - 1))}
                        className="rounded-xl border border-[#DCE4E1] bg-white px-3 py-1.5 font-bold text-[#17233B] hover:bg-[#F5F7F4] disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <span className="font-bold text-[#0B6B69]">
                        {assignPage} / {totalAssignPages}
                      </span>
                      <button
                        disabled={assignPage === totalAssignPages}
                        onClick={() => setAssignPage((p) => Math.min(totalAssignPages, p + 1))}
                        className="rounded-xl border border-[#DCE4E1] bg-white px-3 py-1.5 font-bold text-[#17233B] hover:bg-[#F5F7F4] disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: SUBMISSIONS & GRADING */}
            {active === 'Submissions' && (
              <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#17233B]">
                      Student Submissions & Rubric Grading ({submissions.length})
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Scalable high-capacity review for 1000+ submission responses
                    </p>
                  </div>
                  <label className="flex items-center gap-2 rounded-xl border border-[#DCE4E1] bg-white px-3 py-1.5 shadow-sm">
                    <Search size={14} className="text-[#64748B]" />
                    <input
                      value={subSearch}
                      onChange={(e) => {
                        setSubSearch(e.target.value);
                        setSubPage(1);
                      }}
                      placeholder="Search submissions..."
                      className="w-40 bg-transparent text-xs text-[#17233B] outline-none placeholder:text-[#64748B]"
                    />
                  </label>
                </div>

                <div className="rounded-2xl border border-[#DCE4E1] bg-white shadow-sm overflow-hidden">
                  <div className="divide-y divide-[#DCE4E1]">
                    {paginatedSubmissions.length === 0 ? (
                      <div className="p-8 text-center text-xs text-[#64748B]">
                        No matching submissions found.
                      </div>
                    ) : (
                      paginatedSubmissions.map((s) => {
                        const a = assignments.find((asg) => asg.id === s.assignmentId);
                        return (
                          <div key={s.id} className="p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-[#17233B]">
                                  {a?.title || 'Assignment Submission'}
                                </span>
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                                    s.status === 'GRADED'
                                      ? 'bg-[#e6f8ef] text-[#176a4e]'
                                      : s.status === 'LATE'
                                      ? 'bg-[#fff0ed] text-[#a93628]'
                                      : 'bg-[#fff7df] text-[#8a6410]'
                                  }`}
                                >
                                  {s.status}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-[#64748B]">
                                Content: "{s.content}" · Submitted: {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : 'N/A'}
                              </p>
                              {s.feedback && (
                                <p className="mt-1 text-xs font-medium text-[#0B6B69]">
                                  Instructor Feedback: "{s.feedback}" (Score: {s.score}/{a?.maxScore || 100})
                                </p>
                              )}
                            </div>

                            <div>
                              {(isFaculty || isAdmin) && (
                                <button
                                  onClick={() => {
                                    setShowGradeModal(s);
                                    setGradeScore(s.score || 85);
                                    setGradeFeedback(s.feedback || '');
                                  }}
                                  className="flex items-center gap-1.5 rounded-xl bg-[#0B6B69] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#095957]"
                                >
                                  <Edit3 size={14} /> {s.status === 'GRADED' ? 'Edit Grade' : 'Grade Submission'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Submissions Pagination Controls */}
                {totalSubPages > 1 && (
                  <div className="flex items-center justify-between border-t border-[#DCE4E1] pt-4 text-xs">
                    <span className="text-[#64748B]">
                      Showing {(subPage - 1) * subsPerPage + 1} -{' '}
                      {Math.min(subPage * subsPerPage, filteredSubmissions.length)} of {filteredSubmissions.length} submissions
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={subPage === 1}
                        onClick={() => setSubPage((p) => Math.max(1, p - 1))}
                        className="rounded-xl border border-[#DCE4E1] bg-white px-3 py-1.5 font-bold text-[#17233B] hover:bg-[#F5F7F4] disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <span className="font-bold text-[#0B6B69]">
                        {subPage} / {totalSubPages}
                      </span>
                      <button
                        disabled={subPage === totalSubPages}
                        onClick={() => setSubPage((p) => Math.min(totalSubPages, p + 1))}
                        className="rounded-xl border border-[#DCE4E1] bg-white px-3 py-1.5 font-bold text-[#17233B] hover:bg-[#F5F7F4] disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: ATTENDANCE TRACKER */}
            {active === 'Attendance' && (
              <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-[#0B6B69]/10 px-2.5 py-0.5 text-xs font-bold text-[#0B6B69]">
                        {selectedCourse?.code || 'Active Course'}
                      </span>
                      <h2 className="text-xl font-extrabold text-[#17233B]">
                        Attendance & Participation Tracker
                      </h2>
                    </div>
                    <p className="mt-1 text-xs text-[#64748B]">
                      Monitoring classroom presence, punctuality, and verified absences across all course sessions.
                    </p>
                  </div>

                  {(isFaculty || isAdmin) && (
                    <button
                      onClick={() => {
                        setShowMarkAttModal(true);
                        setMarkAttStudentId(currentUser?.id || '');
                        setMarkAttDate('2026-10-15');
                        setMarkAttStatus('PRESENT');
                        setMarkAttRemarks('');
                      }}
                      className="flex items-center gap-2 rounded-xl bg-[#0B6B69] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#095957] transition"
                    >
                      <Plus size={15} /> Mark Attendance
                    </button>
                  )}
                </div>

                {/* Attendance Summary KPI Grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  <div className="rounded-2xl border border-[#DCE4E1] bg-white p-4 shadow-sm">
                    <div className="text-[11px] font-bold text-[#64748B]">Attendance Rate</div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className={`text-2xl font-black ${
                        (attendanceStats?.attendanceRate || 0) >= 85
                          ? 'text-[#0B6B69]'
                          : (attendanceStats?.attendanceRate || 0) >= 75
                          ? 'text-[#D97706]'
                          : 'text-[#DC2626]'
                      }`}>
                        {attendanceStats?.attendanceRate ?? 100}%
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-[#E2E8F0] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          (attendanceStats?.attendanceRate || 0) >= 85
                            ? 'bg-[#0B6B69]'
                            : (attendanceStats?.attendanceRate || 0) >= 75
                            ? 'bg-[#D97706]'
                            : 'bg-[#DC2626]'
                        }`}
                        style={{ width: `${Math.min(100, attendanceStats?.attendanceRate || 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#DCE4E1] bg-white p-4 shadow-sm">
                    <div className="text-[11px] font-bold text-[#64748B]">Total Sessions</div>
                    <div className="mt-1 text-2xl font-black text-[#17233B]">
                      {attendanceStats?.totalSessions || 0}
                    </div>
                    <span className="mt-1 text-[10px] text-[#64748B]">Recorded lectures</span>
                  </div>

                  <div className="rounded-2xl border border-[#DCE4E1] bg-white p-4 shadow-sm">
                    <div className="text-[11px] font-bold text-[#16A34A]">Present</div>
                    <div className="mt-1 text-2xl font-black text-[#16A34A]">
                      {attendanceStats?.present || 0}
                    </div>
                    <span className="mt-1 text-[10px] text-[#64748B]">Full sessions</span>
                  </div>

                  <div className="rounded-2xl border border-[#DCE4E1] bg-white p-4 shadow-sm">
                    <div className="text-[11px] font-bold text-[#D97706]">Late</div>
                    <div className="mt-1 text-2xl font-black text-[#D97706]">
                      {attendanceStats?.late || 0}
                    </div>
                    <span className="mt-1 text-[10px] text-[#64748B]">Partial credit</span>
                  </div>

                  <div className="rounded-2xl border border-[#DCE4E1] bg-white p-4 shadow-sm">
                    <div className="text-[11px] font-bold text-[#DC2626]">Absent</div>
                    <div className="mt-1 text-2xl font-black text-[#DC2626]">
                      {attendanceStats?.absent || 0}
                    </div>
                    <span className="mt-1 text-[10px] text-[#64748B]">Unexcused</span>
                  </div>

                  <div className="rounded-2xl border border-[#DCE4E1] bg-white p-4 shadow-sm">
                    <div className="text-[11px] font-bold text-[#2563EB]">Excused</div>
                    <div className="mt-1 text-2xl font-black text-[#2563EB]">
                      {attendanceStats?.excused || 0}
                    </div>
                    <span className="mt-1 text-[10px] text-[#64748B]">Verified leave</span>
                  </div>
                </div>

                {/* Low Attendance Alert Banner for Students */}
                {isStudent && (attendanceStats?.attendanceRate || 100) < 75 && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-900 flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold">Attendance Advisory Notice:</span>
                      <p className="mt-0.5 text-red-800">
                        Your attendance rate is currently {attendanceStats?.attendanceRate}%, which is below the mandatory 75% institutional threshold. Please speak with your instructor or academic advisor to prevent exam debarment.
                      </p>
                    </div>
                  </div>
                )}

                {/* Filter & Search Bar */}
                <div className="flex flex-col gap-3 rounded-2xl border border-[#DCE4E1] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                  {/* Status Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {['ALL', 'PRESENT', 'LATE', 'ABSENT', 'EXCUSED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          setAttStatusFilter(st);
                          setAttPage(1);
                        }}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                          attStatusFilter === st
                            ? 'bg-[#0B6B69] text-white shadow-sm'
                            : 'bg-[#F5F7F4] text-[#64748B] hover:text-[#17233B]'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {/* Date & Text Search */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Date Selector */}
                    <select
                      value={attDateFilter}
                      onChange={(e) => {
                        setAttDateFilter(e.target.value);
                        setAttPage(1);
                      }}
                      className="rounded-xl border border-[#DCE4E1] bg-[#F5F7F4] px-3 py-1.5 text-xs font-semibold text-[#17233B] outline-none"
                    >
                      <option value="ALL">All Session Dates</option>
                      {attendanceStats?.dates?.map((d) => (
                        <option key={d} value={d}>
                          Session: {d}
                        </option>
                      ))}
                    </select>

                    {/* Search Field */}
                    <label className="flex items-center gap-2 rounded-xl border border-[#DCE4E1] bg-[#F5F7F4] px-3 py-1.5">
                      <Search size={14} className="text-[#64748B]" />
                      <input
                        value={attSearch}
                        onChange={(e) => {
                          setAttSearch(e.target.value);
                          setAttPage(1);
                        }}
                        placeholder="Search student or notes..."
                        className="w-36 bg-transparent text-xs text-[#17233B] outline-none placeholder:text-[#64748B]"
                      />
                    </label>
                  </div>
                </div>

                {/* Attendance Data Table */}
                <div className="rounded-2xl border border-[#DCE4E1] bg-white shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-[#DCE4E1] bg-[#F5F7F4] text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                        <tr>
                          <th className="px-5 py-3.5">Student</th>
                          <th className="px-5 py-3.5">Session Date</th>
                          <th className="px-5 py-3.5">Attendance Status</th>
                          <th className="px-5 py-3.5">Remarks / Reason</th>
                          {(isFaculty || isAdmin) && <th className="px-5 py-3.5 text-right">Quick Update</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DCE4E1]">
                        {paginatedAttendance.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-xs text-[#64748B]">
                              No attendance records found matching the current criteria.
                            </td>
                          </tr>
                        ) : (
                          paginatedAttendance.map((rec) => (
                            <tr key={rec.id} className="hover:bg-[#F5F7F4]/60 transition">
                              <td className="px-5 py-4">
                                <div className="font-extrabold text-[#17233B]">
                                  {rec.studentName || 'Student'}
                                </div>
                                <div className="text-[11px] text-[#64748B]">
                                  {rec.studentEmail || rec.studentId.slice(0, 12)}
                                </div>
                              </td>

                              <td className="px-5 py-4 font-semibold text-[#17233B]">
                                <div className="flex items-center gap-1.5">
                                  <CalendarDays size={13} className="text-[#0B6B69]" />
                                  {rec.date}
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                                    rec.status === 'PRESENT'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : rec.status === 'LATE'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : rec.status === 'ABSENT'
                                      ? 'bg-red-50 text-red-700 border border-red-200'
                                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                                  }`}
                                >
                                  {rec.status === 'PRESENT' && <Check size={11} />}
                                  {rec.status === 'LATE' && <Clock3 size={11} />}
                                  {rec.status === 'ABSENT' && <X size={11} />}
                                  {rec.status === 'EXCUSED' && <FileText size={11} />}
                                  {rec.status}
                                </span>
                              </td>

                              <td className="px-5 py-4 text-[#64748B]">
                                {rec.remarks || <span className="text-slate-300 italic">None</span>}
                              </td>

                              {(isFaculty || isAdmin) && (
                                <td className="px-5 py-4 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      title="Mark Present"
                                      disabled={rec.status === 'PRESENT'}
                                      onClick={() => handleQuickStatusChange(rec, 'PRESENT')}
                                      className="rounded-lg border border-[#DCE4E1] px-2 py-1 text-[10px] font-bold hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-30 transition"
                                    >
                                      P
                                    </button>
                                    <button
                                      title="Mark Late"
                                      disabled={rec.status === 'LATE'}
                                      onClick={() => handleQuickStatusChange(rec, 'LATE')}
                                      className="rounded-lg border border-[#DCE4E1] px-2 py-1 text-[10px] font-bold hover:bg-amber-50 hover:text-amber-700 disabled:opacity-30 transition"
                                    >
                                      L
                                    </button>
                                    <button
                                      title="Mark Absent"
                                      disabled={rec.status === 'ABSENT'}
                                      onClick={() => handleQuickStatusChange(rec, 'ABSENT')}
                                      className="rounded-lg border border-[#DCE4E1] px-2 py-1 text-[10px] font-bold hover:bg-red-50 hover:text-red-700 disabled:opacity-30 transition"
                                    >
                                      A
                                    </button>
                                    <button
                                      title="Mark Excused"
                                      disabled={rec.status === 'EXCUSED'}
                                      onClick={() => handleQuickStatusChange(rec, 'EXCUSED')}
                                      className="rounded-lg border border-[#DCE4E1] px-2 py-1 text-[10px] font-bold hover:bg-blue-50 hover:text-blue-700 disabled:opacity-30 transition"
                                    >
                                      E
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Attendance Pagination Controls */}
                {totalAttPages > 1 && (
                  <div className="flex items-center justify-between border-t border-[#DCE4E1] pt-4 text-xs">
                    <span className="text-[#64748B]">
                      Showing {(attPage - 1) * attPerPage + 1} -{' '}
                      {Math.min(attPage * attPerPage, filteredAttendance.length)} of {filteredAttendance.length} records
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={attPage === 1}
                        onClick={() => setAttPage((p) => Math.max(1, p - 1))}
                        className="rounded-xl border border-[#DCE4E1] bg-white px-3 py-1.5 font-bold text-[#17233B] hover:bg-[#F5F7F4] disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <span className="font-bold text-[#0B6B69]">
                        {attPage} / {totalAttPages}
                      </span>
                      <button
                        disabled={attPage === totalAttPages}
                        onClick={() => setAttPage((p) => Math.min(totalAttPages, p + 1))}
                        className="rounded-xl border border-[#DCE4E1] bg-white px-3 py-1.5 font-bold text-[#17233B] hover:bg-[#F5F7F4] disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: STUDENTS & RISK / MY PROGRESS */}
            {(active === 'Students & Risk' || active === 'My progress') && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold text-[#17233B]">
                    {isStudent ? 'Your Learning Analytics & Mastery' : 'Explainable Student Risk Intelligence'}
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Transparent indicators, topic confidence, and research scenario telemetry
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
                  {/* Left: Explainable Risk Breakdown */}
                  <div className="rounded-2xl border border-[#DCE4E1] bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#DCE4E1] pb-4">
                      <div>
                        <div className="text-xs font-bold text-[#64748B]">Student Profile: Jaineel Shah / Priya Sharma</div>
                        <h3 className="text-lg font-extrabold text-[#17233B]">CS-204 / CS-301 Algorithm Complexity</h3>
                      </div>
                      <div className="text-right">
                        <span className="rounded-full bg-[#fff0ed] px-3 py-1 text-xs font-extrabold text-[#a93628]">
                          COMPOSITE RISK: 78 / 100 (HIGH)
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 space-y-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                        Transparent Indicator Weights:
                      </div>

                      <div className="rounded-xl border border-[#DCE4E1] p-4">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Low Assessment Performance (Algorithm Complexity 52%)</span>
                          <span className="text-[#F07865]">Weight: 0.40 · Contrib: 21 pts</span>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-[#F5F7F4]">
                          <div className="h-full w-[52%] rounded-full bg-[#F07865]" />
                        </div>
                        <p className="mt-2 text-[11px] text-[#64748B]">
                          Midterm quiz score (52%) fell below the 70% threshold.
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#DCE4E1] p-4">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Consecutive Late Submissions (3 assignments)</span>
                          <span className="text-[#F07865]">Weight: 0.35 · Contrib: 35 pts</span>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-[#F5F7F4]">
                          <div className="h-full w-[80%] rounded-full bg-[#F07865]" />
                        </div>
                        <p className="mt-2 text-[11px] text-[#64748B]">
                          Submissions 1, 2, and 3 were marked past deadline.
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#DCE4E1] p-4">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Topic Struggle: Dynamic Programming & Graphs</span>
                          <span className="text-[#E5B44C]">Weight: 0.25 · Contrib: 22 pts</span>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-[#F5F7F4]">
                          <div className="h-full w-[48%] rounded-full bg-[#E5B44C]" />
                        </div>
                        <p className="mt-2 text-[11px] text-[#64748B]">
                          Student shows difficulty transitioning from recursive subproblems to memoization tables.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3 border-t border-[#DCE4E1] pt-4">
                      {isFaculty && (
                        <button
                          onClick={() => {
                            setShowInterventionModal(true);
                            setIntervNotes('Tutoring session on memoization arrays & recurrence relations.');
                          }}
                          className="flex items-center gap-2 rounded-xl bg-[#0B6B69] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#095957]"
                        >
                          <LifeBuoy size={15} /> Plan Academic Intervention
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right: Topic Mastery Breakdown */}
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-[#DCE4E1] bg-white p-5 shadow-sm">
                      <h3 className="text-sm font-extrabold text-[#17233B] mb-3">Topic Mastery Breakdown</h3>
                      <div className="space-y-3">
                        {topicData.map((t) => (
                          <div key={t.topic}>
                            <div className="flex justify-between text-xs font-bold">
                              <span>{t.topic}</span>
                              <span className={t.score < 60 ? 'text-[#F07865]' : 'text-[#0B6B69]'}>{t.score}%</span>
                            </div>
                            <div className="mt-1.5 h-2 w-full rounded-full bg-[#F5F7F4]">
                              <div
                                className={`h-full rounded-full ${t.score < 60 ? 'bg-[#F07865]' : 'bg-[#0B6B69]'}`}
                                style={{ width: `${t.score}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#DCE4E1] bg-white p-5 shadow-sm">
                      <h3 className="text-sm font-extrabold text-[#17233B] mb-2">Ethics & Faculty Guidance</h3>
                      <p className="text-xs leading-5 text-[#64748B]">
                        Signals are rule-based advisory indicators to assist educators, not autonomous diagnostic labels.
                        Faculty are encouraged to discuss circumstances directly with learners before intervening.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: RECOMMENDATIONS */}
            {active === 'Recommendations' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold text-[#17233B]">Personalized Recommendations</h2>
                  <p className="text-xs text-[#64748B]">
                    Rule-based remedial practice micro-modules based on your topic performance
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {recommendations.map((r) => (
                    <div key={r.id} className="rounded-2xl border border-[#DCE4E1] bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="rounded-lg bg-[#e6f6ef] px-2.5 py-1 text-xs font-extrabold text-[#0B6B69]">
                          {r.topic}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                            r.status === 'COMPLETED'
                              ? 'bg-[#e6f8ef] text-[#176a4e]'
                              : r.status === 'IN_PROGRESS'
                              ? 'bg-[#fff7df] text-[#8a6410]'
                              : 'bg-[#F5F7F4] text-[#64748B]'
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>

                      <h3 className="mt-3 text-base font-extrabold text-[#17233B]">{r.title}</h3>
                      <p className="mt-1.5 text-xs leading-5 text-[#64748B]">{r.reason}</p>

                      {r.practiceItems && r.practiceItems.length > 0 && (
                        <div className="mt-4 space-y-2 rounded-xl bg-[#F5F7F4] p-3 text-xs">
                          <div className="font-bold text-[#17233B]">Interactive Learning Tasks:</div>
                          {r.practiceItems.map((item, i) => (
                            <label key={i} className="flex items-center gap-2 text-[#64748B] cursor-pointer">
                              <input type="checkbox" className="rounded text-[#0B6B69]" />
                              <span>{item}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      <div className="mt-5 flex gap-2 border-t border-[#DCE4E1] pt-3">
                        <button
                          onClick={() =>
                            handleUpdateRecommendation(r.id, r.status === 'IN_PROGRESS' ? 'COMPLETED' : 'IN_PROGRESS')
                          }
                          className={`flex-1 rounded-xl py-2 text-xs font-bold ${
                            r.status === 'COMPLETED'
                              ? 'bg-[#e6f8ef] text-[#176a4e]'
                              : 'bg-[#0B6B69] text-white hover:bg-[#095957]'
                          }`}
                        >
                          {r.status === 'COMPLETED' ? 'Completed ✓' : 'Mark In Progress'}
                        </button>
                        <button
                          onClick={() => handleUpdateRecommendation(r.id, 'DISMISSED')}
                          className="rounded-xl border border-[#DCE4E1] px-3 py-2 text-xs font-bold text-[#64748B] hover:bg-[#F5F7F4]"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: INTERVENTIONS */}
            {active === 'Interventions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#17233B]">Academic Interventions ({interventions.length})</h2>
                    <p className="text-xs text-[#64748B]">Document and track support sessions, tutoring, and check-ins</p>
                  </div>
                  <button
                    onClick={() => setShowInterventionModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-[#0B6B69] px-4 py-2 text-xs font-bold text-white shadow-sm"
                  >
                    <Plus size={15} /> Plan Intervention
                  </button>
                </div>

                <div className="rounded-2xl border border-[#DCE4E1] bg-white shadow-sm overflow-hidden">
                  <div className="divide-y divide-[#DCE4E1]">
                    {interventions.length === 0 ? (
                      <div className="p-8 text-center text-xs text-[#64748B]">
                        No interventions logged yet. Click "+ Plan Intervention" to schedule one.
                      </div>
                    ) : (
                      interventions.map((inv) => (
                        <div key={inv.id} className="p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="rounded-lg bg-[#e6f6ef] px-2.5 py-1 text-xs font-extrabold text-[#0B6B69]">
                                {inv.type}
                              </span>
                              <span className="text-xs font-bold text-[#17233B]">Target Due: {inv.dueAt}</span>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                                  inv.status === 'COMPLETED'
                                    ? 'bg-[#e6f8ef] text-[#176a4e]'
                                    : inv.status === 'IN_PROGRESS'
                                    ? 'bg-[#fff7df] text-[#8a6410]'
                                    : 'bg-[#F5F7F4] text-[#64748B]'
                                }`}
                              >
                                {inv.status}
                              </span>
                            </div>
                            <p className="mt-1.5 text-xs text-[#64748B]">Notes: "{inv.notes}"</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleInterventionStatus(inv.id, inv.status)}
                              className="rounded-xl border border-[#DCE4E1] bg-white px-3 py-1.5 text-xs font-bold text-[#0B6B69] hover:bg-[#F5F7F4]"
                            >
                              Advance Status →
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ALERTS / NOTIFICATIONS */}
            {(active === 'Alerts' || active === 'Notifications') && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold text-[#17233B]">Actionable Academic Alerts</h2>
                  <p className="text-xs text-[#64748B]">Review late submissions and topic struggles requiring attention</p>
                </div>

                <div className="space-y-3">
                  {alerts.map((al) => (
                    <div key={al.id} className="rounded-2xl border border-[#DCE4E1] bg-white p-5 shadow-sm">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0ed] text-[#F07865]">
                            <AlertCircle size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="rounded-md bg-[#fff0ed] px-2 py-0.5 text-[10px] font-extrabold text-[#a93628]">
                                {al.severity} SEVERITY
                              </span>
                              <span className="text-xs font-bold text-[#17233B]">{al.title}</span>
                            </div>
                            <p className="mt-1 text-xs text-[#64748B]">{al.description}</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {al.evidence?.map((ev, i) => (
                                <span key={i} className="rounded-md bg-[#F5F7F4] px-2 py-0.5 text-[10px] text-[#64748B]">
                                  {ev}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <button
                            onClick={() => handleAcknowledgeAlert(al.id)}
                            className={`rounded-xl px-4 py-2 text-xs font-bold ${
                              al.acknowledgedAt
                                ? 'bg-[#e6f8ef] text-[#176a4e]'
                                : 'bg-[#0B6B69] text-white hover:bg-[#095957]'
                            }`}
                          >
                            {al.acknowledgedAt ? 'Acknowledged ✓' : 'Acknowledge Alert'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: ADMIN USERS */}
            {active === 'Users & roles' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#17233B]">Platform User Administration</h2>
                    <p className="text-xs text-[#64748B]">Manage accounts, assign roles, and toggle access states</p>
                  </div>
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-[#0B6B69] px-4 py-2 text-xs font-bold text-white shadow-sm"
                  >
                    <Plus size={15} /> Add User
                  </button>
                </div>

                <div className="rounded-2xl border border-[#DCE4E1] bg-white shadow-sm overflow-hidden">
                  <div className="divide-y divide-[#DCE4E1]">
                    {adminUsers.map((u) => (
                      <div key={u.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9eee5] text-xs font-extrabold text-[#0B6B69]">
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#17233B]">{u.name}</div>
                            <div className="text-[11px] text-[#64748B]">{u.email}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            {u.roles?.map((r) => (
                              <span key={r} className="rounded-md bg-[#e6f6ef] px-2 py-0.5 text-[10px] font-extrabold text-[#0B6B69]">
                                {r}
                              </span>
                            ))}
                          </div>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                              u.status === 'ACTIVE' ? 'bg-[#e6f8ef] text-[#176a4e]' : 'bg-[#fff0ed] text-[#a93628]'
                            }`}
                          >
                            {u.status}
                          </span>

                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className="rounded-lg border border-[#DCE4E1] px-2.5 py-1 text-xs font-bold text-[#64748B] hover:bg-[#F5F7F4]"
                          >
                            {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PLATFORM SETTINGS */}
            {active === 'Platform settings' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold text-[#17233B]">Platform Configuration & Telemetry</h2>
                  <p className="text-xs text-[#64748B]">Service health, database status, and active API endpoints</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-[#DCE4E1] bg-white p-5 shadow-sm space-y-3">
                    <h3 className="text-sm font-extrabold text-[#17233B]">Backend Service</h3>
                    <div className="text-xs text-[#64748B] space-y-2">
                      <div className="flex justify-between">
                        <span>API Base URL:</span>
                        <b className="text-[#17233B]">http://localhost:8000/api/v1</b>
                      </div>
                      <div className="flex justify-between">
                        <span>Health Endpoint:</span>
                        <b className="text-[#0B6B69]">HTTP 200 (Active)</b>
                      </div>
                      <div className="flex justify-between">
                        <span>Database Driver:</span>
                        <b className="text-[#17233B]">SQLite (aurora.db)</b>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#DCE4E1] bg-white p-5 shadow-sm space-y-3">
                    <h3 className="text-sm font-extrabold text-[#17233B]">Active Session Context</h3>
                    <div className="text-xs text-[#64748B] space-y-2">
                      <div className="flex justify-between">
                        <span>Current User:</span>
                        <b className="text-[#17233B]">{currentUser?.name} ({currentUser?.email})</b>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Role:</span>
                        <b className="text-[#0B6B69]">{role}</b>
                      </div>
                      <div className="flex justify-between">
                        <span>Live Sync:</span>
                        <b className="text-[#0B6B69]">Enabled</b>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: DEAN COHORT ANALYTICS */}
            {active === 'Cohort analytics' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold text-[#17233B]">College Cohort Analytics</h2>
                  <p className="text-xs text-[#64748B]">Aggregated metrics across active terms without individual exposure</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-[#DCE4E1] bg-white p-5 shadow-sm">
                    <div className="text-xs font-bold text-[#64748B]">Cohort Completion Rate</div>
                    <div className="mt-2 text-3xl font-extrabold text-[#17233B]">86%</div>
                    <div className="mt-1 text-xs text-[#0B6B69]">↑ 6% higher than prior term</div>
                  </div>
                  <div className="rounded-2xl border border-[#DCE4E1] bg-white p-5 shadow-sm">
                    <div className="text-xs font-bold text-[#64748B]">Intervention Success Rate</div>
                    <div className="mt-2 text-3xl font-extrabold text-[#17233B]">72%</div>
                    <div className="mt-1 text-xs text-[#0B6B69]">On track to meet college goal</div>
                  </div>
                  <div className="rounded-2xl border border-[#DCE4E1] bg-white p-5 shadow-sm">
                    <div className="text-xs font-bold text-[#64748B]">Risk Distribution</div>
                    <div className="mt-2 text-3xl font-extrabold text-[#17233B]">8 Low / 3 Med / 1 High</div>
                    <div className="mt-1 text-xs text-[#64748B]">12 active cohorts tracked</div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <footer className="mt-12 flex flex-col gap-2 border-t border-[#DCE4E1] py-5 text-[11px] text-[#64748B] sm:flex-row sm:items-center sm:justify-between">
              <span>© 2026 Aurora Classroom · PS-04 Academic Collaboration Platform</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#0B6B69]" /> FastAPI Backend Connected (Port 8000)
              </span>
            </footer>
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-40px)] items-start gap-3 rounded-xl bg-[#17233B] px-4 py-3 text-sm text-white shadow-xl animate-fade-in"
        >
          <Check size={18} className="mt-0.5 shrink-0 text-[#B8F0D2]" />
          <span>{notice}</span>
          <button aria-label="Dismiss notification" onClick={() => setNotice('')} className="ml-2 hover:opacity-75">
            <X size={15} />
          </button>
        </div>
      )}

      {/* MODAL: CREATE COURSE */}
      {showCreateCourse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#17233B]/40 backdrop-blur-sm p-4"
          onMouseDown={(e) => e.target === e.currentTarget && setShowCreateCourse(false)}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#17233B]">Create Course Workspace</h3>
              <button onClick={() => setShowCreateCourse(false)} className="rounded-lg p-1 text-[#64748B] hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17233B]">Course Code</label>
                <input
                  required
                  placeholder="e.g. CS204"
                  value={newCourseCode}
                  onChange={(e) => setNewCourseCode(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DCE4E1] px-3 py-2 text-xs outline-none focus:border-[#0B6B69]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17233B]">Course Title</label>
                <input
                  required
                  placeholder="e.g. Data Structures & Algorithms"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DCE4E1] px-3 py-2 text-xs outline-none focus:border-[#0B6B69]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17233B]">Term</label>
                <input
                  required
                  value={newCourseTerm}
                  onChange={(e) => setNewCourseTerm(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DCE4E1] px-3 py-2 text-xs outline-none focus:border-[#0B6B69]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17233B]">Description</label>
                <textarea
                  rows={3}
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DCE4E1] px-3 py-2 text-xs outline-none focus:border-[#0B6B69]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCourse(false)}
                  className="rounded-xl border border-[#DCE4E1] px-4 py-2 text-xs font-bold text-[#64748B]"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-[#0B6B69] px-4 py-2 text-xs font-bold text-white">
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE ASSIGNMENT */}
      {showCreateAssignment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#17233B]/40 backdrop-blur-sm p-4"
          onMouseDown={(e) => e.target === e.currentTarget && setShowCreateAssignment(false)}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#17233B]">Create Course Assignment</h3>
              <button onClick={() => setShowCreateAssignment(false)} className="rounded-lg p-1 text-[#64748B] hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17233B]">Assignment Title</label>
                <input
                  required
                  placeholder="e.g. Dynamic Programming Lab"
                  value={newAssignTitle}
                  onChange={(e) => setNewAssignTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DCE4E1] px-3 py-2 text-xs outline-none focus:border-[#0B6B69]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17233B]">Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Explain instructions and rubric criteria..."
                  value={newAssignInstructions}
                  onChange={(e) => setNewAssignInstructions(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DCE4E1] px-3 py-2 text-xs outline-none focus:border-[#0B6B69]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17233B]">Max Score</label>
                  <input
                    type="number"
                    required
                    value={newAssignMaxScore}
                    onChange={(e) => setNewAssignMaxScore(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-[#DCE4E1] px-3 py-2 text-xs outline-none focus:border-[#0B6B69]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#17233B]">Due Date</label>
                  <input
                    required
                    value={newAssignDue}
                    onChange={(e) => setNewAssignDue(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#DCE4E1] px-3 py-2 text-xs outline-none focus:border-[#0B6B69]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17233B]">Topic Tags (comma-separated)</label>
                <input
                  value={newAssignTags}
                  onChange={(e) => setNewAssignTags(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DCE4E1] px-3 py-2 text-xs outline-none focus:border-[#0B6B69]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateAssignment(false)}
                  className="rounded-xl border border-[#DCE4E1] px-4 py-2 text-xs font-bold text-[#64748B]"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-[#0B6B69] px-4 py-2 text-xs font-bold text-white">
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT ASSIGNMENT */}
      {showSubmitModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#17233B]/40 backdrop-blur-sm p-4"
          onMouseDown={(e) => e.target === e.currentTarget && setShowSubmitModal(null)}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0B6B69]">Submit Work</span>
                <h3 className="text-base font-extrabold text-[#17233B]">{showSubmitModal.title}</h3>
              </div>
              <button onClick={() => setShowSubmitModal(null)} className="rounded-lg p-1 text-[#64748B] hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17233B]">Written Response / Solution</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter your solution, code, or explanation here..."
                  value={submitContent}
                  onChange={(e) => setSubmitContent(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DCE4E1] px-3 py-2 text-xs outline-none focus:border-[#0B6B69]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17233B]">File URL (optional, HTTPS)</label>
                <input
                  placeholder="https://github.com/... or https://..."
                  value={submitFileUrl}
                  onChange={(e) => setSubmitFileUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DCE4E1] px-3 py-2 text-xs outline-none focus:border-[#0B6B69]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(null)}
                  className="rounded-xl border border-[#DCE4E1] px-4 py-2 text-xs font-bold text-[#64748B]"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-[#0B6B69] px-4 py-2 text-xs font-bold text-white">
                  Submit Work
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RUBRIC GRADING */}
      {showGradeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#17233B]/40 backdrop-blur-sm p-4"
          onMouseDown={(e) => e.target === e.currentTarget && setShowGradeModal(null)}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0B6B69]">Rubric Assessment</span>
                <h3 className="text-base font-extrabold text-[#17233B]">Grade Submission</h3>
              </div>
              <button onClick={() => setShowGradeModal(null)} className="rounded-lg p-1 text-[#64748B] hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleGradeSubmission} className="space-y-4">
              <div className="rounded-xl bg-[#F5F7F4] p-3 text-xs text-[#64748B]">
                <b>Student Submission Content:</b>
                <p className="mt-1 text-[#17233B]">"{showGradeModal.content}"</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17233B]">Total Score (Max 100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={gradeScore}
                  onChange={(e) => setGradeScore(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[#DCE4E1] px-3 py-2 text-xs outline-none focus:border-[#0B6B69]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17233B]">Actionable Feedback & Rubric Notes</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Good grasp of memoization table state transitions; strengthen base case handling."
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DCE4E1] px-3 py-2 text-xs outline-none focus:border-[#0B6B69]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGradeModal(null)}
                  className="rounded-xl border border-[#DCE4E1] px-4 py-2 text-xs font-bold text-[#64748B]"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-[#0B6B69] px-4 py-2 text-xs font-bold text-white">
                  Publish Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PLAN INTERVENTION */}
      {showInterventionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#17233B]/40 backdrop-blur-sm p-4"
          onMouseDown={(e) => e.target === e.currentTarget && setShowInterventionModal(false)}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#17233B]">Plan Academic Intervention</h3>
              <button onClick={() => setShowInterventionModal(false)} className="rounded-lg p-1 text-[#64748B] hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateIntervention} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17233B]">Intervention Type</label>
                <select
                  value={intervType}
                  onChange={(e) => setIntervType(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DCE4E1] px-3 py-2 text-xs outline-none focus:border-[#0B6B69]"
                >
                  <option value="TUTORING">One-on-One Tutoring Check-in</option>
                  <option value="CHECK_IN">Academic Milestone Check-in</option>
                  <option value="RESOURCE_ASSIGNMENT">Targeted Practice Module</option>
                  <option value="PEER_SUPPORT">Peer Study Group Mentorship</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17233B]">Target Due Date</label>
                <input
                  required
                  value={intervDue}
                  onChange={(e) => setIntervDue(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DCE4E1] px-3 py-2 text-xs outline-none focus:border-[#0B6B69]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17233B]">Session Notes & Action Plan</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specify topics to review and study schedule adjustments..."
                  value={intervNotes}
                  onChange={(e) => setIntervNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DCE4E1] px-3 py-2 text-xs outline-none focus:border-[#0B6B69]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInterventionModal(false)}
                  className="rounded-xl border border-[#DCE4E1] px-4 py-2 text-xs font-bold text-[#64748B]"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-[#0B6B69] px-4 py-2 text-xs font-bold text-white">
                  Schedule Support
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD USER (ADMIN) */}
      {showAddUserModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#17233B]/40 backdrop-blur-sm p-4"
          onMouseDown={(e) => e.target === e.currentTarget && setShowAddUserModal(false)}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#17233B]">Create Platform User</h3>
              <button onClick={() => setShowAddUserModal(false)} className="rounded-lg p-1 text-[#64748B] hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17233B]">Full Name</label>
                <input
                  required
                  placeholder="e.g. Maya Patel"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DCE4E1] px-3 py-2 text-xs outline-none focus:border-[#0B6B69]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17233B]">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. maya@aurora.demo"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DCE4E1] px-3 py-2 text-xs outline-none focus:border-[#0B6B69]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17233B]">Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as Role)}
                  className="mt-1 w-full rounded-xl border border-[#DCE4E1] px-3 py-2 text-xs outline-none focus:border-[#0B6B69]"
                >
                  <option value="STUDENT">Student</option>
                  <option value="FACULTY">Faculty</option>
                  <option value="DEAN">Dean</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="rounded-xl border border-[#DCE4E1] px-4 py-2 text-xs font-bold text-[#64748B]"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-[#0B6B69] px-4 py-2 text-xs font-bold text-white">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MARK ATTENDANCE */}
      {showMarkAttModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#17233B]/40 backdrop-blur-sm p-4"
          onMouseDown={(e) => e.target === e.currentTarget && setShowMarkAttModal(false)}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0B6B69]">
                  Course Attendance Session
                </span>
                <h3 className="text-base font-extrabold text-[#17233B]">Record Student Attendance</h3>
              </div>
              <button
                onClick={() => setShowMarkAttModal(false)}
                className="rounded-lg p-1 text-[#64748B] hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleMarkAttendance} className="space-y-4">
              <div className="rounded-xl bg-[#F5F7F4] p-3 text-xs text-[#64748B]">
                <b>Selected Course:</b> {selectedCourse?.code} · {selectedCourse?.title}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17233B]">Student Identifier / Name</label>
                <select
                  required
                  value={markAttStudentId}
                  onChange={(e) => setMarkAttStudentId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DCE4E1] px-3 py-2 text-xs outline-none focus:border-[#0B6B69]"
                >
                  <option value="">Select Student...</option>
                  {currentUser && (
                    <option value={currentUser.id}>{currentUser.name} ({currentUser.email})</option>
                  )}
                  {attendanceRecords
                    .map((r) => ({ id: r.studentId, name: r.studentName, email: r.studentEmail }))
                    .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i && v.id !== currentUser?.id)
                    .map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name || 'Student'} ({st.email || st.id.slice(0, 8)})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17233B]">Session Date</label>
                  <input
                    type="date"
                    required
                    value={markAttDate}
                    onChange={(e) => setMarkAttDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#DCE4E1] px-3 py-2 text-xs outline-none focus:border-[#0B6B69]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17233B]">Status</label>
                  <select
                    value={markAttStatus}
                    onChange={(e) => setMarkAttStatus(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-[#DCE4E1] px-3 py-2 text-xs outline-none focus:border-[#0B6B69]"
                  >
                    <option value="PRESENT">PRESENT (On Time)</option>
                    <option value="LATE">LATE (Partial Credit)</option>
                    <option value="ABSENT">ABSENT (Unexcused)</option>
                    <option value="EXCUSED">EXCUSED (Verified Leave)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17233B]">Remarks / Justification (Optional)</label>
                <input
                  placeholder="e.g. Active participation or transit delay"
                  value={markAttRemarks}
                  onChange={(e) => setMarkAttRemarks(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DCE4E1] px-3 py-2 text-xs outline-none focus:border-[#0B6B69]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMarkAttModal(false)}
                  className="rounded-xl border border-[#DCE4E1] px-4 py-2 text-xs font-bold text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0B6B69] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#095957]"
                >
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  delta,
  positive,
  icon,
  sub,
}: {
  title: string;
  value: string;
  delta: string;
  positive: boolean;
  icon: React.ReactNode;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-[#DCE4E1] bg-white p-4 sm:p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-[#64748B] sm:text-xs">{title}</span>
        <span className="rounded-xl bg-[#F5F7F4] p-2 text-[#0B6B69]">{icon}</span>
      </div>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-[25px] font-extrabold tracking-tight text-[#17233B] sm:text-[29px]">{value}</span>
        <span
          className={`flex items-center gap-0.5 text-[10px] font-bold ${
            positive ? 'text-[#0B6B69]' : 'text-[#b54739]'
          }`}
        >
          {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          <span>{delta}</span>
        </span>
      </div>
      <p className="mt-2 text-[10px] text-[#64748B]">{sub}</p>
    </div>
  );
}
