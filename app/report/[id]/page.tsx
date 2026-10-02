"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getReport,
  getSession,
  Report,
  SessionWithTurns,
  MetricsResponse,
} from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ReportPage() {
  return (
    <ProtectedRoute>
      <ReportContent />
    </ProtectedRoute>
  );
}

function ReportContent() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [session, setSession] = useState<SessionWithTurns | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadReportData();
    }
  }, [sessionId]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      // Fetch both report and session data in parallel
      const [reportData, sessionData] = await Promise.all([
        getReport(sessionId),
        getSession(sessionId),
      ]);
      setReport(reportData);
      setSession(sessionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your report...</p>
        </div>
      </div>
    );
  }

  if (error || !report || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error || "Report not found"}</p>
            <button
              onClick={() => router.push("/")}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate average metrics from turns
  const averageMetrics: MetricsResponse = {};
  const answeredTurns = session.turns.filter((t) => t.answer_text);

  if (answeredTurns.length > 0) {
    const totalWords = answeredTurns.reduce(
      (sum, t) => sum + (t.metrics?.words || 0),
      0,
    );
    const totalWpm = answeredTurns.reduce(
      (sum, t) => sum + (t.metrics?.wpm || 0),
      0,
    );
    const totalFillers = answeredTurns.reduce(
      (sum, t) => sum + (t.metrics?.filler_count || 0),
      0,
    );
    const totalPauses = answeredTurns.reduce(
      (sum, t) => sum + (t.metrics?.long_pauses || 0),
      0,
    );

    averageMetrics.words = Math.round(totalWords / answeredTurns.length);
    averageMetrics.wpm = Math.round(totalWpm / answeredTurns.length);
    averageMetrics.filler_count = Math.round(
      totalFillers / answeredTurns.length,
    );
    averageMetrics.long_pauses = Math.round(totalPauses / answeredTurns.length);
  }

  const scoreColor = (score: number | null) => {
    if (score === null) return "text-gray-400";
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const scoreRing = (score: number | null) => {
    if (score === null) return "ring-gray-200 bg-gray-50";
    if (score >= 8) return "ring-green-200 bg-green-50";
    if (score >= 6) return "ring-yellow-200 bg-yellow-50";
    return "ring-red-200 bg-red-50";
  };

  const scoreBg = (score: number | null) => {
    if (score === null) return "bg-gray-400";
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Interview Report
              </h1>
              <p className="text-sm text-gray-600">
                {session.role} • {session.level} • {session.interview_type}
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              New Interview
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Overall Score Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              {report.overall_score !== null ? (
                <>
                  <div
                    className={`inline-flex items-center justify-center w-32 h-32 rounded-full ring-8 ${scoreRing(
                      report.overall_score,
                    )} mb-4`}
                  >
                    <div>
                      <span
                        className={`text-5xl font-bold ${scoreColor(report.overall_score)}`}
                      >
                        {report.overall_score.toFixed(1)}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">out of 10</p>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Overall Performance
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    {report.summary}
                  </p>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full ring-8 ring-gray-200 bg-gray-50 mb-4">
                    <div>
                      <span className="text-3xl text-gray-400">N/A</span>
                      <p className="text-xs text-gray-500 mt-1">
                        Score unavailable
                      </p>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Report Generated
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    {report.summary ||
                      "Some evaluations could not be completed. Review individual question feedback below."}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Speech Metrics Summary */}
          {averageMetrics && Object.keys(averageMetrics).length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Speech Metrics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {averageMetrics.words !== undefined && (
                  <MetricCard
                    label="Avg Words"
                    value={averageMetrics.words.toString()}
                    icon="📝"
                  />
                )}
                {averageMetrics.wpm !== undefined && (
                  <MetricCard
                    label="Avg WPM"
                    value={averageMetrics.wpm.toString()}
                    icon="⚡"
                  />
                )}
                {averageMetrics.filler_count !== undefined && (
                  <MetricCard
                    label="Avg Fillers"
                    value={averageMetrics.filler_count.toString()}
                    icon="💬"
                  />
                )}
                {averageMetrics.long_pauses !== undefined && (
                  <MetricCard
                    label="Avg Pauses"
                    value={averageMetrics.long_pauses.toString()}
                    icon="⏸️"
                  />
                )}
              </div>
            </div>
          )}

          {/* Strengths and Improvements */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Strengths */}
            {report.strengths.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Key Strengths
                  </h2>
                </div>
                <ul className="space-y-3">
                  {report.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-600 mr-2 mt-1">✓</span>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas for Improvement */}
            {report.weak_areas.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-6 h-6 text-orange-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Areas to Improve
                  </h2>
                </div>
                <ul className="space-y-3">
                  {report.weak_areas.map((improvement, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-orange-600 mr-2 mt-1">→</span>
                      <span className="text-gray-700">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Per-Question Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Question-by-Question Breakdown
            </h2>
            <div className="space-y-6">
              {answeredTurns.map((turn, idx) => (
                <div
                  key={turn._id}
                  className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-semibold text-sm mr-3">
                          {idx + 1}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Question {idx + 1}
                        </h3>
                        {turn.evaluation?.evaluation_failed && (
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Evaluation Failed
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-3 ml-11">
                        {turn.question}
                      </p>
                    </div>
                    {turn.evaluation && turn.evaluation.score !== null && (
                      <div className="flex-shrink-0 ml-4">
                        <div
                          className={`inline-flex items-center justify-center w-16 h-16 rounded-full ring-4 ${scoreRing(
                            turn.evaluation.score,
                          )}`}
                        >
                          <span
                            className={`text-2xl font-bold ${scoreColor(turn.evaluation.score)}`}
                          >
                            {turn.evaluation.score}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Score Breakdown */}
                  {turn.evaluation && turn.evaluation.score !== null && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 ml-11">
                      <ScoreBar
                        label="Relevance"
                        score={turn.evaluation.relevance}
                      />
                      <ScoreBar
                        label="Structure"
                        score={turn.evaluation.structure}
                      />
                      <ScoreBar
                        label="Technical"
                        score={turn.evaluation.technical_accuracy}
                      />
                      <ScoreBar
                        label="Clarity"
                        score={turn.evaluation.clarity}
                      />
                    </div>
                  )}

                  {/* Turn Metrics */}
                  {turn.metrics && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-3 ml-11">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        {turn.metrics.words !== undefined && (
                          <div>
                            <p className="text-lg font-bold text-gray-900">
                              {turn.metrics.words}
                            </p>
                            <p className="text-xs text-gray-600">Words</p>
                          </div>
                        )}
                        {turn.metrics.wpm !== undefined && (
                          <div>
                            <p className="text-lg font-bold text-gray-900">
                              {Math.round(turn.metrics.wpm)}
                            </p>
                            <p className="text-xs text-gray-600">WPM</p>
                          </div>
                        )}
                        {turn.metrics.filler_count !== undefined && (
                          <div>
                            <p className="text-lg font-bold text-gray-900">
                              {turn.metrics.filler_count}
                            </p>
                            <p className="text-xs text-gray-600">Fillers</p>
                          </div>
                        )}
                        {turn.metrics.long_pauses !== undefined && (
                          <div>
                            <p className="text-lg font-bold text-gray-900">
                              {turn.metrics.long_pauses}
                            </p>
                            <p className="text-xs text-gray-600">Pauses</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Feedback Summary */}
                  {turn.evaluation && (
                    <div className="ml-11 space-y-2">
                      {turn.evaluation.strengths.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-green-700 mb-1">
                            Strengths:
                          </p>
                          <p className="text-sm text-gray-700">
                            {turn.evaluation.strengths.join(", ")}
                          </p>
                        </div>
                      )}
                      {turn.evaluation.improvements.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-orange-700 mb-1">
                            Improvements:
                          </p>
                          <p className="text-sm text-gray-700">
                            {turn.evaluation.improvements.join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/")}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md"
            >
              Practice Again
            </button>
            <button
              onClick={() => router.push("/history")}
              className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-3 rounded-lg hover:bg-indigo-50 transition-colors font-medium shadow-md"
            >
              View History
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number | null }) {
  if (score === null) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-700">{label}</span>
          <span className="text-xs font-semibold text-gray-400">N/A</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-gray-300 h-2 rounded-full w-0" />
        </div>
      </div>
    );
  }

  const percentage = (score / 10) * 100;
  const color =
    score >= 8 ? "bg-green-500" : score >= 6 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-700">{label}</span>
        <span className="text-xs font-semibold text-gray-900">{score}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
