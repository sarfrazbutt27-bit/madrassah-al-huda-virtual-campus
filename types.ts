
export enum UserRole {
  PRINCIPAL = 'PRINCIPAL',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export type Gender = 'Junge' | 'Mädchen';

export enum CourseType {
  ANFAENGER = 'ANFAENGER',
  FORTGESCHRITTENE = 'FORTGESCHRITTENE',
  ARABISCH = 'ARABISCH',
  IMAM = 'IMAM',
  ILMIYA = 'ILMIYA'
}

export interface WaitlistEntry {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  birthDate: string;
  courseType: CourseType;
  whatsapp: string;
  guardian: string;
  address: string;
  lessonTimes: string;
  timestamp: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  birthDate: string;
  className: string;
  guardian: string;
  address: string;
  whatsapp: string;
  lessonTimes: string;
  registrationDate: string;
  lastSeen?: string;
  reportReleasedHalbjahr?: boolean;
  reportReleasedAbschluss?: boolean;
  status: 'active' | 'dismissed'; // 'dismissed' = Rote Liste
}

export interface ScheduledMeeting {
  id: string;
  title: string;
  type: 'CLASSROOM' | 'STAFF' | 'PARENT_TEACHER';
  dateTime: string;
  className?: string;
  createdBy: string;
  hostId: string;
  meetingLink?: string;
}

export interface Message {
  id: string;
  fromId: string;
  toId: string;
  text: string;
  fileUrl?: string;
  fileType?: 'image' | 'video' | 'audio' | 'pdf' | 'file';
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  role?: UserRole;
  title: string;
  message: string;
  type: 'homework' | 'meeting' | 'system' | 'chat' | 'call';
  meetingId?: string;
  meetingLink?: string;
  isRead: boolean;
  timestamp: string;
}

export interface Homework {
  id: string;
  teacherId: string;
  className: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  content: string;
  fileUrl?: string;
  fileType?: 'pdf' | 'image' | 'doc';
  submittedAt: string;
  grade?: number;
  feedback?: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'image' | 'audio' | 'link';
  url: string;
  className: string;
  subject: string;
  uploadedBy: string;
  createdAt: string;
}

export interface Grade {
  studentId: string;
  subject: string;
  term: 'Halbjahr' | 'Abschluss';
  points: number;
  date: string;
}

export interface ParticipationRecord {
  studentId: string;
  term: 'Halbjahr' | 'Abschluss';
  verhalten: 'Sehr gut' | 'Befriedigend' | 'Unzureichend';
  vortrag: 'Sehr gut' | 'Befriedigend' | 'Unzureichend';
  pünktlichkeit: 'Sehr gut' | 'Befriedigend' | 'Unzureichend';
  zusatzpunkte: number;
}

export interface Attendance {
  studentId: string;
  date: string;
  isPresent: boolean;
}

export interface TeacherAttendance {
  userId: string;
  date: string;
  status: 'present' | 'absent' | 'substituted';
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  password?: string;
  whatsapp?: string;
  assignedClasses?: string[];
  lastSeen?: string;
}
