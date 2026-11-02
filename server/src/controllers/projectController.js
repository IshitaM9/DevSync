const { store } = require('../data/store');

function listProjects(req, res) {
  const workspaceId = req.query.workspaceId;
  const projects = store.projects.filter((project) => project.workspaceId === workspaceId);
  res.json({ success: true, projects });
}

function createProject(req, res) {
  const { workspaceId, name, description } = req.body;

  if (!workspaceId || !name) {
    return res.status(400).json({ success: false, message: 'Workspace ID and project name are required.' });
  }

  const hasAccess = store.memberships.some(
    (member) => member.userId === req.user.id && member.workspaceId === workspaceId && member.status === 'ACTIVE'
  );

  if (!hasAccess) {
    return res.status(403).json({ success: false, message: 'You do not have access to this workspace.' });
  }

  const project = {
    id: `project_${Date.now()}`,
    workspaceId,
    name,
    description: description || '',
    status: 'ACTIVE',
    ownerId: req.user.id,
    createdAt: new Date().toISOString()
  };

  store.projects.push(project);
  store.notifications.push({
    id: `n_${Date.now()}`,
    userId: req.user.id,
    workspaceId,
    message: `A new project called ${name} was created.`,
    type: 'project',
    seen: false,
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ success: true, project });
}

function updateProject(req, res) {
  const project = store.projects.find((entry) => entry.id === req.params.projectId);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

  const hasAccess = store.memberships.some(
    (member) => member.userId === req.user.id && member.workspaceId === project.workspaceId && member.status === 'ACTIVE'
  );

  if (!hasAccess) {
    return res.status(403).json({ success: false, message: 'You do not have access to this workspace.' });
  }

  Object.assign(project, { ...req.body, updatedAt: new Date().toISOString() });
  res.json({ success: true, project });
}

module.exports = { listProjects, createProject, updateProject };
