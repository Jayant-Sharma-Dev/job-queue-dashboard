import { useEffect, useState } from 'react';
import { getJobs, createJob, updateJobStatus, deleteJob } from '../api/job';
import type { Job } from '../api/job';
import '../styles/Dashboard.css';

// Bonus featur : show how long each job took to complete.
function getDuration(startedAt: string | null, completedAt: string | null): string {
  if (!startedAt || !completedAt) {
    return '-';
  }

  const durationSeconds = Math.max(
    0,
    Math.floor((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000),
  );
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = durationSeconds % 60;

  return hours > 0
    ? `${hours}h ${minutes}m ${seconds}s`
    : `${minutes}m ${seconds}s`;
}

export function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      setLoading(true);
      setError(null);
      const data = await getJobs();
      setJobs(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !type.trim()) {
      setError('Title and type are required');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      await createJob(title, type);
      setTitle('');
      setType('');
      await loadJobs(); // Refresh list
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
    } finally {
      setCreating(false);
    }
  }

  async function handleStatusChange(jobId: number, newStatus: string) {
    const job = jobs.find((currentJob) => currentJob.id === jobId);

    try {
      setError(null);
      await updateJobStatus(jobId, newStatus);
      await loadJobs();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '';
      const isNoLongerPending =
        job?.status === 'PENDING' &&
        newStatus === 'RUNNING' &&
        (errorMessage.includes('Cannot transition') ||
          errorMessage === 'Job status has already changed' ||
          errorMessage === 'Invalid job status update');
      const isAlreadyUpdated =
        !isNoLongerPending &&
        (/Cannot transition from (COMPLETED|FAILED) to/i.test(errorMessage) ||
          errorMessage === 'Job status has already changed' ||
          ((job?.status === 'COMPLETED' || job?.status === 'FAILED') &&
            errorMessage === 'Invalid job status update'));

      setError(
        isNoLongerPending
          ? 'Job is no longer pending'
          : isAlreadyUpdated
            ? 'Job is already updated'
          : errorMessage
            ? errorMessage
            : job
              ? `Cannot transition from ${job.status} to ${newStatus}`
              : 'Unable to update job status',
      );
    }
  }

  async function handleDelete(jobId: number) {
    try {
      setError(null);
      await deleteJob(jobId);
      await loadJobs(); 
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete job');
    }
  }

  const filteredJobs = filter === 'ALL' 
    ? jobs 
    : jobs.filter(job => job.status === filter);


  const counts = {
    PENDING: jobs.filter(j => j.status === 'PENDING').length,
    RUNNING: jobs.filter(j => j.status === 'RUNNING').length,
    COMPLETED: jobs.filter(j => j.status === 'COMPLETED').length,
    FAILED: jobs.filter(j => j.status === 'FAILED').length,
  };


  const getNextStatuses = (currentStatus: string) => {
    const transitions: Record<string, string[]> = {
      PENDING: ['RUNNING', 'FAILED'],
      RUNNING: ['COMPLETED', 'FAILED'],
      COMPLETED: [],
      FAILED: [],
    };
    return transitions[currentStatus] || [];
  };

  return (
    <div className="dashboard">
      <h1>Job Queue Dashboard</h1>

      {error && <div className="error-message">{error}</div>}

      {/* Create Job Form */}
      <div className="create-form">
        <h2>Create New Job</h2>
        <form onSubmit={handleCreateJob}>
          <input
            type="text"
            placeholder="Job title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={creating}
          />
          <input
            type="text"
            placeholder="Job type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={creating}
          />
          <button type="submit" disabled={creating || loading}>
            {creating ? 'Creating...' : 'Create Job'}
          </button>
        </form>
      </div>

      {/* Status Counts */}
      <div className="status-counts">
        <div className="count-card pending">
          <span className="count-label">Pending</span>
          <span className="count-number">{counts.PENDING}</span>
        </div>
        <div className="count-card running">
          <span className="count-label">Running</span>
          <span className="count-number">{counts.RUNNING}</span>
        </div>
        <div className="count-card completed">
          <span className="count-label">Completed</span>
          <span className="count-number">{counts.COMPLETED}</span>
        </div>
        <div className="count-card failed">
          <span className="count-label">Failed</span>
          <span className="count-number">{counts.FAILED}</span>
        </div>
      </div>

      {/* Filter */}
      <div className="filter">
        <label>Filter by status:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="RUNNING">Running</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* Jobs List */}
      <div className="jobs-list">
        <h2>Jobs ({filteredJobs.length})</h2>
        {loading && <p>Loading jobs...</p>}
        {!loading && filteredJobs.length === 0 && <p>No jobs found</p>}
        {!loading && filteredJobs.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.id}</td>
                  <td>{job.title}</td>
                  <td>{job.type}</td>
                  <td>
                    <span className={`status-badge ${job.status.toLowerCase()}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="duration">{getDuration(job.startedAt, job.completedAt)}</td>
                  <td>{new Date(job.createdAt).toLocaleString()}</td>
                  <td className="actions">
                    {getNextStatuses(job.status).map((nextStatus) => (
                      <button
                        key={nextStatus}
                        onClick={() => handleStatusChange(job.id, nextStatus)}
                        className={`status-btn ${nextStatus.toLowerCase()}`}
                      >
                        → {nextStatus}
                      </button>
                    ))}
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}