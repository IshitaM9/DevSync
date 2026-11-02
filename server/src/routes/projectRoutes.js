const express = require('express');
const { listProjects, createProject, updateProject } = require('../controllers/projectController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.get('/', listProjects);
router.post('/', createProject);
router.patch('/:projectId', updateProject);

module.exports = router;
