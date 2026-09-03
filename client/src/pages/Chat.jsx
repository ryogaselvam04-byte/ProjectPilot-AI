import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Volume2, VolumeX, Trash2 } from 'lucide-react';
import MasterAILogo from '../components/ui/MasterAILogo.jsx';
import api from '../services/api';

// Browser-native speech APIs - no extra service/API key needed for voice
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const synth = window.speechSynthesis;

// WhatsApp / Meta-AI style chat: bubbles, typing indicator, mic input, spoken replies.
// Talks to POST /api/chat, which calls the Anthropic API server-side.
const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    api.get('/chat/history').then((r) => setMessages(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // ===== Voice input (speech-to-text) =====
  const toggleListening = () => {
    if (!SpeechRecognition) {
      setError('Voice input is not supported in this browser. Try Chrome.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // ===== Voice output (text-to-speech) =====
  const speak = (text) => {
    if (!voiceOn || !synth) return;
    synth.cancel(); // stop any previous utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.02;
    synth.speak(utterance);
  };

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setError('');
    setInput('');
    setSending(true);

    // Optimistic user bubble
    setMessages((m) => [...m, { _id: `temp-${Date.now()}`, role: 'user', content: text }]);

    try {
      const { data } = await api.post('/chat', { message: text });
      setMessages((m) => [
        ...m.filter((msg) => !msg._id.toString().startsWith('temp-')),
        data.userMessage,
        data.assistantMessage,
      ]);
      speak(data.assistantMessage.content);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong sending that message.');
      setMessages((m) => m.filter((msg) => !msg._id.toString().startsWith('temp-')));
    } finally {
      setSending(false);
    }
  };

  const clearChat = async () => {
    if (!confirm('Clear your entire chat history?')) return;
    await api.delete('/chat/history');
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl mb-1 flex items-center gap-2">
            <MasterAILogo size={20} /> MASTER AI
          </h1>
          <p className="text-inkDim text-sm">Ask anything - type, or tap the mic to talk.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceOn((v) => !v)}
            title={voiceOn ? 'Voice replies on' : 'Voice replies off'}
            className={`p-2.5 rounded-lg border transition-colors ${
              voiceOn ? 'text-goldSoft border-gold/30 bg-gold/10' : 'text-inkDim border-white/10'
            }`}
          >
            {voiceOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button onClick={clearChat} className="p-2.5 rounded-lg border border-white/10 text-inkDim hover:text-red-400 hover:border-red-400/30 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-3">
        {messages.length === 0 && !sending && (
          <div className="h-full flex flex-col items-center justify-center text-center text-inkFaint text-sm gap-2">
            <MasterAILogo size={22} />
            <p>Say hello, or ask about your projects, tasks, or how to use the app.</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-gradient-to-b from-goldSoft to-gold text-[#251b06] rounded-br-sm'
                    : 'bg-panel border border-white/[0.08] text-ink rounded-bl-sm'
                }`}
              >
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {sending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-panel border border-white/[0.08] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-inkDim"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

      {/* Composer */}
      <form onSubmit={send} className="flex items-center gap-2 bg-panel border border-white/[0.08] rounded-xl p-2">
        <button
          type="button"
          onClick={toggleListening}
          title="Voice input"
          className={`p-2.5 rounded-lg transition-colors flex-shrink-0 ${
            listening ? 'text-red-400 bg-red-400/10' : 'text-inkDim hover:text-goldSoft'
          }`}
        >
          <Mic size={18} className={listening ? 'animate-pulse' : ''} />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={listening ? 'Listening...' : 'Type a message...'}
          className="flex-1 bg-transparent outline-none text-sm px-1"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="p-2.5 rounded-lg bg-gradient-to-b from-goldSoft to-gold text-[#251b06] disabled:opacity-40 flex-shrink-0"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default Chat;
