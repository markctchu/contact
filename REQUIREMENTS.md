# Requirements & User Stories: Contact Web App

This document outlines the functional requirements and user stories for the **Contact** web application, covering the end-to-end player experience from joining to victory.

---

## 1. Identity & Lobby Management
*As a player, I want a seamless entry into the game so I can start playing with friends quickly.*

- **User Story 1.1: Unique Identity**
  - **Requirement:** Users must enter a username before accessing the lobby.
  - **Details:** The username is persisted in `sessionStorage` so that accidental refreshes do not require re-entry.
- **User Story 1.2: Room Creation**
  - **Requirement:** Any user can create a new game room with a custom name.
  - **Details:** Upon creation, the creator is automatically joined into the room.
- **User Story 1.3: Lobby Visibility**
  - **Requirement:** Users can see a real-time list of all active rooms, their player counts, and current game status.
- **User Story 1.4: Direct Joining**
  - **Requirement:** Users can join any active room with a single tap/click.

---

## 2. Role Management (Wordmaster)
*As a player, I want clear control over taking or relinquishing the lead role.*

- **User Story 2.1: Taking the Lead**
  - **Requirement:** Any player in a 'Waiting' or 'Game Over' room can tap **WORDMASTER** to start a new round.
- **User Story 2.2: Secret Word Submission**
  - **Requirement:** The Wordmaster must submit a valid English word (at least 2 letters) from the dictionary.
  - **Details:** The first letter is automatically revealed to all players as the initial prefix.
- **User Story 2.3: Relinquishing the Role**
  - **Requirement:** If I tap Wordmaster by mistake or cannot think of a word, I can tap **CANCEL** to return the room to 'Waiting' status.
  - **Details:** A system message must notify the room: *"[User] has relinquished Wordmaster."*

---

## 3. Core Gameplay Loop (Players)
*As a player (Attacker), I want to coordinate with others to reveal the secret word.*

- **User Story 3.1: Submitting a Clue**
  - **Requirement:** Players can submit a "hidden" clue word that starts with the currently revealed prefix.
- **User Story 3.2: Setting a Hint**
  - **Requirement:** After submitting a clue word, the player is prompted to provide a public "hint" for that word.
- **User Story 3.3: Calling Contact**
  - **Requirement:** Other players (not the Wordmaster or Clue Owner) can tap **CONTACT** if they think they know the hidden word.
  - **Details:** This triggers a 4-second countdown (starting at "3" for visibility).
- **User Story 3.4: Victory by Contact**
  - **Requirement:** If two players successfully match words and the word is the **Secret Word**, the players win immediately.
- **User Story 3.5: Prefix Advancement**
  - **Requirement:** If two players match words and it is *not* the secret word, the next letter of the secret word is revealed.

---

## 4. Wordmaster Defense
*As the Wordmaster, I want to block player clues to protect my secret word.*

- **User Story 4.1: Denying a Clue**
  - **Requirement:** The Wordmaster can tap **DENY** and enter a word to guess the hidden clue.
  - **Details:** If the Wordmaster is correct, the clue is discarded.
- **User Story 4.2: Deny Restriction**
  - **Requirement:** The Wordmaster cannot use the actual Secret Word to deny a clue.
- **User Story 4.3: Declaring Victory**
  - **Requirement:** If players are stuck, the Wordmaster can tap **DECLARE VICTORY**.
  - **Details:** This triggers a 10-second countdown. If no player **CONTESTS** it, the Wordmaster wins.

---

## 5. Mobile & UI Excellence
*As a mobile player, I want an interface that adapts to my device and keyboard.*

- **User Story 5.1: Dynamic Viewport**
  - **Requirement:** The app layout must "shrink-to-fit" when the mobile keyboard appears, ensuring game elements stay centered and visible.
- **User Story 5.2: Dynamic Font Scaling**
  - **Requirement:** Verified letter tiles must automatically shrink as the secret word gets longer to prevent horizontal scrolling.
- **User Story 5.3: Intelligent Space Management**
  - **Requirement:** The chat window must automatically hide when the keyboard is active to maximize space for game actions.
- **User Story 5.4: Squat Countdowns**
  - **Requirement:** During active countdowns, the verified letters should disappear and be replaced by a compact, horizontal countdown bar to save vertical space.

---

## 6. Stability & Resilience
*As a player on a spotty connection, I want the game to survive brief signal drops.*

- **User Story 6.1: Disconnection Grace Period**
  - **Requirement:** If I lose my signal, the server must wait 10 seconds before removing me from the room.
- **User Story 6.2: Automatic Reconnection**
  - **Requirement:** The app must automatically re-join my current room and restore my role (e.g., Wordmaster) as soon as the connection returns.
- **User Story 6.3: Transport Robustness**
  - **Requirement:** The connection should prefer WebSockets for speed but support Polling for compatibility with restricted networks.
- **User Story 6.4: Real-time Presence**
  - **Requirement:** I want to see exactly who is typing and what their "intent" is (e.g., "User is typing a clue...") in the central area.

---

## 7. Validation & Feedback
- **User Story 7.1: Dictionary Enforcement**
  - **Requirement:** Secret words and clues must be validated against a 170k+ English dictionary.
- **User Story 7.2: Private Error Messages**
  - **Requirement:** If I submit an invalid word, I should receive a private [Private] message in the chat explaining the error without cluttering the room for others.
