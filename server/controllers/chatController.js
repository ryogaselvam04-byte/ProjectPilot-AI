const ChatMessage = require('../models/ChatMessage');
const Task = require('../models/Task');
const Project = require('../models/Project');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const HISTORY_LIMIT = 20;

const GENERAL_SYSTEM_PROMPT = `You are MASTER AI, the assistant embedded inside the ProjectPilot app.
Be concise, warm, and practical. When the user asks about their projects or tasks,
answer generally and helpfully - you don't have direct database access in this
basic assistant, so if they need live data, point them to the Dashboard/Projects/Tasks pages.
Keep responses skimmable: short paragraphs, occasional bullet points, no walls of text.

Language: always reply in the same language the user's message is written in
(Tamil, Tanglish, Hindi, English, or any other language) - detect it automatically
from their message, never ask which language to use, and never switch languages
mid-conversation unless the user does.`;

// Project-scoped prompt asks the model to propose concrete tasks in a
// parseable "TASKS:" block whenever the user describes their project idea.
const projectSystemPrompt = (project) => `You are MASTER AI, helping the user plan and build
their project called "${project.title}". Current description: "${project.description || 'none yet'}".

Have a natural, encouraging conversation about their idea. Whenever the user describes their
project idea, goal, or asks you to break it down - not for small talk or simple questions -
end your reply with a line that says exactly "TASKS:" followed by 4 to 8 concise major task
titles, one per line, each starting with "- ". Keep each task title short (under 8 words) and
actionable (e.g. "- Design the database schema"). Only include the TASKS section when you are
genuinely proposing new tasks. Keep the conversational part brief and motivating.

Language: always reply (including task titles) in the same language the user's message is
written in - detect it automatically, never ask which language to use.`;

// Splits a model reply into { reply, taskTitles[] } by looking for a trailing "TASKS:" block.
const parseTasksFromReply = (text) => {
  const marker = /\n?TASKS:\s*\n/i;
  const match = text.match(marker);
  if (!match) return { reply: text.trim(), taskTitles: [] };

  const reply = text.slice(0, match.index).trim();
  const tasksBlock = text.slice(match.index + match[0].length);
  const taskTitles = tasksBlock
    .split('\n')
    .map((line) => line.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 8);

  return { reply: reply || "Here's a plan to get you started:", taskTitles };
};

// @desc Get chat history (general assistant, or scoped to a project)
// @route GET /api/chat/history?project=:projectId
const getHistory = async (req, res) => {
  try {
    const filter = { owner: req.user._id, project: req.query.project || null };
    const messages = await ChatMessage.find(filter).sort({ createdAt: 1 }).limit(200);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Send a message, get an AI reply. If projectId is provided, the AI
//       will also propose tasks, which get created automatically.
// @route POST /api/chat
const sendMessage = async (req, res) => {
  try {
    const text = (req.body.message || '').trim();
    const projectId = req.body.projectId || null;
    if (!text) return res.status(400).json({ message: 'Message cannot be empty' });

    let project = null;
    if (projectId) {
      project = await Project.findOne({ _id: projectId, owner: req.user._id });
      if (!project) return res.status(404).json({ message: 'Project not found' });
    }

    const userMessage = await ChatMessage.create({
      owner: req.user._id,
      project: projectId,
      role: 'user',
      content: text,
    });

    const recent = await ChatMessage.find({ owner: req.user._id, project: projectId })
      .sort({ createdAt: -1 })
      .limit(HISTORY_LIMIT)
      .lean();
    const history = recent.reverse().map((m) => ({ role: m.role, content: m.content }));

    const systemPrompt = project ? projectSystemPrompt(project) : GENERAL_SYSTEM_PROMPT;

    let response;
    try {
      response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          stream: false,
          messages: [{ role: 'system', content: systemPrompt }, ...history],
        }),
      });
    } catch (networkErr) {
      return res.status(503).json({
        message:
          'Could not reach Ollama. Make sure it is installed and running (open a terminal and run "ollama serve", or just have the Ollama app open).',
      });
    }

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Ollama API error:', response.status, errBody);
      if (response.status === 404) {
        return res.status(502).json({
          message: `Model "${MODEL}" isn't downloaded yet. Run: ollama pull ${MODEL}`,
        });
      }
      return res.status(502).json({ message: 'The local AI model returned an error. Check the server terminal for details.' });
    }

    const data = await response.json();
    const rawReply = data.message?.content || "Sorry, I couldn't generate a response that time.";

    let replyText = rawReply;
    let createdTasks = [];

    if (project) {
      const { reply, taskTitles } = parseTasksFromReply(rawReply);
      replyText = reply;

      if (taskTitles.length) {
        const existingCount = await Task.countDocuments({ project: project._id, owner: req.user._id });
        const docs = taskTitles.map((title, i) => ({
          title,
          project: project._id,
          owner: req.user._id,
          status: 'todo',
          order: existingCount + i,
        }));
        createdTasks = await Task.insertMany(docs);
      }
    }

    const assistantMessage = await ChatMessage.create({
      owner: req.user._id,
      project: projectId,
      role: 'assistant',
      content: replyText,
    });

    res.status(201).json({ userMessage, assistantMessage, createdTasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Clear chat history (general assistant, or scoped to a project)
// @route DELETE /api/chat/history?project=:projectId
const clearHistory = async (req, res) => {
  try {
    await ChatMessage.deleteMany({ owner: req.user._id, project: req.query.project || null });
    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getHistory, sendMessage, clearHistory };
