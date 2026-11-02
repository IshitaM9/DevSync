const { verifyToken } = require('../utils/token');
const { store } = require('../data/store');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const payload = verifyToken(token);
    const user = store.users.find((entry) => entry.id === payload.sub);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Account not found' });
    }

    req.user = { ...user, passwordHash: undefined };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function authorize(roles = []) {
  return (req, res, next) => {
    const user = req.user;
    const userRole = req.workspaceRole || user?.role || 'VIEWER';

    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (roles.length && !roles.includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    next();
  };
}

function requireWorkspaceRole(roles = []) {
  return (req, res, next) => {
    const workspaceId = req.params.workspaceId;
    const membership = store.memberships.find(
      (entry) => entry.workspaceId === workspaceId && entry.userId === req.user.id && entry.status === 'ACTIVE'
    );

    if (!membership) {
      return res.status(403).json({ success: false, message: 'You are not a member of this workspace.' });
    }

    req.workspaceRole = membership.role;

    if (roles.length && !roles.includes(membership.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions for this action.' });
    }

    next();
  };
}

module.exports = { authenticate, authorize, requireWorkspaceRole };
