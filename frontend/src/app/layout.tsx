import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Aurora Classroom | Academic collaboration', description: 'An accessible academic collaboration prototype for students and faculty.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
