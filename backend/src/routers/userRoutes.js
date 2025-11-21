const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/userAuthMiddleware');

router.get('/profile', authMiddleware, userController.getUserProfileByJwt);

module.exports = router;
