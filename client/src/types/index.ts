export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  studentProfile?: StudentProfile;
  teacherProfile?: TeacherProfile;
}

export interface StudentProfile {
  id: string;
  userId: string;
  registerNumber: string;
  degree: string;
  batchYear: number;
  currentSemester: number;
  section: string;
  advisorId?: string;
  phone?: string;
  advisor?: {
    user: {
      name: string;
      email: string;
    };
  };
}

export interface TeacherProfile {
  id: string;
  userId: string;
  staffId: string;
  designation: string;
  department: string;
}

export interface FactorBreakdown {
  name: string;
  weight: number;
  score: number;
  weightedScore: number;
  explanation: string;
}

export interface SubjectFocusItem {
  subjectId: string;
  code: string;
  name: string;
  credits: number;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  internalAverage: number | null;
  attendancePercentage: number | null;
  hasArrear: boolean;
  contributingFactors: string[];
  recommendedAction: string;
  targetMetric?: string;
}

export interface RiskData {
  score: number;
  category: 'SAFE' | 'WATCH' | 'CRITICAL';
  explanation: string;
  factors: FactorBreakdown[];
  recommendations: string[];
  calculatedAt: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: number;
  department: string;
}

export interface InternalAssessment {
  id: string;
  assessmentType: string;
  score: number;
  maxScore: number;
  percentage?: number;
  assessmentDate: string;
  subject: Subject;
}

export interface SemesterResult {
  id: string;
  semester: number;
  grade: string;
  gradePoint: number;
  credits: number;
  attemptNumber: number;
  status: string;
  subject: Subject;
}

export interface AttendanceRecord {
  id: string;
  subjectId: string;
  code: string;
  name: string;
  credits: number;
  attendedClasses: number;
  totalClasses: number;
  percentage: number;
  isBelowThreshold: boolean;
  permissibleAbsences: number;
  classesNeededToCatchUp: number;
}

export interface Arrear {
  id: string;
  originalSemester: number;
  attempts: number;
  deadlineSemester?: number;
  status: 'PENDING' | 'CLEARED';
  subject: Subject;
}

export interface TimetableEntry {
  id: string;
  entryType: 'LECTURE' | 'LAB' | 'INTERNAL_ASSESSMENT' | 'SEMESTER_EXAM';
  dayOfWeek?: string;
  startTime: string;
  endTime: string;
  room: string;
  examDate?: string;
  description?: string;
  subject?: Subject;
}

export interface Intervention {
  id: string;
  studentId: string;
  staffId: string;
  type: string;
  notes: string;
  outcome?: string;
  followUpDate?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    registerNumber: string;
    user: {
      name: string;
      email: string;
      department?: string;
    };
  };
  staff: {
    id: string;
    staffId: string;
    user: {
      name: string;
    };
  };
}

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
