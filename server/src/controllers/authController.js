const bcrypt = require('bcryptjs');
const { store } = require('../data/store');
const { signAccessToken, signRefreshToken } = require('../utils/token');

function generateUserPayload(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: '/'
  });
}

function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
  }

  const existingUser = store.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'This email is already registered.' });
  }

  const user = {
    id: `user_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 10),
    avatar: (name || 'U').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase(),
    role: 'USER',
    createdAt: new Date().toISOString()
  };

  store.users.push(user);

  const accessToken = signAccessToken({ sub: user.id });
  const refreshToken = signRefreshToken({ sub: user.id });
  setRefreshCookie(res, refreshToken);

  return res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    user: generateUserPayload(user),
    token: accessToken
  });
}

function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const user = store.users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const accessToken = signAccessToken({ sub: user.id });
  const refreshToken = signRefreshToken({ sub: user.id });
  setRefreshCookie(res, refreshToken);

  return res.json({
    success: true,
    message: 'Signed in successfully.',
    user: generateUserPayload(user),
    token: accessToken
  });
}

function me(req, res) {
  return res.json({ success: true, user: req.user });
}

function logout(req, res) {
  res.clearCookie('refreshToken', { path: '/' });
  return res.json({ success: true, message: 'Logged out successfully.' });
}

function logoutAll(req, res) {
  res.clearCookie('refreshToken', { path: '/' });
  return res.json({ success: true, message: 'All sessions have been ended.' });
}

function forgotPassword(req, res) {
  const { email } = req.body;
  const user = store.users.find((entry) => entry.email.toLowerCase() === String(email).toLowerCase());

  if (!user) {
    return res.status(404).json({ success: false, message: 'No account found for that email.' });
  }

  const token = `reset_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  store.resetTokens.set(token, user.id);

  return res.json({
    success: true,
    message: 'Password reset instructions have been sent.',
    token
  });
}

function resetPassword(req, res) {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ success: false, message: 'Reset token and password are required.' });
  }

  const userId = store.resetTokens.get(token);
  if (!userId) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
  }

  const user = store.users.find((entry) => entry.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  user.passwordHash = bcrypt.hashSync(password, 10);
  store.resetTokens.delete(token);

  return res.json({ success: true, message: 'Password reset successfully.' });
}

module.exports = { register, login, me, logout, logoutAll, forgotPassword, resetPassword };
