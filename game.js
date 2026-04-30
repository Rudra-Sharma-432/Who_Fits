// game.js
// ─────────────────────────────────────────────────────────────────
// Game back-end: all Firebase room/game operations live here.
// UI helpers and DOM references stay in main.js.
// Word data lives in words.js.
// ─────────────────────────────────────────────────────────────────

// Tracks which room and player seat belong to this browser tab
let currentRoom = null;
let currentPlayer = null;


// ═══════════════════════════════════════════════════════
//  ROOM MANAGEMENT
// ═══════════════════════════════════════════════════════

/** Creates a new room in Firebase and immediately joins it as host. */
function createRoom(playerName) {

  const roomId = Math.floor(Math.random() * 10000);
  const roomName = "room_" + roomId;
  const playerID = UID;

  const roomRef = db.ref("games/Who_Fits/rooms/" + roomName);

  roomRef.set({
    host: playerID,
    roomID: roomId,
    password: document.getElementById("room-password-input").value,
    state: "lobby",
    players: {
      [playerID]: {
        name: playerName,
      }
    },
    playerCount: 1,
    settings: {
      maxPlayers: maxPlayers,
      maxRounds: totalRounds,
      eachRoundTime: eachRoundTime,
      maxVotesPerPlayer: maxVotesPerPlayer,
      anonymousVoting: anonymousVote
    },
    game: {
      round: 1
    }
  });

  // After writing to Firebase, join the room as host
  joinRoom(roomName, playerID);
}


/** Adds the current player to an existing room and starts listening for updates. */
function joinRoom(roomName, playerId) {

  // If no playerId was supplied this is a regular (non-host) join
  if (!playerId) {
    playerId = UID;
    const playerRef = db.ref("games/Who_Fits/rooms/" + roomName + "/players/" + playerId);
    playerRef.set({ name: username });
  }

  // Remove the player from the database automatically if they disconnect
  const playerRef = db.ref("games/Who_Fits/rooms/" + roomName + "/players/" + playerId);
  playerRef.onDisconnect().remove();

  currentRoom = roomName;
  currentPlayer = playerId;

  listenToRoom(roomName);
  goToPanel("lobby");
}


/** Removes the current player from the room and navigates back to the join screen. */
function leaveRoom() {
  gameJoined = false;
  gameStarted = false;
  lastShownRound = 0;
  lastResultsRound = 0;

  if (currentRoom && currentPlayer) {
    // Delete this player's node from the database
    const playerRef = db.ref("games/Who_Fits/rooms/" + currentRoom + "/players/" + currentPlayer);
    playerRef.remove();

    // Detach the Firebase listener so it stops firing after leaving
    db.ref("games/Who_Fits/rooms/" + currentRoom).off();

    currentRoom = null;
    currentPlayer = null;
  }

  goToPanel("join-room");
}


// ═══════════════════════════════════════════════════════
//  REAL-TIME ROOM LISTENER
// ═══════════════════════════════════════════════════════

/** Attaches a Firebase "value" listener to the room; handles all state transitions. */
function listenToRoom(roomName) {
  db.ref("games/Who_Fits/rooms/" + roomName)
    .on("value", snapshot => {

      const room = snapshot.val();

      // ── Auto-delete empty rooms ──
      if (!room || !room.players || Object.keys(room.players).length === 0) {
        db.ref("games/Who_Fits/rooms/" + roomName).remove();
        return;
      }

      // ── Game was restarted: send everyone back to lobby ──
      if (room.state === "lobby") {
        gameStarted = false;
        gameJoined = false;
        lastShownRound = 0;
        lastResultsRound = 0;
        updatePlayersUI(room);
        goToPanel("lobby");
        return;
      }

      // ── Always keep the lobby player list up to date ──
      if (room.state === "lobby") {
        updatePlayersUI(room);
      }

      // ── Only the host writes game data to Firebase (prevents duplicate writes) ──
      if (room.state === "playing" && currentPlayer === room.host && room.game && !room.game.word) {
        startGame(room);
      }

      // ── Every player shows the round voting panel when a new word is revealed ──
      if (room.state === "playing" && room.game.word && room.game.round > lastShownRound) {
        lastShownRound = room.game.round;
        showRoundVoting(room);
      }

      // ── All players show voting results when voting is complete ──
      if (room.state === "playing" && room.votes && gameJoined) {
        const votes = room.votes || {};
        const playerIds = Object.keys(room.players);
        if (Object.keys(votes).length === playerIds.length && room.game.round > lastResultsRound) {
          lastResultsRound = room.game.round;
          showVotingResults(room);
        }
      }

      // ── All players show end screen when game ends ──
      if (room.state === "ended" && gameStarted) {
        endGame(room);
      }

    });
}


// ═══════════════════════════════════════════════════════
//  GAME START  (host only)
// ═══════════════════════════════════════════════════════

/**
 * Called by the host when state changes to "playing" and no word exists yet.
 * Picks a random imposter, word, and discussion order, then writes them to Firebase.
 * All players read these values through listenToRoom().
 */
function startGame(room) {

  const roomRef = db.ref("games/Who_Fits/rooms/" + currentRoom);
  const players = Object.keys(room.players);
  const playerCount = players.length;

  // Pick a random word: category → subCategory → word  (from words.js)
  const category = PHRASE_LIST[Math.floor(Math.random() * PHRASE_LIST.length)];
  const subCategory = category[Math.floor(Math.random() * category.length)];
  const word = subCategory[Math.floor(Math.random() * subCategory.length)];

  document.getElementById('show-phrase').innerText = `Phrase: ${word}`;

  roomRef.update({
    state: "playing",
    playerCount: playerCount,
    game: {
      round: 1,
      word: word,
      playerOrder: players
    }
  });

  if (currentPlayer === room.host) {
    document.getElementById("play-again-btn").classList.remove('hidden');
  }
}


// ═══════════════════════════════════════════════════════
//  GAME JOIN  (all players)
// ═══════════════════════════════════════════════════════

/**
 * Runs when a new round's word is revealed.
 * Shows the word for 3 seconds, then displays voting panel.
 */
async function showRoundVoting(room) {

  gameStarted = true;
  if (!gameJoined) {
    gameJoined = true;
  }

  document_VOTNG_TABLET.classList.remove('voted');

  const playerCount = room.players ? Object.keys(room.players).length : 0;

  // ── Role reveal: show word for 3 seconds ──
  document_SHOW_ROLE_DIV.style.backgroundColor = "var(--card-bg)";
  document_SHOW_ROLE_DIV.style.display = "flex";

  document_SHOW_ROLE_DIV.innerHTML = `<h1>Word: ${room.game.word}</h1>`;
  console.log("Round " + room.game.round + " - Phrase: ", room.game.word);

  await wait(3000);
  document_SHOW_ROLE_DIV.innerHTML = "";
  document_SHOW_ROLE_DIV.style.display = "none";

  // ── Show voting panel ──
  document.getElementById('show-phrase').innerText = `Phrase: ${room.game.word}`;
  createDivs(document_VOTNG_TABLET, playerCount, room);
  goToPanel("voting");
}





/**
 * Displays voting results for 120 seconds, then auto-progresses (host only).
 */
async function showVotingResults(room) {

  goToPanel("results");
  renderVoteResults(room);

  const countdownEl = document.getElementById("results-countdown");
  
  // Countdown 120 seconds
  for (let i = room.settings.eachRoundTime; i >= 0; i--) {
    await wait(1000);
    countdownEl.innerText = `Next round in: ${i} sec`;
  }

  // Only host progresses to next round or ends game
  if (currentPlayer === room.host) {
    if (room.game.round < room.settings.maxRounds) {
      progressToNextRound(room);
    } else {
      db.ref("games/Who_Fits/rooms/" + currentRoom).update({ state: "ended" });
    }
  }
}


/**
 * Host picks a new word, increments round, clears votes, and updates Firebase.
 */
function progressToNextRound(room) {

  // Pick a new word: category → subCategory → word
  const category = PHRASE_LIST[Math.floor(Math.random() * PHRASE_LIST.length)];
  const subCategory = category[Math.floor(Math.random() * category.length)];
  const word = subCategory[Math.floor(Math.random() * subCategory.length)];

  document.getElementById('show-phrase').innerText = `Phrase: ${word}`;

  // Update room with next round (preserve playerOrder!)
  db.ref("games/Who_Fits/rooms/" + currentRoom).update({
    game: {
      round: room.game.round + 1,
      word: word,
      playerOrder: room.game.playerOrder
    },
    votes: null
  });
}


/**
 * Shows the end-game screen and gives host the "Play Again" button.
 */
function endGame(room) {

  // Prevent further progression
  gameStarted = false;

  // Clear the voted state to make the play-again button clickable
  document_VOTNG_TABLET.classList.remove('voted');

  // Show the voting panel (displays results from last round)
  goToPanel("voting");

  // Display play again UI
  showPlayAgainUI(room);
}