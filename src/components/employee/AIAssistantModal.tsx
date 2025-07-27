import React, { useState } from "react";
import { X, Bot, Send, User, Lightbulb, Calendar, Clock } from "lucide-react";
import { Button } from "../common/Button";
import {
  getCurrentUser,
  getLeaveBalances,
  getLeaveRequests,
} from "../../utils/storage";

interface AIAssistantModalProps {
  onClose: () => void;
}

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

// OpenAI API key is handled by the backend proxy server

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Hi! I'm your AI assistant. I can help you with leave policies, balance inquiries, and provide suggestions for your leave planning. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const currentUser = getCurrentUser();
  const leaveBalance = getLeaveBalances().find(
    (b) => b.userId === currentUser?.id
  );
  const userRequests = getLeaveRequests().filter(
    (r) => r.employeeId === currentUser?.id
  );

  const generateIntelligentResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();

    // Leave balance queries
    if (
      message.includes("balance") ||
      (message.includes("leave") && message.includes("left"))
    ) {
      return `Based on your current leave balance:
• Sick Leave: ${leaveBalance?.sick || 0} days remaining out of ${
        leaveBalance?.totalAllocated.sick || 0
      }
• Casual Leave: ${leaveBalance?.casual || 0} days remaining out of ${
        leaveBalance?.totalAllocated.casual || 0
      }
• Vacation Leave: ${leaveBalance?.vacation || 0} days remaining out of ${
        leaveBalance?.totalAllocated.vacation || 0
      }

You have a total of ${
        (leaveBalance?.sick || 0) +
        (leaveBalance?.casual || 0) +
        (leaveBalance?.vacation || 0)
      } days of leave remaining.`;
    }

    // Vacation planning
    if (
      message.includes("vacation") ||
      message.includes("plan") ||
      message.includes("holiday")
    ) {
      return `Great! Let me help you plan your vacation. You have ${
        leaveBalance?.vacation || 0
      } vacation days remaining.

Here are some tips for vacation planning:
• Consider taking vacation during off-peak seasons for better availability
• Plan around company holidays to maximize your time off
• Submit your request at least 2 weeks in advance
• Check with your manager about team coverage during your absence

Would you like me to help you calculate how many days you can take for a specific period?`;
    }

    // Sick leave queries
    if (
      message.includes("sick") ||
      message.includes("ill") ||
      message.includes("health")
    ) {
      return `For sick leave, you have ${
        leaveBalance?.sick || 0
      } days remaining. 

Important sick leave policies:
• Sick leave can be taken immediately when needed
• You may need to provide a medical certificate for extended sick leave
• Sick leave is separate from your other leave types
• Contact your manager as soon as possible when taking sick leave

Is this for immediate use or planning purposes?`;
    }

    // Policy questions
    if (
      message.includes("policy") ||
      message.includes("rule") ||
      message.includes("guideline")
    ) {
      return `Here are the key leave policies:

**General Leave Policies:**
• Submit leave requests at least 2 weeks in advance (except sick leave)
• All leave must be approved by your manager
• Leave requests are processed within 3-5 business days
• You can't take more leave than your available balance

**Leave Types:**
• Sick Leave: For health-related absences
• Casual Leave: For personal matters (up to 3 days at a time)
• Vacation Leave: For planned time off and holidays

**Request Process:**
1. Submit request through the system
2. Manager reviews and approves/rejects
3. You receive notification of the decision
4. Leave is deducted from your balance upon approval

Would you like more specific information about any of these policies?`;
    }

    // Request status
    if (
      message.includes("request") ||
      message.includes("status") ||
      message.includes("pending")
    ) {
      const pendingRequests = userRequests.filter(
        (r) => r.status === "pending"
      );
      const approvedRequests = userRequests.filter(
        (r) => r.status === "approved"
      );

      return `Here's your leave request status:

**Pending Requests:** ${pendingRequests.length}
${pendingRequests
  .map(
    (r) =>
      `• ${r.leaveType} leave: ${r.startDate} to ${r.endDate} (${r.days} days)`
  )
  .join("\n")}

**Approved Requests:** ${approvedRequests.length}
${approvedRequests
  .map(
    (r) =>
      `• ${r.leaveType} leave: ${r.startDate} to ${r.endDate} (${r.days} days)`
  )
  .join("\n")}

${
  pendingRequests.length > 0
    ? "Your pending requests are being reviewed by your manager."
    : "You have no pending requests at the moment."
}`;
    }

    // Default response
    return `I'm here to help you with leave management! I can assist with:

• Checking your leave balance
• Planning vacation time
• Understanding leave policies
• Tracking request status
• Calculating leave days

What specific information would you like to know about your leave?`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Try to call OpenAI API via local proxy
      const response = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are an HR leave management assistant. Answer questions about leave policies, balances, and planning. Use the following user context if relevant: Sick: ${
                leaveBalance?.sick || 0
              }/${leaveBalance?.totalAllocated.sick || 0}, Casual: ${
                leaveBalance?.casual || 0
              }/${leaveBalance?.totalAllocated.casual || 0}, Vacation: ${
                leaveBalance?.vacation || 0
              }/${leaveBalance?.totalAllocated.vacation || 0}.`,
            },
            ...messages.map((m) => ({
              role: m.type === "user" ? "user" : "assistant",
              content: m.content,
            })),
            { role: "user", content: inputMessage },
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiContent =
        data.choices?.[0]?.message?.content ||
        "Sorry, I couldn't get a response from the AI.";

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: aiContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      // Fallback to intelligent response generation
      const fallbackResponse = generateIntelligentResponse(inputMessage);

      const aiResponse: Message = {
        id: (Date.now() + 2).toString(),
        type: "ai",
        content: fallbackResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickActions = [
    {
      icon: Clock,
      text: "Check my leave balance",
      action: "What's my current leave balance?",
    },
    {
      icon: Calendar,
      text: "Plan vacation days",
      action: "Help me plan my vacation days",
    },
    {
      icon: Lightbulb,
      text: "Leave policy help",
      action: "What are the leave policies?",
    },
  ];

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full h-[600px] flex flex-col'>
        <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center space-x-3'>
            <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
              <Bot className='w-5 h-5 text-blue-600' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              AI Leave Assistant
            </h3>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Messages */}
        <div className='flex-1 overflow-y-auto p-6 space-y-4'>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start space-x-3 max-w-[80%] ${
                  message.type === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === "user"
                      ? "bg-blue-600"
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}
                >
                  {message.type === "user" ? (
                    <User className='w-4 h-4 text-white' />
                  ) : (
                    <Bot className='w-4 h-4 text-gray-600 dark:text-gray-300' />
                  )}
                </div>
                <div
                  className={`rounded-lg p-3 ${
                    message.type === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  }`}
                >
                  <p className='text-sm whitespace-pre-line'>
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      message.type === "user"
                        ? "text-blue-100"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className='flex justify-start'>
              <div className='flex items-start space-x-3'>
                <div className='w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center'>
                  <Bot className='w-4 h-4 text-gray-600 dark:text-gray-300' />
                </div>
                <div className='bg-gray-100 dark:bg-gray-700 rounded-lg p-3'>
                  <div className='flex space-x-1'>
                    <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
                    <div
                      className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className='px-6 py-3 border-t border-gray-200 dark:border-gray-700'>
            <p className='text-sm text-gray-600 dark:text-gray-400 mb-3'>
              Quick actions:
            </p>
            <div className='flex flex-wrap gap-2'>
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(action.action)}
                  className='flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors'
                >
                  <action.icon className='w-4 h-4' />
                  <span>{action.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className='p-6 border-t border-gray-200 dark:border-gray-700'>
          <div className='flex space-x-3'>
            <input
              type='text'
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder='Ask me about leave policies, balance, or planning...'
              className='flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              variant='primary'
              icon={Send}
              disabled={!inputMessage.trim() || isTyping}
            >
              {/* Button requires children prop */}
              ""
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
