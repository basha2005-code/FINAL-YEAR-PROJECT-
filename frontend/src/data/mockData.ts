import { Student, ClassStats, ChartData, Report } from '../types';

export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@university.edu',
    marks: 35,
    attendance: 68,
    grade: 'F',
    riskLevel: 'High',
    subjects: [
      { subject: 'Mathematics', marks: 32, maxMarks: 100, attendance: 65, grade: 'F' },
      { subject: 'Physics', marks: 38, maxMarks: 100, attendance: 70, grade: 'F' },
      { subject: 'Chemistry', marks: 35, maxMarks: 100, attendance: 69, grade: 'F' },
    ],
  },
  {
    id: '2',
    name: 'Emily Johnson',
    email: 'emily.johnson@university.edu',
    marks: 78,
    attendance: 92,
    grade: 'B',
    riskLevel: 'Low',
    subjects: [
      { subject: 'Mathematics', marks: 75, maxMarks: 100, attendance: 90, grade: 'B' },
      { subject: 'Physics', marks: 80, maxMarks: 100, attendance: 93, grade: 'A' },
      { subject: 'Chemistry', marks: 79, maxMarks: 100, attendance: 93, grade: 'B' },
    ],
  },
  {
    id: '3',
    name: 'Michael Davis',
    email: 'michael.davis@university.edu',
    marks: 58,
    attendance: 73,
    grade: 'D',
    riskLevel: 'Medium',
    subjects: [
      { subject: 'Mathematics', marks: 55, maxMarks: 100, attendance: 70, grade: 'D' },
      { subject: 'Physics', marks: 60, maxMarks: 100, attendance: 75, grade: 'C' },
      { subject: 'Chemistry', marks: 59, maxMarks: 100, attendance: 74, grade: 'D' },
    ],
  },
  {
    id: '4',
    name: 'Sarah Williams',
    email: 'sarah.williams@university.edu',
    marks: 88,
    attendance: 95,
    grade: 'A',
    riskLevel: 'Low',
    subjects: [
      { subject: 'Mathematics', marks: 90, maxMarks: 100, attendance: 96, grade: 'A' },
      { subject: 'Physics', marks: 86, maxMarks: 100, attendance: 94, grade: 'A' },
      { subject: 'Chemistry', marks: 88, maxMarks: 100, attendance: 95, grade: 'A' },
    ],
  },
  {
    id: '5',
    name: 'David Brown',
    email: 'david.brown@university.edu',
    marks: 42,
    attendance: 71,
    grade: 'F',
    riskLevel: 'High',
    subjects: [
      { subject: 'Mathematics', marks: 40, maxMarks: 100, attendance: 68, grade: 'F' },
      { subject: 'Physics', marks: 44, maxMarks: 100, attendance: 73, grade: 'F' },
      { subject: 'Chemistry', marks: 42, maxMarks: 100, attendance: 72, grade: 'F' },
    ],
  },
  {
    id: '6',
    name: 'Jessica Martinez',
    email: 'jessica.martinez@university.edu',
    marks: 72,
    attendance: 88,
    grade: 'B',
    riskLevel: 'Low',
    subjects: [
      { subject: 'Mathematics', marks: 70, maxMarks: 100, attendance: 86, grade: 'B' },
      { subject: 'Physics', marks: 74, maxMarks: 100, attendance: 89, grade: 'B' },
      { subject: 'Chemistry', marks: 72, maxMarks: 100, attendance: 89, grade: 'B' },
    ],
  },
  {
    id: '7',
    name: 'Robert Wilson',
    email: 'robert.wilson@university.edu',
    marks: 38,
    attendance: 65,
    grade: 'F',
    riskLevel: 'High',
    subjects: [
      { subject: 'Mathematics', marks: 35, maxMarks: 100, attendance: 62, grade: 'F' },
      { subject: 'Physics', marks: 40, maxMarks: 100, attendance: 67, grade: 'F' },
      { subject: 'Chemistry', marks: 39, maxMarks: 100, attendance: 66, grade: 'F' },
    ],
  },
  {
    id: '8',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@university.edu',
    marks: 65,
    attendance: 82,
    grade: 'C',
    riskLevel: 'Low',
    subjects: [
      { subject: 'Mathematics', marks: 63, maxMarks: 100, attendance: 80, grade: 'C' },
      { subject: 'Physics', marks: 67, maxMarks: 100, attendance: 83, grade: 'C' },
      { subject: 'Chemistry', marks: 65, maxMarks: 100, attendance: 83, grade: 'C' },
    ],
  },
];

export const classStats: ClassStats = {
  totalStudents: 120,
  averageMarks: 64.5,
  averageAttendance: 79.2,
  atRiskCount: 18,
};

export const subjectPerformanceData: ChartData[] = [
  { name: 'Mathematics', average: 62 },
  { name: 'Physics', average: 68 },
  { name: 'Chemistry', average: 65 },
  { name: 'Biology', average: 71 },
  { name: 'Computer Science', average: 75 },
];

export const attendanceTrendData: ChartData[] = [
  { name: 'Week 1', attendance: 85 },
  { name: 'Week 2', attendance: 82 },
  { name: 'Week 3', attendance: 79 },
  { name: 'Week 4', attendance: 76 },
  { name: 'Week 5', attendance: 78 },
  { name: 'Week 6', attendance: 80 },
  { name: 'Week 7', attendance: 79 },
  { name: 'Week 8', attendance: 81 },
];

export const passFailData: ChartData[] = [
  { name: 'Pass', value: 85 },
  { name: 'Fail', value: 35 },
];

export const semesterTrendData: ChartData[] = [
  { name: 'Sem 1', marks: 68 },
  { name: 'Sem 2', marks: 65 },
  { name: 'Sem 3', marks: 67 },
  { name: 'Sem 4', marks: 64 },
  { name: 'Sem 5', marks: 66 },
  { name: 'Sem 6', marks: 69 },
];

export const reports: Report[] = [
  {
    id: '1',
    type: 'student',
    title: 'Individual Student Performance Report',
    date: '2026-01-20',
    description: 'Detailed performance analysis for each student',
  },
  {
    id: '2',
    type: 'class',
    title: 'Class-wise Performance Report',
    date: '2026-01-18',
    description: 'Overall class performance metrics and trends',
  },
  {
    id: '3',
    type: 'subject',
    title: 'Subject-wise Analysis Report',
    date: '2026-01-15',
    description: 'Subject performance breakdown and comparison',
  },
];

// Mock data for single student (for student dashboard)
export const currentStudent: Student = {
  id: '2',
  name: 'Emily Johnson',
  email: 'emily.johnson@university.edu',
  marks: 78,
  attendance: 92,
  grade: 'B',
  riskLevel: 'Low',
  subjects: [
    { subject: 'Mathematics', marks: 75, maxMarks: 100, attendance: 90, grade: 'B' },
    { subject: 'Physics', marks: 80, maxMarks: 100, attendance: 93, grade: 'A' },
    { subject: 'Chemistry', marks: 79, maxMarks: 100, attendance: 93, grade: 'B' },
    { subject: 'Biology', marks: 82, maxMarks: 100, attendance: 91, grade: 'A' },
    { subject: 'Computer Science', marks: 74, maxMarks: 100, attendance: 92, grade: 'B' },
  ],
};

export const studentMarksTrend: ChartData[] = [
  { name: 'Sem 1', marks: 72, classAvg: 68 },
  { name: 'Sem 2', marks: 74, classAvg: 65 },
  { name: 'Sem 3', marks: 76, classAvg: 67 },
  { name: 'Sem 4', marks: 78, classAvg: 64 },
];

export const studentAttendanceTrend: ChartData[] = [
  { name: 'Jan', attendance: 88 },
  { name: 'Feb', attendance: 90 },
  { name: 'Mar', attendance: 92 },
  { name: 'Apr', attendance: 93 },
  { name: 'May', attendance: 92 },
];

// Department stats for Admin
export const departmentStats = [
  { department: 'Computer Science', students: 150, avgMarks: 72, avgAttendance: 84 },
  { department: 'Mechanical Engineering', students: 180, avgMarks: 68, avgAttendance: 81 },
  { department: 'Electrical Engineering', students: 160, avgMarks: 70, avgAttendance: 83 },
  { department: 'Civil Engineering', students: 140, avgMarks: 66, avgAttendance: 79 },
];

export const batchComparisonData: ChartData[] = [
  { name: 'Batch 2022', marks: 68, attendance: 82 },
  { name: 'Batch 2023', marks: 71, attendance: 85 },
  { name: 'Batch 2024', marks: 73, attendance: 87 },
  { name: 'Batch 2025', marks: 70, attendance: 84 },
];
