import React, { useState } from "react";
import {
  User,
  Building2,
  Shield,
  Clock,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import {
  getUsers,
  setCurrentUser,
  initializeDemoData,
  addUser,
} from "../../utils/storage";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { SignupData } from "../../types";

interface LoginPageProps {
  onLogin: (user: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<"employee" | "manager">(
    "employee"
  );
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupData, setSignupData] = useState<SignupData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    role: "employee",
    managerId: "",
  });
  const [errors, setErrors] = useState<Partial<SignupData>>({});

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  React.useEffect(() => {
    initializeDemoData();
  }, []);

  const handleRoleLogin = (role: "employee" | "manager") => {
    const users = getUsers();
    const user = users.find((u) => u.role === role);
    if (user) {
      setCurrentUser(user);
      onLogin(user);
    }
  };

  const handleSignupChange = (field: keyof SignupData, value: string) => {
    setSignupData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateSignup = (): boolean => {
    const newErrors: Partial<SignupData> = {};

    if (!signupData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!signupData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!signupData.password) {
      newErrors.password = "Password is required";
    } else if (signupData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!signupData.department.trim()) {
      newErrors.department = "Department is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = () => {
    if (!validateSignup()) return;

    const users = getUsers();
    const existingUser = users.find((u) => u.email === signupData.email);

    if (existingUser) {
      setErrors({ email: "User with this email already exists" });
      return;
    }

    // Auto-assign manager based on department for employees
    let managerId = signupData.managerId;
    if (signupData.role === "employee" && !managerId) {
      const managers = users.filter((u) => u.role === "manager");
      const departmentManager = managers.find(
        (m) =>
          m.department.toLowerCase() === signupData.department.toLowerCase()
      );
      if (departmentManager) {
        managerId = departmentManager.id;
      } else if (managers.length > 0) {
        // Fallback to first available manager
        managerId = managers[0].id;
      }
    }

    const newUser = {
      id: Date.now().toString(),
      name: signupData.name,
      email: signupData.email,
      password: signupData.password, // Store password for simulation
      role: signupData.role,
      department: signupData.department,
      managerId: managerId || undefined,
    };

    addUser(newUser);
    setCurrentUser(newUser);
    onLogin(newUser);
  };

  // Simulated login for signup users
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const users = getUsers();
    const user = users.find(
      (u) => u.email === loginEmail && u.password === loginPassword
    );
    if (user) {
      setCurrentUser(user);
      onLogin(user);
    } else {
      setLoginError("Invalid email or password");
    }
  };

  if (isSignup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Create Account
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Join our HRMS platform to manage your leave requests
              </p>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={signupData.name}
                  onChange={(e) => handleSignupChange("name", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={signupData.email}
                  onChange={(e) => handleSignupChange("email", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department
                </label>
                <select
                  value={signupData.department}
                  onChange={(e) =>
                    handleSignupChange("department", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                    errors.department ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
                {errors.department && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.department}
                  </p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="employee"
                      checked={signupData.role === "employee"}
                      onChange={(e) =>
                        handleSignupChange("role", e.target.value)
                      }
                      className="mr-2"
                    />
                    Employee
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="manager"
                      checked={signupData.role === "manager"}
                      onChange={(e) =>
                        handleSignupChange("role", e.target.value)
                      }
                      className="mr-2"
                    />
                    Manager
                  </label>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={signupData.password}
                    onChange={(e) =>
                      handleSignupChange("password", e.target.value)
                    }
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={signupData.confirmPassword}
                    onChange={(e) =>
                      handleSignupChange("confirmPassword", e.target.value)
                    }
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                onClick={handleSignup}
                variant="primary"
                size="lg"
                className="w-full"
              >
                Create Account
              </Button>

              <div className="text-center">
                <button
                  onClick={() => setIsSignup(false)}
                  className="flex items-center justify-center w-full text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // --- LOGIN PAGE ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            HRMS Leave Management Portal
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Streamline your leave management process with our comprehensive
            platform. Choose your role to access your personalized dashboard.
          </p>
        </div>

        {/* Login Form for Signup Users */}
        <Card className="mb-8 p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Login
          </h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Enter your email"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  tabIndex={-1}
                >
                  {showLoginPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            {loginError && (
              <p className="text-red-500 text-sm mt-1">{loginError}</p>
            )}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
            >
              Login
            </Button>
          </form>
        </Card>

        {/* Quick Demo Login */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Employee Card */}
          <Card
            className="cursor-pointer transform hover:scale-105 transition-all duration-300"
            hover
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Demo Employee Portal
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Submit leave requests, track your leave balance, and manage your
                time off efficiently.
              </p>
              <ul className="text-left text-gray-600 dark:text-gray-400 mb-8 space-y-2">
                <li className="flex items-center">
                  <Clock className="w-4 h-4 text-green-500 mr-2" />
                  Submit leave requests instantly
                </li>
                <li className="flex items-center">
                  <Clock className="w-4 h-4 text-green-500 mr-2" />
                  Track leave balance in real-time
                </li>
                <li className="flex items-center">
                  <Clock className="w-4 h-4 text-green-500 mr-2" />
                  View request history and status
                </li>
              </ul>
              <Button
                onClick={() => handleRoleLogin("employee")}
                variant="primary"
                size="lg"
                className="w-full"
              >
                Quick Login as Demo Employee
              </Button>
            </div>
          </Card>

          {/* Manager Card */}
          <Card
            className="cursor-pointer transform hover:scale-105 transition-all duration-300"
            hover
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Demo Manager Portal
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Review and approve leave requests, manage your team's time off,
                and maintain oversight.
              </p>
              <ul className="text-left text-gray-600 dark:text-gray-400 mb-8 space-y-2">
                <li className="flex items-center">
                  <Clock className="w-4 h-4 text-green-500 mr-2" />
                  Approve or reject leave requests
                </li>
                <li className="flex items-center">
                  <Clock className="w-4 h-4 text-green-500 mr-2" />
                  View team leave analytics
                </li>
                <li className="flex items-center">
                  <Clock className="w-4 h-4 text-green-500 mr-2" />
                  Manage team schedules
                </li>
              </ul>
              <Button
                onClick={() => handleRoleLogin("manager")}
                variant="primary"
                size="lg"
                className="w-full bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
              >
                Quick Login as Demo Manager
              </Button>
            </div>
          </Card>
        </div>

        {/* Signup Option */}
        <div className="text-center mb-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Don't have an account? Create one to get started.
          </p>
          <Button onClick={() => setIsSignup(true)} variant="outline" size="lg">
            Create New Account
          </Button>
        </div>

        {/* Demo Information */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Demo Information
            </h3>
            <p className="text-blue-700 dark:text-blue-300">
              This is a demonstration application with pre-populated data. All
              data is stored locally in your browser for testing purposes.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
