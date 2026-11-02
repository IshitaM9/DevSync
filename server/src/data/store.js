const bcrypt = require('bcryptjs');

const store = {
  users: [],
  workspaces: [],
  memberships: [],
  projects: [],
  tasks: [],
  notifications: [],
  resetTokens: new Map(),
  invites: []
};

function seedStore() {
  const demoHash = bcrypt.hashSync('Demo123!', 10);
  const nishaHash = bcrypt.hashSync('Nisha123!', 10);

  store.users = [
    {
      id: 'user_demo',
      name: 'Aarav Sharma',
      email: 'demo@devsync.app',
      passwordHash: demoHash,
      avatar: 'AS',
      role: 'USER',
      createdAt: new Date().toISOString()
    },
    {
      id: 'user_nisha',
      name: 'Nisha Rao',
      email: 'nisha@devsync.app',
      passwordHash: nishaHash,
      avatar: 'NR',
      role: 'USER',
      createdAt: new Date().toISOString()
    },
    {
      id: 'user_chetan',
      name: 'Chetan Malhotra',
      email: 'chetan@devsync.app',
      passwordHash: bcrypt.hashSync('Chetan123!', 10),
      avatar: 'CM',
      role: 'USER',
      createdAt: new Date().toISOString()
    }
  ];

  store.workspaces = [
    {
      id: 'ws_1',
      name: 'LaunchPad Studio',
      description: 'Product design and engineering workspace for the current sprint.',
      ownerId: 'user_demo',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    },
    {
      id: 'ws_2',
      name: 'Campus Connect',
      description: 'Student community and hackathon coordination.',
      ownerId: 'user_nisha',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    }
  ];

  store.memberships = [
    { id: 'wm_1', workspaceId: 'ws_1', userId: 'user_demo', role: 'OWNER', status: 'ACTIVE', joinedAt: new Date().toISOString() },
    { id: 'wm_2', workspaceId: 'ws_1', userId: 'user_nisha', role: 'ADMIN', status: 'ACTIVE', joinedAt: new Date().toISOString() },
    { id: 'wm_3', workspaceId: 'ws_1', userId: 'user_chetan', role: 'MEMBER', status: 'ACTIVE', joinedAt: new Date().toISOString() },
    { id: 'wm_4', workspaceId: 'ws_2', userId: 'user_nisha', role: 'OWNER', status: 'ACTIVE', joinedAt: new Date().toISOString() },
    { id: 'wm_5', workspaceId: 'ws_2', userId: 'user_demo', role: 'MEMBER', status: 'ACTIVE', joinedAt: new Date().toISOString() }
  ];

  store.projects = [
    {
      id: 'project_1',
      workspaceId: 'ws_1',
      name: 'Client Portal',
      description: 'Build the customer-facing project dashboard and onboarding flow.',
      status: 'ACTIVE',
      ownerId: 'user_demo',
      createdAt: new Date().toISOString()
    },
    {
      id: 'project_2',
      workspaceId: 'ws_1',
      name: 'Marketing Ops',
      description: 'Campaign planning and content scheduling automation.',
      status: 'ACTIVE',
      ownerId: 'user_nisha',
      createdAt: new Date().toISOString()
    }
  ];

  store.tasks = [
    {
      id: 'task_1',
      projectId: 'project_1',
      workspaceId: 'ws_1',
      title: 'Finalize onboarding checklist',
      description: 'Review required steps for new user activation and automation triggers.',
      status: 'TODO',
      priority: 'HIGH',
      assigneeId: 'user_demo',
      reporterId: 'user_nisha',
      dueDate: '2026-11-10',
      createdAt: new Date().toISOString()
    },
    {
      id: 'task_2',
      projectId: 'project_1',
      workspaceId: 'ws_1',
      title: 'Implement activity feed',
      description: 'Ship recent changes card and activity timeline on the dashboard.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      assigneeId: 'user_nisha',
      reporterId: 'user_demo',
      dueDate: '2026-11-12',
      createdAt: new Date().toISOString()
    },
    {
      id: 'task_3',
      projectId: 'project_2',
      workspaceId: 'ws_1',
      title: 'Prepare launch campaign',
      description: 'Build asset checklist and source copy for the launch mailer.',
      status: 'DONE',
      priority: 'LOW',
      assigneeId: 'user_chetan',
      reporterId: 'user_demo',
      dueDate: '2026-11-04',
      createdAt: new Date().toISOString()
    }
  ];

  store.notifications = [
    {
      id: 'n_1',
      userId: 'user_demo',
      workspaceId: 'ws_1',
      message: 'Nisha assigned you to the activity feed task.',
      type: 'task',
      seen: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'n_2',
      userId: 'user_nisha',
      workspaceId: 'ws_1',
      message: 'A new project was created in LaunchPad Studio.',
      type: 'project',
      seen: false,
      createdAt: new Date().toISOString()
    }
  ];
}

seedStore();

module.exports = { store };
