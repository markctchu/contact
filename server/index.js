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
  }
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
  console.log('User connected:', socket.id);

  socket.on(EVENTS.GET_ROOMS, () => {
    socket.emit(EVENTS.ROOMS_LIST, roomManager.getAllRooms());
  });

  socket.on(EVENTS.CREATE_ROOM, ({ name, username }) => {
    const room = roomManager.createRoom(name, socket.id, username);
    socket.data.username = username;
    socket.data.roomId = room.id;
    socket.join(room.id);
    io.emit(EVENTS.ROOMS_LIST, roomManager.getAllRooms());
  });

  socket.on(EVENTS.JOIN_ROOM, ({ roomId, username }) => {
    const room = roomManager.joinRoom(roomId, socket.id, username);
    if (room) {
      socket.data.username = username;
      socket.data.roomId = roomId;
      socket.join(roomId);
      roomManager.emitRoomUpdate(io, room);
      io.emit(EVENTS.ROOMS_LIST, roomManager.getAllRooms());
    } else {
      socket.emit(EVENTS.ERROR, 'Room not found');
    }
  });

  socket.on(EVENTS.BECOME_WORDMASTER, () => {
    const { roomId } = socket.data;
    if (roomId) roomManager.setWordmaster(io, roomId, socket.id);
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

  socket.on('disconnecting', () => {
    const { roomId } = socket.data;
    if (roomId) {
      roomManager.leaveRoom(io, roomId, socket.id);
      io.emit(EVENTS.ROOMS_LIST, roomManager.getAllRooms());
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Catch-all to serve index.html for SPA routing
app.get('(.*)', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
