# Contact - Multiplayer Word Guessing Game

A robust, real-time implementation of the social word-guessing game **Contact**, optimized for mobile and cloud deployment.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express 5, Socket.io
- **Deployment:** Railway (Unified root configuration)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development servers:**
   ```bash
   npm run build # To generate dist for server serving
   npm start
   ```
   - Unified App: `http://localhost:3001` (Serves both API and Frontend)

---

## Project Specification: Contact Web App (V2.0)

### 1. Game Overview
**Contact** is a real-time social word-guessing game. A **Wordmaster** defends a secret word while **Players** attempt to reveal it letter-by-letter by coordinating clues for other words starting with the same prefix.

### 2. Core Gameplay Logic
- **Cancellable Roles:** A player can tap "WORDMASTER" to take the role, but can "CANCEL" to relinquish it if they haven't submitted a word yet.
- **Strict Prefix Logic:** All clues must start with the currently revealed letters.
- **Contact Persistence:** If a **CONTACT** attempt fails (words don't match), the clue **remains active**, allowing further guesses or new contact attempts.
- **Victory Declaration:** The Wordmaster can declare victory if players are stuck. This triggers a 10-second countdown that players must **CONTEST** to stop.
- **Countdown Timing:** Contact countdowns start at 4s (displaying "3" for 2 full seconds) to ensure fair reaction time over high-latency connections.

### 3. Mobile-First UI Specs
- **Adaptive Viewport:** Uses `100dvh` and `interactive-widget=resizes-content` to ensure the layout shrinks-to-fit when the mobile keyboard is active.
- **Dynamic Content Scaling:** 
  - Verified letters automatically scale font size and box dimensions based on word length (up to 12+ characters).
  - Horizontal margins are minimized to maximize horizontal screen space.
- **Intelligent Layout:**
  - **Dynamic Chat:** The chat window automatically hides when the mobile keyboard is active to give 100% vertical space to game actions.
  - **Chat Height:** Displays ~8 lines of history on mobile when the keyboard is down.
  - **Squat Countdowns:** During Victory or Contact events, verified letters are temporarily replaced by a horizontal, high-visibility countdown bar to prevent vertical overflow.
- **Android Support:** Specific input attributes suppress the Android autofill/suggestions bar to recover vertical pixels.

### 4. Connection Stability (Cloud Optimization)
- **Pure WebSocket Transport:** Forced `websocket` transport bypasses flaky polling-to-websocket upgrades often blocked by cloud proxies.
- **10-Second Grace Period:** If a player disconnects, the server waits 10 seconds before removing them. If they reconnect within this window, the game continues uninterrupted.
- **Session Resumption:** 
  - Usernames and Room IDs are persisted in `sessionStorage`.
  - Rejoining a room with the same username automatically restores the player's previous role (e.g., Wordmaster).
- **Network Efficiency:** Typing statuses are sent via a dedicated lightweight `TYPING_UPDATE` event, decoupled from the heavy `ROOM_UPDATE` state.

### 5. Deployment & Diagnostics
- **Express 5 Support:** Uses `app.use` catch-all middleware to bypass strict `path-to-regexp` wildcard issues.
- **Path Verification:** Server logs explicit absolute path verification for `index.html` at startup to prevent "blank screen" deployment errors.
- **Global Event Logging:** Comprehensive server-side logging of every game action (filtered for typing) provides a clear audit trail for debugging.

### 6. Validation & Feedback
- **Dictionary Validation:** Validates secret words and clues against a 178k+ word English dictionary (`words.txt`).
- **Private Messaging:** Error feedback (e.g., "Word not in dictionary") is sent as private system logs visible only to the individual player.
