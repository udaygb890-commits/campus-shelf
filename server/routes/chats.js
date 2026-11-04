const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getChats,
  createOrGetChat,
  getMessages,
  sendMessage,
} = require('../controllers/chatController');

const router = express.Router();

router.get('/', protect, getChats);
router.post('/', protect, createOrGetChat);
router.get('/:id/messages', protect, getMessages);
router.post('/:id/messages', protect, sendMessage);

module.exports = router;

