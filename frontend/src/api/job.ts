const API = "https://job-queue-dashboard-kcjz.onrender.com";

export interface Job {
  id: number;
  title: string;
  type: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export async function createJob(title: string, type: string): Promise<Job> {
  const res = await fetch(`${API}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, type }),
  });
  if (!res.ok) throw new Error('Failed to create job');
  return res.json();
}

export async function getJobs(): Promise<Job[]> {
  const res = await fetch(`${API}/jobs`);
  if (!res.ok) throw new Error('Failed to load jobs');
  return res.json();
}

export async function updateJobStatus(
  id: number,
  status: string,
): Promise<Job> {
  const res = await fetch(`${API}/jobs/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (res.status === 400) {
    const errorBody: unknown = await res.json().catch(() => null);
    const message =
      typeof errorBody === 'string'
        ? errorBody
        : errorBody && typeof errorBody === 'object'
          ? 'message' in errorBody && typeof errorBody.message === 'string'
            ? errorBody.message
            : 'error' in errorBody && typeof errorBody.error === 'string'
              ? errorBody.error
              : null
          : null;

    throw new Error(message || 'Invalid job status update');
  }

  if (!res.ok) {
    throw new Error('Unable to update job status');
  }
  return res.json();
}

export async function deleteJob(id: number): Promise<void> {
  const res = await fetch(`${API}/jobs/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete job');
}