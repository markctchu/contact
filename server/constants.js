const EVENTS = {
  // Lobby
  GET_ROOMS: 'get_rooms',
  ROOMS_LIST: 'rooms_list',
  CREATE_ROOM: 'create_room',
  JOIN_ROOM: 'join_room',
  
  // Game State
  ROOM_UPDATE: 'room_update',
  BECOME_WORDMASTER: 'become_wordmaster',
  SET_SECRET_WORD: 'set_secret_word',
  
  // Gameplay Actions
  SUBMIT_CLUE_WORD: 'submit_clue_word',
  SUBMIT_CLUE_HINT: 'submit_clue_hint',
  CALL_CONTACT: 'call_contact',
  DENY_CLUE: 'deny_clue',
  DECLARE_VICTORY: 'declare_victory',
  CONTEST_VICTORY: 'contest_victory',
  CANCEL_ACTION: 'cancel_action',
  
  // Status & Communication
  TYPING_STATUS: 'typing_status',
  CHAT_MESSAGE: 'chat_message',
  CHAT_UPDATE: 'chat_update',
  CHAT_UPDATE_PRIVATE: 'chat_update_private',
  
  // System
  ERROR: 'error'
};

module.exports = { EVENTS };
