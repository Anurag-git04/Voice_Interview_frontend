"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  submitAnswer,
  getSession,
  SessionWithTurns,
  SubmitAnswerResponse,
} from "@/lib/api";
import MicButton from "@/components/MicButton";
import FeedbackCard from "@/components/FeedbackCard";
import ProtectedRoute from "@/components/ProtectedRoute";

type InterviewState =
  | "loading"
  | "question"
  | "processing"
  | "feedback"
  | "complete"
  | "error";

export default function InterviewPage() {
  return (
    <ProtectedRoute>
      <InterviewContent />
    </ProtectedRoute>
  );
}

function InterviewContent() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [state, setState] = useState<InterviewState>("loading");
  const [session, setSession] = useState<SessionWithTurns | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [currentAnswer, setCurrentAnswer] =
    useState<SubmitAnswerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [questionNumber, setQuestionNumber] = useState(1);

  // Load session data
  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const data = await getSession(sessionId);
      setSession(data);

      // Find the current unanswered question
      const unansweredTurn = data.turns?.find(
        (turn) => turn.answer_text === null || turn.answer_text === undefined,
      );

      if (unansweredTurn) {
        // There's a question waiting for an answer
        setCurrentQuestion(unansweredTurn.question);
        setQuestionNumber(unansweredTurn.index + 1);
        setState("question");
      } else if (data.status === "completed") {
        // Interview is complete
        setState("complete");
      } else if (data.turns && data.turns.length > 0) {
        // All questions answered so far, waiting for next question
        const lastTurn = data.turns[data.turns.length - 1];
        setQuestionNumber(lastTurn.index + 2);
        setState("question");
        setCurrentQuestion("Preparing next question...");
      } else {
        // Fallback - no turns found
        setState("question");
        setCurrentQuestion(
          data.interview_type === "behavioral"
            ? "Tell me about a challenging situation you faced and how you handled it."
            : `Tell me about your experience with ${data.role} technologies.`,
        );
        setQuestionNumber(1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session");
      setState("error");
    }
  };

  const handleRecordingComplete = async (audioBlob: Blob) => {
    // Stop any ongoing speech synthesis immediately
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setState("processing");
    setTranscript("");
    setError(null);

    try {
      // Convert blob to file
      const audioFile = new File([audioBlob], "answer.webm", {
        type: audioBlob.type,
      });

      const response = await submitAnswer(sessionId, { audio_file: audioFile });

      setCurrentAnswer(response);
      setState("feedback");

      // Show next question or mark as complete
      if (response.is_complete) {
        setTimeout(() => {
          setState("complete");
        }, 3000);
      } else if (response.next_question) {
        setCurrentQuestion(response.next_question);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit answer");
      setState("error");
    }
  };

  const handleNextQuestion = () => {
    // Stop any ongoing speech
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (currentAnswer?.is_complete) {
      router.push(`/report/${sessionId}`);
    } else {
      setQuestionNumber(questionNumber + 1);
      setState("question");
      setCurrentAnswer(null);
      speakQuestion(currentQuestion);
    }
  };

  const speakQuestion = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Speak the question when state changes to 'question'
  useEffect(() => {
    if (
      state === "question" &&
      currentQuestion &&
      !currentQuestion.includes("Loading") &&
      !currentQuestion.includes("Preparing")
    ) {
      speakQuestion(currentQuestion);
    }
  }, [state, currentQuestion]);

  // Cleanup: Stop speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview session...</p>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
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

  if (state === "complete") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Interview Complete!
          </h2>
          <p className="text-gray-600 mb-6">
            Great job! Let's see how you performed.
          </p>
          <button
            onClick={() => router.push(`/report/${sessionId}`)}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            View Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Interview in Progress
              </h1>
              <p className="text-sm text-gray-600">
                {session?.role} • {session?.level} • Question {questionNumber}/
                {session?.max_questions}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Question Card */}
          {(state === "question" || state === "processing") && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-start space-x-4 mb-6">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Question {questionNumber}
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {currentQuestion}
                  </p>
                </div>
              </div>

              {/* Microphone Control */}
              <div className="flex flex-col items-center py-8">
                {state === "processing" ? (
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
                    <div>
                      <p className="text-gray-700 font-medium">
                        Processing your answer...
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Transcribing audio and evaluating response
                      </p>
                    </div>
                  </div>
                ) : (
                  <MicButton
                    onRecordingComplete={handleRecordingComplete}
                    disabled={state !== "question"}
                  />
                )}
              </div>

              {transcript && (
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Your answer:
                  </p>
                  <p className="text-gray-600">{transcript}</p>
                </div>
              )}
            </div>
          )}

          {/* Feedback Card */}
          {state === "feedback" && currentAnswer && (
            <div className="space-y-6">
              <FeedbackCard
                evaluation={currentAnswer.evaluation}
                metrics={currentAnswer.metrics}
              />

              <div className="flex justify-center">
                <button
                  onClick={handleNextQuestion}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md"
                >
                  {currentAnswer.is_complete
                    ? "View Full Report"
                    : "Next Question"}
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
