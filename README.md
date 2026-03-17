# Contact - Multiplayer Word Guessing Game

A full-stack implementation of the social word-guessing game **Contact**.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express, Socket.io
- **Orchestration:** Concurrently

## Getting Started

1. **Install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Run the development servers:**
   ```bash
   npm start
   ```
   - Client: `http://localhost:5173`
   - Server: `http://localhost:3001`

## Project Specification: Contact Web App

### 1. Game Overview
**Contact** is a social word-guessing game where a **Wordmaster** defends a secret word while **Players (Attackers)** attempt to reveal it letter-by-letter by coordinating clues for other words.

### 2. Roles & Presence
- **Wordmaster:** One user who selects the secret word and denies player clues.
- **Players:** Everyone else in the room. They collaborate to trigger "Contact."
- **Typing Indicators:** Real-time status in the central area: *"[User] is typing a clue/guess..."*

### 3. User Interface & Layout

#### Left Sidebar: Action Log
Consists solely of:
- `[Player name] contacted [Player name] to guess [CLUE WORD]`
- `[Wordmaster] denied [Player name]'s guess of [CLUE WORD]`
- `[Wordmaster] declared victory!`
- `[Player name] contested victory!`
- `[System] Game Over! The word was [SECRET WORD]`

#### Main Central Area
- **Current Verified Letters:** The revealed prefix.
- **Current Clue:** The active hint text.
- **Active Typing Status:** Who is typing and their intent.
- **Countdowns:** Visual timers for Contact (3s) and Victory (10s).

#### Bottom Section: Dynamic Input & Chat
A context-aware section where users see at most one prompt action at a time.
- **General State:** Standard chat box with scrollable history.
- **Prompt Actions:**
  - **GUESS/CLUE:** For players submitting a clue.
  - **CONTACT:** For players matching an active clue.
  - **DENY:** For Wordmasters to kill a clue.
  - **DECLARE VICTORY:** (Wordmaster only) Available only when no active clue is present.
  - **CONTEST:** (Players only) Appears only during a Victory countdown.
  - **CANCEL:** To exit a current action.
  - **BECOME WORDMASTER:** Appears after a game ends to start a new round.

### 4. The Contact Loop
1. **Step 1:** A player clicks **GUESS** to submit a hidden clue word. This locks out all other GUESS prompts. Anyone else currently typing a guess has their input cleared and is reverted to chat.
2. **Step 2:** The player clicks **CLUE** to submit the public hint.
3. **Step 3:** The **CONTACT** (Players) and **DENY** (Wordmaster) prompts become available.
4. **Step 4:** If a player clicks **CONTACT** and submits a guess, a 3-second countdown begins.
5. **Step 5:** If the timer expires without a successful Wordmaster **DENY**, the backend validates.
   - **Match:** New letter revealed.
   - **No Match:** Clue cleared.

### 5. Victory Declaration & Endgame

#### Wordmaster Victory
- **Trigger:** The Wordmaster can click **DECLARE VICTORY** at any time, provided there is no active clue to deny.
- **The Victory Countdown:** A 10-second timer triggers for the whole room.
- **The Contest:** During these 10 seconds, all Players' prompts change to **CONTEST**.
- **Resolution:**
  - If a player clicks **CONTEST**, the countdown is cancelled, the Wordmaster's declaration is voided, and play continues.
  - If the 10 seconds expire with no contest, the Wordmaster wins.

#### Player Victory
- **Trigger:** Players win if the secret word is fully revealed or if a **GUESS** matches the Wordmaster's secret word exactly.

### 6. Starting a New Round
- Once a game ends, the Action Log announces the result and the central area displays the full Secret Word.
- The bottom prompt changes to **BECOME WORDMASTER**.
- The first person to click **BECOME WORDMASTER** is assigned the role and can immediately submit a new secret word to start the next round.

### 7. Technical Constraints
- **Prompt Exclusivity:** The backend must ensure that the state only allows one action type per user.
- **Real-time Sync:** All state changes (letters, clues, timers, typing status) are pushed via Socket.io.
- **Validation:** All words must be validated against a dictionary; proper nouns and archaic terms are prohibited.