require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const transactionRoutes = require('./routes/transactions');
const chatRoutes = require('./routes/chats');

// Connect to database
connectDB();

const app = express();
const httpServer = http.createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Make io accessible in routes/controllers
app.set('io', io);

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/chats', chatRoutes);

// Health check
app.get('/api/v1/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Socket.io Real-time Chat ─────────────────────────────────────────────────
const onlineUsers = new Map(); // userId → socketId

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // User comes online
  socket.on('user:online', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.join(`user:${userId}`);
    io.emit('users:online', Array.from(onlineUsers.keys()));
    console.log(`✅ User ${userId} online`);
  });

  // Join a chat room
  socket.on('chat:join', (chatId) => {
    socket.join(`chat:${chatId}`);
    console.log(`💬 Socket ${socket.id} joined chat ${chatId}`);
  });

  // Leave a chat room
  socket.on('chat:leave', (chatId) => {
    socket.leave(`chat:${chatId}`);
  });

  // Send a message (real-time broadcast)
  socket.on('chat:message', (data) => {
    // data: { chatId, message }
    socket.to(`chat:${data.chatId}`).emit('chat:message', data.message);
  });

  // Typing indicator
  socket.on('chat:typing', (data) => {
    // data: { chatId, userId, isTyping }
    socket.to(`chat:${data.chatId}`).emit('chat:typing', data);
  });

  // Disconnect
  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('users:online', Array.from(onlineUsers.keys()));
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Campus Shelf server running on http://localhost:${PORT}`);
});

