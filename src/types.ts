export type UserRole = 'principal' | 'teacher' | 'student' | 'parent';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  schoolId?: string;
  classId?: string;
  parentId?: string;
  createdAt: string;
}

export interface School {
  id: string;
  name: string;
  principalId: string;
  inviteCode: string;
  createdAt: string;
}

export interface Class {
  id: string;
  name: string;
  schoolId: string;
  teacherId?: string;
  studentIds: string[];
  createdAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  classId: string;
  teacherId: string;
  dueDate: string;
  createdAt: string;
}

export interface StudentProgress {
  id: string;
  studentId: string;
  assignmentId: string;
  score?: number;
  status: 'pending' | 'completed' | 'graded';
  updatedAt: string;
}
