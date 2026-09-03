# ProjectPilot AI

A premium, dark-themed AI project management platform. Cinematic lamp-switch
login, animated dashboard, Kanban tasks, notes, projects, profile, settings
and an admin-ready API.

## Stack

- **Client:** React 18 + Vite + React Router + Tailwind CSS + Framer Motion + Lucide icons + Axios
- **Server:** Node.js + Express + MongoDB (Mongoose) + JWT + bcrypt + Multer
- **Database:** MongoDB Atlas

## Folder structure

```
projectpilot-ai/
  client/          React + Vite frontend
    src/
      components/
        layout/    Navbar, Sidebar, AppLayout, Loader, Lamp
        ui/         Button, Card, ProtectedRoute
      pages/        Login, Register, Dashboard, Projects, Tasks, Notes, Profile, Settings
      context/      AuthContext (JWT session)
      hooks/         useAuth
      services/      api.js (Axios instance)
      styles/        index.css (Tailwind)
  server/          Express backend
    config/         db.js (MongoDB connection)
    models/         User, Project, Task, Note, FileItem
    controllers/     business logic per resource
    routes/          Express routers per resource
    middleware/      auth (JWT), errorHandler
    utils/           generateToken
    uploads/         file uploads land here (Multer)
```

## 1. Set up MongoDB Atlas

1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user + password
3. Under Network Access, allow your IP (or 0.0.0.0/0 for local dev)
4. Copy your connection string — it looks like:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/projectpilot?retryWrites=true&w=majority`

## 2. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_atlas_connection_string_here
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Run it:

```bash
npm run dev
```

You should see `MongoDB connected: ...` and `ProjectPilot AI server running on port 5000`.
Visit http://localhost:5000/api/health to confirm.

## 3. Frontend setup

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Edit `.env` if your API runs somewhere other than `http://localhost:5000/api`.

Visit http://localhost:5173 — you'll land on the cinematic Login screen.
Pull the lamp cord, then register a new account to get into the dashboard.

## API overview

| Method | Route                     | Auth   | Description                |
|--------|----------------------------|--------|-----------------------------|
| POST   | /api/auth/register        | Public | Create account              |
| POST   | /api/auth/login           | Public | Login, returns JWT          |
| GET    | /api/auth/me               | Private| Current user                |
| GET    | /api/auth/google, /github, /microsoft | Public | Start OAuth login (full-page redirect) |
| GET    | /api/auth/:provider/callback | Public | OAuth provider redirects back here, then to `/oauth-callback` on the frontend |
| GET/POST | /api/projects            | Private| List / create projects      |
| GET    | /api/projects/:id           | Private| Get one project (detail page) |
| PUT/DELETE | /api/projects/:id       | Private| Update / delete a project   |
| PUT    | /api/projects/:id/archive  | Private| Archive a project           |
| POST   | /api/projects/:id/comments | Private| Add a comment               |
| GET/POST | /api/tasks               | Private| List / create tasks         |
| PUT/DELETE | /api/tasks/:id          | Private| Update (incl. Kanban drag) / delete |
| GET/POST | /api/notes               | Private| List / create notes         |
| PUT/DELETE | /api/notes/:id          | Private| Update (auto-save) / delete |
| GET    | /api/chat/history?project=:id | Private| Chat history (general, or scoped to a project) |
| POST   | /api/chat                  | Private| Send a message; include `projectId` to also auto-generate tasks |
| DELETE | /api/chat/history?project=:id | Private| Clear that thread's history |
| PUT    | /api/users/profile         | Private| Update profile              |
| PUT    | /api/users/password        | Private| Change password             |
| DELETE | /api/users/me              | Private| Delete own account          |
| GET    | /api/users                 | Admin  | List all users (with `online` status) |
| PUT    | /api/users/:id/role         | Admin  | Promote/demote a user's role |
| DELETE | /api/users/:id              | Admin  | Delete any user's account   |
| GET    | /api/users/stats           | Admin  | Platform-wide stats (incl. `onlineNow`) |
| POST/GET | /api/files                | Private| Upload / list files         |
| DELETE | /api/files/:id             | Private| Delete a file               |

## Notes on what's scaffolded vs. stubbed

- **Auth, Projects, Tasks, Notes, Profile, Settings, Files** are fully wired
  end-to-end: real MongoDB models, real routes, real frontend pages calling
  the real API.
- **MASTER AI** (`/chat` in the URL, labeled "MASTER AI" in the sidebar with
  its own custom diamond-mark logo) is a real,
  working WhatsApp/Meta-AI style assistant: type or tap the mic to talk
  (browser Speech-to-Text), get replies from a **local Ollama model** running
  on your own machine (completely free, no API key, no billing, no internet
  needed once the model is downloaded), and optionally have replies read
  back to you (browser Text-to-Speech, toggle with the speaker icon).
  Conversation history is saved per user in MongoDB.

  **Setup:**
  1. Install Ollama from https://ollama.com (Windows/Mac/Linux)
  2. Open a terminal and run: `ollama pull llama3.2` (downloads a small,
     ~2GB model that runs fine on 8GB RAM — first pull takes a few minutes)
  3. Make sure Ollama is running (the installer usually starts it
     automatically as a background service; if not, run `ollama serve` in a
     terminal and leave it open)
  4. That's it — `server/.env` already points at `http://localhost:11434`
     by default, no key needed.

  If your laptop is lower-spec, try an even smaller model like `phi3.5` or
  `gemma2:2b` and set `OLLAMA_MODEL=phi3.5` (etc.) in `server/.env` to match.
  Without Ollama running, every other feature still works; `/chat` just
  shows a friendly "couldn't reach Ollama" message.

  **Multi-language**: MASTER AI auto-detects whatever language you type in
  (Tamil, Tanglish, Hindi, English, etc.) and replies in that same language —
  no setting to toggle, it just follows your message. Quality depends on how
  well the Ollama model you picked handles that language; `llama3.2` handles
  major world languages reasonably, but a small local model won't match a
  large hosted one for less-common languages.

- **Site-wide animation pass**: every authenticated route now transitions
  with a consistent fade/slide (`AppLayout`'s `AnimatePresence`), and a slow-
  drifting ambient gradient backdrop (`AmbientBackground`) sits behind every
  page, public and private. This is a generated gradient/grain effect rather
  than a photo — no external image asset, so nothing to license or swap out.

- **Project detail page** (click any project card → `/projects/:id`) is a
  notepad-style page: title and description auto-save as you type (same
  debounced pattern as Notes), plus status/priority/progress controls and a
  list of that project's tasks.
- **Per-project AI assistant** — a floating chat button (bottom-right of the
  project page) opens a panel scoped to that one project. Describe your idea
  there and the AI proposes 4–8 major tasks, which get created automatically
  on that project's board (parsed from a `TASKS:` block in the model's
  reply — small local models don't reliably output strict JSON, so this
  format is more robust). This chat is separate from the general `/chat`
  history (each project + the general assistant each keep their own thread).
- **Task-completion celebration** — dragging a task into the Completed
  column fires a gold-toned confetti burst (`canvas-confetti`) and a random
  short motivational toast. Purely a frontend touch, no backend involved.
- **Landing page** (`/`) is now public — hero, feature grid, and a scroll-triggered
  "download the app" section (App Store / Google Play badges show a "coming
  soon" toast since there's no real mobile app yet — wiring these up to real
  store links would be misleading before an app actually exists).
- **Admin panel** (`/admin`, visible in the sidebar only to `role: "admin"`
  users) lists every user with a live "online now" indicator (active in the
  last 5 minutes), lets an admin promote/demote roles and delete accounts,
  and shows platform-wide stats. Polls every 30s — no websocket needed for this.
- **Brand mark** — the whole app (sidebar, public nav, Login/Register cards,
  footer, and the splash screen) now uses one consistent logo: an
  overlapping triangle + circle in the gold gradient
  (`components/ui/BrandMark.jsx`), replacing the plain gold square placeholder.
- **Splash screen** — on first load, a full-screen intro plays: the brand
  mark glows and gently pulses/rotates, "PROJECTPILOT" fades in below it,
  a thin gold progress bar sweeps, then it all fades out to reveal the app
  (which has already mounted underneath, so there's no blank flash in
  between). `components/layout/SplashScreen.jsx`, wired once in `App.jsx`.
  OAuth (via Passport.js), not placeholders. Apple was intentionally skipped
  — Sign in with Apple requires a paid ($99/year) Apple Developer Program
  membership before you can even generate the credentials, so there was
  nothing to test yet. The other three are free. Setup below.

### Setting up social login

Each provider needs its own app registration + a client ID/secret pasted
into `server/.env`. Any provider left blank in `.env` is automatically
disabled — its button shows a "not configured yet" message instead of
crashing anything, so you can set these up one at a time or skip them.

**Google:**
1. https://console.cloud.google.com → create a project (or use an existing one)
2. APIs & Services → Credentials → Create Credentials → OAuth client ID
3. Application type: Web application
4. Authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
5. Copy the Client ID and Client Secret into `server/.env`:
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```

**GitHub:**
1. https://github.com/settings/developers → OAuth Apps → New OAuth App
2. Homepage URL: `http://localhost:5173`
3. Authorization callback URL: `http://localhost:5000/api/auth/github/callback`
4. Copy the Client ID, generate a Client Secret, paste both into `server/.env`:
   ```
   GITHUB_CLIENT_ID=...
   GITHUB_CLIENT_SECRET=...
   ```

**Microsoft:**
1. https://portal.azure.com → Microsoft Entra ID → App registrations → New registration
2. Redirect URI: type **Web**, value `http://localhost:5000/api/auth/microsoft/callback`
3. After creating it: Certificates & secrets → New client secret → copy its **value** (not the ID) immediately, it's hidden after you leave the page
4. Copy the Application (client) ID and that secret into `server/.env`:
   ```
   MICROSOFT_CLIENT_ID=...
   MICROSOFT_CLIENT_SECRET=...
   ```

After adding any of these, restart the backend (`npm run dev`). The
matching button on the Login page will then do a real OAuth redirect
instead of showing "not configured."

**How it works under the hood** (stateless, no server-side sessions):
clicking a social button does a full-page redirect to
`/api/auth/<provider>`, which sends the browser to Google/GitHub/Microsoft's
real login page. On success, they redirect back to
`/api/auth/<provider>/callback`; the backend finds-or-creates a `User` (by
provider ID, or by matching email if that address already has an account),
mints a normal JWT, and redirects to `/oauth-callback?token=...` on the
frontend, which stores the token and logs you in exactly like a
password-based login.
- To create your **first admin**, register a normal account, then in
  MongoDB Atlas (Collections → your DB → `users`) edit that document and set
  `role: "admin"` directly. After that, promoting/demoting other users can be
  done from the Admin panel itself.

## Security hardening in this build

- Passwords hashed with bcrypt (10 salt rounds), never returned by the API.
- **Account lockout**: 5 failed logins locks the account for 15 minutes
  (`User.registerFailedLogin` / `isLocked`), resets on a successful login.
- **express-mongo-sanitize** strips `$`/`.` operators from `body`/`params`/`query`
  to block NoSQL injection attempts.
- **hpp** blocks HTTP parameter pollution (`?role=user&role=admin`-style attacks).
- **helmet** for secure HTTP headers, **compression** for gzip responses.
- CORS locked to `CLIENT_URL` — only your frontend origin can call the API.
- Rate limiting: a generous global limit on `/api`, plus a tighter limit
  specifically on `/api/auth` (register/login are the highest-value target).
- Server refuses to boot if `MONGO_URI` or `JWT_SECRET` is missing from `.env`,
  instead of silently running insecurely.
- JWT-protected routes via `middleware/auth.js`; admin routes additionally
  require `role: "admin"` via `adminOnly`.
- `app.set('trust proxy', 1)` so rate limiting and `req.ip` work correctly
  once you deploy behind a reverse proxy / load balancer.

### Before you actually deploy this for real users

- Generate a real `JWT_SECRET` (don't hand-type one) — e.g.
  `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
  and put the output in `.env`.
- Set `NODE_ENV=production` and restrict Atlas Network Access to your
  server's actual IP instead of `0.0.0.0/0`.
- Serve the app over **HTTPS** (e.g. via a reverse proxy like Nginx, or your
  host's built-in TLS) — cookies/tokens over plain HTTP can be intercepted.
- Consider moving the JWT out of `localStorage` into an `httpOnly` cookie if
  you want stronger protection against XSS token theft (current setup favors
  simplicity for local dev).
- Rotate `JWT_SECRET` and force re-login if you ever suspect it leaked.

#   P r o j e c t p i l o t - A I  
 #   P r o j e c t P i l o t - A I  
 