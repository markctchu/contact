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

## Project Specification: Contact Web App (Updated)

### 1. Game Overview
**Contact** is a social word-guessing game where a **Wordmaster** defends a secret word while **Players (Attackers)** attempt to reveal it letter-by-letter by coordinating clues for other words.

### 2. Roles & Presence
- **Wordmaster:** One user who selects the secret word and denies player clues.
- **Players:** Everyone else in the room. They collaborate to trigger "Contact."
- **Typing Indicators:** Real-time status in the central area: *"[User] is typing..."*

### 3. User Interface & Layout

#### Unified Single-Column Layout
- **Top Bar:** Displays the Room Name and real-time count of connected players.
- **Main Central Area:**
  - **Intro State:** Displays "LET'S PLAY" and blue "CONTACT" tiles while waiting for the Wordmaster.
  - **Prefix Display:** Shows revealed letters in blue tiles, followed by a single blank tile (`_`) and ellipsis (`...`) to indicate further letters.
  - **Dynamic Scaling:** The entire center section scales automatically to fit any resolution (720p to 4K) and mobile devices without scrollbars.
- **Bottom Section:**
  - **Unified Chat & Logs:** A single scrollable window displaying both player chat and system game logs (Contact attempts, Denials, Successes, Retractions) with color-coded styling.
  - **Context-Aware Input:** A single input bar with a toggle button on the left (GUESS, CONTACT, DENY, etc.). Actions are submitted via the **Enter** key.

### 4. The Contact Loop
1. **Step 1:** A player clicks **GUESS** to submit a hidden clue word. 
2. **Step 2:** The player is automatically prompted to set a **HINT** (Public hint). They can click **RETRACT** at any time to cancel.
3. **Step 3:** The **CONTACT** (Players) and **DENY** (Wordmaster) prompts become available.
4. **Step 4:** If a player clicks **CONTACT** and submits a matching word, a 3-second countdown begins.
5. **Step 5:** If the timer expires without a successful Wordmaster **DENY**, the next letter is revealed.
   - **Secret Word Contact:** If players successfully contact on the actual secret word, they win immediately.

### 5. Victory Declaration & Endgame
- **Wordmaster Victory:** Triggered if the 10-second **DECLARE VICTORY** countdown expires without a player clicking **CONTEST**.
- **Player Victory:** Triggered if the secret word is fully revealed or if a **CONTACT** matches the secret word exactly.

### 6. Validation & Logic
- **Strict Prefix Matching:** Clues must start with the **entire** currently revealed prefix.
- **Dictionary Validation:** (Optional) If a `words.txt` file is present in the `server/` directory, secret words and clues are validated against it.
- **Private Feedback:** Invalid inputs result in a private [Private] system message visible only to the offending player.
- **Wordmaster Restriction:** The Wordmaster cannot deny a clue using the secret word itself.
- **Word Reuse:** Successfully contacted or denied words cannot be reused as clues in the same round.
- **Refreshes:** Retractions and actions are tied to usernames, ensuring stability across page refreshes or socket reconnections.