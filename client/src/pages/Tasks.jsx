import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

const COLUMNS = [
  { key: 'todo', label: 'Todo' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'testing', label: 'Testing' },
  { key: 'completed', label: 'Completed' },
];

const priorityDot = { low: 'bg-inkFaint', medium: 'bg-goldSoft', high: 'bg-red-400' };

const CHEERS = [
  'Nice work! 🎉',
  'Boom, done! 🙌',
  "That's how it's done! ✨",
  'One step closer! 🚀',
  'Crushed it! 🔥',
  'Great job! 🌟',
];

// A small gold-toned confetti burst - matches the app's premium palette
// instead of default rainbow confetti.
const celebrate = () => {
  confetti({
    particleCount: 90,
    spread: 70,
    origin: { y: 0.7 },
    colors: ['#f0b75b', '#f9dca0', '#7a5a2c', '#ffffff'],
  });
};

// Kanban board with native HTML5 drag-and-drop between columns
const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [dragId, setDragId] = useState(null);
  const [cheer, setCheer] = useState('');

  const load = () => api.get('/tasks').then((r) => setTasks(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const { data } = await api.post('/tasks', { title: newTitle, status: 'todo' });
    setTasks((t) => [data, ...t]);
    setNewTitle('');
  };

  const moveTask = async (id, status) => {
    const task = tasks.find((t) => t._id === id);
    const justCompleted = task && task.status !== 'completed' && status === 'completed';

    setTasks((t) => t.map((task) => (task._id === id ? { ...task, status } : task))); // optimistic

    if (justCompleted) {
      celebrate();
      setCheer(CHEERS[Math.floor(Math.random() * CHEERS.length)]);
      setTimeout(() => setCheer(''), 2200);
    }

    try {
      await api.put(`/tasks/${id}`, { status });
    } catch {
      load(); // revert on failure
    }
  };

  return (
    <div className="space-y-6 relative">
      <div>
        <h1 className="font-display text-2xl md:text-3xl mb-1">Tasks</h1>
        <p className="text-inkDim text-sm">Drag cards across columns as work moves forward.</p>
      </div>

      <form onSubmit={addTask} className="flex gap-2.5">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New task title..."
          className="flex-1 bg-white/[0.03] border border-white/10 focus:border-gold/40 rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors"
        />
        <button className="flex items-center gap-1.5 bg-gradient-to-b from-goldSoft to-gold text-[#251b06] font-bold text-sm px-4 rounded-lg">
          <Plus size={15} /> Add
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => dragId && moveTask(dragId, col.key)}
            className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-3 min-h-[200px]"
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-inkDim">{col.label}</span>
              <span className="text-[10px] text-inkFaint">
                {tasks.filter((t) => t.status === col.key).length}
              </span>
            </div>

            <div className="space-y-2.5">
              {tasks
                .filter((t) => t.status === col.key)
                .map((t) => (
                  <motion.div
                    key={t._id}
                    layout
                    draggable
                    onDragStart={() => setDragId(t._id)}
                    className="bg-panel border border-white/[0.08] rounded-lg p-3 cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${priorityDot[t.priority] || 'bg-inkFaint'}`} />
                      <span className="text-[10px] uppercase text-inkFaint">{t.priority || 'medium'}</span>
                    </div>
                    <p className="text-sm">{t.title}</p>
                    {t.dueDate && (
                      <p className="text-[10.5px] text-inkFaint mt-1.5">
                        Due {new Date(t.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Motivational toast on task completion */}
      <AnimatePresence>
        {cheer && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-panel border border-gold/30 rounded-full px-5 py-2.5 text-sm font-semibold text-goldSoft shadow-gold z-50"
          >
            {cheer}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tasks;
