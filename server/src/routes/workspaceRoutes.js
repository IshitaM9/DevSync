const express = require('express');
const { listWorkspaces, createWorkspace, getWorkspace, getWorkspaceAnalytics, inviteMember, updateMemberRole } = require('../controllers/workspaceController');
const { authenticate, requireWorkspaceRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.get('/', listWorkspaces);
router.post('/', createWorkspace);
router.get('/:workspaceId', requireWorkspaceRole(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']), getWorkspace);
router.get('/:workspaceId/analytics', requireWorkspaceRole(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']), getWorkspaceAnalytics);
router.post('/:workspaceId/invite', requireWorkspaceRole(['OWNER', 'ADMIN']), inviteMember);
router.patch('/:workspaceId/members/:memberId', requireWorkspaceRole(['OWNER', 'ADMIN']), updateMemberRole);

module.exports = router;
