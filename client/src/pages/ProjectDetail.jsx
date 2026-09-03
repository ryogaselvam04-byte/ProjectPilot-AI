import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Send, Mic, CheckSquare, Trash2 } from 'lucide-react';
import MasterAILogo from '../components/ui/MasterAILogo.jsx';
import api from '../services/api';

const STATUS_OPTIONS = ['active', 'completed', 'archived'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high'];

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Notepad-style project page: editable title/description that auto-saves,
// status/priority/progress controls, its tasks, and a floating AI chat that
// can turn a described idea into real tasks on this project.
const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved
  const saveTimer = useRef(null);

  const [chatOpen, setChatOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?project=${id}`),
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      if (err.response?.status === 404) setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const patchField = (field, value) => {
    setProject((p) => ({ ...p, [field]: value }));
    setSaveState('saving');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await api.put(`/projects/${id}`, { [field]: value });
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 1500);
      } catch {
        setSaveState('idle');
      }
    }, 600);
  };

  const onTasksCreated = (newTasks) => {
    setTasks((t) => [...t, ...newTasks]);
  };

  if (loading) return <p className="text-sm text-inkFaint">Loading project...</p>;
  if (notFound) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-inkFaint mb-4">This project doesn't exist, or isn't yours.</p>
        <Link to="/projects" className="text-goldSoft text-sm font-bold underline">Back to Projects</Link>
      </div>
    );
  }

  const doneCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative">
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-1.5 text-xs text-inkDim hover:text-ink transition-colors"
      >
        <ArrowLeft size={14} /> All projects
      </button>

      {/* ===== Notepad area ===== */}
      <div className="bg-panel border border-white/[0.08] rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-1">
          <input
            value={project.title}
            onChange={(e) => patchField('title', e.target.value)}
            className="font-display text-2xl md:text-3xl bg-transparent outline-none flex-1"
          />
          <span className="text-[10px] text-inkFaint w-16 text-right">
            {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved' : ''}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-5 mt-3">
          <select
            value={project.status}
            onChange={(e) => patchField('status', e.target.value)}
            className="bg-white/[0.04] border border-white/10 rounded-full px-3 py-1 text-[11px] uppercase tracking-wide outline-none"
          >
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={project.priority}
            onChange={(e) => patchField('priority', e.target.value)}
            className="bg-white/[0.04] border border-white/10 rounded-full px-3 py-1 text-[11px] uppercase tracking-wide outline-none"
          >
            {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <div className="flex items-center gap-2 ml-auto text-[11px] text-inkDim">
            <span>Progress</span>
            <input
              type="range" min="0" max="100" value={project.progress || 0}
              onChange={(e) => patchField('progress', Number(e.target.value))}
              className="accent-gold w-24"
            />
            <span className="text-goldSoft w-8">{project.progress || 0}%</span>
          </div>
        </div>

        <textarea
          value={project.description}
          onChange={(e) => patchField('description', e.target.value)}
          placeholder="Write anything about this project - notes, plans, links..."
          rows={10}
          className="w-full bg-transparent outline-none text-sm text-inkDim leading-relaxed resize-none"
        />
      </div>

      {/* ===== Tasks for this project ===== */}
      <div className="bg-panel border border-white/[0.08] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-base flex items-center gap-2">
            <CheckSquare size={16} className="text-goldSoft" /> Tasks
          </h3>
          <span className="text-[11px] text-inkFaint">{doneCount}/{tasks.length} done</span>
        </div>

        {tasks.length === 0 ? (
          <p className="text-sm text-inkFaint">
            No tasks yet — open the AI assistant (bottom right) and describe your idea to generate some.
          </p>
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => (
              <div key={t._id} className="flex items-center gap-2.5 text-sm">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.status === 'completed' ? 'bg-emerald-400' : 'bg-inkFaint'}`} />
                <span className={t.status === 'completed' ? 'line-through text-inkFaint' : ''}>{t.title}</span>
              </div>
            ))}
          </div>
        )}
        <Link to="/tasks" className="inline-block mt-4 text-xs text-goldSoft font-bold underline underline-offset-2">
          Open full Kanban board →
        </Link>
      </div>

      {/* ===== Floating AI chat launcher ===== */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-b from-goldSoft to-gold text-[#251b06] shadow-gold flex items-center justify-center z-40"
        title="Ask AI about this project"
      >
        <MasterAILogo size={24} />
      </button>

      <AnimatePresence>
        {chatOpen && (
          <ProjectChatPanel
            project={project}
            onClose={() => setChatOpen(false)}
            onTasksCreated={onTasksCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Slide-in panel, bottom-right: a chat scoped to this one project. When the
// AI proposes tasks, they're created server-side and handed back here.
const ProjectChatPanel = ({ project, onClose, onTasksCreated }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [justAdded, setJustAdded] = useState(0);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    api.get(`/chat/history?project=${project._id}`).then((r) => setMessages(r.data)).catch(() => {});
  }, [project._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const toggleListening = () => {
    if (!SpeechRecognition) return;
    if (listening) { recognitionRef.current?.stop(); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (e) => setInput((prev) => (prev ? `${prev} ${e.results[0][0].transcript}` : e.results[0][0].transcript));
    recognitionRef.current = recognition;
    recognition.start();
  };

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);
    setMessages((m) => [...m, { _id: `temp-${Date.now()}`, role: 'user', content: text }]);

    try {
      const { data } = await api.post('/chat', { message: text, projectId: project._id });
      setMessages((m) => [
        ...m.filter((msg) => !msg._id.toString().startsWith('temp-')),
        data.userMessage,
        data.assistantMessage,
      ]);
      if (data.createdTasks?.length) {
        onTasksCreated(data.createdTasks);
        setJustAdded(data.createdTasks.length);
        setTimeout(() => setJustAdded(0), 3000);
      }
    } catch {
      setMessages((m) => m.filter((msg) => !msg._id.toString().startsWith('temp-')));
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      className="fixed bottom-24 right-6 w-[min(360px,90vw)] h-[min(500px,70vh)] bg-panel border border-gold/20 rounded-2xl shadow-2xl flex flex-col z-40 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2 min-w-0">
          <MasterAILogo size={15} />
          <p className="text-sm font-semibold truncate">{project.title}</p>
        </div>
        <button onClick={onClose} className="text-inkDim hover:text-ink"><X size={16} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {messages.length === 0 && (
          <p className="text-xs text-inkFaint text-center mt-6">
            Tell me about this project's idea and I'll suggest tasks to add to your board.
          </p>
        )}
        {messages.map((m) => (
          <div key={m._id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
              m.role === 'user'
                ? 'bg-gradient-to-b from-goldSoft to-gold text-[#251b06] rounded-br-sm'
                : 'bg-white/[0.05] border border-white/[0.08] rounded-bl-sm'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex gap-1.5 px-3">
            {[0, 1, 2].map((i) => (
              <motion.span key={i} className="w-1 h-1 rounded-full bg-inkDim"
                animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }} />
            ))}
          </div>
        )}
        <AnimatePresence>
          {justAdded > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="text-[11px] text-center text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg py-1.5"
            >
              ✓ Added {justAdded} task{justAdded > 1 ? 's' : ''} to this project
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex items-center gap-1.5 p-2.5 border-t border-white/[0.08]">
        <button type="button" onClick={toggleListening} className={`p-2 rounded-lg flex-shrink-0 ${listening ? 'text-red-400 bg-red-400/10' : 'text-inkDim'}`}>
          <Mic size={15} className={listening ? 'animate-pulse' : ''} />
        </button>
        <input
          value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your idea..."
          className="flex-1 bg-transparent outline-none text-xs"
        />
        <button type="submit" disabled={!input.trim() || sending} className="p-2 rounded-lg bg-gradient-to-b from-goldSoft to-gold text-[#251b06] disabled:opacity-40 flex-shrink-0">
          <Send size={14} />
        </button>
      </form>
    </motion.div>
  );
};

export default ProjectDetail;
