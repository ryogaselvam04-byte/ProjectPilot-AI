import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, FolderKanban, Clock, Sparkles } from 'lucide-react';
import Card from '../components/ui/Card.jsx';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.06 } }),
};

// Landing screen after login: greeting + live stats pulled from the API
const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    api.get('/projects').then((r) => setProjects(r.data)).catch(() => setProjects([]));
    api.get('/tasks').then((r) => setTasks(r.data)).catch(() => setTasks([]));
  }, []);

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const upcoming = tasks
    .filter((t) => t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);

  const stats = [
    { label: 'Active projects', value: activeProjects, icon: FolderKanban },
    { label: 'Tasks completed', value: completedTasks, icon: CheckCircle2 },
    { label: 'Total tasks', value: tasks.length, icon: Clock },
    { label: 'AI suggestions', value: 3, icon: Sparkles },
  ];

  return (
    <div className="space-y-8">
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
        <p className="text-xs tracking-[0.2em] uppercase text-goldSoft mb-2">Welcome back</p>
        <h1 className="font-display text-3xl md:text-4xl">
          Good to see you, {user?.name?.split(' ')[0] || 'there'}.
        </h1>
        <p className="text-inkDim text-sm mt-2 max-w-md">
          Here's what's happening across your projects today.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} variants={fadeUp} initial="hidden" animate="show" custom={i + 1}>
            <Card>
              <s.icon size={18} className="text-goldSoft mb-3" />
              <div className="font-display text-2xl">{s.value}</div>
              <div className="text-[11px] text-inkDim mt-1">{s.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5}>
          <Card hover={false}>
            <h3 className="font-display text-base mb-4">Recent projects</h3>
            {projects.length === 0 ? (
              <p className="text-sm text-inkFaint">No projects yet — create your first one.</p>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 4).map((p) => (
                  <div key={p._id} className="flex items-center justify-between text-sm">
                    <span>{p.title}</span>
                    <span className="text-[11px] text-goldSoft">{p.progress || 0}%</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={6}>
          <Card hover={false}>
            <h3 className="font-display text-base mb-4">Upcoming tasks</h3>
            {upcoming.length === 0 ? (
              <p className="text-sm text-inkFaint">Nothing due soon. Enjoy the calm.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((t) => (
                  <div key={t._id} className="flex items-center justify-between text-sm">
                    <span>{t.title}</span>
                    <span className="text-[11px] text-inkDim">
                      {new Date(t.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
