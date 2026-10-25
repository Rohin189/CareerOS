import { useCallback, useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import ReadinessCard from '../components/ReadinessCard';
import TargetsPanel from '../components/TargetsPanel';
import SkillsPanel from '../components/SkillsPanel';
import MilestonesPanel from '../components/MilestonesPanel';
import GitHubPanel from '../components/GitHubPanel';
import EvidencePanel from '../components/EvidencePanel';
import JobsPanel from '../components/JobsPanel';
import JobGapPanel from '../components/JobGapPanel';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [github, setGithub] = useState(null);
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async function () {
    try {
      const results = await Promise.all([
        api.get('/career'),
        api.get('/career/dashboard'),
        api.get('/github'),
        api.get('/jobs')
      ]);
      setProfile(results[0].data);
      setSummary(results[1].data);
      setGithub(results[2].data);
      setJobs(results[3].data);
      setError('');
    } catch (err) {
      setError('Unable to load your dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(function () {
    load();
  }, [load]);

  // Single write path: persist the patch, then refresh profile and summary
  async function save(patch) {
    try {
      const res = await api.put('/career', patch);
      setProfile(res.data);
      const dash = await api.get('/career/dashboard');
      setSummary(dash.data);
      // A username change can make the cached GitHub snapshot stale
      if (patch.githubUsername !== undefined) {
        const gh = await api.get('/github');
        setGithub(gh.data);
      }
      setError('');
    } catch (err) {
      const message = err.response && err.response.data && err.response.data.message;
      setError(message || 'Unable to save changes.');
    }
  }

  // Fetch fresh data from GitHub for the saved username
  async function refreshGitHub() {
    try {
      const res = await api.post('/github/refresh');
      setGithub(res.data);
      // Evidence lives in the summary, so it must be refetched after new GitHub data
      const dash = await api.get('/career/dashboard');
      setSummary(dash.data);
      setError('');
    } catch (err) {
      const message = err.response && err.response.data && err.response.data.message;
      setError(message || 'Unable to refresh GitHub data.');
    }
  }

  // Returns whether the posting was saved, so the panel only clears its form on success
  async function addJob(posting) {
    try {
      const res = await api.post('/jobs', posting);
      setJobs(function (prev) { return [res.data].concat(prev); });
      // The job gap lives in the summary, so it must be refetched after postings change
      const dash = await api.get('/career/dashboard');
      setSummary(dash.data);
      setError('');
      return true;
    } catch (err) {
      const message = err.response && err.response.data && err.response.data.message;
      setError(message || 'Unable to add the job posting.');
      return false;
    }
  }

  async function removeJob(id) {
    try {
      await api.delete('/jobs/' + id);
      setJobs(function (prev) { return prev.filter(function (j) { return j._id !== id; }); });
      const dash = await api.get('/career/dashboard');
      setSummary(dash.data);
      setError('');
    } catch (err) {
      const message = err.response && err.response.data && err.response.data.message;
      setError(message || 'Unable to remove the job posting.');
    }
  }

  if (loading) {
    return <p className="status">Loading dashboard...</p>;
  }

  if (!profile || !summary || !github || !jobs) {
    return (
      <div className="page">
        <p className="error">{error}</p>
        <button className="btn" onClick={load}>Retry</button>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h1>CareerOS</h1>
          <p className="subtitle">Career Dashboard &middot; {user.name || user.email}</p>
        </div>
        <button onClick={logout}>Log out</button>
      </header>

      {error && <p className="error banner">{error}</p>}

      <div className="grid">
        <ReadinessCard summary={summary} />
        <TargetsPanel profile={profile} onSave={save} />
        <SkillsPanel skills={profile.skills} summary={summary.skills} onSave={save} />
        <MilestonesPanel milestones={profile.milestones} summary={summary.milestones} onSave={save} />
        <GitHubPanel github={github} onSave={save} onRefresh={refreshGitHub} />
        <EvidencePanel evidence={summary.githubEvidence} />
        <JobsPanel jobs={jobs} onAdd={addJob} onRemove={removeJob} />
        <JobGapPanel gap={summary.jobGap} />
      </div>
    </div>
  );
}
