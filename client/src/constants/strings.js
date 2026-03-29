/**
 * MASTER STRING REPOSITORY (Client-side)
 * 
 * This is the single source of truth for all player-facing text in the webapp.
 * To update the UI, simply edit the values here.
 */

export const STRINGS = {
  // --- 1. Identity & Landing (App.jsx) ---
  APP_TITLE: "Contact",
  TAGLINE: "A GAME ABOUT HAVING THE LAST WORD",
  LOGIN_LABEL: "Choose your name",
  LOGIN_CTA: "Enter Game",

  // --- 2. Lobby & Session Management (Lobby.jsx) ---
  LOBBY_TITLE: "Lobby",
  LOBBY_SUBTITLE: (username) => `Active Sessions for ${username}`,
  ROOM_LIST_HEADER: "Current Games",
  ROOM_COUNT_SUFFIX: "Total",
  NO_ROOMS_MSG: "No active rooms",
  JOIN_BUTTON: "Join",
  CREATE_HEADER: "Host Game",
  ROOM_NAME_PLACEHOLDER: "Room Name",
  CREATE_BUTTON: "Launch Session",

  // --- 3. Game Room Interface (GameRoom.jsx / BottomInput.jsx) ---
  ROOM_STATUS_TAG: "Active Session",
  PLAYER_COUNT_LABEL: (count) => count === 1 ? "Player" : "Players",
  KEYBOARD_COLLAPSE: "Collapse Keys",
  KEYBOARD_EXPAND: "Expand Keys",
  MODE_ACTIVE_SUFFIX: "Mode Active",

  // --- 4. Central Area States: Game Tiles (CentralArea.jsx) ---
  WORD_LABEL_INPUT: "MY BEST GUESS IS...",
  WORD_LABEL_SECRET: "THEY'LL NEVER GUESS",
  WORD_LABEL_REVEALED: "IT STARTS WITH",
  WORD_LABEL_CONTACT_LOCK: "IT DEFINITELY HAS TO BE",
  WORD_LABEL_DENIED: "WORDMASTER HAS DENIED",
  WORD_LABEL_DENIED_WM: "YOU HAVE DENIED",
  WORD_LABEL_INIT: "PREPARE TO MAKE",
  WORD_LABEL_FINAL: "THE SECRET WORD WAS",
  WORD_LABEL_VICTORY: "WORDMASTER HAS DECLARED VICTORY!",
  WORD_LABEL_VICTORY_WM: "YOU HAVE DECLARED VICTORY",
  STATUS_WAITING: "Tap Wordmaster to Begin",
  STATUS_SETTING_WM: "Enter your secret word above",
  STATUS_SETTING_PL: "Wordmaster is thinking...",
  STATUS_PLAYING_EMPTY: "AWAITING GUESS SUBMISSION",
  STATUS_CONTEST_GAME: "Contest to continue the game",
  STATUS_CONTEST_GAME_WM: "You win the round if no one contests",
  STATUS_CONTEST_GUESS: "Submit Guess or Contest to continue",
  STATUS_DENIED_SUCCESS: "submit new guess to progress",
  STATUS_DENIED_SUCCESS_WM: "Players blocked successfully",
  TYPING_SUFFIX: "is typing...",

  // --- 5. Active Event Overlays: Countdowns (CentralArea.jsx) ---
  VICTORY_TITLE: "Wordmaster has Declared Victory!",
  VICTORY_SUBTITLE: "Contest to stop the countdown",
  VICTORY_PENDING_TITLE: "Victory Pending",
  VICTORY_PENDING_SUB: "Contest to Intercept",
  CONTACT_TITLE: "Contact",

  // --- 6. Action Mode Placeholders (UnifiedInput.jsx / CentralArea.jsx) ---
  PLACEHOLDER_SECRET: "SUBMIT SECRET WORD",
  PLACEHOLDER_GUESS: "SUBMIT GUESS WORD",
  PLACEHOLDER_GUESS_CLUE: "PROVIDE CLUE FOR CONTACT",
  PLACEHOLDER_CONTACT: "SOLVE THE CLUE",
  PLACEHOLDER_DENY: "INTERCEPT CONTACT",
  CLUE_INPUT_PROMPT: (hiddenWord) => `THE PERFECT CLUE:`,

  // --- 7. Dynamic Action Buttons (ActionToggleButton.jsx) ---
  ACTION_WM: "Wordmaster",
  ACTION_RELINQUISH: "Cancel",
  ACTION_DECLARE: "Declare Victory",
  ACTION_DENY: "Deny",
  ACTION_GUESS: "Guess",
  ACTION_CONTACT: "Contact!",
  ACTION_RETRACT: "Retract",
  ACTION_CONTEST: "Contest",
  ACTION_CANCEL: "Cancel",
  ACTION_CHAT: "Chat",

  // --- 8. System Logs & Chat (ChatWindow.jsx / CentralArea.jsx) ---
  LOG_PRIVATE_PREFIX: "Private",
  LOG_CLUE_HEADER: (playerName) => `Clue from ${playerName}`,
  LOG_CONTACT_ATTEMPT: (playerName) => `${playerName} is attempting contact...`,
  LOG_CLUE_PENDING: "Pending...",
  LOG_YOUR_GUESS: "YOUR GUESS:",

  // --- 9. Game Outcomes (CentralArea.jsx) ---
  WINNER_PLAYERS: "PLAYERS WIN",
  WINNER_WORDMASTER: "WORDMASTER WINS",
  PLAY_AGAIN_PROMPT: "Select Wordmaster to Play Again",

  // --- 10. Virtual Keyboard (VirtualKeyboard.jsx) ---
  KEY_ENTER: "DONE",
  KEY_DELETE: "DEL",
  KEY_SPACE: "SPACE"
};
