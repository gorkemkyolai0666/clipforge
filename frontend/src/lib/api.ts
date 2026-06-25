export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); this.name = 'ApiError'; }
}

function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) throw new Error('NEXT_PUBLIC_API_URL yapılandırılmamış');
  return url;
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('clipforge_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${getApiUrl()}${endpoint}`, { ...options, headers });
  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('clipforge_token');
    localStorage.removeItem('clipforge_user');
    window.location.href = '/login';
    throw new ApiError(401, 'Oturum süresi doldu');
  }
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Bir hata oluştu' }));
    throw new ApiError(response.status, err.message || `HTTP ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

function crud(base: string) {
  return {
    list: () => fetchAPI(base),
    get: (id: string) => fetchAPI(`${base}/${id}`),
    create: (data: Record<string, unknown>) => fetchAPI(base, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) => fetchAPI(`${base}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`${base}/${id}`, { method: 'DELETE' }),
  };
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (data: Record<string, unknown>) =>
      fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    me: () => fetchAPI('/auth/me'),
  },
  dashboard: {
    stats: () => fetchAPI('/dashboard/stats'),
  },
  boards: {
    ...crud('/boards'),
    columns: (boardId: string) => fetchAPI(`/boards/${boardId}/columns`),
    moveIssue: (boardId: string, issueId: string, columnId: string, position: number) =>
      fetchAPI(`/boards/${boardId}/issues/${issueId}/move`, {
        method: 'PATCH',
        body: JSON.stringify({ columnId, position }),
      }),
  },
  sprints: {
    ...crud('/sprints'),
    velocity: () => fetchAPI('/sprints/velocity'),
    burndown: (id: string) => fetchAPI(`/sprints/${id}/burndown`),
  },
  issues: crud('/issues'),
  dependencies: {
    list: () => fetchAPI('/dependencies'),
    graph: () => fetchAPI('/dependencies/radar'),
    radar: () => fetchAPI('/dependencies/radar'),
    blastRadius: (issueId: string) => fetchAPI(`/dependencies/thread-radius/${issueId}`),
  },
  team: crud('/team'),
  ceremonies: crud('/ceremonies'),
  audit: {
    list: (params?: { page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      const qs = q.toString();
      return fetchAPI(`/audit${qs ? `?${qs}` : ''}`);
    },
  },
  triage: {
    inbox: () => fetchAPI('/triage/inbox'),
    rules: () => fetchAPI('/triage/rules'),
    createRule: (data: Record<string, unknown>) =>
      fetchAPI('/triage/rules', { method: 'POST', body: JSON.stringify(data) }),
  },
  cycleAnalytics: {
    heatmap: () => fetchAPI('/cycle-analytics/heatmap'),
    forecast: () => fetchAPI('/cycle-analytics/forecast'),
  },
  settings: {
    get: () => fetchAPI('/settings'),
    update: (data: Record<string, unknown>) => fetchAPI('/settings', { method: 'PATCH', body: JSON.stringify(data) }),
  },
};
