const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      // Only required for accounts that signed up with email/password -
      // OAuth users (Google/GitHub/Microsoft) never set one.
      required: function () {
        return !this.googleId && !this.githubId && !this.microsoftId;
      },
      minlength: 6,
      select: false,
    },
    googleId: { type: String, select: false },
    githubId: { type: String, select: false },
    microsoftId: { type: String, select: false },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    skills: [{ type: String }],
    experience: { type: String, default: '' },
    socialLinks: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    darkMode: { type: Boolean, default: true },

    // ===== Activity tracking (drives "online now" in Admin panel) =====
    lastActiveAt: { type: Date, default: Date.now },

    // ===== Brute-force protection =====
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
  },
  { timestamps: true }
);

// True while the account is temporarily locked out from failed logins
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

// Call after a wrong password - locks the account for LOCK_TIME_MS after 5 tries
userSchema.methods.registerFailedLogin = async function () {
  this.loginAttempts += 1;
  if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
    this.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
  }
  await this.save();
};

// Call after a successful login - clears any lockout state
userSchema.methods.registerSuccessfulLogin = async function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  this.lastActiveAt = new Date();
  await this.save();
};

module.exports = mongoose.model('User', userSchema);
