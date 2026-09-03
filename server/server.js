require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const compression = require('compression');
const path = require('path');

const connectDB = require('./config/db');
const passport = require('./config/passport');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const noteRoutes = require('./routes/noteRoutes');
const userRoutes = require('./routes/userRoutes');
const fileRoutes = require('./routes/fileRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Fail fast if critical secrets are missing - better than a silent insecure default
['MONGO_URI', 'JWT_SECRET'].forEach((key) => {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}. Check your .env file.`);
    process.exit(1);
  }
});

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Required when deployed behind a reverse proxy / load balancer (Render, Vercel,
// Nginx, Heroku, etc.) so rate-limiting and req.ip see the real client IP.
app.set('trust proxy', 1);

// ===== Security & core middleware =====
app.use(helmet());
app.use(compression()); // gzip responses
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize()); // strips $ / . operators from req.body,params,query - blocks NoSQL injection
app.use(hpp()); // blocks HTTP parameter pollution (?role=user&role=admin style attacks)
app.use(passport.initialize()); // stateless - no passport.session(), we issue our own JWTs
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Global rate limit - baseline protection for every route
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please slow down' },
});
app.use('/api', globalLimiter);

// Tighter limit specifically on auth routes - the highest-value brute-force target
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login/register attempts, please try again later' },
});
app.use('/api/auth', authLimiter);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== API routes =====
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/chat', chatRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'ProjectPilot AI API' }));

// ===== Error handling (must be last) =====
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`ProjectPilot AI server running on port ${PORT}`));
