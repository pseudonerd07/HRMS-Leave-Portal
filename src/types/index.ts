export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional password for simulated login
  role: "employee" | "manager";
  department: string;
  managerId?: string;
  avatar?: string;
}

export interface LeaveBalance {
  userId: string;
  sick: number;
  casual: number;
  vacation: number;
  totalAllocated: {
    sick: number;
    casual: number;
    vacation: number;
  };
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  managerId: string;
  leaveType: "sick" | "casual" | "vacation";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedAt?: string;
  managerComments?: string;
  documents?: string[];
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  createdAt: string;
  read: boolean;
}

export interface WorkFromHomeRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  reason: string;
  status: "approved" | "pending" | "rejected";
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "leave" | "wfh" | "holiday";
  status?: string;
}

// New types for requested features

export interface TeamCalendarEvent {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  leaveType: "sick" | "casual" | "vacation";
  startDate: string;
  endDate: string;
  days: number;
  status: "pending" | "approved" | "rejected";
  department: string;
  managerId: string;
  managerName: string;
}

export interface CalendarIntegration {
  id: string;
  userId: string;
  provider: "google" | "outlook" | "apple";
  email: string;
  isEnabled: boolean;
  syncLeaveRequests: boolean;
  syncNotifications: boolean;
  lastSync?: string;
}

export interface ReturnToWorkNotification {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  managerId: string;
  managerName: string;
  leaveRequestId: string;
  returnDate: string;
  notificationDate: string;
  isSent: boolean;
  sentTo: string[];
  message: string;
}

export interface LeavePolicy {
  id: string;
  title: string;
  category:
    | "general"
    | "sick"
    | "vacation"
    | "casual"
    | "maternity"
    | "paternity";
  content: string;
  effectiveDate: string;
  lastUpdated: string;
  tags: string[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "general" | "leave-request" | "approval" | "calendar" | "policy";
  tags: string[];
  helpful: number;
  notHelpful: number;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
  role: "employee" | "manager";
  managerId?: string;
}
