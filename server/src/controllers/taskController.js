const { store } = require('../data/store');

function listTasks(req, res) {
  const { projectId } = req.query;
  const tasks = store.tasks.filter((task) => task.projectId === projectId);
  res.json({ success: true, tasks });
}

function createTask(req, res) {
  const { projectId, title, description, priority, status, assigneeId } = req.body;

  if (!projectId || !title) {
    return res.status(400).json({ success: false, message: 'Project ID and title are required.' });
  }

  const project = store.projects.find((entry) => entry.id === projectId);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  const hasAccess = store.memberships.some(
    (member) => member.userId === req.user.id && member.workspaceId === project.workspaceId && member.status === 'ACTIVE'
  );

  if (!hasAccess) {
    return res.status(403).json({ success: false, message: 'You do not have access to this workspace.' });
  }

  const task = {
    id: `task_${Date.now()}`,
    projectId,
    workspaceId: project.workspaceId,
    title,
    description: description || '',
    priority: priority || 'MEDIUM',
    status: status || 'TODO',
    assigneeId: assigneeId || req.user.id,
    reporterId: req.user.id,
    dueDate: req.body.dueDate || null,
    createdAt: new Date().toISOString()
  };

  store.tasks.push(task);
  store.notifications.push({
    id: `n_${Date.now()}`,
    userId: req.user.id,
    workspaceId: project.workspaceId,
    message: `A task named ${title} was created.`,
    type: 'task',
    seen: false,
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ success: true, task });
}

function updateTask(req, res) {
  const task = store.tasks.find((entry) => entry.id === req.params.taskId);
  if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

  const hasAccess = store.memberships.some(
    (member) => member.userId === req.user.id && member.workspaceId === task.workspaceId && member.status === 'ACTIVE'
  );

  if (!hasAccess) {
    return res.status(403).json({ success: false, message: 'You do not have access to this workspace.' });
  }

  Object.assign(task, { ...req.body, updatedAt: new Date().toISOString() });
  res.json({ success: true, task });
}

function deleteTask(req, res) {
  const taskIndex = store.tasks.findIndex((entry) => entry.id === req.params.taskId);
  if (taskIndex === -1) return res.status(404).json({ success: false, message: 'Task not found.' });

  const task = store.tasks[taskIndex];
  const hasAccess = store.memberships.some(
    (member) => member.userId === req.user.id && member.workspaceId === task.workspaceId && member.status === 'ACTIVE'
  );

  if (!hasAccess) {
    return res.status(403).json({ success: false, message: 'You do not have access to this workspace.' });
  }

  store.tasks.splice(taskIndex, 1);
  res.json({ success: true, message: 'Task deleted.' });
}

module.exports = { listTasks, createTask, updateTask, deleteTask };
