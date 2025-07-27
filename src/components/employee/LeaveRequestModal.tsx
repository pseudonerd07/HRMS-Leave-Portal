import React, { useState } from "react";
import { X, Calendar, FileText, Clock } from "lucide-react";
import { Button } from "../common/Button";
import {
  getCurrentUser,
  getLeaveBalances,
  saveLeaveRequest,
  updateLeaveBalance,
  addNotification,
  getUsers,
} from "../../utils/storage";
import { LeaveRequest, LeaveBalance } from "../../types";

interface LeaveRequestModalProps {
  onClose: () => void;
  onSubmit: () => void;
}

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    leaveType: "casual" as "sick" | "casual" | "vacation",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = getCurrentUser();
  const leaveBalances = getLeaveBalances();
  const userBalance = leaveBalances.find((b) => b.userId === currentUser?.id);

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  const days = calculateDays(formData.startDate, formData.endDate);
  const availableBalance = userBalance ? userBalance[formData.leaveType] : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSubmitting(true);

    try {
      // Always get the latest user info (in case managerId was patched)
      const allUsers = getUsers();
      const freshUser =
        allUsers.find((u) => u.id === currentUser.id) || currentUser;
      // Create new leave request
      const newRequest: LeaveRequest = {
        id: Date.now().toString(),
        employeeId: freshUser.id,
        employeeName: freshUser.name,
        managerId: freshUser.managerId || "",
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        days: days,
        reason: formData.reason,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      saveLeaveRequest(newRequest);

      // Update leave balance (deduct the requested days)
      if (userBalance) {
        const updatedBalance: LeaveBalance = {
          ...userBalance,
          [formData.leaveType]: userBalance[formData.leaveType] - days,
        };
        updateLeaveBalance(updatedBalance);
      }

      // Add notification for manager
      const manager = allUsers.find((u) => u.id === freshUser.managerId);
      if (manager) {
        addNotification({
          id: Date.now().toString(),
          userId: manager.id,
          message: `New leave request from ${freshUser.name} for ${days} days`,
          type: "info",
          createdAt: new Date().toISOString(),
          read: false,
        });
      }

      // Add confirmation notification for employee
      addNotification({
        id: (Date.now() + 1).toString(),
        userId: freshUser.id,
        message: `Your leave request for ${days} days has been submitted successfully`,
        type: "success",
        createdAt: new Date().toISOString(),
        read: false,
      });

      onSubmit();
    } catch (error) {
      console.error("Error submitting leave request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Submit Leave Request
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Leave Type
            </label>
            <select
              value={formData.leaveType}
              onChange={(e) =>
                setFormData({ ...formData, leaveType: e.target.value as any })
              }
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="casual">Casual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="vacation">Vacation Leave</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Available balance: {availableBalance} days
            </p>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min={
                  formData.startDate || new Date().toISOString().split("T")[0]
                }
              />
            </div>
          </div>

          {/* Days Calculation */}
          {formData.startDate && formData.endDate && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  Total Days: {days}
                </span>
              </div>
              {days > availableBalance && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  ⚠️ Insufficient leave balance. You have {availableBalance}{" "}
                  days available.
                </p>
              )}
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for Leave
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              rows={4}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Please provide a reason for your leave request..."
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || days > availableBalance || days <= 0}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
