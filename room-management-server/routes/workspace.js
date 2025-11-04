// routes/workspace.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const workspaceController = require('../controllers/workspaceController');


module.exports = router;