require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { ElizaAgent } = require('./agents/elizaAgent');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Eliza agent
const elizaAgent = new ElizaAgent();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('chat_message', async (data) => {
    try {
      const response = await elizaAgent.processQuery(data.message);
      socket.emit('bot_response', { message: response });
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('bot_response', { 
        message: 'I apologize, but I encountered an error while processing your request. Please try again.' 
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// API endpoints
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await elizaAgent.processQuery(message);
    res.json({ response });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 