import React, { useState, useEffect } from "react";
import { X, Calendar, Users, Filter, Download, Eye } from "lucide-react";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { getTeamCalendar, getUsers, getCurrentUser } from "../../utils/storage";
import { TeamCalendarEvent, User } from "../../types";

interface TeamCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamCalendarModal: React.FC<TeamCalendarModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [events, setEvents] = useState<TeamCalendarEvent[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  useEffect(() => {
    if (isOpen) {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const allEvents = getTeamCalendar();
        const teamEvents = allEvents.filter(
          (event) => event.managerId === currentUser.id
        );
        setEvents(teamEvents);

        const allUsers = getUsers();
        const team = allUsers.filter(
          (user) => user.managerId === currentUser.id
        );
        setTeamMembers(team);
      }
    }
  }, [isOpen]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "danger";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const getLeaveTypeColor = (leaveType: string) => {
    switch (leaveType) {
      case "sick":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "vacation":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "casual":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.startDate);
    const monthMatch =
      eventDate.getMonth() === selectedMonth.getMonth() &&
      eventDate.getFullYear() === selectedMonth.getFullYear();
    const departmentMatch =
      selectedDepartment === "all" || event.department === selectedDepartment;
    const statusMatch =
      selectedStatus === "all" || event.status === selectedStatus;

    return monthMatch && departmentMatch && statusMatch;
  });

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDay = (day: number) => {
    return filteredEvents.filter((event) => {
      const eventDate = new Date(event.startDate);
      return eventDate.getDate() === day;
    });
  };

  const exportCalendar = () => {
    const csvContent = [
      [
        "Employee",
        "Leave Type",
        "Start Date",
        "End Date",
        "Days",
        "Status",
        "Department",
      ],
      ...filteredEvents.map((event) => [
        event.employeeName,
        event.leaveType,
        event.startDate,
        event.endDate,
        event.days.toString(),
        event.status,
        event.department,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `team-calendar-${selectedMonth.getFullYear()}-${
      selectedMonth.getMonth() + 1
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center space-x-3'>
            <Calendar className='w-6 h-6 text-blue-600' />
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
              Team Leave Calendar
            </h2>
          </div>
          <div className='flex items-center space-x-3'>
            <Button
              onClick={exportCalendar}
              variant='outline'
              icon={Download}
              size='sm'
            >
              Export
            </Button>
            <Button onClick={onClose} variant='outline' icon={X} size='sm'>
              Close
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            {/* Month Selector */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Month
              </label>
              <input
                type='month'
                value={`${selectedMonth.getFullYear()}-${String(
                  selectedMonth.getMonth() + 1
                ).padStart(2, "0")}`}
                onChange={(e) => {
                  const [year, month] = e.target.value.split("-");
                  setSelectedMonth(
                    new Date(parseInt(year), parseInt(month) - 1)
                  );
                }}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white'
              />
            </div>

            {/* Department Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white'
              >
                <option value='all'>All Departments</option>
                {Array.from(new Set(events.map((e) => e.department))).map(
                  (dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white'
              >
                <option value='all'>All Status</option>
                <option value='approved'>Approved</option>
                <option value='pending'>Pending</option>
                <option value='rejected'>Rejected</option>
              </select>
            </div>

            {/* View Mode */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                View
              </label>
              <div className='flex space-x-2'>
                <Button
                  onClick={() => setViewMode("calendar")}
                  variant={viewMode === "calendar" ? "primary" : "outline"}
                  size='sm'
                  icon={Calendar}
                >
                  Calendar
                </Button>
                <Button
                  onClick={() => setViewMode("list")}
                  variant={viewMode === "list" ? "primary" : "outline"}
                  size='sm'
                  icon={Eye}
                >
                  List
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='p-6 overflow-auto max-h-[60vh]'>
          {viewMode === "calendar" ? (
            <div className='space-y-4'>
              {/* Calendar Grid */}
              <div className='grid grid-cols-7 gap-1'>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className='p-2 text-center font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700'
                    >
                      {day}
                    </div>
                  )
                )}

                {Array.from({ length: getFirstDayOfMonth(selectedMonth) }).map(
                  (_, index) => (
                    <div
                      key={`empty-${index}`}
                      className='p-2 min-h-[80px] bg-gray-50 dark:bg-gray-700'
                    ></div>
                  )
                )}

                {Array.from({ length: getDaysInMonth(selectedMonth) }).map(
                  (_, index) => {
                    const day = index + 1;
                    const dayEvents = getEventsForDay(day);

                    return (
                      <div
                        key={day}
                        className='p-2 min-h-[80px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                      >
                        <div className='text-sm font-medium text-gray-900 dark:text-white mb-1'>
                          {day}
                        </div>
                        <div className='space-y-1'>
                          {dayEvents.map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded ${getLeaveTypeColor(
                                event.leaveType
                              )} cursor-pointer hover:opacity-80`}
                              title={`${event.employeeName} - ${event.leaveType} (${event.days} days)`}
                            >
                              <div className='font-medium truncate'>
                                {event.employeeName}
                              </div>
                              <div className='text-xs opacity-75'>
                                {event.leaveType}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          ) : (
            <div className='space-y-4'>
              {/* List View */}
              {filteredEvents.length === 0 ? (
                <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
                  No leave events found for the selected filters.
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <Card key={event.id} className='p-4'>
                    <div className='flex justify-between items-start'>
                      <div className='flex-1'>
                        <div className='flex items-center space-x-3 mb-2'>
                          <h3 className='font-semibold text-gray-900 dark:text-white'>
                            {event.employeeName}
                          </h3>
                          <Badge variant={getStatusBadgeVariant(event.status)}>
                            {event.status}
                          </Badge>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getLeaveTypeColor(
                              event.leaveType
                            )}`}
                          >
                            {event.leaveType}
                          </span>
                        </div>
                        <div className='text-sm text-gray-600 dark:text-gray-400'>
                          <div>Department: {event.department}</div>
                          <div>
                            Duration: {event.startDate} to {event.endDate} (
                            {event.days} days)
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className='p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 text-center'>
            <div>
              <div className='text-2xl font-bold text-blue-600'>
                {filteredEvents.length}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Total Events
              </div>
            </div>
            <div>
              <div className='text-2xl font-bold text-green-600'>
                {filteredEvents.filter((e) => e.status === "approved").length}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Approved
              </div>
            </div>
            <div>
              <div className='text-2xl font-bold text-yellow-600'>
                {filteredEvents.filter((e) => e.status === "pending").length}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Pending
              </div>
            </div>
            <div>
              <div className='text-2xl font-bold text-red-600'>
                {filteredEvents.filter((e) => e.status === "rejected").length}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Rejected
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
