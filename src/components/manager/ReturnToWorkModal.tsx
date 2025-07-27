import React, { useState, useEffect } from "react";
import {
  X,
  Bell,
  Users,
  Calendar,
  Mail,
  Settings,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import {
  getReturnToWorkNotifications,
  saveReturnToWorkNotification,
  getLeaveRequests,
  getUsers,
  getCurrentUser,
} from "../../utils/storage";
import { ReturnToWorkNotification, LeaveRequest, User } from "../../types";

interface ReturnToWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReturnToWorkModal: React.FC<ReturnToWorkModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<
    ReturnToWorkNotification[]
  >([]);
  const [pendingNotifications, setPendingNotifications] = useState<
    ReturnToWorkNotification[]
  >([]);
  const [selectedNotification, setSelectedNotification] =
    useState<ReturnToWorkNotification | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    notifyManager: true,
    notifyIT: true,
    notifyHR: false,
    daysInAdvance: 2,
  });

  useEffect(() => {
    if (isOpen) {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const allNotifications = getReturnToWorkNotifications();
        const userNotifications = allNotifications.filter(
          (n) => n.managerId === currentUser.id
        );
        setNotifications(userNotifications);

        // Generate pending notifications for upcoming returns
        generatePendingNotifications();
      }
    }
  }, [isOpen]);

  const generatePendingNotifications = () => {
    const leaveRequests = getLeaveRequests();
    const allUsers = getUsers();
    const pending: ReturnToWorkNotification[] = [];

    // Find approved leave requests that are ending soon
    const today = new Date();
    const upcomingReturns = leaveRequests.filter((request) => {
      if (request.status !== "approved") return false;

      const endDate = new Date(request.endDate);
      const daysUntilReturn = Math.ceil(
        (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      return (
        daysUntilReturn >= 0 &&
        daysUntilReturn <= notificationSettings.daysInAdvance
      );
    });

    upcomingReturns.forEach((request) => {
      const employee = allUsers.find((u) => u.id === request.employeeId);
      const manager = allUsers.find((u) => u.id === request.managerId);

      if (employee && manager) {
        const returnDate = new Date(request.endDate);
        returnDate.setDate(returnDate.getDate() + 1); // Next day after leave ends

        const notificationDate = new Date(returnDate);
        notificationDate.setDate(
          notificationDate.getDate() - notificationSettings.daysInAdvance
        );

        const existingNotification = notifications.find(
          (n) => n.leaveRequestId === request.id
        );

        if (!existingNotification && notificationDate <= today) {
          pending.push({
            id: `pending-${request.id}`,
            employeeId: request.employeeId,
            employeeName: request.employeeName,
            employeeEmail: employee.email,
            managerId: request.managerId,
            managerName: manager.name,
            leaveRequestId: request.id,
            returnDate: returnDate.toISOString().split("T")[0],
            notificationDate: today.toISOString().split("T")[0],
            isSent: false,
            sentTo: [],
            message: `${
              request.employeeName
            } is returning to work on ${returnDate.toLocaleDateString()} after ${
              request.leaveType
            } leave.`,
          });
        }
      }
    });

    setPendingNotifications(pending);
  };

  const handleSendNotification = async (
    notification: ReturnToWorkNotification
  ) => {
    setIsSending(true);

    // Simulate sending notification
    setTimeout(() => {
      const sentTo: string[] = [];

      if (notificationSettings.notifyManager) {
        sentTo.push(notification.managerName);
      }
      if (notificationSettings.notifyIT) {
        sentTo.push("it@company.com");
      }
      if (notificationSettings.notifyHR) {
        sentTo.push("hr@company.com");
      }

      const updatedNotification: ReturnToWorkNotification = {
        ...notification,
        isSent: true,
        sentTo,
        id: Date.now().toString(),
      };

      saveReturnToWorkNotification(updatedNotification);
      setNotifications((prev) => [...prev, updatedNotification]);
      setPendingNotifications((prev) =>
        prev.filter((n) => n.id !== notification.id)
      );
      setIsSending(false);
    }, 2000);
  };

  const handleSendAllNotifications = async () => {
    setIsSending(true);

    for (const notification of pendingNotifications) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
      handleSendNotification(notification);
    }

    setIsSending(false);
  };

  const getStatusBadgeVariant = (isSent: boolean) => {
    return isSent ? "success" : "warning";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center space-x-3'>
            <Bell className='w-6 h-6 text-blue-600' />
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
              Return-to-Work Notifications
            </h2>
          </div>
          <Button onClick={onClose} variant='outline' icon={X} size='sm'>
            Close
          </Button>
        </div>

        <div className='p-6 overflow-auto max-h-[70vh]'>
          {/* Settings */}
          <Card className='p-6 mb-6'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Notification Settings
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                  Notify Teams
                </label>
                <div className='space-y-3'>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={notificationSettings.notifyManager}
                      onChange={(e) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          notifyManager: e.target.checked,
                        }))
                      }
                      className='mr-2 rounded'
                    />
                    <span className='text-sm text-gray-700 dark:text-gray-300'>
                      Reporting Manager
                    </span>
                  </label>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={notificationSettings.notifyIT}
                      onChange={(e) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          notifyIT: e.target.checked,
                        }))
                      }
                      className='mr-2 rounded'
                    />
                    <span className='text-sm text-gray-700 dark:text-gray-300'>
                      IT/Admin Team
                    </span>
                  </label>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={notificationSettings.notifyHR}
                      onChange={(e) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          notifyHR: e.target.checked,
                        }))
                      }
                      className='mr-2 rounded'
                    />
                    <span className='text-sm text-gray-700 dark:text-gray-300'>
                      HR Team
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Days in Advance
                </label>
                <select
                  value={notificationSettings.daysInAdvance}
                  onChange={(e) =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      daysInAdvance: parseInt(e.target.value),
                    }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                >
                  <option value={1}>1 day</option>
                  <option value={2}>2 days</option>
                  <option value={3}>3 days</option>
                  <option value={5}>5 days</option>
                  <option value={7}>1 week</option>
                </select>
                <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                  Send notifications this many days before employee returns
                </p>
              </div>
            </div>
          </Card>

          {/* Pending Notifications */}
          {pendingNotifications.length > 0 && (
            <div className='mb-6'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Pending Notifications ({pendingNotifications.length})
                </h3>
                <Button
                  onClick={handleSendAllNotifications}
                  variant='primary'
                  icon={Mail}
                  size='sm'
                  disabled={isSending}
                >
                  {isSending ? "Sending..." : "Send All"}
                </Button>
              </div>

              <div className='space-y-4'>
                {pendingNotifications.map((notification) => (
                  <Card key={notification.id} className='p-4'>
                    <div className='flex justify-between items-start'>
                      <div className='flex-1'>
                        <div className='flex items-center space-x-3 mb-2'>
                          <h4 className='font-semibold text-gray-900 dark:text-white'>
                            {notification.employeeName}
                          </h4>
                          <Badge variant='warning'>Pending</Badge>
                        </div>
                        <div className='text-sm text-gray-600 dark:text-gray-400 space-y-1'>
                          <div>
                            Return Date: {formatDate(notification.returnDate)}
                          </div>
                          <div>Message: {notification.message}</div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleSendNotification(notification)}
                        variant='primary'
                        size='sm'
                        disabled={isSending}
                      >
                        Send
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Sent Notifications */}
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Sent Notifications ({notifications.filter((n) => n.isSent).length}
              )
            </h3>

            {notifications.filter((n) => n.isSent).length === 0 ? (
              <Card className='p-6 text-center text-gray-500 dark:text-gray-400'>
                <Bell className='w-12 h-12 mx-auto mb-4 text-gray-400' />
                <p>No notifications have been sent yet.</p>
                <p className='text-sm'>
                  Notifications will appear here once sent.
                </p>
              </Card>
            ) : (
              <div className='space-y-4'>
                {notifications
                  .filter((n) => n.isSent)
                  .sort(
                    (a, b) =>
                      new Date(b.notificationDate).getTime() -
                      new Date(a.notificationDate).getTime()
                  )
                  .map((notification) => (
                    <Card key={notification.id} className='p-4'>
                      <div className='flex justify-between items-start'>
                        <div className='flex-1'>
                          <div className='flex items-center space-x-3 mb-2'>
                            <h4 className='font-semibold text-gray-900 dark:text-white'>
                              {notification.employeeName}
                            </h4>
                            <Badge
                              variant={getStatusBadgeVariant(
                                notification.isSent
                              )}
                            >
                              {notification.isSent ? "Sent" : "Pending"}
                            </Badge>
                          </div>
                          <div className='text-sm text-gray-600 dark:text-gray-400 space-y-1'>
                            <div>
                              Return Date: {formatDate(notification.returnDate)}
                            </div>
                            <div>
                              Sent Date:{" "}
                              {formatDate(notification.notificationDate)}
                            </div>
                            <div>Message: {notification.message}</div>
                            {notification.sentTo.length > 0 && (
                              <div>
                                Sent to: {notification.sentTo.join(", ")}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className='p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-center'>
            <div>
              <div className='text-2xl font-bold text-blue-600'>
                {notifications.length}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Total Notifications
              </div>
            </div>
            <div>
              <div className='text-2xl font-bold text-green-600'>
                {notifications.filter((n) => n.isSent).length}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Sent
              </div>
            </div>
            <div>
              <div className='text-2xl font-bold text-yellow-600'>
                {pendingNotifications.length}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Pending
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
