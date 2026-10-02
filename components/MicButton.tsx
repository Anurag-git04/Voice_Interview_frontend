"use client";

import { useState, useRef } from "react";

interface MicButtonProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
}

export default function MicButton({
  onRecordingComplete,
  disabled,
}: MicButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      setError(null);
      setRecordingDuration(0);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Check for supported MIME type
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      // Update duration counter
      durationIntervalRef.current = setInterval(() => {
        const duration = (Date.now() - startTimeRef.current) / 1000;
        setRecordingDuration(duration);
      }, 100);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Clear duration interval
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }

        const duration = (Date.now() - startTimeRef.current) / 1000;

        // Validate minimum duration
        if (duration < 0.5) {
          setError("Recording too short. Please speak for at least 1 second.");
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const audioBlob = new Blob(chunksRef.current, { type: mimeType });

        // Validate blob size
        if (audioBlob.size < 2000) {
          setError("Recording too short. Please speak for at least 1 second.");
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        onRecordingComplete(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        setError(
          "Microphone permission denied. Please allow access to continue.",
        );
      } else {
        setError("Failed to access microphone. Please check your settings.");
      }
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMouseDown = () => {
    if (!disabled) {
      startRecording();
    }
  };

  const handleMouseUp = () => {
    stopRecording();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!disabled) {
      startRecording();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    stopRecording();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        type="button"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (isRecording) stopRecording();
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        disabled={disabled}
        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
          disabled
            ? "bg-gray-300 cursor-not-allowed"
            : isRecording
              ? "bg-red-500 hover:bg-red-600 focus:ring-red-500 scale-110 shadow-lg"
              : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 shadow-md"
        }`}
      >
        {isRecording ? (
          <svg
            className="w-10 h-10 text-white animate-pulse"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg
            className="w-10 h-10 text-white"
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
        )}
      </button>

      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">
          {isRecording ? (
            <span className="text-red-600 flex items-center justify-center space-x-2">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <span>
                Recording {recordingDuration.toFixed(1)}s... Release to submit
              </span>
            </span>
          ) : (
            "Press and hold to answer"
          )}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {disabled
            ? "Please wait..."
            : isRecording
              ? "Speak for at least 1 second"
              : "Push-to-talk"}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-w-sm">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}
