export type StudentStatus = 'ACTIVE' | 'INACTIVE';
export type StudentSource = 'IMPORTED' | 'BOOKING' | 'ADMIN';

export interface Student {
  id: string;
  register_number: string;
  name: string;
  programme: string;
  year: string;
  section: string;
  email: string | null;
  phone: string | null;
  status: StudentStatus;
  source: StudentSource;
  created_at: string;
  updated_at: string;
}

export type FacultyStatus = 'ACTIVE' | 'INACTIVE';

export interface Faculty {
  id: string;
  name: string;
  employee_id: string;
  designation: string;
  email: string;
  phone: string | null;
  room: string | null;
  campus: string;
  status: FacultyStatus;
  calendar_token: string;
  created_at: string;
  updated_at: string;
}

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'DECLINED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type AppointmentSource = 'ONLINE' | 'ADMIN';

export interface Appointment {
  id: string;
  appointment_id: string;
  student_id: string;
  faculty_id: string;
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
  notes: string | null;
  status: AppointmentStatus;
  source: AppointmentSource;
  decline_reason: string | null;
  cancellation_reason: string | null;
  tracking_code?: string | null;
  tracking_token_hash?: string | null;
  created_at: string;
  updated_at: string;
  student?: Student;
  faculty?: Faculty;
}

export interface PublicAppointmentStatus {
  appointment_id: string;
  status: AppointmentStatus;
  student_name: string;
  faculty_name: string;
  date: string;
  start_time: string;
  end_time: string;
  decline_reason?: string | null;
}

export interface CoordinatorNotification {
  id: string;
  recipient_user_id?: string | null;
  type: string;
  title: string;
  message: string | null;
  appointment_id?: string | null;
  is_read: boolean;
  created_at: string;
  appointment?: Appointment;
}

export interface SessionRecord {
  id: string;
  title: string;
  date: string;
  faculty_id: string;
  student_count: number;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  faculty?: Faculty;
}

export interface WorkingHoursDay {
  start: string;
  end: string;
  closed: boolean;
}

export interface WorkingHours {
  monday: WorkingHoursDay;
  tuesday: WorkingHoursDay;
  wednesday: WorkingHoursDay;
  thursday: WorkingHoursDay;
  friday: WorkingHoursDay;
  saturday: WorkingHoursDay;
  sunday: WorkingHoursDay;
}

export interface PortalSettings {
  working_hours: WorkingHours;
  appointment_duration: number; // in minutes (15, 30, 45, 60)
  portal_info: {
    name: string;
    instructions: string;
  };
}

export interface BookingFormData {
  register_number: string;
  name: string;
  programme: string;
  year: string;
  section: string;
  email: string;
  phone: string;
  faculty_id: string;
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
  notes?: string;
}

export interface FacultyAvailability {
  id: string;
  faculty_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

