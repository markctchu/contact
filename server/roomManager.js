const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { EVENTS } = require('./constants');

class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.dictionary = new Set();
    this.loadDictionary();
  }

  loadDictionary() {
    try {
      const filePath = path.join(__dirname, 'words.txt');
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const words = content.split(/\r?\n/);
        words.forEach(word => {
          const w = word.trim().toUpperCase();
          if (w) this.dictionary.add(w);
        });
        console.log(`[System] Dictionary loaded: ${this.dictionary.size} words.`);
      }
    } catch (err) {
      console.error('[Error] Failed to load dictionary:', err);
    }
  }

  createRoom(name, creatorId, creatorUsername) {
    const roomId = uuidv4();
    const room = {
      id: roomId,
      name: name,
      players: new Map([[creatorId, { id: creatorId, username: creatorUsername, role: 'player' }]]),
      wordmaster: null,
      status: 'waiting',
      secretWord: '',
      revealedPrefix: '',
      currentClue: null,
      victoryCountdown: 0,
      typingStatus: new Map(),
      chat: [],
      usedWords: new Set()
    };
    this.rooms.set(roomId, room);
    return room;
  }

  joinRoom(roomId, playerId, username) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    
    let existingRole = 'player';
    // Session Resumption: If a player with this username already exists, inherit their role and clean up old ID
    for (const [id, p] of room.players.entries()) {
      if (p.username === username) {
        existingRole = p.role;
        if (room.wordmaster === id) room.wordmaster = playerId;
        room.players.delete(id);
        room.typingStatus.delete(id);
        break;
      }
    }

    room.players.set(playerId, { id: playerId, username: username, role: existingRole });
    return room;
  }

  leaveRoom(io, roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    room.players.delete(playerId);
    room.typingStatus.delete(playerId);
    
    if (room.wordmaster === playerId) {
      room.wordmaster = null;
      room.status = 'game_over';
      this.addLog(io, roomId, 'System', 'Wordmaster left. Game Over.');
    }

    if (room.players.size === 0) {
      this.rooms.delete(roomId);
      return null;
    }
    
    this.emitRoomUpdate(io, room);
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  getAllRooms() {
    return Array.from(this.rooms.values()).map(r => ({
      id: r.id,
      name: r.name,
      playerCount: r.players.size,
      status: r.status
    }));
  }

  addLog(io, roomId, type, message) {
    const room = this.rooms.get(roomId);
    if (room) {
      const chatMsg = { 
        username: 'System', 
        message: message, 
        timestamp: Date.now(),
        isLog: true,
        logType: type
      };
      
      room.chat.push(chatMsg);
      if (io) io.to(roomId).emit(EVENTS.CHAT_UPDATE, room.chat);
    }
  }

  setWordmaster(io, roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    
    room.players.forEach(p => p.role = 'player');
    const player = room.players.get(playerId);
    if (player) {
      player.role = 'wordmaster';
      room.wordmaster = playerId;
      room.status = 'setting_word';
      room.secretWord = '';
      room.revealedPrefix = '';
      room.currentClue = null;
      room.usedWords = new Set();
      this.addLog(io, roomId, 'System', `${player.username} has become the Wordmaster.`);
      this.emitRoomUpdate(io, room);
      return true;
    }
    return false;
  }

  sendPrivateLog(io, socketId, type, message) {
    const chatMsg = { 
      username: 'System', 
      message: message, 
      timestamp: Date.now(),
      isLog: true,
      logType: type,
      isPrivate: true
    };
    io.to(socketId).emit(EVENTS.CHAT_UPDATE_PRIVATE, chatMsg);
  }

  validateWord(word, strict = false) {
    if (!word) return false;
    const normalized = word.trim().toUpperCase();
    if (!/^[A-Z]{2,}$/.test(normalized)) return false;
    if (strict && this.dictionary.size > 0) return this.dictionary.has(normalized);
    return true;
  }

  setSecretWord(io, roomId, playerId, word) {
    const room = this.rooms.get(roomId);
    if (!room || room.wordmaster !== playerId) return false;
    
    if (!this.validateWord(word, true)) {
      this.sendPrivateLog(io, playerId, 'Failure', `"${word.toUpperCase()}" is not a valid English word.`);
      return false;
    }
    
    room.secretWord = word.trim().toUpperCase();
    room.revealedPrefix = room.secretWord[0];
    room.status = 'playing';
    this.emitRoomUpdate(io, room);
    return true;
  }

  submitClue(io, roomId, playerId, hiddenWord) {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'playing' || room.currentClue) return false;
    if (room.wordmaster === playerId) return false;
    
    const normalizedWord = hiddenWord.trim().toUpperCase();
    if (!this.validateWord(normalizedWord, true)) {
      this.sendPrivateLog(io, playerId, 'Failure', `"${normalizedWord}" is not a valid English word.`);
      return false;
    }
    if (!normalizedWord.startsWith(room.revealedPrefix)) {
      this.sendPrivateLog(io, playerId, 'Failure', `Clue must start with: "${room.revealedPrefix}"`);
      return false;
    }
    if (normalizedWord === room.revealedPrefix || room.usedWords.has(normalizedWord)) {
      this.sendPrivateLog(io, playerId, 'Failure', 'Invalid or already used word.');
      return false;
    }

    room.currentClue = {
      player: playerId,
      hiddenWord: normalizedWord,
      hint: '',
      contactedBy: null,
      contactGuess: null,
      countdown: 0
    };
    this.emitRoomUpdate(io, room);
    return true;
  }

  submitHint(io, roomId, playerId, hint) {
    const room = this.rooms.get(roomId);
    if (!room || !room.currentClue || room.currentClue.player !== playerId) return false;
    
    const normalizedHint = hint.trim();
    if (normalizedHint.length < 2) {
      this.sendPrivateLog(io, playerId, 'Failure', 'Hint too short.');
      return false;
    }

    room.currentClue.hint = normalizedHint;
    this.emitRoomUpdate(io, room);
    return true;
  }

  callContact(io, roomId, playerId, contactGuess) {
    const room = this.rooms.get(roomId);
    if (!room || !room.currentClue || !room.currentClue.hint || room.currentClue.contactedBy) return false;
    if (playerId === room.currentClue.player || playerId === room.wordmaster) return false;

    const normalizedGuess = contactGuess.trim().toUpperCase();
    if (!this.validateWord(normalizedGuess, false)) {
      this.sendPrivateLog(io, playerId, 'Failure', 'Invalid formatting.');
      return false;
    }

    room.currentClue.contactedBy = playerId;
    room.currentClue.contactGuess = normalizedGuess;
    room.currentClue.countdown = 4; // Start at 4 to allow 3 to stay for 2 seconds
    
    this.addLog(io, roomId, 'Contact', `${this.getUsername(room, room.currentClue.player)} and ${this.getUsername(room, playerId)} are attempting contact...`);
    this.emitRoomUpdate(io, room);
    return true;
  }

  denyClue(io, roomId, playerId, denyGuess) {
    const room = this.rooms.get(roomId);
    if (!room || !room.currentClue || room.wordmaster !== playerId) return false;
    
    const normalizedDeny = denyGuess.trim().toUpperCase();
    if (!this.validateWord(normalizedDeny, false)) return false;
    if (normalizedDeny === room.secretWord) {
      this.sendPrivateLog(io, playerId, 'Failure', 'Cannot deny using secret word!');
      return false;
    }

    if (normalizedDeny === room.currentClue.hiddenWord) {
      room.usedWords.add(normalizedDeny);
      this.addLog(io, roomId, 'Deny', `Wordmaster denied the guess of ${normalizedDeny}`);
      room.currentClue = null;
      this.emitRoomUpdate(io, room);
      return true;
    } else {
      this.sendPrivateLog(io, playerId, 'Failure', `Incorrect! It wasn't "${normalizedDeny}".`);
    }
    return false;
  }

  declareVictory(io, roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room || room.wordmaster !== playerId || room.currentClue || room.status !== 'playing') return false;
    
    room.status = 'victory_countdown';
    room.victoryCountdown = 10;
    this.addLog(io, roomId, 'Victory', `Wordmaster declared victory!`);
    this.emitRoomUpdate(io, room);
    return true;
  }

  contestVictory(io, roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'victory_countdown' || room.wordmaster === playerId) return false;
    
    room.status = 'playing';
    room.victoryCountdown = 0;
    this.addLog(io, roomId, 'Contest', `${this.getUsername(room, playerId)} contested victory!`);
    this.emitRoomUpdate(io, room);
    return true;
  }

  cancelAction(io, roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room || !room.currentClue) return false;
    
    const player = room.players.get(playerId);
    const clueOwner = room.players.get(room.currentClue.player);

    if (room.currentClue.player === playerId || (player && clueOwner && player.username === clueOwner.username)) {
      if (!room.currentClue.contactedBy) {
        this.addLog(io, roomId, 'System', `${player?.username || 'A player'} has retracted their clue.`);
        room.currentClue = null;
        this.emitRoomUpdate(io, room);
        return true;
      }
    }
    return false;
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

  tick(io) {
    this.rooms.forEach((room, roomId) => {
      if (room.currentClue && room.currentClue.contactedBy && room.currentClue.countdown > 0) {
        room.currentClue.countdown--;
        if (room.currentClue.countdown === 0) {
          const { hiddenWord, contactGuess, player, contactedBy } = room.currentClue;

          if (hiddenWord === contactGuess) {
            // SUCCESSFUL CONTACT: Permanently burn the word
            room.usedWords.add(hiddenWord);

            if (hiddenWord === room.secretWord) {
              room.revealedPrefix = room.secretWord;
              room.status = 'game_over';
              this.addLog(io, roomId, 'Success', `VICTORY! ${this.getUsername(room, player)} and ${this.getUsername(room, contactedBy)} contacted the secret word: ${hiddenWord}`);
            } else {
              const nextChar = room.secretWord[room.revealedPrefix.length];
              room.revealedPrefix += nextChar;
              this.addLog(io, roomId, 'Success', `Contact! ${this.getUsername(room, player)} and ${this.getUsername(room, contactedBy)} successfully guessed ${hiddenWord}`);
              if (room.revealedPrefix === room.secretWord) {
                room.status = 'game_over';
                this.addLog(io, roomId, 'System', `Game Over! Players win! The word was ${room.secretWord}`);
              }
            }
            room.currentClue = null;
          } else {
            this.addLog(io, roomId, 'Failure', `Contact failed! Words did not match.`);
            // RESET CLUE: Keep it active but allow new contacts
            room.currentClue.contactedBy = null;
            room.currentClue.contactGuess = null;
            room.currentClue.countdown = 0;
          }
        }
        this.emitRoomUpdate(io, room);
      }

      if (room.status === 'victory_countdown' && room.victoryCountdown > 0) {
        room.victoryCountdown--;
        if (room.victoryCountdown === 0) {
          room.status = 'game_over';
          this.addLog(io, roomId, 'System', `Game Over! Wordmaster wins! The word was ${room.secretWord}`);
        }
        this.emitRoomUpdate(io, room);
      }
    });
  }

  emitRoomUpdate(io, room) {
    const playersArr = Array.from(room.players.values());
    
    io.to(room.id).emit(EVENTS.ROOM_UPDATE, {
      id: room.id,
      name: room.name,
      status: room.status,
      players: playersArr,
      wordmaster: room.wordmaster,
      revealedPrefix: room.revealedPrefix,
      currentClue: room.currentClue ? {
        player: room.currentClue.player,
        playerName: this.getUsername(room, room.currentClue.player),
        hint: room.currentClue.hint,
        contactedBy: room.currentClue.contactedBy,
        contactedByName: this.getUsername(room, room.currentClue.contactedBy),
        countdown: room.currentClue.countdown
      } : null,
      victoryCountdown: room.victoryCountdown,
      secretWord: room.status === 'game_over' ? room.secretWord : null 
    });
  }
}

module.exports = new RoomManager();
