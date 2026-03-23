const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
  pingTimeout: 60000,
  pingInterval: 10000,
  transports: ['websocket', 'polling']
});

const PORT = process.env.PORT || 3001;

// Absolute paths for reliability
const distPath = path.resolve(__dirname, '../client/dist');
const indexPath = path.resolve(distPath, 'index.html');

console.log(`[System] Serving static files from: ${distPath}`);
if (fs.existsSync(indexPath)) {
  console.log(`[System] Found index.html at: ${indexPath}`);
} else {
  console.error(`[Error] index.html NOT FOUND at: ${indexPath}`);
}

app.use(express.static(distPath));

// Global interval for game ticks (countdowns)
setInterval(() => {
  roomManager.tick(io);
}, 1000);

io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.id} from ${socket.handshake.address} [Transport: ${socket.conn.transport.name}]`);

  if (socket.recovered) {
    console.log(`[Socket] Session recovered for ${socket.id}`);
  }

  // Log all incoming events for this socket
  socket.onAny((eventName, ...args) => {
    if (eventName === EVENTS.TYPING_STATUS || eventName === EVENTS.TYPING_UPDATE) return; 
    console.log(`[Event] From ${socket.data.username || 'Unknown'} (${socket.id}): ${eventName}`, JSON.stringify(args));
  });

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
    
    // Immediate Cleanup: If another socket with this username is in a grace period for this room, 
    // we don't need to wait for the timeout.
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

  socket.on(EVENTS.SUBMIT_GUESS_WORD, ({ word }) => {
    const { roomId } = socket.data;
    if (roomId) roomManager.submitGuess(io, roomId, socket.id, word);
  });

  socket.on(EVENTS.SUBMIT_GUESS_CLUE, ({ clue }) => {
    const { roomId } = socket.data;
    if (roomId) roomManager.submitClue(io, roomId, socket.id, clue);
  });

  socket.on(EVENTS.CALL_CONTACT, ({ guess }) => {
    const { roomId } = socket.data;
    if (roomId) roomManager.callContact(io, roomId, socket.id, guess);
  });

  socket.on(EVENTS.DENY_GUESS, ({ guess }) => {
    const { roomId } = socket.data;
    if (roomId) roomManager.denyGuess(io, roomId, socket.id, guess);
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
    if (roomId) {
      const room = roomManager.getRoom(roomId);
      if (room && room.status === 'setting_word' && room.wordmaster === socket.id) {
        // Wordmaster is backing out
        room.status = 'waiting';
        room.wordmaster = null;
        // Reset player role in room object
        const player = room.players.get(socket.id);
        if (player) player.role = 'player';
        
        roomManager.emitRoomUpdate(io, room);
        roomManager.addLog(io, roomId, 'System', STRINGS.MSG_WM_RELINQUISHED(socket.data.username));
      } else {
        roomManager.cancelAction(io, roomId, socket.id);
      }
    }
  });

  socket.on(EVENTS.ERROR_REPORT, (errorData) => {
    console.error(`\x1b[31m[FRONTEND CRASH]\x1b[0m User: ${socket.data.username || 'Unknown'} (${socket.id})`);
    console.error(`Message: ${errorData.message}`);
    console.error(`Stack: ${errorData.componentStack}`);
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
    console.log(`[Socket] User ${socket.data.username || 'Unknown'} (${socket.id}) disconnecting. Reason: ${reason}`);
    roomManager.handleDisconnect(io, socket);
  });

  socket.on('disconnect', (reason) => {
    console.log(`[Socket] User disconnected: ${socket.id}. Reason: ${reason}`);
  });
});

// Catch-all to serve index.html for SPA routing
// Using app.use with no path is the safest way to bypass Express 5 wildcard issues
app.use((req, res) => {
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`[Error] Failed to send index.html: ${err.message}`);
      res.status(404).send('Frontend could not be loaded. Please ensure the build completed successfully.');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
