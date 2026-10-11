'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Award,
  Users,
} from 'lucide-react';
import { login, getStoredToken, getCurrentUser } from '@/lib/api';
import type { Role } from '@/lib/types';

interface DemoAccount {
  role: Role;
  label: string;
  name: string;
  email: string;
  pass: string;
  badge: string;
  icon: typeof BookOpen;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'STUDENT',
    label: 'Student',
    name: 'Jaineel Shah',
    email: 'student@aurora.demo',
    pass: 'StudentDemo2026!',
    badge: 'Coursework & Mastery',
    icon: BookOpen,
  },
  {
    role: 'FACULTY',
    label: 'Faculty',
    name: 'Ananya Shah',
    email: 'faculty@aurora.demo',
    pass: 'FacultyDemo2026!',
    badge: 'Grading & Interventions',
    icon: Award,
  },
  {
    role: 'DEAN',
    label: 'Dean',
    name: 'Dr. Mehta',
    email: 'dean@aurora.demo',
    pass: 'DeanDemo2026!',
    badge: 'Institutional Intelligence',
    icon: Users,
  },
  {
    role: 'ADMIN',
    label: 'Admin',
    name: 'Platform Admin',
    email: 'admin@aurora.demo',
    pass: 'AdminDemo2026!',
    badge: 'Full Access & Config',
    icon: ShieldCheck,
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      getCurrentUser()
        .then(() => {
          router.replace('/');
        })
        .catch(() => {
          // Token expired or invalid, remain on login
        });
    }
  }, [router]);

  async function handleLogin(targetEmail = email, targetPass = password) {
    if (!targetEmail || !targetPass) {
      setError('Please provide both email address and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await login(targetEmail, targetPass);
      if (typeof window !== 'undefined') {
        localStorage.setItem('aurora_user', JSON.stringify(res.user));
      }
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  }

  function handleSelectDemo(acc: DemoAccount, autoSubmit = false) {
    setEmail(acc.email);
    setPassword(acc.pass);
    setSelectedRole(acc.role);
    setError(null);
    if (autoSubmit) {
      handleLogin(acc.email, acc.pass);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7F4] text-[#17233B]">
      {/* Top Simple Navigation Header */}
      <header className="flex h-16 items-center justify-between border-b border-[#DCE4E1] bg-white px-6 md:px-12">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B6B69] text-white shadow-sm">
            <GraduationCap size={20} />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-[#17233B]">
            aurora<span className="text-[#0B6B69]">.</span>
          </span>
          <span className="hidden rounded-full bg-[#e6f6ef] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0B6B69] sm:inline-block">
            Classroom OS
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Backend Live (FastAPI)
        </div>
      </header>

      {/* Main Login Container */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 overflow-hidden rounded-3xl border border-[#DCE4E1] bg-white shadow-xl lg:grid-cols-12">
          
          {/* Left / Top Side: Login Form */}
          <div className="flex flex-col justify-between p-7 sm:p-10 lg:col-span-7">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#e6f6ef] px-3 py-1 text-xs font-bold text-[#0B6B69]">
                <Sparkles size={14} /> Secure Academic Portal
              </div>
              <h1 className="text-2xl font-black tracking-tight text-[#17233B] sm:text-3xl">
                Sign in to your account
              </h1>
              <p className="mt-1.5 text-xs text-[#64748B]">
                Access course workspaces, assignments, rubric scoring, and intelligence feeds.
              </p>

              {/* Error Message */}
              {error && (
                <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-700">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Credentials Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin();
                }}
                className="mt-6 space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-[#17233B]">
                    Email Address
                  </label>
                  <div className="relative mt-1.5">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64748B]">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. student@aurora.demo"
                      className="w-full rounded-xl border border-[#DCE4E1] bg-[#F5F7F4]/60 py-2.5 pl-10 pr-3.5 text-xs font-medium text-[#17233B] outline-none transition focus:border-[#0B6B69] focus:bg-white focus:ring-2 focus:ring-[#0B6B69]/15"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#17233B]">
                      Password
                    </label>
                    <span className="text-[11px] text-[#64748B]">Demo protected</span>
                  </div>
                  <div className="relative mt-1.5">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64748B]">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-[#DCE4E1] bg-[#F5F7F4]/60 py-2.5 pl-10 pr-10 text-xs font-medium text-[#17233B] outline-none transition focus:border-[#0B6B69] focus:bg-white focus:ring-2 focus:ring-[#0B6B69]/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#64748B] hover:text-[#17233B]"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B6B69] py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#095957] active:scale-[0.99] disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-8 border-t border-[#DCE4E1] pt-4 text-center text-[11px] text-[#64748B]">
              Aurora Academic System · Multi-role role-based access control enabled
            </div>
          </div>

          {/* Right / Side Panel: Demo Accounts Quick-Select */}
          <div className="border-t border-[#DCE4E1] bg-[#f9fbfa] p-7 sm:p-10 lg:border-l lg:border-t-0 lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#17233B]">
                <ShieldCheck size={17} className="text-[#0B6B69]" />
                Demo Credentials & Roles
              </div>
              <p className="mt-1 text-xs text-[#64748B]">
                Click any role card below to instantly populate credentials and test that workflow:
              </p>

              <div className="mt-4 space-y-2.5">
                {DEMO_ACCOUNTS.map((acc) => {
                  const Icon = acc.icon;
                  const isCurrent = selectedRole === acc.role;
                  return (
                    <div
                      key={acc.role}
                      onClick={() => handleSelectDemo(acc, false)}
                      className={`cursor-pointer rounded-2xl border p-3.5 transition ${
                        isCurrent
                          ? 'border-[#0B6B69] bg-white ring-2 ring-[#0B6B69]/20 shadow-sm'
                          : 'border-[#DCE4E1] bg-white/70 hover:border-[#0B6B69]/50 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
                              isCurrent ? 'bg-[#0B6B69] text-white' : 'bg-[#e6f6ef] text-[#0B6B69]'
                            }`}
                          >
                            <Icon size={16} />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#17233B]">
                              {acc.name}{' '}
                              <span className="text-[10px] font-semibold text-[#64748B]">({acc.label})</span>
                            </div>
                            <div className="text-[11px] text-[#64748B]">{acc.email}</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectDemo(acc, true);
                          }}
                          className="rounded-lg bg-[#e6f6ef] px-2 py-1 text-[10px] font-extrabold text-[#0B6B69] hover:bg-[#0B6B69] hover:text-white transition"
                        >
                          Quick Login →
                        </button>
                      </div>
                      <div className="mt-2 text-[10px] font-medium text-[#64748B]">
                        Scope: {acc.badge}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[#DCE4E1] bg-white p-3 text-[11px] text-[#64748B]">
              <span className="font-bold text-[#17233B]">Tip:</span> You can also test with custom seeded student accounts like <code className="text-[#0B6B69]">kabir@aurora.demo</code> (Password: <code className="text-[#0B6B69]">Student2026!</code>).
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
