import React, { useState } from 'react';
import { X, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { saveLeaveRequest, addNotification, getLeaveBalances, updateLeaveBalance } from '../../utils/storage';
import { LeaveRequest } from '../../types';

interface RequestActionModalProps {
  request: LeaveRequest;
  onClose: () => void;
  onAction: () => void;
}

export const RequestActionModal: React.FC<RequestActionModalProps> = ({ 
  request, 
  onClose, 
  onAction 
}) => {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (selectedAction: 'approve' | 'reject') => {
    setIsSubmitting(true);

    try {
      const updatedRequest: LeaveRequest = {
        ...request,
        status: selectedAction === 'approve' ? 'approved' : 'rejected',
        approvedAt: new Date().toISOString(),
        managerComments: comments || undefined
      };

      saveLeaveRequest(updatedRequest);

      // If rejecting, restore the leave balance
      if (selectedAction === 'reject') {
        const balances = getLeaveBalances();
        const userBalance = balances.find(b => b.userId === request.employeeId);
        if (userBalance) {
          const restoredBalance = {
            ...userBalance,
            [request.leaveType]: userBalance[request.leaveType] + request.days
          };
          updateLeaveBalance(restoredBalance);
        }
      }

      // Add notification for employee
      const notificationMessage = selectedAction === 'approve'
        ? `Your leave request for ${request.days} days has been approved`
        : `Your leave request for ${request.days} days has been rejected`;

      addNotification({
        id: Date.now().toString(),
        userId: request.employeeId,
        message: notificationMessage,
        type: selectedAction === 'approve' ? 'success' : 'error',
        createdAt: new Date().toISOString(),
        read: false
      });

      onAction();
    } catch (error) {
      console.error('Error processing request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Review Leave Request</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Request Details */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{request.employeeName}</h4>
                <div className="flex items-center space-x-3">
                  <Badge variant="info">{request.leaveType} Leave</Badge>
                  <Badge variant={getStatusBadgeVariant(request.status)}>
                    {request.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Start Date</p>
                <p className="font-medium text-gray-900 dark:text-white">{request.startDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">End Date</p>
                <p className="font-medium text-gray-900 dark:text-white">{request.endDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                <p className="font-medium text-gray-900 dark:text-white">{request.days} days</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Submitted</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Reason</p>
              <p className="text-gray-900 dark:text-white">{request.reason}</p>
            </div>
          </div>

          {/* Manager Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Comments (Optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add your comments about this request..."
            />
          </div>

          {/* Action Selection */}
          {!action && request.status === 'pending' && (
            <div className="flex space-x-4">
              <Button
                onClick={() => setAction('approve')}
                variant="success"
                icon={CheckCircle}
                className="flex-1"
              >
                Approve Request
              </Button>
              <Button
                onClick={() => setAction('reject')}
                variant="danger"
                icon={XCircle}
                className="flex-1"
              >
                Reject Request
              </Button>
            </div>
          )}

          {/* Confirmation Step */}
          {action && (
            <div className={`border-2 rounded-lg p-4 ${
              action === 'approve' ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'
            }`}>
              <div className="flex items-center space-x-2 mb-3">
                {action === 'approve' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  action === 'approve' ? 'text-green-900 dark:text-green-300' : 'text-red-900 dark:text-red-300'
                }`}>
                  {action === 'approve' ? 'Approve' : 'Reject'} this leave request?
                </span>
              </div>
              <p className={`text-sm mb-4 ${
                action === 'approve' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
              }`}>
                {action === 'approve' 
                  ? `This will approve ${request.employeeName}'s request for ${request.days} days of ${request.leaveType} leave.`
                  : `This will reject ${request.employeeName}'s request and restore their leave balance.`
                }
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={() => handleSubmit(action)}
                  variant={action === 'approve' ? 'success' : 'danger'}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Processing...' : `Confirm ${action === 'approve' ? 'Approval' : 'Rejection'}`}
                </Button>
                <Button
                  onClick={() => setAction(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Close Button for Already Processed Requests */}
          {request.status !== 'pending' && (
            <div className="flex justify-end">
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};