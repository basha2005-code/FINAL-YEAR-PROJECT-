export type UserRole = 'teacher' | 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  marks: number;
  attendance: number;
  grade: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  subjects: SubjectPerformance[];
}

export interface SubjectPerformance {
  subject: string;
  marks: number;
  maxMarks: number;
  attendance: number;
  grade: string;
}

export interface ClassStats {
  totalStudents: number;
  averageMarks: number;
  averageAttendance: number;
  atRiskCount: number;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface Report {
  id: string;
  type: 'student' | 'class' | 'subject';
  title: string;
  date: string;
  description: string;
}
