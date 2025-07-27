import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  TrendingUp,
  Plus,
  History,
  User as UserIcon,
  Bot,
  Settings,
  BookOpen,
} from "lucide-react";
import { Layout } from "../common/Layout";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { LeaveRequestModal } from "./LeaveRequestModal";
import { CalendarModal } from "./CalendarModal";
import { AIAssistantModal } from "./AIAssistantModal";
import { CalendarIntegrationModal } from "../common/CalendarIntegrationModal";
import { PolicyFAQModal } from "../common/PolicyFAQModal";
import {
  getCurrentUser,
  getLeaveBalances,
  getLeaveRequests,
} from "../../utils/storage";
import { LeaveRequest, LeaveBalance, User } from "../../types";

interface EmployeeDashboardProps {
  onLogout: () => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  onLogout,
}) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showCalendarIntegrationModal, setShowCalendarIntegrationModal] =
    useState(false);
  const [showPolicyFAQModal, setShowPolicyFAQModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "history">(
    "overview"
  );
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user) {
      const balances = getLeaveBalances();
      const userBalance = balances.find((b) => b.userId === user.id);
      setLeaveBalance(userBalance || null);

      const allRequests = getLeaveRequests();
      const userRequests = allRequests.filter((r) => r.employeeId === user.id);
      // Sort by creation date in descending order (latest first)
      userRequests.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRequests(userRequests);
    }
  }, []);

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

  const recentRequests = requests.slice(0, 3);
  const pendingRequests = requests.filter((r) => r.status === "pending").length;

  return (
    <Layout title='Employee Dashboard' onLogout={onLogout}>
      <div className='space-y-8'>
        {/* Welcome Section */}
        <div className='flex justify-between items-center'>
          <div>
            <h2 className='text-3xl font-bold text-gray-900 dark:text-white'>
              Welcome back, {currentUser?.name}!
            </h2>
            <p className='text-gray-600 dark:text-gray-400 mt-2'>
              Manage your leave requests and track your time off
            </p>
          </div>
          <div className='flex flex-wrap gap-3 justify-end items-center mb-4'>
            <Button
              onClick={() => setShowCalendarIntegrationModal(true)}
              variant='outline'
              icon={Settings}
              size='lg'
              className='rounded-lg shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
            >
              Calendar Sync
            </Button>
            <Button
              onClick={() => setShowPolicyFAQModal(true)}
              variant='outline'
              icon={BookOpen}
              size='lg'
              className='rounded-lg shadow-sm hover:bg-green-50 dark:hover:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300'
            >
              Policies & FAQ
            </Button>
            <Button
              onClick={() => setShowCalendarModal(true)}
              variant='outline'
              icon={Calendar}
              size='lg'
              className='rounded-lg shadow-sm hover:bg-purple-50 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300'
            >
              View Calendar
            </Button>
            <Button
              onClick={() => setShowAIModal(true)}
              variant='secondary'
              icon={Bot}
              size='lg'
              className='rounded-lg shadow-sm hover:bg-yellow-50 dark:hover:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300'
            >
              AI Assistant
            </Button>
            <Button
              onClick={() => setShowRequestModal(true)}
              variant='primary'
              icon={Plus}
              size='lg'
              className='rounded-lg shadow-md'
            >
              New Leave Request
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
          <Card className='text-center'>
            <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Calendar className='w-6 h-6 text-blue-600' />
            </div>
            <p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
              Pending Requests
            </p>
            <p className='text-2xl font-bold text-gray-900 dark:text-white'>
              {pendingRequests}
            </p>
          </Card>

          <Card className='text-center'>
            <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Clock className='w-6 h-6 text-green-600' />
            </div>
            <p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
              Sick Leave
            </p>
            <p className='text-2xl font-bold text-gray-900 dark:text-white'>
              {leaveBalance?.sick || 0} /{" "}
              {leaveBalance?.totalAllocated.sick || 0}
            </p>
          </Card>

          <Card className='text-center'>
            <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <TrendingUp className='w-6 h-6 text-purple-600' />
            </div>
            <p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
              Casual Leave
            </p>
            <p className='text-2xl font-bold text-gray-900 dark:text-white'>
              {leaveBalance?.casual || 0} /{" "}
              {leaveBalance?.totalAllocated.casual || 0}
            </p>
          </Card>

          <Card className='text-center'>
            <div className='w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <UserIcon className='w-6 h-6 text-orange-600' />
            </div>
            <p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
              Vacation Leave
            </p>
            <p className='text-2xl font-bold text-gray-900 dark:text-white'>
              {leaveBalance?.vacation || 0} /{" "}
              {leaveBalance?.totalAllocated.vacation || 0}
            </p>
          </Card>
        </div>

        {/* Leave Balance Chart */}
        <Card>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-6'>
            Leave Balance Overview
          </h3>
          <div className='space-y-6'>
            {/* Sick Leave */}
            <div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Sick Leave
                </span>
                <span className='text-sm text-gray-600 dark:text-gray-400'>
                  {leaveBalance?.sick || 0} of{" "}
                  {leaveBalance?.totalAllocated.sick || 0} days remaining
                </span>
              </div>
              <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3'>
                <div
                  className='bg-blue-600 h-3 rounded-full transition-all duration-300'
                  style={{
                    width: `${
                      ((leaveBalance?.sick || 0) /
                        (leaveBalance?.totalAllocated.sick || 1)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Casual Leave */}
            <div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Casual Leave
                </span>
                <span className='text-sm text-gray-600 dark:text-gray-400'>
                  {leaveBalance?.casual || 0} of{" "}
                  {leaveBalance?.totalAllocated.casual || 0} days remaining
                </span>
              </div>
              <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3'>
                <div
                  className='bg-green-600 h-3 rounded-full transition-all duration-300'
                  style={{
                    width: `${
                      ((leaveBalance?.casual || 0) /
                        (leaveBalance?.totalAllocated.casual || 1)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Vacation Leave */}
            <div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Vacation Leave
                </span>
                <span className='text-sm text-gray-600 dark:text-gray-400'>
                  {leaveBalance?.vacation || 0} of{" "}
                  {leaveBalance?.totalAllocated.vacation || 0} days remaining
                </span>
              </div>
              <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3'>
                <div
                  className='bg-purple-600 h-3 rounded-full transition-all duration-300'
                  style={{
                    width: `${
                      ((leaveBalance?.vacation || 0) /
                        (leaveBalance?.totalAllocated.vacation || 1)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className='border-b border-gray-200 dark:border-gray-700'>
          <nav className='-mb-px flex space-x-8'>
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              Recent Requests
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "history"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              All History
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === "overview" && (
          <Card>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-6'>
              Recent Leave Requests
            </h3>
            {recentRequests.length > 0 ? (
              <div className='space-y-4'>
                {recentRequests.map((request) => (
                  <div
                    key={request.id}
                    className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                  >
                    <div className='flex justify-between items-start'>
                      <div className='flex-1'>
                        <div className='flex items-center space-x-3 mb-2'>
                          <h4 className='font-medium text-gray-900 dark:text-white capitalize'>
                            {request.leaveType} Leave
                          </h4>
                          <Badge
                            variant={getStatusBadgeVariant(request.status)}
                          >
                            {request.status}
                          </Badge>
                        </div>
                        <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                          {request.reason}
                        </p>
                        <div className='flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400'>
                          <span>
                            {request.startDate} to {request.endDate}
                          </span>
                          <span>{request.days} days</span>
                          <span>
                            Submitted{" "}
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {request.managerComments && (
                          <div className='mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md'>
                            <p className='text-sm text-blue-800 dark:text-blue-300'>
                              <span className='font-medium'>
                                Manager's Comment:
                              </span>{" "}
                              {request.managerComments}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-12'>
                <History className='w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4' />
                <p className='text-gray-500 dark:text-gray-400'>
                  No leave requests yet
                </p>
                <Button
                  onClick={() => setShowRequestModal(true)}
                  variant='primary'
                  className='mt-4'
                >
                  Submit Your First Request
                </Button>
              </div>
            )}
          </Card>
        )}

        {activeTab === "history" && (
          <Card>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-6'>
              All Leave Requests
            </h3>
            {requests.length > 0 ? (
              <div className='space-y-4'>
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                  >
                    <div className='flex justify-between items-start'>
                      <div className='flex-1'>
                        <div className='flex items-center space-x-3 mb-2'>
                          <h4 className='font-medium text-gray-900 dark:text-white capitalize'>
                            {request.leaveType} Leave
                          </h4>
                          <Badge
                            variant={getStatusBadgeVariant(request.status)}
                          >
                            {request.status}
                          </Badge>
                        </div>
                        <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                          {request.reason}
                        </p>
                        <div className='flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400'>
                          <span>
                            {request.startDate} to {request.endDate}
                          </span>
                          <span>{request.days} days</span>
                          <span>
                            Submitted{" "}
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {request.managerComments && (
                          <div className='mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md'>
                            <p className='text-sm text-blue-800 dark:text-blue-300'>
                              <span className='font-medium'>
                                Manager's Comment:
                              </span>{" "}
                              {request.managerComments}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-12'>
                <History className='w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4' />
                <p className='text-gray-500 dark:text-gray-400'>
                  No leave requests found
                </p>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Leave Request Modal */}
      {showRequestModal && (
        <LeaveRequestModal
          onClose={() => setShowRequestModal(false)}
          onSubmit={() => {
            setShowRequestModal(false);
            // Refresh data
            window.location.reload();
          }}
        />
      )}

      {/* Calendar Modal */}
      {showCalendarModal && (
        <CalendarModal onClose={() => setShowCalendarModal(false)} />
      )}

      {/* AI Assistant Modal */}
      {showAIModal && (
        <AIAssistantModal onClose={() => setShowAIModal(false)} />
      )}

      {/* New Feature Modals */}
      <CalendarIntegrationModal
        isOpen={showCalendarIntegrationModal}
        onClose={() => setShowCalendarIntegrationModal(false)}
      />

      <PolicyFAQModal
        isOpen={showPolicyFAQModal}
        onClose={() => setShowPolicyFAQModal(false)}
      />
    </Layout>
  );
};
