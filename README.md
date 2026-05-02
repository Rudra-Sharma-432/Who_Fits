# Who Fits

A real-time multiplayer social party game built using **HTML, CSS, JavaScript** with **Firebase Realtime Database** as the backend.
Players join a room, see a phrase each round, and vote for who they think best fits it. The fun comes from the reveal — seeing who voted for whom.

---

# Tech Stack

* HTML
* CSS
* JavaScript
* Firebase Realtime Database
* GitHub Pages (for hosting)

---

# Database Structure

The Who Fits game stores its data in the following structure:

```
games
   Who_Fits
      rooms
         room_4821
            host: "player_1234_5678"
            roomID: 4821
            password: ""
            state: "lobby"
            playerCount: 3
            settings
               maxPlayers: 6
               maxRounds: 3
               resultTimer: 60
               maxVotesPerPlayer: 1
               anonymousVoting: false
            players
               player_1234_5678
                  name: "Rudra"
               player_9876_5432
                  name: "Aman"
               player_1111_2222
                  name: "Rahul"
            game
               round: 1
               word: "Most likely to survive a zombie apocalypse"
               playerOrder: ["player_1234_5678", "player_9876_5432", "player_1111_2222"]
            votes
               player_1234_5678: "player_9876_5432"
               player_9876_5432: "player_1111_2222"
```

---

# Game States

The room progresses through different states stored in `room.state`.

```
lobby      → Players are joining; host configures settings
playing    → Active round; phrase is shown and players vote
ended      → All rounds complete; game is over
```

Clients listen to the room state in real time and update the UI accordingly.

---

# Core Multiplayer Functions

The multiplayer system is built around these core functions:

```
createRoom()         → Host creates a new room with settings and joins it
joinRoom()           → Player joins an existing room by room name
leaveRoom()          → Player disconnects and their node is removed from Firebase
listenToRoom()       → Attaches a real-time Firebase listener; drives all state transitions
startGame()          → Host picks a phrase and writes game data to Firebase (round 1)
showRoundVoting()    → All players display the voting panel for the current round
showVotingResults()  → All players see the vote breakdown; host auto-advances
progressToNextRound()→ Host picks a new phrase, increments round, clears votes
endGame()            → Displays end screen and shows Play Again button to host
restartGame()        → Host resets room back to lobby state
```

---

# Room System

Rooms allow friends to play together privately or publicly.

Example flow:

```
Host creates room → Room code generated (e.g. 4821)
Host shares code  → Friends join via public list or private code
Players appear in lobby
Host adjusts settings (rounds, timer, vote count, anonymous mode)
Host clicks Start → 3-second countdown → game begins
```

**Disconnect Handling**: Firebase `onDisconnect()` automatically removes a player's data if they close the tab or lose connection.

---

# Phrase System

Phrases are stored in `phrases.js` as a nested array:

```
PHRASE_LIST → category[] → subCategory[] → phrase[]
```

Each round, the host picks:
1. A random **category** (e.g. Personality Chaos, Survival Logic, Internet Energy)
2. A random **subCategory** within it
3. A random **phrase** from that subCategory

Example phrases:
- *"Laughs at everything"*
- *"Would go viral accidentally"*
- *"Sacrifices self for team"*
- *"Writes code that somehow works"*

---

# Host Controls

The host (room creator) controls all game settings before the game starts:

| Setting | Description | Range |
|---|---|---|
| Max Players | How many players can join | 3 – 10 |
| Total Rounds | Number of voting rounds | 1 – 5 |
| Result Timer | Seconds to show results before next round | 10 – 120 sec |
| Votes Per Player | How many players each person can vote for | 1 – 3 |
| Anonymous Voting | Hides voter names in results | On / Off |

---

# Game Flow

```
1. Lobby      → Players join; host configures and starts
2. Phrase      → Phrase shown to all players for 3 seconds
3. Voting      → Players vote for who best fits the phrase
4. Results     → Vote breakdown shown; countdown to next round
5. Repeat      → Steps 2–4 repeat for each round
6. End Screen  → Host can restart or leave
```

---

# File Structure

```
index.html     → All panels and HTML structure
style.css      → Theming, layout, and component styles
main.js        → Firebase init, UI helpers, DOM references, lobby logic
game.js        → Room management, Firebase listeners, game state logic
phrases.js     → All phrase categories used during gameplay
config.js      → Firebase config (not tracked in version control)
```

---

# Credits

| | |
|---|---|
| **Creator** | Rudra Sharma |
| **Built With** | HTML · CSS · JavaScript · Firebase |
| **Game Type** | Social Party Game |
| **Version** | 1.0.0 |
| **Started** | 30 April, 2026 |
