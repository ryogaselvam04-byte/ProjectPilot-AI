const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const User = require('../models/User');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

// Shared logic for all three providers: find an existing user by their
// provider id, otherwise link/create one by email, otherwise create fresh.
// `idField` is which User field stores this provider's id (e.g. "googleId").
const findOrCreateOAuthUser = async ({ idField, providerId, name, email, avatar }) => {
  let user = await User.findOne({ [idField]: providerId });
  if (user) return user;

  if (email) {
    user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      user[idField] = providerId;
      if (!user.avatar && avatar) user.avatar = avatar;
      await user.save();
      return user;
    }
  }

  user = await User.create({
    name: name || 'New user',
    email: email ? email.toLowerCase() : `${idField}-${providerId}@no-email.projectpilot`,
    avatar: avatar || '',
    [idField]: providerId,
  });
  return user;
};

// Only register a strategy if its credentials are actually configured -
// keeps the server booting cleanly even if you've only set up some providers.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${SERVER_URL}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateOAuthUser({
            idField: 'googleId',
            providerId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
            avatar: profile.photos?.[0]?.value,
          });
          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${SERVER_URL}/api/auth/github/callback`,
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateOAuthUser({
            idField: 'githubId',
            providerId: profile.id,
            name: profile.displayName || profile.username,
            email: profile.emails?.[0]?.value,
            avatar: profile.photos?.[0]?.value,
          });
          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );
}

if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  passport.use(
    new MicrosoftStrategy(
      {
        clientID: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        callbackURL: `${SERVER_URL}/api/auth/microsoft/callback`,
        scope: ['user.read'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateOAuthUser({
            idField: 'microsoftId',
            providerId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value || profile._json?.mail || profile._json?.userPrincipalName,
            avatar: '',
          });
          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );
}

module.exports = passport;
