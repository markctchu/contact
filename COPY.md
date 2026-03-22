# Application Copy: Single Source of Truth

This document serves as the master record for all player-facing text in the Contact webapp. To update the UI, modify the values here and the changes will be propagated throughout the codebase.

## 1. Identity & Landing
| Key | Default Value | Location | Function |
| :--- | :--- | :--- | :--- |
| APP_TITLE | Contact | App.jsx | Main logo/title text |
| TAGLINE | A GAME ABOUT HAVING THE LAST WORD | App.jsx | Brand subtitle on login |
| LOGIN_LABEL | Choose your name | App.jsx | Placeholder for username input |
| LOGIN_CTA | Enter Game | App.jsx | Main entry button |

## 2. Lobby & Session Management
| Key | Default Value | Location | Function |
| :--- | :--- | :--- | :--- |
| LOBBY_TITLE | Lobby | Lobby.jsx | Header for the room list |
| LOBBY_SUBTITLE | Active Sessions for | Lobby.jsx | Welcome text above rooms |
| ROOM_LIST_HEADER | Current Games | Lobby.jsx | Label for active rooms section |
| ROOM_COUNT_SUFFIX | Total | Lobby.jsx | Suffix for the room counter badge |
| NO_ROOMS_MSG | No active rooms | Lobby.jsx | Displayed when list is empty |
| JOIN_BUTTON | Join | Lobby.jsx | Button to enter an existing room |
| CREATE_HEADER | Host Game | Lobby.jsx | Header for room creation section |
| ROOM_NAME_PLACEHOLDER | Room Name | Lobby.jsx | Placeholder for room name input |
| CREATE_BUTTON | Launch Session | Lobby.jsx | Button to create and join room |

## 3. Game Room Interface
| Key | Default Value | Location | Function |
| :--- | :--- | :--- | :--- |
| ROOM_STATUS_TAG | Active Session | GameRoom.jsx | Small tag under room name |
| PLAYER_COUNT_LABEL | Entities | GameRoom.jsx | Label for the user count badge |
| KEYBOARD_COLLAPSE | Collapse Keys | BottomInput.jsx | Desktop toggle to hide keyboard |
| KEYBOARD_EXPAND | Expand Keys | BottomInput.jsx | Desktop toggle to show keyboard |
| MODE_ACTIVE_SUFFIX | Mode Active | BottomInput.jsx | Indicator when a specific action is selected |

## 4. Central Area States (Game Tiles)
| Key | Default Value | Location | Function |
| :--- | :--- | :--- | :--- |
| WORD_LABEL_INPUT | THEY'LL NEVER GUESS | CentralArea.jsx | Label while user is typing a word |
| WORD_LABEL_REVEALED | IT STARTS WITH | CentralArea.jsx | Label for the revealed prefix |
| WORD_LABEL_INIT | PREPARE TO MAKE | CentralArea.jsx | Label before any word is set |
| STATUS_WAITING | Tap Wordmaster to Begin | CentralArea.jsx | Prompt for players to start game |
| STATUS_SETTING_WM | ENTER YOUR SECRET WORD ABOVE | CentralArea.jsx | Instruction for Wordmaster setting word |
| STATUS_SETTING_PL | Wordmaster is thinking... | CentralArea.jsx | Message for players while word is being set |
| STATUS_PLAYING_EMPTY | AWAITING GUESS SUBMISSION | CentralArea.jsx | Initial state when no clues are active |
| TYPING_SUFFIX | is typing... | CentralArea.jsx | Text after names in typing indicator |

## 5. Active Event Overlays (Countdowns)
| Key | Default Value | Location | Function |
| :--- | :--- | :--- | :--- |
| VICTORY_TITLE | Wordmaster has Declared Victory! | CentralArea.jsx | Warning when WM hits victory button |
| VICTORY_SUBTITLE | Contest to stop the countdown | CentralArea.jsx | Call to action during victory countdown |
| VICTORY_PENDING_TITLE | Victory Pending | CentralArea.jsx | Alternative header for victory event |
| VICTORY_PENDING_SUB | Contest to Intercept | CentralArea.jsx | Alternative subtext for victory event |
| CONTACT_TITLE | Contact | CentralArea.jsx | Large header during a contact event |

## 6. Action Mode Placeholders (Input Area)
| Key | Default Value | Location | Function |
| :--- | :--- | :--- | :--- |
| PLACEHOLDER_SECRET | SUBMIT SECRET WORD | UnifiedInput.jsx | Wordmaster setting their word |
| PLACEHOLDER_GUESS | SUBMIT GUESS WORD | UnifiedInput.jsx | Player entering a hidden word |
| PLACEHOLDER_HINT | PROVIDE HINT FOR CONTACT | UnifiedInput.jsx | Player entering hint for their word |
| PLACEHOLDER_CONTACT | SOLVE THE CLUE | UnifiedInput.jsx | Player attempting to match a clue |
| PLACEHOLDER_DENY | INTERCEPT CONTACT | UnifiedInput.jsx | Wordmaster guessing a clue |
| PLACEHOLDER_CHAT | SEND CHAT MESSAGE | UnifiedInput.jsx | Default state for general chat |
| HINT_INPUT_PROMPT | THE PERFECT CLUE: | CentralArea.jsx | Prompt above the hint input box |
| HINT_INPUT_AWAITING | Enter Clue here... | CentralArea.jsx | Placeholder inside the hint box |

## 7. Dynamic Buttons (Action Bar)
| Key | Default Value | Location | Function |
| :--- | :--- | :--- | :--- |
| ACTION_WM | Wordmaster | ActionToggleButton.jsx | Button to take the lead role |
| ACTION_RELINQUISH | Cancel | ActionToggleButton.jsx | Button to back out of Wordmaster |
| ACTION_DECLARE | Declare Victory | ActionToggleButton.jsx | WM's button to trigger endgame |
| ACTION_DENY | Deny | ActionToggleButton.jsx | WM's button to guess a clue |
| ACTION_GUESS | Guess | ActionToggleButton.jsx | Player's button to start a clue |
| ACTION_CONTACT | Contact! | ActionToggleButton.jsx | Player's button to match a clue |
| ACTION_RETRACT | Retract | ActionToggleButton.jsx | Player's button to pull their clue |
| ACTION_CONTEST | Contest | ActionToggleButton.jsx | Player's button to stop WM victory |
| ACTION_CANCEL | Cancel | ActionToggleButton.jsx | Generic cancel for current mode |
| ACTION_CHAT | Chat | ActionToggleButton.jsx | Label for the default state |

## 8. System Logs & Chat
| Key | Default Value | Location | Function |
| :--- | :--- | :--- | :--- |
| LOG_PRIVATE_PREFIX | Private | ChatWindow.jsx | Tag for messages only the user sees |
| LOG_CLUE_HEADER | Clue from | CentralArea.jsx | Identification above an active clue |
| LOG_HINT_PENDING | Pending... | CentralArea.jsx | Displayed while clue owner types hint |

## 9. Automated Chat Messages (Server-side)
| Key | Value Pattern | Logic |
| :--- | :--- | :--- |
| MSG_JOINED | [User] joined the room. | roomManager.js |
| MSG_LEFT | [User] left the room. | roomManager.js |
| MSG_WM_LEFT | [User] (Wordmaster) left. Game reset. | roomManager.js |
| MSG_GUESS_LEFT | [User]'s guess was removed as they left. | roomManager.js |
| MSG_WM_ASSIGNED | [User] is now the Wordmaster. | roomManager.js |
| MSG_WM_RELINQUISHED | [User] has relinquished Wordmaster. | index.js |
| MSG_GAME_STARTED | Game Started! Revealed: [Prefix] | roomManager.js |
| MSG_GUESS_SUBMITTED | [User] submitted a new guess: "[Clue]" | roomManager.js |
| MSG_CONTACT_ATTEMPT | [User1] and [User2] are attempting contact... | roomManager.js |
| MSG_INTERCEPTED | Wordmaster intercepted! The word was [Word] | roomManager.js |
| MSG_VICTORY_DECLARED | Wordmaster is declaring victory! | roomManager.js |
| MSG_VICTORY_CONTESTED | [User] contested the victory! | roomManager.js |
| MSG_GUESS_RETRACTED | [User] retracted their guess. | roomManager.js |
| MSG_CONTACT_SUCCESS_GAME | VICTORY! [User1] and [User2] contacted the secret word: [Word] | roomManager.js |
| MSG_CONTACT_SUCCESS_CHAR | Contact! [User1] and [User2] successfully guessed [Word] | roomManager.js |
| MSG_CONTACT_FAILED | Contact failed! Words did not match. | roomManager.js |
| MSG_PLAYERS_WIN | Game Over! Players win! The word was [Word] | roomManager.js |
| MSG_WM_WINS | Game Over! Wordmaster wins! The word was [Word] | roomManager.js |

## 10. Virtual Keyboard
| Key | Default Value | Location | Function |
| :--- | :--- | :--- | :--- |
| KEY_ENTER | DONE | VirtualKeyboard.jsx | Label for the action/submit key |
| KEY_DELETE | DEL | VirtualKeyboard.jsx | Label for the backspace key |
| KEY_SPACE | SPACE | VirtualKeyboard.jsx | Label for the space key |
