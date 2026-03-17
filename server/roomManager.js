const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

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
      } else {
        console.warn('[Warning] words.txt not found in server directory. Strict validation disabled.');
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
      victoryTimer: null,
      victoryCountdown: 0,
      typingStatus: new Map(),
      actionLog: [],
      chat: [],
      usedWords: new Set()
    };
    this.rooms.set(roomId, room);
    return room;
  }

  joinRoom(roomId, playerId, username) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    room.players.set(playerId, { id: playerId, username: username, role: 'player' });
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
      const logEntry = { type, message, timestamp: Date.now() };
      room.actionLog.push(logEntry);
      
      const chatMsg = { 
        username: 'System', 
        message: message, 
        timestamp: logEntry.timestamp,
        isLog: true,
        logType: type
      };
      
      room.chat.push(chatMsg);
      
      if (io) {
        io.to(roomId).emit('chat_update', room.chat);
      }
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
      room.actionLog = [];
      room.usedWords = new Set();
      this.addLog(io, roomId, 'System', `${player.username} has become the Wordmaster.`);
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
    io.to(socketId).emit('chat_update_private', chatMsg);
  }

  validateWord(word, strict = false) {
    if (!word) return false;
    const normalized = word.trim().toUpperCase();
    
    if (!/^[A-Z]{2,}$/.test(normalized)) return false;

    if (strict && this.dictionary.size > 0) {
      return this.dictionary.has(normalized);
    }

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
      this.sendPrivateLog(io, playerId, 'Failure', `Clue must start with the revealed prefix: "${room.revealedPrefix}"`);
      return false;
    }
    if (normalizedWord === room.revealedPrefix) {
      this.sendPrivateLog(io, playerId, 'Failure', 'Clue must be longer than the prefix.');
      return false;
    }
    if (room.usedWords.has(normalizedWord)) {
      this.sendPrivateLog(io, playerId, 'Failure', `"${normalizedWord}" has already been used this round.`);
      return false;
    }

    room.currentClue = {
      player: playerId,
      hiddenWord: normalizedWord,
      hint: '',
      contactedBy: null,
      contactGuess: null,
      countdown: 0,
      timer: null
    };
    return true;
  }

  submitHint(io, roomId, playerId, hint) {
    const room = this.rooms.get(roomId);
    if (!room || !room.currentClue || room.currentClue.player !== playerId) return false;
    
    const normalizedHint = hint.trim();
    if (normalizedHint.length < 2) {
      this.sendPrivateLog(io, playerId, 'Failure', 'Hint must be at least 2 characters long.');
      return false;
    }

    room.currentClue.hint = normalizedHint;
    return true;
  }

  callContact(io, roomId, playerId, contactGuess) {
    const room = this.rooms.get(roomId);
    if (!room || !room.currentClue || !room.currentClue.hint) return false;
    if (playerId === room.currentClue.player || playerId === room.wordmaster) return false;
    if (room.currentClue.contactedBy) return false;

    const normalizedGuess = contactGuess.trim().toUpperCase();
    if (!this.validateWord(normalizedGuess, false)) {
      this.sendPrivateLog(io, playerId, 'Failure', 'Contact guess must contain only A-Z.');
      return false;
    }

    room.currentClue.contactedBy = playerId;
    room.currentClue.contactGuess = normalizedGuess;
    room.currentClue.countdown = 3;
    
    const clueGiver = this.getUsername(room, room.currentClue.player);
    const contacter = this.getUsername(room, playerId);
    
    this.addLog(io, roomId, 'Contact', `${clueGiver} and ${contacter} are attempting contact...`);
    return true;
  }

  denyClue(io, roomId, playerId, denyGuess) {
    const room = this.rooms.get(roomId);
    if (!room || !room.currentClue || room.wordmaster !== playerId) return false;
    
    const normalizedDeny = denyGuess.trim().toUpperCase();
    if (!this.validateWord(normalizedDeny, false)) {
      this.sendPrivateLog(io, playerId, 'Failure', 'Denial guess must contain only A-Z.');
      return false;
    }
    
    if (normalizedDeny === room.secretWord) {
      this.sendPrivateLog(io, playerId, 'Failure', 'You cannot deny using your own secret word!');
      return false;
    }

    if (normalizedDeny === room.currentClue.hiddenWord) {
      room.usedWords.add(normalizedDeny);
      this.addLog(io, roomId, 'Deny', `Wordmaster denied ${this.getUsername(room, room.currentClue.player)}'s guess of ${normalizedDeny}`);
      this.clearClue(room);
      return true;
    } else {
      this.sendPrivateLog(io, playerId, 'Failure', `Incorrect! The clue was not "${normalizedDeny}".`);
    }
    return false;
  }

  clearClue(room) {
    if (room.currentClue && room.currentClue.timer) clearInterval(room.currentClue.timer);
    room.currentClue = null;
  }

  declareVictory(io, roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room || room.wordmaster !== playerId || room.currentClue || room.status !== 'playing') return false;
    
    room.status = 'victory_countdown';
    room.victoryCountdown = 10;
    this.addLog(io, roomId, 'Victory', `Wordmaster declared victory!`);
    return true;
  }

  contestVictory(io, roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'victory_countdown' || room.wordmaster === playerId) return false;
    
    room.status = 'playing';
    room.victoryCountdown = 0;
    this.addLog(io, roomId, 'Contest', `${this.getUsername(room, playerId)} contested victory!`);
    return true;
  }

  cancelAction(io, roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room || !room.currentClue) return false;
    
    const player = room.players.get(playerId);
    const clueOwner = room.players.get(room.currentClue.player);

    if (room.currentClue.player === playerId || (player && clueOwner && player.username === clueOwner.username)) {
      if (!room.currentClue.contactedBy) {
        const username = player ? player.username : 'A player';
        this.addLog(io, roomId, 'System', `${username} has retracted their clue.`);
        this.clearClue(room);
        return true;
      }
    }
    return false;
  }

  setTypingStatus(roomId, playerId, intent) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    if (intent) {
      room.typingStatus.set(playerId, intent);
    } else {
      room.typingStatus.delete(playerId);
    }
  }

  getUsername(room, playerId) {
    const player = room.players.get(playerId);
    return player ? player.username : 'Unknown';
  }

  tick(io) {
    this.rooms.forEach((room, roomId) => {
      if (room.currentClue && room.currentClue.contactedBy && room.currentClue.countdown > 0) {
        room.currentClue.countdown--;
        if (room.currentClue.countdown === 0) {
          const guessedWord = room.currentClue.hiddenWord;
          
          if (room.currentClue.hiddenWord === room.currentClue.contactGuess) {
            // SUCCESSFUL CONTACT
            const clueGiver = this.getUsername(room, room.currentClue.player);
            const contacter = this.getUsername(room, room.currentClue.contactedBy);
            room.usedWords.add(guessedWord);

            if (guessedWord === room.secretWord) {
              room.revealedPrefix = room.secretWord;
              room.status = 'game_over';
              this.addLog(io, roomId, 'Success', `VICTORY! ${clueGiver} and ${contacter} successfully contacted the secret word: ${guessedWord}`);
              this.addLog(io, roomId, 'System', `Game Over! Players win!`);
            } else {
              const nextChar = room.secretWord[room.revealedPrefix.length];
              room.revealedPrefix += nextChar;
              
              this.addLog(io, roomId, 'Success', `Contact! ${clueGiver} and ${contacter} successfully guessed ${guessedWord}`);
              
              if (room.revealedPrefix === room.secretWord) {
                room.status = 'game_over';
                this.addLog(io, roomId, 'System', `Game Over! Players win! The word was ${room.secretWord}`);
              }
            }
          } else {
            this.addLog(io, roomId, 'Failure', `Contact failed! Words did not match.`);
          }
          this.clearClue(room);
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
    const typingArr = Array.from(room.typingStatus.entries()).map(([id, intent]) => ({
      username: this.getUsername(room, id),
      intent
    }));

    io.to(room.id).emit('room_update', {
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
      actionLog: room.actionLog,
      typingStatus: typingArr,
      secretWord: room.status === 'game_over' ? room.secretWord : null 
    });
  }
}

module.exports = new RoomManager();
