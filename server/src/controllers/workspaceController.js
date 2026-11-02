const { store } = require('../data/store');

function canAccessWorkspace(userId, workspaceId) {
  return store.memberships.some(
    (member) => member.userId === userId && member.workspaceId === workspaceId && member.status === 'ACTIVE'
  );
}

function listWorkspaces(req, res) {
  const memberships = store.memberships.filter((entry) => entry.userId === req.user.id && entry.status === 'ACTIVE');
  const workspaceIds = memberships.map((entry) => entry.workspaceId);
  const workspaces = store.workspaces.filter((workspace) => workspaceIds.includes(workspace.id));

  res.json({ success: true, workspaces });
}

function createWorkspace(req, res) {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Workspace name is required.' });
  }

  const workspace = {
    id: `ws_${Date.now()}`,
    name,
    description: description || '',
    ownerId: req.user.id,
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  };

  store.workspaces.push(workspace);
  store.memberships.push({
    id: `wm_${Date.now()}`,
    workspaceId: workspace.id,
    userId: req.user.id,
    role: 'OWNER',
    status: 'ACTIVE',
    joinedAt: new Date().toISOString()
  });

  res.status(201).json({ success: true, workspace });
}

function getWorkspace(req, res) {
  const workspace = store.workspaces.find((entry) => entry.id === req.params.workspaceId);
  if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found.' });

  if (!canAccessWorkspace(req.user.id, workspace.id)) {
    return res.status(403).json({ success: false, message: 'You do not have access to this workspace.' });
  }

  const members = store.memberships.filter((member) => member.workspaceId === workspace.id && member.status === 'ACTIVE')
    .map((member) => {
      const user = store.users.find((entry) => entry.id === member.userId);
      return { ...member, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } };
    });

  const projects = store.projects.filter((project) => project.workspaceId === workspace.id);

  return res.json({ success: true, workspace, members, projects });
}

function getWorkspaceAnalytics(req, res) {
  const workspaceId = req.params.workspaceId;
  const workspace = store.workspaces.find((entry) => entry.id === workspaceId);

  if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found.' });
  if (!canAccessWorkspace(req.user.id, workspaceId)) {
    return res.status(403).json({ success: false, message: 'You do not have access to this workspace.' });
  }

  const workspaceTasks = store.tasks.filter((task) => task.workspaceId === workspaceId);
  const distribution = {
    TODO: workspaceTasks.filter((task) => task.status === 'TODO').length,
    IN_PROGRESS: workspaceTasks.filter((task) => task.status === 'IN_PROGRESS').length,
    DONE: workspaceTasks.filter((task) => task.status === 'DONE').length
  };

  const analytics = {
    totalProjects: store.projects.filter((project) => project.workspaceId === workspaceId).length,
    totalMembers: store.memberships.filter((member) => member.workspaceId === workspaceId && member.status === 'ACTIVE').length,
    tasksCompleted: distribution.DONE,
    tasksInProgress: distribution.IN_PROGRESS,
    distribution
  };

  return res.json({ success: true, analytics });
}

function inviteMember(req, res) {
  const { email, role } = req.body;
  const user = store.users.find((entry) => entry.email.toLowerCase() === String(email).toLowerCase());

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const workspaceId = req.params.workspaceId;
  if (!canAccessWorkspace(req.user.id, workspaceId)) {
    return res.status(403).json({ success: false, message: 'You do not have access to this workspace.' });
  }

  const invitation = {
    id: `invite_${Date.now()}`,
    workspaceId,
    userId: user.id,
    invitedBy: req.user.id,
    role: role || 'MEMBER',
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };

  store.invites.push(invitation);
  store.notifications.push({
    id: `n_${Date.now()}`,
    userId: user.id,
    workspaceId,
    message: `You were invited to join ${store.workspaces.find((entry) => entry.id === workspaceId)?.name || 'a workspace'}.`,
    type: 'workspace',
    seen: false,
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ success: true, invitation });
}

function updateMemberRole(req, res) {
  const membership = store.memberships.find((entry) => entry.id === req.params.memberId);
  if (!membership) return res.status(404).json({ success: false, message: 'Member not found.' });

  membership.role = req.body.role || membership.role;
  res.json({ success: true, membership });
}

module.exports = { listWorkspaces, createWorkspace, getWorkspace, getWorkspaceAnalytics, inviteMember, updateMemberRole };
