const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const roomManager = require('./roomManager');
const { EVENTS } = require('./constants');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000, // 60 seconds
  pingInterval: 25000 // 25 seconds
});

const PORT = process.env.PORT || 3001;

// Serve static files from the React app
const distPath = path.resolve(__dirname, '..', 'client', 'dist');
app.use(express.static(distPath));

// Global interval for game ticks (countdowns)
setInterval(() => {
  roomManager.tick(io);
}, 1000);

io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.id} from ${socket.handshake.address} [Transport: ${socket.conn.transport.name}]`);

  socket.conn.on('upgrade', (transport) => {
    console.log(`[Socket] Transport upgraded to ${transport.name} for ${socket.id}`);
  });

  socket.on(EVENTS.GET_ROOMS, () => {
    socket.emit(EVENTS.ROOMS_LIST, roomManager.getAllRooms());
  });

  socket.on(EVENTS.CREATE_ROOM, ({ name, username }) => {
    console.log(`[Room] User ${username} (${socket.id}) creating room: ${name}`);
    const room = roomManager.createRoom(name, socket.id, username);
    socket.data.username = username;
    socket.data.roomId = room.id;
    socket.join(room.id);
    roomManager.emitRoomUpdate(io, room);
    io.emit(EVENTS.ROOMS_LIST, roomManager.getAllRooms());
  });

  socket.on(EVENTS.JOIN_ROOM, ({ roomId, username }) => {
    console.log(`[Room] User ${username} (${socket.id}) joining room: ${roomId}`);
    const room = roomManager.joinRoom(roomId, socket.id, username);
    if (room) {
      socket.data.username = username;
      socket.data.roomId = roomId;
      socket.join(roomId);
      roomManager.emitRoomUpdate(io, room);
      io.emit(EVENTS.ROOMS_LIST, roomManager.getAllRooms());
    } else {
      console.warn(`[Room] Join failed: Room ${roomId} not found for user ${username}`);
      socket.emit(EVENTS.ERROR, 'Room not found');
    }
  });

  socket.on(EVENTS.BECOME_WORDMASTER, () => {
    const { roomId } = socket.data;
    if (roomId) {
      console.log(`[Game] User ${socket.data.username} becoming wordmaster in room ${roomId}`);
      roomManager.setWordmaster(io, roomId, socket.id);
    }
  });

  socket.on(EVENTS.SET_SECRET_WORD, ({ word }) => {
    const { roomId } = socket.data;
    if (roomId) roomManager.setSecretWord(io, roomId, socket.id, word);
  });

  socket.on(EVENTS.SUBMIT_CLUE_WORD, ({ word }) => {
    const { roomId } = socket.data;
    if (roomId) roomManager.submitClue(io, roomId, socket.id, word);
  });

  socket.on(EVENTS.SUBMIT_CLUE_HINT, ({ hint }) => {
    const { roomId } = socket.data;
    if (roomId) roomManager.submitHint(io, roomId, socket.id, hint);
  });

  socket.on(EVENTS.CALL_CONTACT, ({ guess }) => {
    const { roomId } = socket.data;
    if (roomId) roomManager.callContact(io, roomId, socket.id, guess);
  });

  socket.on(EVENTS.DENY_CLUE, ({ guess }) => {
    const { roomId } = socket.data;
    if (roomId) roomManager.denyClue(io, roomId, socket.id, guess);
  });

  socket.on(EVENTS.DECLARE_VICTORY, () => {
    const { roomId } = socket.data;
    if (roomId) roomManager.declareVictory(io, roomId, socket.id);
  });

  socket.on(EVENTS.CONTEST_VICTORY, () => {
    const { roomId } = socket.data;
    if (roomId) roomManager.contestVictory(io, roomId, socket.id);
  });

  socket.on(EVENTS.CANCEL_ACTION, () => {
    const { roomId } = socket.data;
    if (roomId) roomManager.cancelAction(io, roomId, socket.id);
  });

  socket.on(EVENTS.TYPING_STATUS, ({ intent }) => {
    const { roomId } = socket.data;
    if (roomId) roomManager.setTypingStatus(io, roomId, socket.id, intent);
  });

  socket.on(EVENTS.CHAT_MESSAGE, ({ message }) => {
    const { roomId, username } = socket.data;
    if (roomId && username) {
      const room = roomManager.getRoom(roomId);
      if (room) {
        room.chat.push({ username, message, timestamp: Date.now() });
        io.to(roomId).emit(EVENTS.CHAT_UPDATE, room.chat);
      }
    }
  });

  socket.on('disconnecting', (reason) => {
    const { roomId, username } = socket.data;
    console.log(`[Socket] User ${username || 'Unknown'} (${socket.id}) disconnecting. Reason: ${reason}`);
    if (roomId) {
      roomManager.leaveRoom(io, roomId, socket.id);
      io.emit(EVENTS.ROOMS_LIST, roomManager.getAllRooms());
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`[Socket] User disconnected: ${socket.id}. Reason: ${reason}`);
  });
});

// Catch-all to serve index.html for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
