import {
  User,
  LeaveBalance,
  LeaveRequest,
  Notification,
  TeamCalendarEvent,
  CalendarIntegration,
  ReturnToWorkNotification,
  LeavePolicy,
  FAQItem,
} from "../types";

const STORAGE_KEYS = {
  USERS: "hrms_users",
  LEAVE_BALANCES: "hrms_leave_balances",
  LEAVE_REQUESTS: "hrms_leave_requests",
  NOTIFICATIONS: "hrms_notifications",
  CURRENT_USER: "hrms_current_user",
  WFH_REQUESTS: "hrms_wfh_requests",
  THEME: "hrms_theme",
  TEAM_CALENDAR: "hrms_team_calendar",
  CALENDAR_INTEGRATIONS: "hrms_calendar_integrations",
  RETURN_TO_WORK_NOTIFICATIONS: "hrms_return_to_work_notifications",
  LEAVE_POLICIES: "hrms_leave_policies",
  FAQ_ITEMS: "hrms_faq_items",
};

// Initialize demo data
export const initializeDemoData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const demoUsers: User[] = [
      {
        id: "1",
        name: "John Smith",
        email: "john.smith@company.com",
        role: "employee",
        department: "Engineering",
        managerId: "3",
      },
      {
        id: "2",
        name: "Sarah Johnson",
        email: "sarah.johnson@company.com",
        role: "employee",
        department: "Marketing",
        managerId: "4",
      },
      {
        id: "3",
        name: "Mike Wilson",
        email: "mike.wilson@company.com",
        role: "manager",
        department: "Engineering",
      },
      {
        id: "4",
        name: "Emily Davis",
        email: "emily.davis@company.com",
        role: "manager",
        department: "Marketing",
      },
    ];

    const demoBalances: LeaveBalance[] = [
      {
        userId: "1",
        sick: 5, // 5 available out of 12
        casual: 7, // 7 available out of 10
        vacation: 15, // 15 available out of 20
        totalAllocated: { sick: 12, casual: 10, vacation: 20 },
      },
      {
        userId: "2",
        sick: 8, // 8 available out of 12
        casual: 4, // 4 available out of 10
        vacation: 10, // 10 available out of 18
        totalAllocated: { sick: 12, casual: 10, vacation: 18 },
      },
      {
        userId: "3",
        sick: 10, // 10 available out of 15
        casual: 9, // 9 available out of 12
        vacation: 18, // 18 available out of 25
        totalAllocated: { sick: 15, casual: 12, vacation: 25 },
      },
      {
        userId: "4",
        sick: 12, // 12 available out of 15
        casual: 10, // 10 available out of 12
        vacation: 20, // 20 available out of 25
        totalAllocated: { sick: 15, casual: 12, vacation: 25 },
      },
    ];

    const demoRequests: LeaveRequest[] = [
      {
        id: "1",
        employeeId: "1",
        employeeName: "John Smith",
        managerId: "3",
        leaveType: "sick",
        startDate: "2025-01-20",
        endDate: "2025-01-22",
        days: 3,
        reason: "Flu symptoms and fever",
        status: "approved",
        createdAt: "2025-01-15",
        approvedAt: "2025-01-16",
        managerComments: "Take care of your health. Approved.",
      },
      {
        id: "2",
        employeeId: "2",
        employeeName: "Sarah Johnson",
        managerId: "4",
        leaveType: "vacation",
        startDate: "2025-02-10",
        endDate: "2025-02-14",
        days: 5,
        reason: "Family vacation to Hawaii",
        status: "pending",
        createdAt: "2025-01-25",
      },
    ];

    // Demo data for new features
    const demoTeamCalendar: TeamCalendarEvent[] = [
      {
        id: "1",
        employeeId: "1",
        employeeName: "John Smith",
        employeeEmail: "john.smith@company.com",
        leaveType: "sick",
        startDate: "2025-01-20",
        endDate: "2025-01-22",
        days: 3,
        status: "approved",
        department: "Engineering",
        managerId: "3",
        managerName: "Mike Wilson",
      },
      {
        id: "2",
        employeeId: "2",
        employeeName: "Sarah Johnson",
        employeeEmail: "sarah.johnson@company.com",
        leaveType: "vacation",
        startDate: "2025-02-10",
        endDate: "2025-02-14",
        days: 5,
        status: "pending",
        department: "Marketing",
        managerId: "4",
        managerName: "Emily Davis",
      },
    ];

    const demoCalendarIntegrations: CalendarIntegration[] = [
      {
        id: "1",
        userId: "1",
        provider: "google",
        email: "john.smith@gmail.com",
        isEnabled: true,
        syncLeaveRequests: true,
        syncNotifications: true,
        lastSync: "2025-01-25T10:30:00Z",
      },
    ];

    const demoReturnToWorkNotifications: ReturnToWorkNotification[] = [
      {
        id: "1",
        employeeId: "1",
        employeeName: "John Smith",
        employeeEmail: "john.smith@company.com",
        managerId: "3",
        managerName: "Mike Wilson",
        leaveRequestId: "1",
        returnDate: "2025-01-23",
        notificationDate: "2025-01-21",
        isSent: true,
        sentTo: ["mike.wilson@company.com", "it@company.com"],
        message:
          "John Smith is returning to work on 2025-01-23 after sick leave.",
      },
    ];

    const demoLeavePolicies: LeavePolicy[] = [
      {
        id: "1",
        title: "Annual Leave Policy",
        category: "vacation",
        content:
          "Employees are entitled to 20 days of annual leave per year. Leave requests must be submitted at least 2 weeks in advance for approval.",
        effectiveDate: "2024-01-01",
        lastUpdated: "2024-01-01",
        tags: ["annual", "vacation", "approval"],
      },
      {
        id: "2",
        title: "Sick Leave Policy",
        category: "sick",
        content:
          "Employees can take up to 12 days of sick leave per year. Medical certificates are required for absences longer than 3 consecutive days.",
        effectiveDate: "2024-01-01",
        lastUpdated: "2024-01-01",
        tags: ["sick", "medical", "certificate"],
      },
      {
        id: "3",
        title: "Casual Leave Policy",
        category: "casual",
        content:
          "Employees are entitled to 12 days of casual leave per year for personal matters. Requests should be submitted at least 3 days in advance.",
        effectiveDate: "2024-01-01",
        lastUpdated: "2024-01-01",
        tags: ["casual", "personal", "advance"],
      },
    ];

    const demoFAQItems: FAQItem[] = [
      {
        id: "1",
        question: "How do I submit a leave request?",
        answer:
          'Navigate to your dashboard and click "New Leave Request". Fill in the required details including leave type, dates, and reason. Submit for manager approval.',
        category: "leave-request",
        tags: ["submit", "request", "approval"],
        helpful: 45,
        notHelpful: 2,
      },
      {
        id: "2",
        question: "How long does leave approval take?",
        answer:
          "Leave requests are typically approved within 2-3 business days. Urgent requests may be processed faster depending on manager availability.",
        category: "approval",
        tags: ["approval", "timeline", "urgent"],
        helpful: 38,
        notHelpful: 5,
      },
      {
        id: "3",
        question: "Can I cancel an approved leave request?",
        answer:
          "Yes, you can cancel an approved leave request up to 3 days before the start date. Contact your manager for cancellation approval.",
        category: "general",
        tags: ["cancel", "approved", "cancellation"],
        helpful: 32,
        notHelpful: 3,
      },
      {
        id: "4",
        question: "How do I sync my leave calendar with external apps?",
        answer:
          "Go to Settings > Calendar Integration and connect your Google Calendar, Outlook, or Apple Calendar. Your approved leaves will automatically sync.",
        category: "calendar",
        tags: ["sync", "calendar", "integration"],
        helpful: 28,
        notHelpful: 4,
      },
    ];

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(demoUsers));
    localStorage.setItem(
      STORAGE_KEYS.LEAVE_BALANCES,
      JSON.stringify(demoBalances)
    );
    localStorage.setItem(
      STORAGE_KEYS.LEAVE_REQUESTS,
      JSON.stringify(demoRequests)
    );
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    localStorage.setItem(
      STORAGE_KEYS.TEAM_CALENDAR,
      JSON.stringify(demoTeamCalendar)
    );
    localStorage.setItem(
      STORAGE_KEYS.CALENDAR_INTEGRATIONS,
      JSON.stringify(demoCalendarIntegrations)
    );
    localStorage.setItem(
      STORAGE_KEYS.RETURN_TO_WORK_NOTIFICATIONS,
      JSON.stringify(demoReturnToWorkNotifications)
    );
    localStorage.setItem(
      STORAGE_KEYS.LEAVE_POLICIES,
      JSON.stringify(demoLeavePolicies)
    );
    localStorage.setItem(STORAGE_KEYS.FAQ_ITEMS, JSON.stringify(demoFAQItems));
  }
};

// Storage utilities
export const getUsers = (): User[] => {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
};

export const getLeaveBalances = (): LeaveBalance[] => {
  const balances = localStorage.getItem(STORAGE_KEYS.LEAVE_BALANCES);
  return balances ? JSON.parse(balances) : [];
};

export const getLeaveRequests = (): LeaveRequest[] => {
  const requests = localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS);
  return requests ? JSON.parse(requests) : [];
};

export const getNotifications = (): Notification[] => {
  const notifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  return notifications ? JSON.parse(notifications) : [];
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const saveLeaveRequest = (request: LeaveRequest) => {
  const requests = getLeaveRequests();
  const existingIndex = requests.findIndex((r) => r.id === request.id);

  if (existingIndex >= 0) {
    requests[existingIndex] = request;
  } else {
    requests.push(request);
  }

  localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(requests));
};

export const updateLeaveBalance = (balance: LeaveBalance) => {
  const balances = getLeaveBalances();
  const existingIndex = balances.findIndex((b) => b.userId === balance.userId);

  if (existingIndex >= 0) {
    balances[existingIndex] = balance;
  } else {
    balances.push(balance);
  }

  localStorage.setItem(STORAGE_KEYS.LEAVE_BALANCES, JSON.stringify(balances));
};

export const addNotification = (notification: Notification) => {
  const notifications = getNotifications();
  notifications.unshift(notification);
  localStorage.setItem(
    STORAGE_KEYS.NOTIFICATIONS,
    JSON.stringify(notifications)
  );
};

export const markNotificationAsRead = (notificationId: string) => {
  const notifications = getNotifications();
  const updatedNotifications = notifications.map((n) =>
    n.id === notificationId ? { ...n, read: true } : n
  );
  localStorage.setItem(
    STORAGE_KEYS.NOTIFICATIONS,
    JSON.stringify(updatedNotifications)
  );
};

export const getWFHRequests = () => {
  const requests = localStorage.getItem(STORAGE_KEYS.WFH_REQUESTS);
  return requests ? JSON.parse(requests) : [];
};

export const saveWFHRequest = (request: any) => {
  const requests = getWFHRequests();
  requests.push(request);
  localStorage.setItem(STORAGE_KEYS.WFH_REQUESTS, JSON.stringify(requests));
};

export const addUser = (user: User) => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

  // Initialize leave balances for new user
  initializeUserLeaveBalances(user.id, user.role);
};

// Initialize leave balances for new users
export const initializeUserLeaveBalances = (
  userId: string,
  role: "employee" | "manager"
) => {
  const balances = getLeaveBalances();

  // Check if user already has balances
  const existingBalance = balances.find((b) => b.userId === userId);
  if (existingBalance) return;

  // Generate realistic random leave balances based on role
  const isManager = role === "manager";

  const newBalance: LeaveBalance = {
    userId,
    sick: Math.floor(Math.random() * (isManager ? 8 : 6)) + (isManager ? 8 : 5), // 8-15 for managers, 5-10 for employees
    casual:
      Math.floor(Math.random() * (isManager ? 6 : 5)) + (isManager ? 6 : 4), // 6-11 for managers, 4-8 for employees
    vacation:
      Math.floor(Math.random() * (isManager ? 10 : 8)) + (isManager ? 15 : 10), // 15-24 for managers, 10-17 for employees
    totalAllocated: {
      sick: isManager ? 15 : 12,
      casual: isManager ? 12 : 10,
      vacation: isManager ? 25 : 20,
    },
  };

  balances.push(newBalance);
  localStorage.setItem(STORAGE_KEYS.LEAVE_BALANCES, JSON.stringify(balances));
};

export const getTheme = (): "light" | "dark" => {
  const theme = localStorage.getItem(STORAGE_KEYS.THEME);
  return theme === "dark" ? "dark" : "light";
};

export const setTheme = (theme: "light" | "dark") => {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
};

export const getTeamCalendar = (): TeamCalendarEvent[] => {
  const calendar = localStorage.getItem(STORAGE_KEYS.TEAM_CALENDAR);
  return calendar ? JSON.parse(calendar) : [];
};

export const saveTeamCalendarEvent = (event: TeamCalendarEvent) => {
  const calendar = getTeamCalendar();
  calendar.push(event);
  localStorage.setItem(STORAGE_KEYS.TEAM_CALENDAR, JSON.stringify(calendar));
};

export const getCalendarIntegrations = (): CalendarIntegration[] => {
  const integrations = localStorage.getItem(STORAGE_KEYS.CALENDAR_INTEGRATIONS);
  return integrations ? JSON.parse(integrations) : [];
};

export const saveCalendarIntegration = (integration: CalendarIntegration) => {
  const integrations = getCalendarIntegrations();
  const existingIndex = integrations.findIndex((i) => i.id === integration.id);

  if (existingIndex >= 0) {
    integrations[existingIndex] = integration;
  } else {
    integrations.push(integration);
  }

  localStorage.setItem(
    STORAGE_KEYS.CALENDAR_INTEGRATIONS,
    JSON.stringify(integrations)
  );
};

export const getReturnToWorkNotifications = (): ReturnToWorkNotification[] => {
  const notifications = localStorage.getItem(
    STORAGE_KEYS.RETURN_TO_WORK_NOTIFICATIONS
  );
  return notifications ? JSON.parse(notifications) : [];
};

export const saveReturnToWorkNotification = (
  notification: ReturnToWorkNotification
) => {
  const notifications = getReturnToWorkNotifications();
  notifications.push(notification);
  localStorage.setItem(
    STORAGE_KEYS.RETURN_TO_WORK_NOTIFICATIONS,
    JSON.stringify(notifications)
  );
};

export const getLeavePolicies = (): LeavePolicy[] => {
  const policies = localStorage.getItem(STORAGE_KEYS.LEAVE_POLICIES);
  return policies ? JSON.parse(policies) : [];
};

export const saveLeavePolicy = (policy: LeavePolicy) => {
  const policies = getLeavePolicies();
  const existingIndex = policies.findIndex((p) => p.id === policy.id);

  if (existingIndex >= 0) {
    policies[existingIndex] = policy;
  } else {
    policies.push(policy);
  }

  localStorage.setItem(STORAGE_KEYS.LEAVE_POLICIES, JSON.stringify(policies));
};

export const getFAQItems = (): FAQItem[] => {
  const faqItems = localStorage.getItem(STORAGE_KEYS.FAQ_ITEMS);
  return faqItems ? JSON.parse(faqItems) : [];
};

export const saveFAQItem = (item: FAQItem) => {
  const faqItems = getFAQItems();
  const existingIndex = faqItems.findIndex((f) => f.id === item.id);

  if (existingIndex >= 0) {
    faqItems[existingIndex] = item;
  } else {
    faqItems.push(item);
  }

  localStorage.setItem(STORAGE_KEYS.FAQ_ITEMS, JSON.stringify(faqItems));
};

// PATCH: Assign managerId to all employees missing it and update their leave requests
export function patchAssignManagersToEmployees() {
  const users = getUsers();
  const managers = users.filter((u) => u.role === "manager");
  let changed = false;

  // Assign managerId to employees missing it
  users.forEach((user) => {
    if (user.role === "employee" && !user.managerId) {
      // Try to find a manager in the same department
      const departmentManager = managers.find(
        (m) => m.department.toLowerCase() === user.department.toLowerCase()
      );
      if (departmentManager) {
        user.managerId = departmentManager.id;
      } else if (managers.length > 0) {
        user.managerId = managers[0].id;
      }
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem("hrms_users", JSON.stringify(users));
  }

  // Update leave requests for these employees
  const requests = getLeaveRequests();
  let reqChanged = false;
  requests.forEach((req) => {
    const user = users.find((u) => u.id === req.employeeId);
    if (user && user.managerId && req.managerId !== user.managerId) {
      req.managerId = user.managerId;
      reqChanged = true;
    }
  });
  if (reqChanged) {
    localStorage.setItem("hrms_leave_requests", JSON.stringify(requests));
  }
}
