import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ui/ProtectedRoute.jsx';
import AdminRoute from './components/ui/AdminRoute.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import AmbientBackground from './components/layout/AmbientBackground.jsx';
import SplashScreen from './components/layout/SplashScreen.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import OAuthCallback from './pages/OAuthCallback.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Projects from './pages/Projects.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import Tasks from './pages/Tasks.jsx';
import Notes from './pages/Notes.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import Admin from './pages/Admin.jsx';
import Chat from './pages/Chat.jsx';

function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      <AmbientBackground />
      {/* App content mounts immediately underneath the splash - no blank flash */}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />

        {/* Private routes - share the sidebar/navbar layout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
        </Route>
      </Routes>

      {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}
    </>
  );
}

export default App;
