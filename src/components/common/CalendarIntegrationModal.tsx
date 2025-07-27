import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Mail,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";
import { Badge } from "./Badge";
import {
  getCalendarIntegrations,
  saveCalendarIntegration,
  getCurrentUser,
} from "../../utils/storage";
import { CalendarIntegration } from "../../types";

interface CalendarIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarIntegrationModal: React.FC<
  CalendarIntegrationModalProps
> = ({ isOpen, onClose }) => {
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<
    "google" | "outlook" | "apple"
  >("google");
  const [email, setEmail] = useState("");
  const [syncLeaveRequests, setSyncLeaveRequests] = useState(true);
  const [syncNotifications, setSyncNotifications] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "connecting" | "success" | "error"
  >("idle");

  useEffect(() => {
    if (isOpen) {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const userIntegrations = getCalendarIntegrations().filter(
          (i) => i.userId === currentUser.id
        );
        setIntegrations(userIntegrations);
      }
    }
  }, [isOpen]);

  const getProviderInfo = (provider: string) => {
    switch (provider) {
      case "google":
        return {
          name: "Google Calendar",
          icon: "📅",
          color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          description:
            "Sync with your Google Calendar for automatic event creation",
        };
      case "outlook":
        return {
          name: "Outlook Calendar",
          icon: "📧",
          color:
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
          description:
            "Integrate with Microsoft Outlook for seamless scheduling",
        };
      case "apple":
        return {
          name: "Apple Calendar",
          icon: "🍎",
          color:
            "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
          description: "Connect with Apple Calendar for iOS and macOS users",
        };
      default:
        return {
          name: "Unknown",
          icon: "❓",
          color:
            "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
          description: "Unknown calendar provider",
        };
    }
  };

  const handleConnect = async () => {
    if (!email.trim()) return;

    setIsConnecting(true);
    setConnectionStatus("connecting");

    // Simulate connection process
    setTimeout(() => {
      const currentUser = getCurrentUser();
      const newIntegration: CalendarIntegration = {
        id: Date.now().toString(),
        userId: currentUser?.id || "",
        provider: selectedProvider,
        email: email,
        isEnabled: true,
        syncLeaveRequests,
        syncNotifications,
        lastSync: new Date().toISOString(),
      };

      saveCalendarIntegration(newIntegration);
      setIntegrations((prev) => [...prev, newIntegration]);

      setEmail("");
      setIsConnecting(false);
      setConnectionStatus("success");

      // Reset status after 3 seconds
      setTimeout(() => setConnectionStatus("idle"), 3000);
    }, 2000);
  };

  const handleDisconnect = (integrationId: string) => {
    const updatedIntegrations = integrations.filter(
      (i) => i.id !== integrationId
    );
    // In a real app, you would also remove from storage
    setIntegrations(updatedIntegrations);
  };

  const handleToggleIntegration = (integration: CalendarIntegration) => {
    const updatedIntegration = {
      ...integration,
      isEnabled: !integration.isEnabled,
    };
    saveCalendarIntegration(updatedIntegration);
    setIntegrations((prev) =>
      prev.map((i) => (i.id === integration.id ? updatedIntegration : i))
    );
  };

  const handleSync = (integration: CalendarIntegration) => {
    // Simulate sync process
    const updatedIntegration = {
      ...integration,
      lastSync: new Date().toISOString(),
    };
    saveCalendarIntegration(updatedIntegration);
    setIntegrations((prev) =>
      prev.map((i) => (i.id === integration.id ? updatedIntegration : i))
    );
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center space-x-3'>
            <Calendar className='w-6 h-6 text-blue-600' />
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
              Calendar Integration
            </h2>
          </div>
          <Button onClick={onClose} variant='outline' icon={X} size='sm'>
            Close
          </Button>
        </div>

        <div className='p-6 overflow-auto max-h-[70vh]'>
          {/* Current Integrations */}
          <div className='mb-8'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Connected Calendars
            </h3>

            {integrations.length === 0 ? (
              <Card className='p-6 text-center text-gray-500 dark:text-gray-400'>
                <Calendar className='w-12 h-12 mx-auto mb-4 text-gray-400' />
                <p>No calendar integrations connected yet.</p>
                <p className='text-sm'>
                  Connect your calendar to automatically sync leave events.
                </p>
              </Card>
            ) : (
              <div className='space-y-4'>
                {integrations.map((integration) => {
                  const providerInfo = getProviderInfo(integration.provider);

                  return (
                    <Card key={integration.id} className='p-4'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-4'>
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${providerInfo.color}`}
                          >
                            {providerInfo.icon}
                          </div>
                          <div>
                            <h4 className='font-semibold text-gray-900 dark:text-white'>
                              {providerInfo.name}
                            </h4>
                            <p className='text-sm text-gray-600 dark:text-gray-400'>
                              {integration.email}
                            </p>
                            <div className='flex items-center space-x-4 mt-2'>
                              <Badge
                                variant={
                                  integration.isEnabled ? "success" : "default"
                                }
                              >
                                {integration.isEnabled ? "Active" : "Inactive"}
                              </Badge>
                              {integration.lastSync && (
                                <span className='text-xs text-gray-500 dark:text-gray-400'>
                                  Last sync:{" "}
                                  {new Date(
                                    integration.lastSync
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className='flex items-center space-x-2'>
                          <Button
                            onClick={() => handleSync(integration)}
                            variant='outline'
                            icon={RefreshCw}
                            size='sm'
                            disabled={!integration.isEnabled}
                          >
                            Sync
                          </Button>
                          <Button
                            onClick={() => handleToggleIntegration(integration)}
                            variant={
                              integration.isEnabled ? "outline" : "primary"
                            }
                            size='sm'
                          >
                            {integration.isEnabled ? "Disable" : "Enable"}
                          </Button>
                          <Button
                            onClick={() => handleDisconnect(integration.id)}
                            variant='outline'
                            size='sm'
                            className='text-red-600 hover:text-red-700'
                          >
                            Disconnect
                          </Button>
                        </div>
                      </div>

                      <div className='mt-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
                        <div className='grid grid-cols-2 gap-4'>
                          <div className='flex items-center space-x-2'>
                            <input
                              type='checkbox'
                              checked={integration.syncLeaveRequests}
                              onChange={() => {
                                const updated = {
                                  ...integration,
                                  syncLeaveRequests:
                                    !integration.syncLeaveRequests,
                                };
                                saveCalendarIntegration(updated);
                                setIntegrations((prev) =>
                                  prev.map((i) =>
                                    i.id === integration.id ? updated : i
                                  )
                                );
                              }}
                              className='rounded'
                            />
                            <label className='text-sm text-gray-700 dark:text-gray-300'>
                              Sync Leave Requests
                            </label>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <input
                              type='checkbox'
                              checked={integration.syncNotifications}
                              onChange={() => {
                                const updated = {
                                  ...integration,
                                  syncNotifications:
                                    !integration.syncNotifications,
                                };
                                saveCalendarIntegration(updated);
                                setIntegrations((prev) =>
                                  prev.map((i) =>
                                    i.id === integration.id ? updated : i
                                  )
                                );
                              }}
                              className='rounded'
                            />
                            <label className='text-sm text-gray-700 dark:text-gray-300'>
                              Sync Notifications
                            </label>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add New Integration */}
          <div className='border-t border-gray-200 dark:border-gray-700 pt-8'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Connect New Calendar
            </h3>

            <Card className='p-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Provider Selection */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                    Choose Calendar Provider
                  </label>
                  <div className='space-y-3'>
                    {(["google", "outlook", "apple"] as const).map(
                      (provider) => {
                        const providerInfo = getProviderInfo(provider);

                        return (
                          <label
                            key={provider}
                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedProvider === provider
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                            }`}
                          >
                            <input
                              type='radio'
                              name='provider'
                              value={provider}
                              checked={selectedProvider === provider}
                              onChange={(e) =>
                                setSelectedProvider(e.target.value as any)
                              }
                              className='mr-3'
                            />
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${providerInfo.color}`}
                            >
                              {providerInfo.icon}
                            </div>
                            <div className='ml-3'>
                              <div className='font-medium text-gray-900 dark:text-white'>
                                {providerInfo.name}
                              </div>
                              <div className='text-sm text-gray-600 dark:text-gray-400'>
                                {providerInfo.description}
                              </div>
                            </div>
                          </label>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Connection Form */}
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Email Address
                    </label>
                    <input
                      type='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder='Enter your email address'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                    />
                  </div>

                  <div className='space-y-3'>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Sync Options
                    </label>
                    <div className='space-y-2'>
                      <label className='flex items-center'>
                        <input
                          type='checkbox'
                          checked={syncLeaveRequests}
                          onChange={(e) =>
                            setSyncLeaveRequests(e.target.checked)
                          }
                          className='mr-2 rounded'
                        />
                        <span className='text-sm text-gray-700 dark:text-gray-300'>
                          Automatically sync approved leave requests
                        </span>
                      </label>
                      <label className='flex items-center'>
                        <input
                          type='checkbox'
                          checked={syncNotifications}
                          onChange={(e) =>
                            setSyncNotifications(e.target.checked)
                          }
                          className='mr-2 rounded'
                        />
                        <span className='text-sm text-gray-700 dark:text-gray-300'>
                          Sync leave notifications and reminders
                        </span>
                      </label>
                    </div>
                  </div>

                  <Button
                    onClick={handleConnect}
                    variant='primary'
                    size='lg'
                    className='w-full'
                    disabled={!email.trim() || isConnecting}
                  >
                    {isConnecting ? "Connecting..." : "Connect Calendar"}
                  </Button>

                  {connectionStatus === "success" && (
                    <div className='flex items-center space-x-2 text-green-600 dark:text-green-400'>
                      <CheckCircle className='w-5 h-5' />
                      <span>Calendar connected successfully!</span>
                    </div>
                  )}

                  {connectionStatus === "error" && (
                    <div className='flex items-center space-x-2 text-red-600 dark:text-red-400'>
                      <AlertCircle className='w-5 h-5' />
                      <span>Connection failed. Please try again.</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
