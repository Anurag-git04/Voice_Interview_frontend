"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSession, checkHealth } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}

function HomeContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    role: "Full Stack Developer",
    level: "Junior" as "Junior" | "Mid-Level" | "Senior",
    interview_type: "technical" as "technical" | "behavioral" | "system_design",
    max_questions: 5,
  });

  // Check backend health on mount
  useEffect(() => {
    checkHealth()
      .then(() => setBackendStatus("online"))
      .catch(() => setBackendStatus("offline"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await createSession(formData);
      router.push(`/interview/${response.session_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                AI Voice Interview Coach
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Practice interviews with real-time feedback
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.full_name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={() => router.push("/history")}
                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                History
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full">
          {/* Backend Status */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  backendStatus === "checking"
                    ? "bg-yellow-400 animate-pulse"
                    : backendStatus === "online"
                      ? "bg-green-500"
                      : "bg-red-500"
                }`}
              />
              <span className="text-sm text-gray-600">
                {backendStatus === "checking" && "Checking backend..."}
                {backendStatus === "online" && "Backend ready"}
                {backendStatus === "offline" && "Backend offline"}
              </span>
            </div>
          </div>

          {/* Setup Form Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
                <svg
                  className="w-8 h-8 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Start Your Interview
              </h2>
              <p className="text-gray-600 mt-2">
                Configure your practice session
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Input */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Role
                </label>
                <input
                  type="text"
                  id="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900 bg-white"
                  placeholder="e.g., Full Stack Developer"
                  required
                />
              </div>

              {/* Level Select */}
              <div>
                <label
                  htmlFor="level"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Experience Level
                </label>
                <select
                  id="level"
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      level: e.target.value as
                        | "Junior"
                        | "Mid-Level"
                        | "Senior",
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900 bg-white"
                >
                  <option value="Junior">Junior</option>
                  <option value="Mid-Level">Mid-Level</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>

              {/* Interview Type Select */}
              <div>
                <label
                  htmlFor="interview_type"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Interview Type
                </label>
                <select
                  id="interview_type"
                  value={formData.interview_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interview_type: e.target.value as
                        | "technical"
                        | "behavioral"
                        | "system_design",
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900 bg-white"
                >
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="system_design">System Design</option>
                </select>
              </div>

              {/* Number of Questions */}
              <div>
                <label
                  htmlFor="max_questions"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Number of Questions
                </label>
                <input
                  type="number"
                  id="max_questions"
                  value={formData.max_questions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_questions: parseInt(e.target.value) || 5,
                    })
                  }
                  min={1}
                  max={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900 bg-white"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 3-5 questions
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || backendStatus === "offline"}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating Session...
                  </span>
                ) : (
                  "Start Interview"
                )}
              </button>
            </form>
          </div>

          {/* Features Info */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-indigo-600 font-semibold text-lg">🎯</div>
              <p className="text-sm text-gray-600 mt-1">Real-time feedback</p>
            </div>
            <div className="text-center">
              <div className="text-indigo-600 font-semibold text-lg">🎤</div>
              <p className="text-sm text-gray-600 mt-1">Speech analysis</p>
            </div>
            <div className="text-center">
              <div className="text-indigo-600 font-semibold text-lg">📊</div>
              <p className="text-sm text-gray-600 mt-1">Progress tracking</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Powered by AI • Practice makes perfect
          </p>
        </div>
      </footer>
    </div>
  );
}
