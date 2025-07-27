import React, { useState, useEffect } from "react";
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  UserPlus,
  Bot,
  Bell,
  BookOpen,
  Settings,
} from "lucide-react";
import { Layout } from "../common/Layout";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { RequestActionModal } from "./RequestActionModal";
import { AddUserModal } from "./AddUserModal";
import { AIAssistantModal } from "../employee/AIAssistantModal";
import { TeamCalendarModal } from "./TeamCalendarModal";
import { ReturnToWorkModal } from "./ReturnToWorkModal";
import { CalendarIntegrationModal } from "../common/CalendarIntegrationModal";
import { PolicyFAQModal } from "../common/PolicyFAQModal";
import {
  getCurrentUser,
  getLeaveRequests,
  getUsers,
  getLeaveBalances,
} from "../../utils/storage";
import { LeaveRequest, User } from "../../types";

interface ManagerDashboardProps {
  onLogout: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<"pending" | "team" | "analytics">(
    "pending"
  );
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(
    null
  );
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showTeamCalendarModal, setShowTeamCalendarModal] = useState(false);
  const [showReturnToWorkModal, setShowReturnToWorkModal] = useState(false);
  const [showCalendarIntegrationModal, setShowCalendarIntegrationModal] =
    useState(false);
  const [showPolicyFAQModal, setShowPolicyFAQModal] = useState(false);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      const allRequests = getLeaveRequests();
      const teamRequests = allRequests.filter(
        (r) => r.managerId === currentUser.id
      );
      // Sort by creation date in descending order (latest first)
      teamRequests.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRequests(teamRequests);

      const allUsers = getUsers();
      const team = allUsers.filter((u) => u.managerId === currentUser.id);
      setTeamMembers(team);
    }
  }, []);

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const approvedRequests = requests.filter((r) => r.status === "approved");
  const rejectedRequests = requests.filter((r) => r.status === "rejected");

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

  const handleRequestAction = () => {
    setSelectedRequest(null);
    // Refresh data
    const currentUser = getCurrentUser();
    const allRequests = getLeaveRequests();
    const teamRequests = allRequests.filter(
      (r) => r.managerId === currentUser?.id
    );
    setRequests(teamRequests);
  };

  return (
    <Layout title='Manager Dashboard' onLogout={onLogout}>
      <div className='space-y-8'>
        {/* Welcome Section */}
        <div>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-3xl font-bold text-gray-900 dark:text-white'>
                Manager Dashboard
              </h2>
              <p className='text-gray-600 dark:text-gray-400 mt-2'>
                Manage your team's leave requests and monitor attendance
                patterns
              </p>
            </div>
            <div className='flex flex-wrap gap-3 justify-end items-center mb-4'>
              <Button
                onClick={() => setShowTeamCalendarModal(true)}
                variant='outline'
                icon={Calendar}
                size='lg'
                className='rounded-lg shadow-sm hover:bg-purple-50 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300'
              >
                Team Calendar
              </Button>
              <Button
                onClick={() => setShowReturnToWorkModal(true)}
                variant='outline'
                icon={Bell}
                size='lg'
                className='rounded-lg shadow-sm hover:bg-yellow-50 dark:hover:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300'
              >
                Return Notifications
              </Button>
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
                onClick={() => setShowAddUserModal(true)}
                variant='outline'
                icon={UserPlus}
                size='lg'
                className='rounded-lg shadow-sm hover:bg-pink-50 dark:hover:bg-pink-900/30 border-pink-200 dark:border-pink-700 text-pink-700 dark:text-pink-300'
              >
                Add User
              </Button>
              <Button
                onClick={() => setShowAIModal(true)}
                variant='secondary'
                icon={Bot}
                size='lg'
                className='rounded-lg shadow-sm hover:bg-orange-50 dark:hover:bg-orange-900/30 border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-300'
              >
                AI Assistant
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
          <Card className='text-center'>
            <div className='w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Clock className='w-6 h-6 text-yellow-600' />
            </div>
            <p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
              Pending Requests
            </p>
            <p className='text-2xl font-bold text-gray-900 dark:text-white'>
              {pendingRequests.length}
            </p>
          </Card>

          <Card className='text-center'>
            <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <CheckCircle className='w-6 h-6 text-green-600' />
            </div>
            <p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
              Approved This Month
            </p>
            <p className='text-2xl font-bold text-gray-900 dark:text-white'>
              {approvedRequests.length}
            </p>
          </Card>

          <Card className='text-center'>
            <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <XCircle className='w-6 h-6 text-red-600' />
            </div>
            <p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
              Rejected This Month
            </p>
            <p className='text-2xl font-bold text-gray-900 dark:text-white'>
              {rejectedRequests.length}
            </p>
          </Card>

          <Card className='text-center'>
            <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Users className='w-6 h-6 text-blue-600' />
            </div>
            <p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
              Team Members
            </p>
            <p className='text-2xl font-bold text-gray-900 dark:text-white'>
              {teamMembers.length}
            </p>
          </Card>
        </div>

        {/* Tabs */}
        <div className='border-b border-gray-200 dark:border-gray-700'>
          <nav className='-mb-px flex space-x-8'>
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "pending"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              Pending Requests ({pendingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab("team")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "team"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              Team Overview
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "analytics"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              All Requests
            </button>
          </nav>
        </div>

        {/* Pending Requests Tab */}
        {activeTab === "pending" && (
          <Card>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-6'>
              Pending Leave Requests
            </h3>
            {pendingRequests.length > 0 ? (
              <div className='space-y-4'>
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className='border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                  >
                    <div className='flex justify-between items-start'>
                      <div className='flex-1'>
                        <div className='flex items-center space-x-3 mb-3'>
                          <h4 className='font-semibold text-gray-900 dark:text-white'>
                            {request.employeeName}
                          </h4>
                          <Badge variant='info' size='sm'>
                            {request.leaveType}
                          </Badge>
                          <Badge
                            variant={getStatusBadgeVariant(request.status)}
                          >
                            {request.status}
                          </Badge>
                        </div>
                        <p className='text-gray-600 dark:text-gray-400 mb-3'>
                          {request.reason}
                        </p>
                        <div className='flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 mb-4'>
                          <div className='flex items-center space-x-1'>
                            <Calendar className='w-4 h-4' />
                            <span>
                              {request.startDate} to {request.endDate}
                            </span>
                          </div>
                          <span>{request.days} days</span>
                          <span>
                            Submitted{" "}
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className='flex space-x-3'>
                          <Button
                            onClick={() => setSelectedRequest(request)}
                            variant='primary'
                            size='sm'
                          >
                            Review Request
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-12'>
                <Clock className='w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4' />
                <p className='text-gray-500 dark:text-gray-400'>
                  No pending requests
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Team Overview Tab */}
        {activeTab === "team" && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-6'>
                Team Members
              </h3>
              <div className='space-y-4'>
                {teamMembers.map((member) => {
                  const memberRequests = requests.filter(
                    (r) => r.employeeId === member.id
                  );
                  const pendingCount = memberRequests.filter(
                    (r) => r.status === "pending"
                  ).length;

                  return (
                    <div
                      key={member.id}
                      className='flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg'
                    >
                      <div className='flex items-center space-x-3'>
                        <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                          <span className='text-sm font-medium text-blue-600'>
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className='font-medium text-gray-900 dark:text-white'>
                            {member.name}
                          </h4>
                          <p className='text-sm text-gray-500 dark:text-gray-400'>
                            {member.department}
                          </p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm text-gray-900 dark:text-white font-medium'>
                          {memberRequests.length} requests
                        </p>
                        {pendingCount > 0 && (
                          <Badge variant='warning' size='sm'>
                            {pendingCount} pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-6'>
                Leave Statistics
              </h3>
              <div className='space-y-4'>
                <div className='flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
                  <span className='text-blue-900 dark:text-blue-300 font-medium'>
                    Total Requests
                  </span>
                  <span className='text-2xl font-bold text-blue-900 dark:text-blue-300'>
                    {requests.length}
                  </span>
                </div>
                <div className='flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg'>
                  <span className='text-green-900 dark:text-green-300 font-medium'>
                    Approved
                  </span>
                  <span className='text-2xl font-bold text-green-900 dark:text-green-300'>
                    {approvedRequests.length}
                  </span>
                </div>
                <div className='flex justify-between items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg'>
                  <span className='text-yellow-900 dark:text-yellow-300 font-medium'>
                    Pending
                  </span>
                  <span className='text-2xl font-bold text-yellow-900 dark:text-yellow-300'>
                    {pendingRequests.length}
                  </span>
                </div>
                <div className='flex justify-between items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg'>
                  <span className='text-red-900 dark:text-red-300 font-medium'>
                    Rejected
                  </span>
                  <span className='text-2xl font-bold text-red-900 dark:text-red-300'>
                    {rejectedRequests.length}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* All Requests Tab */}
        {activeTab === "analytics" && (
          <Card>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-6'>
              All Leave Requests
            </h3>
            {requests.length > 0 ? (
              <div className='space-y-4'>
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className='border border-gray-200 dark:border-gray-700 rounded-lg p-6'
                  >
                    <div className='flex justify-between items-start'>
                      <div className='flex-1'>
                        <div className='flex items-center space-x-3 mb-3'>
                          <h4 className='font-semibold text-gray-900 dark:text-white'>
                            {request.employeeName}
                          </h4>
                          <Badge variant='info' size='sm'>
                            {request.leaveType}
                          </Badge>
                          <Badge
                            variant={getStatusBadgeVariant(request.status)}
                          >
                            {request.status}
                          </Badge>
                        </div>
                        <p className='text-gray-600 dark:text-gray-400 mb-3'>
                          {request.reason}
                        </p>
                        <div className='flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400'>
                          <div className='flex items-center space-x-1'>
                            <Calendar className='w-4 h-4' />
                            <span>
                              {request.startDate} to {request.endDate}
                            </span>
                          </div>
                          <span>{request.days} days</span>
                          <span>
                            Submitted{" "}
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                          {request.approvedAt && (
                            <span>
                              Processed{" "}
                              {new Date(
                                request.approvedAt
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {request.managerComments && (
                          <div className='mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md'>
                            <p className='text-sm text-gray-700 dark:text-gray-300'>
                              <span className='font-medium'>Your Comment:</span>{" "}
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
                <TrendingUp className='w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4' />
                <p className='text-gray-500 dark:text-gray-400'>
                  No requests found
                </p>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Request Action Modal */}
      {selectedRequest && (
        <RequestActionModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onAction={handleRequestAction}
        />
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onUserAdded={() => {
            setShowAddUserModal(false);
            // Refresh team members
            const currentUser = getCurrentUser();
            const allUsers = getUsers();
            const team = allUsers.filter(
              (u) => u.managerId === currentUser?.id
            );
            setTeamMembers(team);
          }}
        />
      )}

      {/* AI Assistant Modal */}
      {showAIModal && (
        <AIAssistantModal onClose={() => setShowAIModal(false)} />
      )}

      {/* New Feature Modals */}
      <TeamCalendarModal
        isOpen={showTeamCalendarModal}
        onClose={() => setShowTeamCalendarModal(false)}
      />

      <ReturnToWorkModal
        isOpen={showReturnToWorkModal}
        onClose={() => setShowReturnToWorkModal(false)}
      />

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
