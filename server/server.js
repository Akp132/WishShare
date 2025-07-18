require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth');
const wishlistRoutes = require('./routes/wishlists');
const itemRoutes = require('./routes/items');

const app = express();
const server = http.createServer(app);

// Trust proxy for Render deployment
app.set('trust proxy', 1);

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://wish-share.vercel.app',
      'https://wish-share-i9lipqggz-akshays-projects-7b746b9a.vercel.app',
      process.env.CLIENT_URL
    ],
    methods: ["GET", "POST"]
  }
});

// Make io accessible to routes
app.set('socketio', io);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://wish-share.vercel.app',
    'https://wish-share-i9lipqggz-akshays-projects-7b746b9a.vercel.app',
    process.env.CLIENT_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/wishlist-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Add debug logging for requests
app.use('/api', (req, res, next) => {
  console.log(`📝 API Request: ${req.method} ${req.originalUrl}`);
  console.log(`📍 Origin: ${req.headers.origin}`);
  next();
});

// Routes
console.log('🔗 Setting up routes...');
app.use('/api/auth', authRoutes);
app.use('/api/wishlists', wishlistRoutes);
app.use('/api/wishlists', itemRoutes);
console.log('✅ Routes setup complete');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test auth endpoint
app.get('/api/auth/test', (req, res) => {
  res.json({
    message: 'Auth routes working!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Join wishlist room
  socket.on('join_wishlist', (wishlistId) => {
    socket.join(`wishlist_${wishlistId}`);
    console.log(`🚀 User ${socket.id} joined wishlist room: ${wishlistId}`);
  });

  // Leave wishlist room
  socket.on('leave_wishlist', (wishlistId) => {
    socket.leave(`wishlist_${wishlistId}`);
    console.log(`👋 User ${socket.id} left wishlist room: ${wishlistId}`);
  });

  // Handle typing indicator for comments
  socket.on('typing_comment', (data) => {
    console.log('⌨️ User typing comment:', data);
    socket.to(`wishlist_${data.wishlistId}`).emit('user_typing_comment', {
      itemId: data.itemId,
      userId: data.userId,
      isTyping: data.isTyping
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for real-time connections`);
});