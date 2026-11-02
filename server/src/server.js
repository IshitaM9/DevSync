require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const http = require('http');
const { Server } = require('socket.io');
const { app } = require('./app');
const { connectDatabase } = require('./config/db');

const port = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

io.on('connection', (socket) => {
  socket.on('join-workspace', (workspaceId) => {
    socket.join(workspaceId);
  });

  socket.on('task-update', (payload) => {
    io.to(payload.workspaceId).emit('task-updated', payload);
  });
});

async function startServer() {
  await connectDatabase();
  server.listen(port, () => {
    console.log(`DevSync server running on http://localhost:${port}`);
  });
}

startServer();
module.exports = { io };
