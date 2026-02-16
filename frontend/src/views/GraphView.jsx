import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Background,
  ConnectionMode,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const relationValues = ['enabled', 'led_to', 'applied_in', 'resulted_in'];
const relationLabel = {
  enabled: 'Enabled',
  led_to: 'Led to',
  applied_in: 'Applied in',
  resulted_in: 'Resulted in'
};
const positionsStorageKey = 'narrative_graph_positions_v1';

const AchievementNode = ({ data }) => (
  <div className="graph-node relative w-56 rounded-xl px-3 py-2">
    <Handle type="target" position={Position.Top} className="!h-3 !w-3 !bg-[var(--accent)]" />
    <p className="text-main text-sm font-semibold">{data.title}</p>
    <p className="text-muted text-xs">{data.year} • {data.type}</p>
    <Handle type="source" position={Position.Bottom} className="!h-3 !w-3 !bg-[var(--primary)]" />
  </div>
);

const nodeTypes = { achievement: AchievementNode };

const GraphView = ({
  achievements,
  connections,
  onSelectAchievement,
  onCreateConnection,
  onDeleteConnection,
  canEdit
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isSavingEdge, setIsSavingEdge] = useState(false);
  const [isDeletingEdge, setIsDeletingEdge] = useState(false);
  const [query, setQuery] = useState('');
  const [flowApi, setFlowApi] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [pendingConnection, setPendingConnection] = useState(null);

  const achievementById = useMemo(
    () => new Map(achievements.map((item) => [item._id, item])),
    [achievements]
  );

  const saveNodePositions = useCallback((nodeList) => {
    const saved = nodeList.reduce((acc, node) => {
      acc[node.id] = node.position;
      return acc;
    }, {});
    localStorage.setItem(positionsStorageKey, JSON.stringify(saved));
  }, []);

  const loadSavedPositions = useCallback(() => {
    try {
      const raw = localStorage.getItem(positionsStorageKey);
      return raw ? JSON.parse(raw) : {};
    } catch (_e) {
      return {};
    }
  }, []);

  useEffect(() => {
    const savedPositions = loadSavedPositions();

    setNodes((previous) =>
      achievements.map((achievement, index) => {
        const current = previous.find((node) => node.id === achievement._id);
        const saved = savedPositions[achievement._id];

        return {
          id: achievement._id,
          type: 'achievement',
          data: {
            title: achievement.title,
            year: new Date(achievement.date).getFullYear(),
            type: achievement.type
          },
          position:
            current?.position ||
            saved || {
              x: 120 + (index % 4) * 260,
              y: 80 + Math.floor(index / 4) * 190
            }
        };
      })
    );
  }, [achievements, loadSavedPositions, setNodes]);

  useEffect(() => {
    setEdges(
      connections.map((connection) => ({
        id: connection._id,
        source: connection.fromAchievementId,
        target: connection.toAchievementId,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
        label: relationLabel[connection.relationType] || connection.relationType,
        style: {
          stroke: selectedEdgeId === connection._id ? 'var(--primary)' : 'var(--accent)',
          strokeWidth: selectedEdgeId === connection._id ? 3.2 : 2.2
        },
        labelStyle: { fill: '#0f172a', fontWeight: 700 },
        labelBgStyle: { fill: '#ffffff', fillOpacity: 1 },
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 6,
        data: {
          relationType: connection.relationType,
          storyText: connection.storyText || ''
        }
      }))
    );
  }, [connections, selectedEdgeId, setEdges]);

  useEffect(() => {
    const exists = connections.some((item) => item._id === selectedEdgeId);
    if (!exists) setSelectedEdgeId(null);
  }, [connections, selectedEdgeId]);

  useEffect(() => {
    if (nodes.length) {
      saveNodePositions(nodes);
    }
  }, [nodes, saveNodePositions]);

  const selectedEdge = useMemo(
    () => edges.find((edge) => edge.id === selectedEdgeId) || null,
    [edges, selectedEdgeId]
  );

  const filteredNodes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return nodes;
    return nodes.filter((node) => {
      const achievement = achievementById.get(node.id);
      if (!achievement) return false;
      const hay = `${achievement.title} ${achievement.type} ${achievement.description}`.toLowerCase();
      return hay.includes(q);
    });
  }, [achievementById, nodes, query]);

  const focusMatches = () => {
    if (!flowApi || filteredNodes.length === 0) return;
    const ids = new Set(filteredNodes.map((n) => n.id));
    flowApi.fitView({
      padding: 0.25,
      duration: 350,
      nodes: nodes.filter((n) => ids.has(n.id))
    });
  };

  const layoutByDate = () => {
    const sorted = [...achievements].sort((a, b) => new Date(a.date) - new Date(b.date));
    const map = new Map(sorted.map((item, idx) => [item._id, idx]));

    setNodes((current) =>
      current.map((node) => {
        const idx = map.get(node.id) ?? 0;
        return {
          ...node,
          position: {
            x: 120 + (idx % 3) * 300,
            y: 90 + Math.floor(idx / 3) * 200
          }
        };
      })
    );
  };

  const layoutCircle = () => {
    const radius = Math.max(180, achievements.length * 16);
    const center = { x: 480, y: 300 };

    setNodes((current) =>
      current.map((node, idx) => {
        const angle = (idx / Math.max(1, current.length)) * Math.PI * 2;
        return {
          ...node,
          position: {
            x: center.x + Math.cos(angle) * radius,
            y: center.y + Math.sin(angle) * radius
          }
        };
      })
    );
  };

  const resetLayout = () => {
    localStorage.removeItem(positionsStorageKey);
    setNodes((current) =>
      current.map((node, idx) => ({
        ...node,
        position: {
          x: 120 + (idx % 4) * 260,
          y: 80 + Math.floor(idx / 4) * 190
        }
      }))
    );
  };

  const onConnect = useCallback(
    (params) => {
      if (!params.source || !params.target || params.source === params.target || isSavingEdge) return;
      if (!canEdit) return;

      setPendingConnection({
        fromAchievementId: params.source,
        toAchievementId: params.target,
        relationType: 'enabled',
        storyText: ''
      });
    },
    [canEdit, isSavingEdge]
  );

  const submitPendingConnection = async (e) => {
    e.preventDefault();
    if (!pendingConnection) return;

    setIsSavingEdge(true);
    const created = await onCreateConnection(pendingConnection);
    setIsSavingEdge(false);

    if (created) {
      setPendingConnection(null);
    }
  };

  const deleteSelectedEdge = async () => {
    if (!canEdit || !selectedEdge || isDeletingEdge) return;

    setIsDeletingEdge(true);
    const ok = await onDeleteConnection(selectedEdge.id);
    setIsDeletingEdge(false);

    if (ok) {
      setSelectedEdgeId(null);
    }
  };

  if (!achievements.length) {
    return <div className="text-muted p-6">No achievements yet. Add one to see graph visualization.</div>;
  }

  return (
    <div className="bg-surface border-theme relative h-[640px] w-full overflow-hidden rounded-2xl border">
      <div className="bg-surface border-theme absolute left-3 right-3 top-3 z-20 flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2">
        <input
          className="input-theme min-w-52 flex-1 rounded-lg px-3 py-2 text-sm"
          placeholder="Search nodes by title/type"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn-secondary px-3 py-2 text-xs" onClick={focusMatches}>
          Focus Matches
        </button>
        <button className="btn-secondary px-3 py-2 text-xs" onClick={layoutByDate}>
          Date Layout
        </button>
        <button className="btn-secondary px-3 py-2 text-xs" onClick={layoutCircle}>
          Circle Layout
        </button>
        <button className="btn-secondary px-3 py-2 text-xs" onClick={resetLayout}>
          Reset Positions
        </button>
        <span className="text-muted text-xs">
          Nodes: {nodes.length} | Links: {edges.length}
        </span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        onInit={setFlowApi}
        nodesDraggable
        nodesConnectable={canEdit}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_event, node) => onSelectAchievement(node.id)}
        onEdgeClick={(_event, edge) => setSelectedEdgeId(edge.id)}
        connectionMode={ConnectionMode.Loose}
      >
        <Background gap={22} color="var(--grid)" />
        <MiniMap zoomable pannable />
        <Controls />
      </ReactFlow>

      {pendingConnection && (
        <form
          onSubmit={submitPendingConnection}
          className="bg-surface border-theme absolute bottom-16 left-3 z-30 w-[420px] max-w-[calc(100%-1.5rem)] rounded-xl border p-3"
        >
          <p className="text-main mb-2 text-sm font-semibold">Create connection</p>
          <p className="text-muted mb-2 text-xs">
            {achievementById.get(pendingConnection.fromAchievementId)?.title || 'Source'} {'->'}{' '}
            {achievementById.get(pendingConnection.toAchievementId)?.title || 'Target'}
          </p>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[170px,1fr]">
            <select
              className="input-theme rounded-lg px-2 py-2 text-sm"
              value={pendingConnection.relationType}
              onChange={(e) =>
                setPendingConnection((prev) => ({ ...prev, relationType: e.target.value }))
              }
            >
              {relationValues.map((item) => (
                <option key={item} value={item}>
                  {relationLabel[item]}
                </option>
              ))}
            </select>
            <input
              className="input-theme rounded-lg px-2 py-2 text-sm"
              placeholder="Optional story text"
              value={pendingConnection.storyText}
              onChange={(e) =>
                setPendingConnection((prev) => ({ ...prev, storyText: e.target.value }))
              }
            />
          </div>
          <div className="mt-2 flex gap-2">
            <button className="btn-accent px-3 py-2 text-xs" disabled={isSavingEdge}>
              {isSavingEdge ? 'Saving...' : 'Save Connection'}
            </button>
            <button
              type="button"
              className="btn-secondary px-3 py-2 text-xs"
              onClick={() => setPendingConnection(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {selectedEdge && (
        <div className="bg-surface border-theme absolute bottom-16 right-3 z-30 w-[360px] max-w-[calc(100%-1.5rem)] rounded-xl border p-3">
          <p className="text-main text-sm font-semibold">Selected connection</p>
          <p className="text-muted mt-1 text-xs">
            {(achievementById.get(selectedEdge.source)?.title || 'Source')} {'->'}{' '}
            {(achievementById.get(selectedEdge.target)?.title || 'Target')}
          </p>
          <p className="text-main mt-2 text-xs">Relation: {selectedEdge.data?.relationType}</p>
          {selectedEdge.data?.storyText ? (
            <p className="text-muted mt-1 text-xs">Story: {selectedEdge.data.storyText}</p>
          ) : null}
          <div className="mt-3 flex gap-2">
            {canEdit && (
              <button className="btn-secondary px-3 py-2 text-xs" disabled={isDeletingEdge} onClick={deleteSelectedEdge}>
                {isDeletingEdge ? 'Removing...' : 'Delete'}
              </button>
            )}
            <button className="btn-secondary px-3 py-2 text-xs" onClick={() => setSelectedEdgeId(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      <div className="bg-surface border-theme text-muted border-t px-3 py-2 text-xs">
        Drag nodes freely. {canEdit ? 'Create links by dragging from one node handle to another.' : 'Login to create/delete connections.'}
      </div>
    </div>
  );
};

export default GraphView;


