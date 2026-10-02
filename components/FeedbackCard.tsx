"use client";

import { Evaluation, MetricsResponse } from "@/lib/api";

interface FeedbackCardProps {
  evaluation: Evaluation;
  metrics?: MetricsResponse;
}

export default function FeedbackCard({
  evaluation,
  metrics,
}: FeedbackCardProps) {
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

  // If evaluation failed, show a simplified card
  if (evaluation.evaluation_failed || evaluation.score === null) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 animate-fadeIn">
        <div className="text-center pb-6 border-b border-gray-200">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full ring-4 ring-yellow-200 bg-yellow-50 mb-3">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-sm font-medium text-gray-900">
            Evaluation Unavailable
          </p>
          <p className="text-xs text-gray-600 mt-1">
            We encountered an issue processing this response.
          </p>
        </div>

        {/* Still show speech metrics if available */}
        {metrics && (
          <div className="bg-indigo-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-indigo-900 mb-3">
              Speech Metrics
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {metrics.words !== undefined && (
                <MetricItem label="Words" value={metrics.words.toString()} />
              )}
              {metrics.wpm !== undefined && (
                <MetricItem label="WPM" value={metrics.wpm.toFixed(0)} />
              )}
              {metrics.filler_count !== undefined && (
                <MetricItem
                  label="Filler Words"
                  value={metrics.filler_count.toString()}
                />
              )}
              {metrics.long_pauses !== undefined && (
                <MetricItem
                  label="Long Pauses"
                  value={metrics.long_pauses.toString()}
                />
              )}
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Your answer was recorded. Please continue to the next question.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 animate-fadeIn">
      {/* Overall Score */}
      <div className="text-center pb-6 border-b border-gray-200">
        <div
          className={`inline-flex items-center justify-center w-20 h-20 rounded-full ring-4 ${scoreRing(
            evaluation.score,
          )} mb-3`}
        >
          <span
            className={`text-3xl font-bold ${scoreColor(evaluation.score)}`}
          >
            {evaluation.score}
          </span>
        </div>
        <p className="text-sm text-gray-600">Overall Score</p>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <ScoreItem label="Relevance" score={evaluation.relevance} />
        <ScoreItem label="Structure" score={evaluation.structure} />
        <ScoreItem
          label="Technical Accuracy"
          score={evaluation.technical_accuracy}
        />
        <ScoreItem label="Clarity" score={evaluation.clarity} />
      </div>

      {/* Speech Metrics */}
      {metrics && (
        <div className="bg-indigo-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-indigo-900 mb-3">
            Speech Metrics
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {metrics.words !== undefined && (
              <MetricItem label="Words" value={metrics.words.toString()} />
            )}
            {metrics.wpm !== undefined && (
              <MetricItem label="WPM" value={metrics.wpm.toFixed(0)} />
            )}
            {metrics.filler_count !== undefined && (
              <MetricItem
                label="Filler Words"
                value={metrics.filler_count.toString()}
              />
            )}
            {metrics.long_pauses !== undefined && (
              <MetricItem
                label="Long Pauses"
                value={metrics.long_pauses.toString()}
              />
            )}
          </div>
        </div>
      )}

      {/* Strengths */}
      {evaluation.strengths.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
            <svg
              className="w-5 h-5 text-green-600 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Strengths
          </h3>
          <ul className="space-y-1">
            {evaluation.strengths.map((strength, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for Improvement */}
      {evaluation.improvements.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
            <svg
              className="w-5 h-5 text-orange-600 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Areas for Improvement
          </h3>
          <ul className="space-y-1">
            {evaluation.improvements.map((improvement, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sample Answer */}
      {evaluation.sample_answer && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Sample Answer
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {evaluation.sample_answer}
          </p>
        </div>
      )}
    </div>
  );
}

function ScoreItem({ label, score }: { label: string; score: number | null }) {
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
        <span className="text-xs font-semibold text-gray-900">{score}/10</span>
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

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-indigo-900">{value}</p>
      <p className="text-xs text-indigo-700">{label}</p>
    </div>
  );
}
