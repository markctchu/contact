export const EVENTS = {
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
  SUBMIT_GUESS_WORD: 'submit_guess_word',
  SUBMIT_GUESS_CLUE: 'submit_guess_clue',
  CALL_CONTACT: 'call_contact',
  DENY_GUESS: 'deny_guess',
  DECLARE_VICTORY: 'declare_victory',
  CONTEST_VICTORY: 'contest_victory',
  CANCEL_ACTION: 'cancel_action',
  
  // Status & Communication
  TYPING_STATUS: 'typing_status',
  TYPING_UPDATE: 'typing_update',
  CHAT_MESSAGE: 'chat_message',
  CHAT_UPDATE: 'chat_update',
  CHAT_UPDATE_PRIVATE: 'chat_update_private',
  
  // System
  ERROR: 'error',
  ERROR_REPORT: 'error_report'
};
