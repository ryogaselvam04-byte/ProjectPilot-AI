import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pin, Search, Trash2 } from 'lucide-react';
import api from '../services/api';

// Notes page: list + editor with debounced auto-save
const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState('');
  const saveTimer = useRef(null);

  const load = () => api.get('/notes').then((r) => {
    setNotes(r.data);
    if (!activeId && r.data[0]) setActiveId(r.data[0]._id);
  }).catch(() => {});
  useEffect(() => { load(); }, []);

  const active = notes.find((n) => n._id === activeId);

  const createNote = async () => {
    const { data } = await api.post('/notes', { title: 'Untitled note', content: '' });
    setNotes((n) => [data, ...n]);
    setActiveId(data._id);
  };

  const updateActive = (field, value) => {
    setNotes((n) => n.map((note) => (note._id === activeId ? { ...note, [field]: value } : note)));
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      api.put(`/notes/${activeId}`, { [field]: value }).catch(() => {});
    }, 600); // debounced auto-save
  };

  const togglePin = async (id, pinned) => {
    const { data } = await api.put(`/notes/${id}`, { pinned: !pinned });
    setNotes((n) => n.map((note) => (note._id === id ? data : note)));
  };

  const remove = async (id) => {
    await api.delete(`/notes/${id}`);
    setNotes((n) => n.filter((note) => note._id !== id));
    if (activeId === id) setActiveId(null);
  };

  const filtered = notes.filter((n) => n.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-5 h-[calc(100vh-160px)]">
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2">
            <Search size={14} className="text-inkFaint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes..."
              className="bg-transparent outline-none text-xs w-full"
            />
          </div>
          <button onClick={createNote} className="bg-gradient-to-b from-goldSoft to-gold text-[#251b06] rounded-lg px-3">
            <Plus size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {filtered.map((n) => (
            <motion.button
              layout
              key={n._id}
              onClick={() => setActiveId(n._id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between gap-2 ${
                n._id === activeId ? 'bg-white/[0.06] text-ink' : 'text-inkDim hover:bg-white/[0.03]'
              }`}
            >
              <span className="truncate">{n.title || 'Untitled'}</span>
              {n.pinned && <Pin size={12} className="text-goldSoft flex-shrink-0" />}
            </motion.button>
          ))}
          {filtered.length === 0 && <p className="text-xs text-inkFaint px-2 pt-4">No notes found.</p>}
        </div>
      </div>

      <div className="bg-panel border border-white/[0.08] rounded-2xl p-6 flex flex-col">
        {active ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <input
                value={active.title}
                onChange={(e) => updateActive('title', e.target.value)}
                className="font-display text-xl bg-transparent outline-none flex-1"
              />
              <div className="flex gap-2 text-inkDim">
                <button onClick={() => togglePin(active._id, active.pinned)} className="hover:text-goldSoft transition-colors">
                  <Pin size={16} className={active.pinned ? 'text-goldSoft' : ''} />
                </button>
                <button onClick={() => remove(active._id)} className="hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <textarea
              value={active.content}
              onChange={(e) => updateActive('content', e.target.value)}
              placeholder="Write in markdown... auto-saves as you type."
              className="flex-1 bg-transparent outline-none text-sm text-inkDim resize-none leading-relaxed"
            />
          </>
        ) : (
          <p className="text-sm text-inkFaint m-auto">Select or create a note to get started.</p>
        )}
      </div>
    </div>
  );
};

export default Notes;
