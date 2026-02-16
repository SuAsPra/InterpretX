import { motion } from 'framer-motion';

const relationLabel = {
  led_to: 'Led to',
  enabled: 'Enabled',
  applied_in: 'Applied in',
  resulted_in: 'Resulted in'
};

const TimelineView = ({ achievements, connections, narrative }) => {
  const sorted = [...achievements].sort((a, b) => new Date(a.date) - new Date(b.date));
  const titleById = new Map(achievements.map((item) => [item._id, item.title]));

  if (!sorted.length) {
    return <div className="text-muted p-6">No achievements yet. Build your timeline by adding milestones.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="panel-solid rounded-2xl p-4">
        <h3 className="text-accent text-sm font-semibold uppercase tracking-wide">Narrative Story</h3>
        <p className="text-main mt-2">{narrative || 'Generate your story after adding achievements and connections.'}</p>
      </div>

      <div className="space-y-4">
        {sorted.map((achievement, idx) => {
          const outgoing = connections.filter((c) => c.fromAchievementId === achievement._id);
          return (
            <motion.div
              key={achievement._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="panel-solid rounded-2xl p-4"
            >
              <p className="text-primary text-sm font-semibold">
                {new Date(achievement.date).toLocaleDateString()} - {achievement.title}
              </p>
              <p className="text-muted mt-1 text-sm">{achievement.description}</p>
              {outgoing.length > 0 && (
                <div className="text-main mt-3 space-y-1 text-sm">
                  {outgoing.map((connection) => (
                    <p key={connection._id}>
                      {relationLabel[connection.relationType]} {'->'}{' '}
                      {titleById.get(connection.toAchievementId) || 'Next step'}
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineView;
