
const express = require('express');
const ChatbotController = require('../controllers/ChatbotController');


const router = express.Router();

router.post('/', ChatbotController.simpleChat);
router.post('/product/:productId', ChatbotController.askProductQuestionController);


module.exports = router;
