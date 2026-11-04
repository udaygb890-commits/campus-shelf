const asyncHandler = require('express-async-handler');
const Chat = require('../models/Chat');

// @desc  Get all chats for current user
// @route GET /api/v1/chats
// @access Private
const getChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ participants: req.user._id })
    .populate('participants', 'name avatarUrl isVerified')
    .populate('listing', 'title images price status')
    .sort({ lastMessageAt: -1 });

  res.json({ success: true, data: chats });
});

// @desc  Create or get existing chat
// @route POST /api/v1/chats
// @access Private
const createOrGetChat = asyncHandler(async (req, res) => {
  const { listingId, recipientId } = req.body;

  // Check if chat already exists for this listing between these users
  let chat = await Chat.findOne({
    listing: listingId,
    participants: { $all: [req.user._id, recipientId] },
  })
    .populate('participants', 'name avatarUrl isVerified')
    .populate('listing', 'title images price status');

  if (!chat) {
    chat = await Chat.create({
      participants: [req.user._id, recipientId],
      listing: listingId,
    });
    await chat.populate('participants', 'name avatarUrl isVerified');
    await chat.populate('listing', 'title images price status');
  }

  res.json({ success: true, data: chat });
});

// @desc  Get messages for a chat
// @route GET /api/v1/chats/:id/messages
// @access Private
const getMessages = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id).populate('messages.sender', 'name avatarUrl');

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  if (!chat.participants.some((p) => p.toString() === req.user._id.toString())) {
    res.status(403);
    throw new Error('Not a participant of this chat');
  }

  res.json({ success: true, data: chat.messages });
});

// @desc  Send a message in a chat
// @route POST /api/v1/chats/:id/messages
// @access Private
const sendMessage = asyncHandler(async (req, res) => {
  const { text, offerAmount } = req.body;
  const chat = await Chat.findById(req.params.id);

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  if (!chat.participants.some((p) => p.toString() === req.user._id.toString())) {
    res.status(403);
    throw new Error('Not a participant of this chat');
  }

  const message = { sender: req.user._id, text, offerAmount: offerAmount || null };
  chat.messages.push(message);
  chat.lastMessage = text;
  chat.lastMessageAt = new Date();
  await chat.save();

  const newMessage = chat.messages[chat.messages.length - 1];
  res.status(201).json({ success: true, data: newMessage });
});

module.exports = { getChats, createOrGetChat, getMessages, sendMessage };

