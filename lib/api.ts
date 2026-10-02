// API client for interview backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Auth helper - will be set by AuthContext
let getAuthHeadersFn: (() => { Authorization: string } | {}) | null = null;

export function setAuthHeadersGetter(fn: () => { Authorization: string } | {}) {
  getAuthHeadersFn = fn;
}

function getAuthHeaders() {
  return getAuthHeadersFn ? getAuthHeadersFn() : {};
}

// Type definitions matching backend schemas
export interface CreateSessionRequest {
  role: string;
  level: 'Junior' | 'Mid-Level' | 'Senior';
  interview_type: 'technical' | 'behavioral' | 'system_design';
  max_questions: number;
  llm_provider?: string;
  llm_model?: string;
}

export interface CreateSessionResponse {
  session_id: string;
  first_question: string;
  status: string;
}

export interface Evaluation {
  score: number | null;
  relevance: number | null;
  structure: number | null;
  technical_accuracy: number | null;
  clarity: number | null;
  strengths: string[];
  improvements: string[];
  sample_answer: string;
  evaluation_failed?: boolean;
}

export interface MetricsResponse {
  words?: number;
  wpm?: number;
  filler_count?: number;
  long_pauses?: number;
  [key: string]: any;
}

export interface SubmitAnswerResponse {
  turn_id: string;
  evaluation: Evaluation;
  metrics?: MetricsResponse;
  next_question?: string;
  is_complete: boolean;
}

export interface Turn {
  _id: string;
  session_id: string;
  index: number;
  question: string;
  answer_text?: string | null;
  evaluation?: Evaluation | null;
  metrics?: MetricsResponse | null;
  llm_provider?: string;
  llm_model?: string;
  latency_ms?: number;
  created_at: string;
}

export interface Session {
  _id: string;
  role: string;
  level: string;
  interview_type: string;
  max_questions: number;
  llm_provider?: string;
  llm_model?: string;
  status: string;
  created_at: string;
  completed_at?: string;
  summary?: string;
}

export interface SessionWithTurns extends Session {
  turns: Turn[];
}

export interface Report {
  session_id: string;
  overall_score: number | null;
  strengths: string[];
  weak_areas: string[];
  summary: string;
  recommendations: string[];
  turns_count: number;
  average_latency_ms: number;
}

// API client functions
export async function createSession(
  data: CreateSessionRequest
): Promise<CreateSessionResponse> {
  const response = await fetch(`${API_URL}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to create session' }));
    throw new Error(error.detail || 'Failed to create session');
  }

  return response.json();
}

export async function submitAnswer(
  sessionId: string,
  data: { answer_text?: string; audio_file?: File }
): Promise<SubmitAnswerResponse> {
  const formData = new FormData();

  if (data.answer_text) {
    formData.append('answer_text', data.answer_text);
  }

  if (data.audio_file) {
    formData.append('audio_file', data.audio_file);
  }

  const response = await fetch(`${API_URL}/sessions/${sessionId}/answer`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to submit answer' }));
    throw new Error(error.detail || 'Failed to submit answer');
  }

  return response.json();
}

export async function getSession(sessionId: string): Promise<SessionWithTurns> {
  const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch session' }));
    throw new Error(error.detail || 'Failed to fetch session');
  }

  return response.json();
}

export async function getReport(sessionId: string): Promise<Report> {
  const response = await fetch(`${API_URL}/sessions/${sessionId}/report`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch report' }));
    throw new Error(error.detail || 'Failed to fetch report');
  }

  return response.json();
}

export async function getSessions(): Promise<Session[]> {
  const response = await fetch(`${API_URL}/sessions`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch sessions' }));
    throw new Error(error.detail || 'Failed to fetch sessions');
  }

  const data = await response.json();
  // Backend returns { sessions: [...], total: number }
  return data.sessions || [];
}

export async function checkHealth(): Promise<{ status: string }> {
  const response = await fetch(`${API_URL}/health`);

  if (!response.ok) {
    throw new Error('Backend is not responding');
  }

  return response.json();
}
