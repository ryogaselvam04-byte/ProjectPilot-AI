const express = require('express');
const passport = require('../config/passport');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const generateToken = require('../utils/generateToken');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// ===== OAuth (Google / GitHub / Microsoft) =====
// Stateless flow: browser hits /api/auth/<provider> -> provider's login page
// -> redirects back to /api/auth/<provider>/callback -> we mint our own JWT
// -> redirect to the frontend with the token in the URL, which the
// OAuthCallback page picks up and stores exactly like a normal login.

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const handleOAuthCallback = (req, res) => {
  // req.user was set by the passport strategy's verify callback
  const token = generateToken(req.user._id);
  res.redirect(`${CLIENT_URL}/oauth-callback?token=${token}`);
};

const oauthNotConfigured = (provider) => (req, res) => {
  res.redirect(
    `${CLIENT_URL}/login?oauthError=${encodeURIComponent(`${provider} login isn't configured on this server yet.`)}`
  );
};

// Google
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${CLIENT_URL}/login` }),
    handleOAuthCallback
  );
} else {
  router.get('/google', oauthNotConfigured('Google'));
}

// GitHub
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
  router.get(
    '/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: `${CLIENT_URL}/login` }),
    handleOAuthCallback
  );
} else {
  router.get('/github', oauthNotConfigured('GitHub'));
}

// Microsoft
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  router.get('/microsoft', passport.authenticate('microsoft', { scope: ['user.read'], session: false }));
  router.get(
    '/microsoft/callback',
    passport.authenticate('microsoft', { session: false, failureRedirect: `${CLIENT_URL}/login` }),
    handleOAuthCallback
  );
} else {
  router.get('/microsoft', oauthNotConfigured('Microsoft'));
}

module.exports = router;
