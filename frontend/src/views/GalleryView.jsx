import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const types = ['all', 'course', 'project', 'certificate', 'experience', 'award'];

const GalleryView = ({ achievements, onSelectAchievement }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const visible = useMemo(() => {
    return achievements
      .filter((item) => (filterType === 'all' ? true : item.type === filterType))
      .filter((item) => {
        const haystack = `${item.title} ${item.description} ${(item.skillsGained || []).join(' ')}`.toLowerCase();
        return haystack.includes(search.toLowerCase());
      })
      .sort((a, b) => {
        const x = new Date(a.date).getTime();
        const y = new Date(b.date).getTime();
        return sortOrder === 'newest' ? y - x : x - y;
      });
  }, [achievements, filterType, search, sortOrder]);

  return (
    <div>
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search achievements..."
          className="input-theme rounded-xl px-3 py-2"
        />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-theme rounded-xl px-3 py-2">
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="input-theme rounded-xl px-3 py-2">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <div className="text-muted border-theme rounded-2xl border border-dashed p-6 text-center">No achievements match this filter.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((achievement, idx) => (
            <motion.button
              key={achievement._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => onSelectAchievement(achievement._id)}
              className="panel-solid rounded-2xl p-4 text-left transition hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-main font-semibold">{achievement.title}</h3>
                <span className="badge-theme rounded-full px-2 py-1 text-xs font-semibold">{achievement.type}</span>
              </div>
              <p className="text-muted mt-2 text-xs">{new Date(achievement.date).toLocaleDateString()}</p>
              <p className="text-muted mt-2 line-clamp-3 text-sm">{achievement.description}</p>
              <p className="text-muted mt-3 text-xs">Skills: {(achievement.skillsGained || []).join(', ') || 'N/A'}</p>
              {achievement.proofLink && (
                <a
                  href={achievement.proofLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent mt-3 inline-block text-sm font-semibold"
                  onClick={(e) => e.stopPropagation()}
                >
                  Proof link
                </a>
              )}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryView;
