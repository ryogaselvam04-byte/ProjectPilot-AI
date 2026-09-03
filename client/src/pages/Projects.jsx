import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Archive } from 'lucide-react';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import api from '../services/api';

const priorityColor = { low: 'text-inkDim', medium: 'text-goldSoft', high: 'text-red-400' };

// Project management: create, list, archive, delete - all backed by /api/projects
const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const load = () => api.get('/projects').then((r) => setProjects(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const { data } = await api.post('/projects', { title });
      setProjects((p) => [data, ...p]);
      setTitle('');
    } finally {
      setCreating(false);
    }
  };

  const archive = async (id) => {
    const { data } = await api.put(`/projects/${id}/archive`);
    setProjects((p) => p.map((proj) => (proj._id === id ? data : proj)));
  };

  const remove = async (id) => {
    await api.delete(`/projects/${id}`);
    setProjects((p) => p.filter((proj) => proj._id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl mb-1">Projects</h1>
        <p className="text-inkDim text-sm">Everything you're building, tracked in one place.</p>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2.5">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New project name..."
          className="flex-1 bg-white/[0.03] border border-white/10 focus:border-gold/40 rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors"
        />
        <Button type="submit" loading={creating}><Plus size={15} /> Create</Button>
      </form>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {projects.map((p) => (
            <motion.div
              key={p._id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="flex flex-col gap-3 cursor-pointer" onClick={() => navigate(`/projects/${p._id}`)}>
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-sm">{p.title}</h3>
                  <span className={`text-[10px] uppercase tracking-wide ${priorityColor[p.priority]}`}>
                    {p.priority}
                  </span>
                </div>
                <p className="text-xs text-inkDim line-clamp-2">{p.description || 'No description yet.'}</p>

                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-goldDim to-goldSoft transition-all duration-700"
                    style={{ width: `${p.progress || 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-inkFaint">
                  <span className="uppercase">{p.status}</span>
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); archive(p._id); }} className="hover:text-goldSoft transition-colors">
                      <Archive size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); remove(p._id); }} className="hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {projects.length === 0 && (
        <p className="text-sm text-inkFaint text-center py-10">No projects yet — create your first one above.</p>
      )}
    </div>
  );
};

export default Projects;
