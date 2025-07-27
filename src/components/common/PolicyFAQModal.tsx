import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  FileText,
  HelpCircle,
  BookOpen,
  Filter,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";
import { Badge } from "./Badge";
import {
  getLeavePolicies,
  getFAQItems,
  saveFAQItem,
} from "../../utils/storage";
import { LeavePolicy, FAQItem } from "../../types";

interface PolicyFAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PolicyFAQModal: React.FC<PolicyFAQModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"policies" | "faq">("policies");
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPolicy, setSelectedPolicy] = useState<LeavePolicy | null>(
    null
  );
  const [selectedFAQ, setSelectedFAQ] = useState<FAQItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPolicies(getLeavePolicies());
      setFaqItems(getFAQItems());
    }
  }, [isOpen]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "general":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "sick":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "vacation":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "casual":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "maternity":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200";
      case "paternity":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getFAQCategoryColor = (category: string) => {
    switch (category) {
      case "general":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "leave-request":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "approval":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "calendar":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "policy":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch =
      policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === "all" || policy.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredFAQItems = faqItems.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFAQFeedback = (faqId: string, isHelpful: boolean) => {
    const updatedFaqItems = faqItems.map((faq) => {
      if (faq.id === faqId) {
        return {
          ...faq,
          helpful: isHelpful ? faq.helpful + 1 : faq.helpful,
          notHelpful: !isHelpful ? faq.notHelpful + 1 : faq.notHelpful,
        };
      }
      return faq;
    });

    setFaqItems(updatedFaqItems);
    const updatedFaq = updatedFaqItems.find((f) => f.id === faqId);
    if (updatedFaq) {
      saveFAQItem(updatedFaq);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Leave Policies & FAQ
            </h2>
          </div>
          <Button onClick={onClose} variant="outline" icon={X} size="sm">
            Close
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("policies")}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === "policies"
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Leave Policies
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === "faq"
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <HelpCircle className="w-4 h-4 inline mr-2" />
            FAQ
          </button>
        </div>

        <div className="p-6 overflow-auto max-h-[70vh]">
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex space-x-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search policies and FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">All Categories</option>
                {activeTab === "policies" ? (
                  <>
                    <option value="general">General</option>
                    <option value="sick">Sick Leave</option>
                    <option value="vacation">Vacation</option>
                    <option value="casual">Casual Leave</option>
                    <option value="maternity">Maternity</option>
                    <option value="paternity">Paternity</option>
                  </>
                ) : (
                  <>
                    <option value="general">General</option>
                    <option value="leave-request">Leave Request</option>
                    <option value="approval">Approval</option>
                    <option value="calendar">Calendar</option>
                    <option value="policy">Policy</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {activeTab === "policies" ? (
            /* Policies Tab */
            <div className="space-y-6">
              {selectedPolicy ? (
                /* Policy Detail View */
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {selectedPolicy.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(
                            selectedPolicy.category
                          )}`}
                        >
                          {selectedPolicy.category}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Effective: {formatDate(selectedPolicy.effectiveDate)}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => setSelectedPolicy(null)}
                      variant="outline"
                      size="sm"
                    >
                      Back to List
                    </Button>
                  </div>

                  <Card className="p-6">
                    <div className="prose dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                        {selectedPolicy.content}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tags:
                        </span>
                        {selectedPolicy.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="default"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Last updated: {formatDate(selectedPolicy.lastUpdated)}
                      </p>
                    </div>
                  </Card>
                </div>
              ) : (
                /* Policies List */
                <div>
                  {filteredPolicies.length === 0 ? (
                    <Card className="p-6 text-center text-gray-500 dark:text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>No policies found matching your search criteria.</p>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {filteredPolicies.map((policy) => (
                        <Card
                          key={policy.id}
                          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedPolicy(policy)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                {policy.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                {policy.content.substring(0, 150)}...
                              </p>
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(
                                    policy.category
                                  )}`}
                                >
                                  {policy.category}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Effective: {formatDate(policy.effectiveDate)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* FAQ Tab */
            <div className="space-y-6">
              {selectedFAQ ? (
                /* FAQ Detail View */
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {selectedFAQ.question}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getFAQCategoryColor(
                            selectedFAQ.category
                          )}`}
                        >
                          {selectedFAQ.category}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => setSelectedFAQ(null)}
                      variant="outline"
                      size="sm"
                    >
                      Back to List
                    </Button>
                  </div>

                  <Card className="p-6">
                    <div className="prose dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                        {selectedFAQ.answer}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tags:
                          </span>
                          {selectedFAQ.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="default"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() =>
                              handleFAQFeedback(selectedFAQ.id, true)
                            }
                            className="flex items-center space-x-1 text-green-600 hover:text-green-700"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span className="text-sm">
                              {selectedFAQ.helpful}
                            </span>
                          </button>
                          <button
                            onClick={() =>
                              handleFAQFeedback(selectedFAQ.id, false)
                            }
                            className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                          >
                            <ThumbsDown className="w-4 h-4" />
                            <span className="text-sm">
                              {selectedFAQ.notHelpful}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ) : (
                /* FAQ List */
                <div>
                  {filteredFAQItems.length === 0 ? (
                    <Card className="p-6 text-center text-gray-500 dark:text-gray-400">
                      <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>No FAQ items found matching your search criteria.</p>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {filteredFAQItems.map((faq) => (
                        <Card
                          key={faq.id}
                          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedFAQ(faq)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                {faq.question}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                {faq.answer.substring(0, 150)}...
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${getFAQCategoryColor(
                                      faq.category
                                    )}`}
                                  >
                                    {faq.category}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                  <span>👍 {faq.helpful}</span>
                                  <span>👎 {faq.notHelpful}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {policies.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Policies
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {faqItems.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                FAQ Items
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
