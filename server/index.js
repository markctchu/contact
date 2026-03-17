const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const roomManager = require('./roomManager');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Global interval for game ticks (countdowns)
setInterval(() => {
  roomManager.tick(io);
}, 1000);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('get_rooms', () => {
    socket.emit('rooms_list', roomManager.getAllRooms());
  });

  socket.on('create_room', ({ name, username }) => {
    const room = roomManager.createRoom(name, socket.id, username);
    socket.join(room.id);
    roomManager.emitRoomUpdate(io, room);
    io.emit('rooms_list', roomManager.getAllRooms());
  });

  socket.on('join_room', ({ roomId, username }) => {
    const room = roomManager.joinRoom(roomId, socket.id, username);
    if (room) {
      socket.join(room.id);
      roomManager.emitRoomUpdate(io, room);
      io.emit('rooms_list', roomManager.getAllRooms());
    } else {
      socket.emit('error', 'Room not found');
    }
  });

  socket.on('become_wordmaster', ({ roomId }) => {
    if (roomManager.setWordmaster(io, roomId, socket.id)) {
      const room = roomManager.getRoom(roomId);
      roomManager.emitRoomUpdate(io, room);
    }
  });

  socket.on('set_secret_word', ({ roomId, word }) => {
    if (roomManager.setSecretWord(io, roomId, socket.id, word)) {
      const room = roomManager.getRoom(roomId);
      roomManager.emitRoomUpdate(io, room);
    }
  });

  socket.on('submit_clue_word', ({ roomId, word }) => {
    if (roomManager.submitClue(io, roomId, socket.id, word)) {
      const room = roomManager.getRoom(roomId);
      roomManager.emitRoomUpdate(io, room);
    }
  });

  socket.on('submit_clue_hint', ({ roomId, hint }) => {
    if (roomManager.submitHint(io, roomId, socket.id, hint)) {
      const room = roomManager.getRoom(roomId);
      roomManager.emitRoomUpdate(io, room);
    }
  });

  socket.on('call_contact', ({ roomId, guess }) => {
    if (roomManager.callContact(io, roomId, socket.id, guess)) {
      const room = roomManager.getRoom(roomId);
      roomManager.emitRoomUpdate(io, room);
    }
  });

  socket.on('deny_clue', ({ roomId, guess }) => {
    if (roomManager.denyClue(io, roomId, socket.id, guess)) {
      const room = roomManager.getRoom(roomId);
      roomManager.emitRoomUpdate(io, room);
    }
  });

  socket.on('declare_victory', ({ roomId }) => {
    if (roomManager.declareVictory(io, roomId, socket.id)) {
      const room = roomManager.getRoom(roomId);
      roomManager.emitRoomUpdate(io, room);
    }
  });

  socket.on('contest_victory', ({ roomId }) => {
    if (roomManager.contestVictory(io, roomId, socket.id)) {
      const room = roomManager.getRoom(roomId);
      roomManager.emitRoomUpdate(io, room);
    }
  });

  socket.on('cancel_action', ({ roomId }) => {
    roomManager.cancelAction(io, roomId, socket.id);
    const updatedRoom = roomManager.getRoom(roomId);
    if (updatedRoom) {
      roomManager.emitRoomUpdate(io, updatedRoom);
    }
  });

  socket.on('typing_status', ({ roomId, intent }) => {
    roomManager.setTypingStatus(roomId, socket.id, intent);
    const room = roomManager.getRoom(roomId);
    if (room) {
      roomManager.emitRoomUpdate(io, room);
    }
  });

  socket.on('chat_message', ({ roomId, message }) => {
    const room = roomManager.getRoom(roomId);
    if (room) {
      const player = room.players.get(socket.id);
      if (player) {
        room.chat.push({ username: player.username, message, timestamp: Date.now() });
        io.to(roomId).emit('chat_update', room.chat);
      }
    }
  });

  socket.on('disconnecting', () => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        const room = roomManager.leaveRoom(io, roomId, socket.id);
        if (room) {
          roomManager.emitRoomUpdate(io, room);
        }
        io.emit('rooms_list', roomManager.getAllRooms());
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
