import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import GraphView from '../views/GraphView';
import TimelineView from '../views/TimelineView';
import GalleryView from '../views/GalleryView';

const tabs = ['graph', 'timeline', 'gallery'];

const initialAchievementForm = {
  title: '',
  type: 'project',
  description: '',
  date: '',
  skillsGained: '',
  proofLink: '',
  tags: ''
};

const initialConnectionForm = {
  fromAchievementId: '',
  toAchievementId: '',
  relationType: 'enabled',
  storyText: ''
};

const DashboardPage = ({ publicUsername = null, forceReadOnly = false }) => {
  const { user, logout, loading: authLoading } = useAuth();
  const isPublicProfile = Boolean(publicUsername);
  const canEdit = Boolean(user) && !forceReadOnly && !isPublicProfile;

  const [activeTab, setActiveTab] = useState('graph');
  const [achievements, setAchievements] = useState([]);
  const [connections, setConnections] = useState([]);
  const [narrative, setNarrative] = useState('');
  const [narrativeDraft, setNarrativeDraft] = useState('');
  const [editingNarrative, setEditingNarrative] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [achievementForm, setAchievementForm] = useState(initialAchievementForm);
  const [connectionForm, setConnectionForm] = useState(initialConnectionForm);
  const [detailForm, setDetailForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [publicProfileName, setPublicProfileName] = useState('');
  const [profileLookup, setProfileLookup] = useState('');

  const selectedAchievement = useMemo(
    () => achievements.find((item) => item._id === selectedId) || null,
    [achievements, selectedId]
  );

  const refreshData = async () => {
    if (!canEdit && !isPublicProfile) {
      setAchievements([]);
      setConnections([]);
      setNarrative('');
      setNarrativeDraft('');
      setEditingNarrative(false);
      setSelectedId(null);
      return;
    }

    const base = isPublicProfile
      ? `/public/profile/${encodeURIComponent(publicUsername)}`
      : '';
    const [achievementRes, connectionRes, narrativeRes] = await Promise.all([
      api.get(`${base}/achievements`),
      api.get(`${base}/connections`),
      api.post(`${base}/narrative/generate`)
    ]);

    setAchievements(achievementRes.data);
    setConnections(connectionRes.data);
    setNarrative(narrativeRes.data.story || '');
    setEditingNarrative(false);

    if (isPublicProfile) {
      try {
        const { data } = await api.get(`/public/profile/${encodeURIComponent(publicUsername)}`);
        setPublicProfileName(data.user?.name || '');
      } catch (_err) {
        setPublicProfileName('');
      }
    }

    const ids = new Set(achievementRes.data.map((item) => item._id));
    if (achievementRes.data.length === 0) {
      setSelectedId(null);
      return;
    }

    if (!selectedId || !ids.has(selectedId)) {
      setSelectedId(achievementRes.data[0]._id);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    const run = async () => {
      try {
        setLoading(true);
        setError('');
        await refreshData();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [user, authLoading, publicUsername, canEdit, isPublicProfile]);

  useEffect(() => {
    if (!selectedAchievement) {
      setDetailForm(null);
      return;
    }

    setDetailForm({
      title: selectedAchievement.title,
      type: selectedAchievement.type,
      description: selectedAchievement.description,
      date: selectedAchievement.date?.slice(0, 10),
      skillsGained: (selectedAchievement.skillsGained || []).join(', '),
      proofLink: selectedAchievement.proofLink || '',
      tags: (selectedAchievement.tags || []).join(', ')
    });
  }, [selectedAchievement]);

  useEffect(() => {
    if (!editingNarrative) {
      setNarrativeDraft(narrative || '');
    }
  }, [narrative, editingNarrative]);

  const parseList = (text) =>
    text
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const submitAchievement = async (e) => {
    e.preventDefault();
    if (!canEdit) {
      setError('Please login to add achievements.');
      return;
    }

    setError('');

    try {
      setSaving(true);
      await api.post('/achievements', {
        ...achievementForm,
        skillsGained: parseList(achievementForm.skillsGained),
        tags: parseList(achievementForm.tags)
      });
      setAchievementForm(initialAchievementForm);
      await refreshData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add achievement');
    } finally {
      setSaving(false);
    }
  };

  const submitConnection = async (e) => {
    e.preventDefault();
    if (!canEdit) {
      setError('Please login to create connections.');
      return;
    }

    setError('');

    if (!connectionForm.fromAchievementId || !connectionForm.toAchievementId) {
      setError('Select both from and to achievements');
      return;
    }

    try {
      setSaving(true);
      await api.post('/connections', connectionForm);
      setConnectionForm(initialConnectionForm);
      await refreshData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create connection');
    } finally {
      setSaving(false);
    }
  };

  const saveDetails = async () => {
    if (!canEdit) {
      setError('Please login to edit achievements.');
      return;
    }

    if (!selectedAchievement || !detailForm) return;

    try {
      setSaving(true);
      await api.put(`/achievements/${selectedAchievement._id}`, {
        ...detailForm,
        skillsGained: parseList(detailForm.skillsGained),
        tags: parseList(detailForm.tags)
      });
      await refreshData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update achievement');
    } finally {
      setSaving(false);
    }
  };

  const removeAchievement = async (achievementId) => {
    if (!canEdit) {
      setError('Please login to delete achievements.');
      return;
    }

    try {
      setSaving(true);
      await api.delete(`/achievements/${achievementId}`);
      if (selectedId === achievementId) {
        setSelectedId(null);
      }
      await refreshData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete achievement');
    } finally {
      setSaving(false);
    }
  };

  const removeConnection = async (connectionId) => {
    if (!canEdit) {
      setError('Please login to delete connections.');
      return;
    }

    try {
      setSaving(true);
      await api.delete(`/connections/${connectionId}`);
      await refreshData(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete connection');
    } finally {
      setSaving(false);
    }
  };

  const removeConnectionFromGraph = async (connectionId) => {
    if (!canEdit) {
      setError('Please login to delete connections.');
      return false;
    }

    try {
      setSaving(true);
      await api.delete(`/connections/${connectionId}`);
      await refreshData();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete connection');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const createConnectionFromGraph = async (payload) => {
    if (!canEdit) {
      setError('Please login to create connections.');
      return false;
    }

    try {
      setSaving(true);
      const { data } = await api.post('/connections', payload);
      await refreshData();
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create connection');
      return false;
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return <div className="text-muted p-8 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <header className="panel mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div>
          <h1 className="text-main text-xl font-bold">Connected Achievements Dashboard</h1>
          <p className="text-muted text-sm">
            {canEdit
              ? `Welcome user : ${user.name}`
              : isPublicProfile
                ? `Viewing profile : ${publicProfileName || publicUsername}`
                : 'Public portfolio view'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/" className="btn-secondary px-3 py-2 text-sm font-medium">
            Landing
          </Link>
          {canEdit ? (
            <button className="btn-secondary px-3 py-2 text-sm font-medium" onClick={logout}>
              Logout
            </button>
          ) : (
            <Link to="/auth" className="btn-primary px-3 py-2 text-sm font-medium">
              Login / Signup
            </Link>
          )}
          {canEdit && user?.username && (
            <Link to={`/u/${user.username}`} className="btn-secondary px-3 py-2 text-sm font-medium">
              View Public Profile
            </Link>
          )}
        </div>
      </header>

      {!canEdit && !isPublicProfile && (
        <div className="badge-theme mb-3 rounded-xl border border-theme px-3 py-2 text-sm">
          Open a public profile link like <span className="font-semibold">/u/username</span> to view a user portfolio.
        </div>
      )}

      {error && <div className="alert-danger mb-3 rounded-xl px-3 py-2 text-sm">{error}</div>}

      {canEdit ? (
        <div className="grid gap-4 xl:grid-cols-[320px,1fr,340px]">
          <aside className="panel space-y-4 rounded-2xl p-4">
            <div>
              <h2 className="text-primary text-sm font-semibold uppercase tracking-wide">Add Achievement</h2>
              <form onSubmit={submitAchievement} className="mt-2 space-y-2">
                <input
                  className="input-theme w-full rounded-lg px-3 py-2 text-sm"
                  placeholder="Title"
                  value={achievementForm.title}
                  onChange={(e) => setAchievementForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                  disabled={!canEdit || saving}
                />
                <select
                  className="input-theme w-full rounded-lg px-3 py-2 text-sm"
                  value={achievementForm.type}
                  onChange={(e) => setAchievementForm((prev) => ({ ...prev, type: e.target.value }))}
                  disabled={!canEdit || saving}
                >
                  <option value="course">Course</option>
                  <option value="project">Project</option>
                  <option value="certificate">Certificate</option>
                  <option value="experience">Experience</option>
                  <option value="award">Award</option>
                </select>
                <input
                  className="input-theme w-full rounded-lg px-3 py-2 text-sm"
                  type="date"
                  value={achievementForm.date}
                  onChange={(e) => setAchievementForm((prev) => ({ ...prev, date: e.target.value }))}
                  required
                  disabled={!canEdit || saving}
                />
                <textarea
                  className="input-theme w-full rounded-lg px-3 py-2 text-sm"
                  rows="2"
                  placeholder="Description"
                  value={achievementForm.description}
                  onChange={(e) => setAchievementForm((prev) => ({ ...prev, description: e.target.value }))}
                  required
                  disabled={!canEdit || saving}
                />
                <input
                  className="input-theme w-full rounded-lg px-3 py-2 text-sm"
                  placeholder="Skills (comma separated)"
                  value={achievementForm.skillsGained}
                  onChange={(e) => setAchievementForm((prev) => ({ ...prev, skillsGained: e.target.value }))}
                  disabled={!canEdit || saving}
                />
                <input
                  className="input-theme w-full rounded-lg px-3 py-2 text-sm"
                  placeholder="Proof link"
                  value={achievementForm.proofLink}
                  onChange={(e) => setAchievementForm((prev) => ({ ...prev, proofLink: e.target.value }))}
                  disabled={!canEdit || saving}
                />
                <input
                  className="input-theme w-full rounded-lg px-3 py-2 text-sm"
                  placeholder="Tags (comma separated)"
                  value={achievementForm.tags}
                  onChange={(e) => setAchievementForm((prev) => ({ ...prev, tags: e.target.value }))}
                  disabled={!canEdit || saving}
                />
                <button
                  disabled={!canEdit || saving}
                  className="btn-primary w-full px-3 py-2 text-sm"
                >
                  Add Achievement
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-accent text-sm font-semibold uppercase tracking-wide">Connect Achievements</h2>
              <form onSubmit={submitConnection} className="mt-2 space-y-2">
                <select
                  className="input-theme w-full rounded-lg px-3 py-2 text-sm"
                  value={connectionForm.fromAchievementId}
                  onChange={(e) => setConnectionForm((prev) => ({ ...prev, fromAchievementId: e.target.value }))}
                  disabled={!canEdit || saving}
                >
                  <option value="">From achievement</option>
                  {achievements.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.title}
                    </option>
                  ))}
                </select>
                <select
                  className="input-theme w-full rounded-lg px-3 py-2 text-sm"
                  value={connectionForm.toAchievementId}
                  onChange={(e) => setConnectionForm((prev) => ({ ...prev, toAchievementId: e.target.value }))}
                  disabled={!canEdit || saving}
                >
                  <option value="">To achievement</option>
                  {achievements.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.title}
                    </option>
                  ))}
                </select>
                <select
                  className="input-theme w-full rounded-lg px-3 py-2 text-sm"
                  value={connectionForm.relationType}
                  onChange={(e) => setConnectionForm((prev) => ({ ...prev, relationType: e.target.value }))}
                  disabled={!canEdit || saving}
                >
                  <option value="enabled">Enabled</option>
                  <option value="led_to">Led to</option>
                  <option value="applied_in">Applied in</option>
                  <option value="resulted_in">Resulted in</option>
                </select>
                <textarea
                  className="input-theme w-full rounded-lg px-3 py-2 text-sm"
                  rows="2"
                  placeholder="Optional story text"
                  value={connectionForm.storyText}
                  onChange={(e) => setConnectionForm((prev) => ({ ...prev, storyText: e.target.value }))}
                  disabled={!canEdit || saving}
                />
                <button
                  disabled={!canEdit || saving}
                  className="btn-accent w-full px-3 py-2 text-sm"
                >
                  Add Connection
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-main mb-2 text-sm font-semibold uppercase tracking-wide">Achievements</h2>
              <div className="max-h-64 space-y-2 overflow-auto pr-1">
                {achievements.length === 0 && <p className="text-muted text-sm">No achievements yet.</p>}
                {achievements.map((item) => (
                  <div
                    key={item._id}
                    className={`rounded-lg border px-3 py-2 ${
                      selectedId === item._id ? 'badge-theme border-theme' : 'bg-surface border-theme'
                    }`}
                  >
                    <button className="w-full text-left" onClick={() => setSelectedId(item._id)}>
                      <p className="text-main text-sm font-medium">{item.title}</p>
                      <p className="text-muted text-xs">{new Date(item.date).toLocaleDateString()}</p>
                    </button>
                    {canEdit && (
                      <button className="text-danger mt-1 text-xs font-semibold" onClick={() => removeAchievement(item._id)}>
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="panel rounded-2xl p-4">
            <div className="mb-4 flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize ${
                    activeTab === tab ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {tab} view
                </button>
              ))}
            </div>

            {activeTab === 'graph' && (
              <GraphView
                achievements={achievements}
                connections={connections}
                onSelectAchievement={setSelectedId}
                onCreateConnection={createConnectionFromGraph}
                onDeleteConnection={removeConnectionFromGraph}
                canEdit={canEdit}
              />
            )}
            {activeTab === 'timeline' && (
              <TimelineView achievements={achievements} connections={connections} narrative={narrative} />
            )}
            {activeTab === 'gallery' && (
              <GalleryView achievements={achievements} onSelectAchievement={setSelectedId} />
            )}
          </section>

          <aside className="panel space-y-4 rounded-2xl p-4">
            <div>
              <h2 className="text-main text-sm font-semibold uppercase tracking-wide">Achievement Details</h2>
              {!detailForm && <p className="text-muted mt-2 text-sm">Select an achievement to view details.</p>}
              {detailForm && (
                <div className="mt-2 space-y-2">
                  <input
                    className="input-theme w-full rounded-lg px-3 py-2 text-sm"
                    value={detailForm.title}
                    onChange={(e) => setDetailForm((prev) => ({ ...prev, title: e.target.value }))}
                    disabled={!canEdit || saving}
                  />
                  <textarea
                    className="input-theme w-full rounded-lg px-3 py-2 text-sm"
                    rows="3"
                    value={detailForm.description}
                    onChange={(e) => setDetailForm((prev) => ({ ...prev, description: e.target.value }))}
                    disabled={!canEdit || saving}
                  />
                  <input
                    className="input-theme w-full rounded-lg px-3 py-2 text-sm"
                    type="date"
                    value={detailForm.date}
                    onChange={(e) => setDetailForm((prev) => ({ ...prev, date: e.target.value }))}
                    disabled={!canEdit || saving}
                  />
                  <input
                    className="input-theme w-full rounded-lg px-3 py-2 text-sm"
                    value={detailForm.skillsGained}
                    onChange={(e) => setDetailForm((prev) => ({ ...prev, skillsGained: e.target.value }))}
                    placeholder="Skills"
                    disabled={!canEdit || saving}
                  />
                  <input
                    className="input-theme w-full rounded-lg px-3 py-2 text-sm"
                    value={detailForm.proofLink}
                    onChange={(e) => setDetailForm((prev) => ({ ...prev, proofLink: e.target.value }))}
                    placeholder="Proof link"
                    disabled={!canEdit || saving}
                  />
                  <button
                    onClick={saveDetails}
                    disabled={!canEdit || saving}
                    className="btn-secondary w-full px-3 py-2 text-sm font-semibold"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-accent text-sm font-semibold uppercase tracking-wide">Narrative</h2>
              <textarea
                className="input-theme mt-2 w-full rounded-xl px-3 py-2 text-sm"
                rows="7"
                placeholder="Write or edit your narrative story."
                value={narrativeDraft}
                onChange={(e) => {
                  setEditingNarrative(true);
                  setNarrativeDraft(e.target.value);
                }}
                disabled={!canEdit || saving}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  className="btn-secondary px-3 py-1 text-sm font-medium"
                  disabled={!canEdit || saving}
                  onClick={async () => {
                    try {
                      const { data } = await api.put('/narrative/custom', {
                        story: narrativeDraft
                      });
                      setNarrative(data.story || '');
                      setEditingNarrative(false);
                    } catch (err) {
                      setError(err.response?.data?.message || 'Failed to save narrative');
                    }
                  }}
                >
                  Save Story
                </button>
                <button
                  className="btn-outline px-3 py-1 text-sm font-medium"
                  disabled={!canEdit || saving}
                  onClick={() => {
                    setNarrativeDraft(narrative || '');
                    setEditingNarrative(false);
                  }}
                >
                  Reset Draft
                </button>
                <button
                  className="btn-outline px-3 py-1 text-sm font-medium"
                  disabled={!canEdit || saving}
                  onClick={async () => {
                    try {
                      await api.delete('/narrative/custom');
                      const { data } = await api.post('/narrative/generate');
                      setNarrative(data.story || '');
                      setEditingNarrative(false);
                    } catch (err) {
                      setError(err.response?.data?.message || 'Failed to regenerate narrative');
                    }
                  }}
                >
                  Regenerate Story
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-main text-sm font-semibold uppercase tracking-wide">Connections</h2>
              <div className="mt-2 max-h-56 space-y-2 overflow-auto pr-1">
                {connections.length === 0 && <p className="text-muted text-sm">No connections yet.</p>}
                {connections.map((connection) => (
                  <div key={connection._id} className="bg-surface border-theme rounded-lg border p-2 text-xs">
                    <p className="text-main">{connection.relationType.replace('_', ' ')}</p>
                    {connection.storyText && <p className="text-muted">{connection.storyText}</p>}
                    {canEdit && (
                      <button className="text-danger mt-1 font-semibold" onClick={() => removeConnection(connection._id)}>
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      ) : isPublicProfile ? (
        <div className="grid gap-4">
          <section className="panel rounded-2xl p-4">
            <div className="mb-4 flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize ${
                    activeTab === tab ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {tab} view
                </button>
              ))}
            </div>

            {activeTab === 'graph' && (
              <GraphView
                achievements={achievements}
                connections={connections}
                onSelectAchievement={setSelectedId}
                onCreateConnection={createConnectionFromGraph}
                onDeleteConnection={removeConnectionFromGraph}
                canEdit={canEdit}
              />
            )}
            {activeTab === 'timeline' && (
              <TimelineView achievements={achievements} connections={connections} narrative={narrative} />
            )}
            {activeTab === 'gallery' && (
              <GalleryView achievements={achievements} onSelectAchievement={setSelectedId} />
            )}
          </section>
        </div>
      ) : (
        <div className="panel rounded-2xl p-5">
          <p className="text-main text-sm font-semibold">Find a public profile</p>
          <p className="text-muted mt-1 text-sm">Enter a username to open read-only graph, timeline, and gallery views.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              className="input-theme rounded-lg px-3 py-2 text-sm sm:w-80"
              placeholder="username"
              value={profileLookup}
              onChange={(e) => setProfileLookup(e.target.value)}
            />
            <Link
              to={`/u/${encodeURIComponent(profileLookup.trim().toLowerCase())}`}
              className={`btn-primary px-3 py-2 text-sm ${!profileLookup.trim() ? 'pointer-events-none opacity-60' : ''}`}
            >
              Open Profile
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
