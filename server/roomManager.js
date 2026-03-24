const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { EVENTS } = require('./constants');
const { STRINGS } = require('./strings');

class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.dictionary = new Set();
    this.loadDictionary();
  }

  loadDictionary() {
    try {
      const data = fs.readFileSync(path.join(__dirname, 'words.txt'), 'utf8');
      const words = data.split('\n').map(w => w.trim().toUpperCase()).filter(w => w.length > 0);
      this.dictionary = new Set(words);
      console.log(`[System] Dictionary loaded: ${this.dictionary.size} words.`);
    } catch (err) {
      console.error('[Error] Failed to load dictionary:', err.message);
    }
  }

  isValidWord(word) {
    return this.dictionary.has(word.toUpperCase());
  }

  createRoom(name, creatorId, username) {
    const roomId = uuidv4();
    const room = {
      id: roomId,
      name: name,
      status: 'waiting',
      players: new Map(), // Map<socketId, PlayerObject>
      wordmaster: null,
      secretWord: null,
      revealedPrefix: '',
      currentGuess: null,
      victoryCountdown: 0,
      chat: [],
      typingStatus: new Map(),
      usedWords: new Set(),
      winner: null
    };
    this.addPlayer(room, creatorId, username);
    this.rooms.set(roomId, room);
    return room;
  }

  addPlayer(room, socketId, username) {
    // Check for existing player with same username (session recovery)
    let existingPlayer = null;
    let oldSocketId = null;

    for (const [id, p] of room.players.entries()) {
      if (p.username === username) {
        existingPlayer = p;
        oldSocketId = id;
        break;
      }
    }

    if (existingPlayer) {
      // Inherit properties from disconnected session
      existingPlayer.status = 'active';
      existingPlayer.lastSeen = Date.now();
      
      // If they changed socket IDs, update the map
      if (oldSocketId !== socketId) {
        room.players.delete(oldSocketId);
        room.players.set(socketId, existingPlayer);
        // If they were Wordmaster, keep them as Wordmaster
        if (room.wordmaster === oldSocketId) {
          room.wordmaster = socketId;
        }
        // If they were the current guesser, update the guesser ID
        if (room.currentGuess?.player === oldSocketId) {
          room.currentGuess.player = socketId;
        }
        // Update contactedBy
        if (room.currentGuess?.contactedBy === oldSocketId) {
          room.currentGuess.contactedBy = socketId;
        }
      }
      return existingPlayer;
    } else {
      const newPlayer = {
        id: socketId,
        username: username,
        status: 'active',
        lastSeen: Date.now(),
        role: 'player'
      };
      room.players.set(socketId, newPlayer);
      return newPlayer;
    }
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  getAllRooms() {
    return Array.from(this.rooms.values()).map(r => ({
      id: r.id,
      name: r.name,
      playerCount: Array.from(r.players.values()).filter(p => p.status === 'active').length,
      status: r.status
    }));
  }

  joinRoom(roomId, playerId, username) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    this.addPlayer(room, playerId, username);
    return room;
  }

  handleDisconnect(io, socket) {
    const { roomId, username } = socket.data;
    if (!roomId) return;

    const room = this.getRoom(roomId);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (player) {
      player.status = 'disconnected';
      player.lastSeen = Date.now();
      console.log(`[Lifecycle] Player ${username} marked as disconnected in ${roomId}`);
      this.emitRoomUpdate(io, room);
    }
  }

  leaveRoom(io, roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(playerId);
    const username = player ? player.username : 'Unknown';
    
    this._removePlayerPermanently(io, room, playerId, username);
  }

  _removePlayerPermanently(io, room, playerId, username) {
    const isWM = room.wordmaster === playerId;
    const isGuesser = room.currentGuess && room.currentGuess.player === playerId;
    
    console.log(`[Lifecycle] Permanently removing ${username} (${playerId}) from room ${room.id}. Role: ${isWM ? 'Wordmaster' : (isGuesser ? 'Guesser' : 'Player')}`);

    room.players.delete(playerId);
    room.typingStatus.delete(playerId);

    if (isWM) {
      room.wordmaster = null;
      room.status = 'waiting';
      room.secretWord = null;
      room.revealedPrefix = '';
      room.currentGuess = null;
      this.addLog(io, room.id, 'System', STRINGS.MSG_WM_LEFT(username));
    } else if (isGuesser) {
      room.currentGuess = null;
      this.addLog(io, room.id, 'System', STRINGS.MSG_GUESS_LEFT(username));
    } else {
      this.addLog(io, room.id, 'System', STRINGS.MSG_LEFT(username));
    }

    if (room.players.size === 0) {
      console.log(`[Lifecycle] Room ${room.id} is now empty. Deleting room.`);
      this.rooms.delete(room.id);
    } else {
      this.emitRoomUpdate(io, room);
    }
  }

  setWordmaster(io, roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    
    if (room.wordmaster && room.status !== 'game_over') return;

    room.wordmaster = playerId;
    room.status = 'setting_word';
    room.secretWord = null;
    room.revealedPrefix = '';
    room.currentGuess = null;
    room.winner = null;
    
    for (const p of room.players.values()) {
      p.role = (p.id === playerId) ? 'wordmaster' : 'player';
    }

    this.addLog(io, roomId, 'System', STRINGS.MSG_WM_ASSIGNED(this.getUsername(room, playerId)));
    this.emitRoomUpdate(io, room);
  }

  setSecretWord(io, roomId, playerId, word) {
    const room = this.rooms.get(roomId);
    if (!room || room.wordmaster !== playerId) return;

    const upperWord = word.toUpperCase();
    if (!this.isValidWord(upperWord)) {
      this.addPrivateLog(io, playerId, 'Error', 'Word not in dictionary.');
      return;
    }

    room.secretWord = upperWord;
    room.revealedPrefix = upperWord[0];
    room.status = 'playing';
    room.usedWords.clear();
    room.usedWords.add(upperWord);
    this.addLog(io, roomId, 'System', STRINGS.MSG_GAME_STARTED(room.revealedPrefix));
    this.emitRoomUpdate(io, room);
  }

  submitGuess(io, roomId, playerId, word) {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'playing' || room.wordmaster === playerId || room.currentGuess) return;

    const upperWord = word.toUpperCase();
    if (!upperWord.startsWith(room.revealedPrefix)) {
      this.addPrivateLog(io, playerId, 'Error', `Word must start with ${room.revealedPrefix}`);
      return;
    }
    if (!this.isValidWord(upperWord)) {
      this.addPrivateLog(io, playerId, 'Error', 'Word not in dictionary.');
      return;
    }
    if (room.usedWords.has(upperWord)) {
      this.addPrivateLog(io, playerId, 'Error', 'Word has already been used.');
      return;
    }

    room.currentGuess = {
      player: playerId,
      hiddenWord: upperWord,
      clue: null,
      contactedBy: null,
      contactGuess: null,
      countdown: 0
    };
    this.emitRoomUpdate(io, room);
  }

  submitClue(io, roomId, playerId, clue) {
    const room = this.rooms.get(roomId);
    if (!room || !room.currentGuess || room.currentGuess.player !== playerId) return;

    room.currentGuess.clue = clue;
    this.addLog(io, roomId, 'Action', STRINGS.MSG_GUESS_SUBMITTED(this.getUsername(room, playerId), clue));
    this.emitRoomUpdate(io, room);
  }

  submitContact(io, roomId, playerId, guess) {
    const room = this.rooms.get(roomId);
    if (!room || !room.currentGuess || room.wordmaster === playerId || room.currentGuess.player === playerId) return;

    if (room.currentGuess.contactedBy) {
      this.addPrivateLog(io, playerId, 'Error', 'Another player is already attempting contact.');
      return;
    }

    const normalizedGuess = guess.toUpperCase();
    if (!this.isValidWord(normalizedGuess)) {
      this.addPrivateLog(io, playerId, 'Error', 'Invalid word.');
      return;
    }

    room.currentGuess.contactedBy = playerId;
    room.currentGuess.contactGuess = normalizedGuess;
    room.currentGuess.countdown = 4;
    
    this.addLog(io, roomId, 'Contact', STRINGS.MSG_CONTACT_ATTEMPT(this.getUsername(room, room.currentGuess.player), this.getUsername(room, playerId)));
    this.emitRoomUpdate(io, room);
  }

  denyGuess(io, roomId, playerId, guess) {
    const room = this.rooms.get(roomId);
    if (!room || room.wordmaster !== playerId || !room.currentGuess) return;

    const upperGuess = guess.toUpperCase();
    if (upperGuess === room.secretWord) {
      this.addPrivateLog(io, playerId, 'Error', 'Cannot use the secret word.');
      return;
    }

    if (upperGuess === room.currentGuess.hiddenWord) {
      room.usedWords.add(upperGuess);
      this.addLog(io, roomId, 'Failure', STRINGS.MSG_INTERCEPTED(upperGuess));
      room.currentGuess = null;
    } else {
      this.addPrivateLog(io, playerId, 'Error', 'Incorrect intercept attempt.');
    }
    this.emitRoomUpdate(io, room);
  }

  declareVictory(io, roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room || room.wordmaster !== playerId || room.currentGuess) return;

    room.status = 'victory_countdown';
    room.victoryCountdown = 10;
    this.addLog(io, roomId, 'System', STRINGS.MSG_VICTORY_DECLARED);
    this.emitRoomUpdate(io, room);
  }

  contestVictory(io, roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'victory_countdown' || room.wordmaster === playerId) return;

    room.status = 'playing';
    room.victoryCountdown = 0;
    this.addLog(io, roomId, 'System', STRINGS.MSG_VICTORY_CONTESTED(this.getUsername(room, playerId)));
    this.emitRoomUpdate(io, room);
  }

  cancelAction(io, roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    if (room.currentGuess && room.currentGuess.player === playerId) {
      room.currentGuess = null;
      this.addLog(io, roomId, 'System', STRINGS.MSG_GUESS_RETRACTED(this.getUsername(room, playerId)));
      this.emitRoomUpdate(io, room);
    }
  }

  setTypingStatus(io, roomId, playerId, intent) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    intent ? room.typingStatus.set(playerId, intent) : room.typingStatus.delete(playerId);
    
    const typingArr = Array.from(room.typingStatus.entries()).map(([id, intent]) => ({
      username: this.getUsername(room, id),
      intent
    }));
    
    io.to(roomId).emit(EVENTS.TYPING_UPDATE, typingArr);
  }

  getUsername(room, playerId) {
    return room.players.get(playerId)?.username || 'Unknown';
  }

  addLog(io, roomId, type, message) {
    const room = this.rooms.get(roomId);
    if (room) {
      const log = { isLog: true, logType: type, message, timestamp: Date.now() };
      room.chat.push(log);
      io.to(roomId).emit(EVENTS.CHAT_UPDATE, room.chat);
    }
  }

  addPrivateLog(io, playerId, type, message) {
    const log = { isLog: true, logType: type, message, timestamp: Date.now(), isPrivate: true };
    io.to(playerId).emit(EVENTS.CHAT_UPDATE_PRIVATE, log);
  }

  tick(io) {
    const GRACE_PERIOD = 60000; // 60 seconds

    this.rooms.forEach((room, roomId) => {
      // 1. Handle Grace Periods for Disconnected Players
      room.players.forEach((player, socketId) => {
        if (player.status === 'disconnected') {
          if (Date.now() - player.lastSeen > GRACE_PERIOD) {
            console.log(`[Lifecycle] Removing ${player.username} permanently from ${roomId} (Grace period expired)`);
            this._removePlayerPermanently(io, room, socketId, player.username);
          }
        }
      });

      // 2. Handle Countdown: Contact
      if (room.currentGuess && room.currentGuess.contactedBy && room.currentGuess.countdown > 0) {
        room.currentGuess.countdown--;
        if (room.currentGuess.countdown === 0) {
          const { hiddenWord, contactGuess, player, contactedBy } = room.currentGuess;

          if (hiddenWord === contactGuess) {
            room.usedWords.add(hiddenWord);

            if (hiddenWord === room.secretWord) {
              room.revealedPrefix = room.secretWord;
              room.status = 'game_over';
              room.winner = 'players';
              this.addLog(io, roomId, 'Success', STRINGS.MSG_CONTACT_SUCCESS_GAME(this.getUsername(room, player), this.getUsername(room, contactedBy), hiddenWord));
            } else {
              const nextChar = room.secretWord[room.revealedPrefix.length];
              room.revealedPrefix += nextChar;
              this.addLog(io, roomId, 'Success', STRINGS.MSG_CONTACT_SUCCESS_CHAR(this.getUsername(room, player), this.getUsername(room, contactedBy), hiddenWord));
              if (room.revealedPrefix === room.secretWord) {
                room.status = 'game_over';
                room.winner = 'players';
                this.addLog(io, roomId, 'System', STRINGS.MSG_PLAYERS_WIN(room.secretWord));
              }
            }
            room.currentGuess = null;
          } else {
            this.addLog(io, roomId, 'Failure', STRINGS.MSG_CONTACT_FAILED);
            room.currentGuess.contactedBy = null;
            room.currentGuess.contactGuess = null;
            room.currentGuess.countdown = 0;
          }
        }
        this.emitRoomUpdate(io, room);
      }

      // 3. Handle Countdown: Victory
      if (room.status === 'victory_countdown' && room.victoryCountdown > 0) {
        room.victoryCountdown--;
        if (room.victoryCountdown === 0) {
          room.status = 'game_over';
          room.winner = 'wordmaster';
          room.revealedPrefix = room.secretWord;
          this.addLog(io, roomId, 'System', STRINGS.MSG_WM_WINS(room.secretWord));
        }
        this.emitRoomUpdate(io, room);
      }
    });
  }

  serializeRoom(room) {
    if (!room) return null;
    return {
      id: room.id || '',
      name: room.name || '',
      status: room.status || 'waiting',
      winner: room.winner || null,
      players: room.players ? Array.from(room.players.values()) : [],
      wordmaster: room.wordmaster || null,
      revealedPrefix: room.revealedPrefix || '',
      currentGuess: {
        player: room.currentGuess?.player || null,
        playerName: room.currentGuess ? this.getUsername(room, room.currentGuess.player) : null,
        clue: room.currentGuess?.clue || null,
        hiddenWord: room.currentGuess?.hiddenWord || null,
        contactedBy: room.currentGuess?.contactedBy || null,
        contactedByName: room.currentGuess?.contactedBy ? this.getUsername(room, room.currentGuess.contactedBy) : null,
        countdown: room.currentGuess?.countdown || 0
      },
      victoryCountdown: room.victoryCountdown || 0,
      chat: room.chat || [],
      secretWord: room.status === 'game_over' ? room.secretWord : null
    };
  }

  emitRoomUpdate(io, room, targetSocket = null) {
    const serialized = this.serializeRoom(room);
    if (targetSocket) {
      console.log(`[Room] Emitting direct room update to socket: ${targetSocket.id}`);
      targetSocket.emit(EVENTS.ROOM_UPDATE, serialized);
    }
    io.to(room.id).emit(EVENTS.ROOM_UPDATE, serialized);
  }
}

module.exports = new RoomManager();
