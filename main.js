// main.js
// ─────────────────────────────────────────────────────────────────
// UI layer: Firebase init, panel navigation, lobby UI, DOM refs,
// player settings (username / UID), and game settings sliders.
// Game room logic lives in game.js. Word data lives in words.js.
// ─────────────────────────────────────────────────────────────────


// ═══════════════════════════════════════════════════════
//  GLOBALS
// ═══════════════════════════════════════════════════════

const PANEL_DIVS = document.querySelectorAll('div.panel');

// Flags that prevent duplicate game-join and game-start calls
let gameStarted = false;
let gameJoined = false;

// Tracks the last round shown to prevent duplicate displays
let lastShownRound = 0;

// Tracks which round we've already shown results for (prevents duplicate displays)
let lastResultsRound = 0;


// ═══════════════════════════════════════════════════════
//  FIREBASE INIT
// ═══════════════════════════════════════════════════════

// firebaseConfig is defined in config.js (loaded before this script)
firebase.initializeApp(firebaseConfig);
const db = firebase.database();


// ═══════════════════════════════════════════════════════
//  PANEL NAVIGATION
// ═══════════════════════════════════════════════════════

/** Hides every panel then reveals the one whose id is "<name>-panel". */
function goToPanel(name) {
  PANEL_DIVS.forEach(div => div.classList.add('hidden'));
  document.getElementById(`${name}-panel`).classList.remove('hidden');
}


// ═══════════════════════════════════════════════════════
//  LIVE ROOM LIST  (Join Room panel)
// ═══════════════════════════════════════════════════════

// Watches all active rooms and re-renders the join-room list in real time
db.ref("games/Who_Fits/rooms/")
  .on("value", snapshot => {

    const rooms = snapshot.val();
    const container = document.getElementById("rooms");
    container.innerHTML = "";

    if (!rooms) return;

    for (const roomId in rooms) {
      const room = rooms[roomId];
      const playerCount = room.players ? Object.keys(room.players).length : 0;

      // Resolve host display name from the players object
      const hostId = room.host;
      const hostName = room.players?.[hostId]?.name ?? "Unknown";

      const div = document.createElement("div");
      div.className = "room-joining-div";
      div.innerHTML = `
        <div class="room-info">
          <span class="room-id">${roomId}</span>
          <span class="host-name">${hostName}</span>
        </div>
        <p>${playerCount}/${room.settings.maxPlayers}</p>
      `;

      // Clicking a room card calls joinRoom() in game.js
      div.onclick = () => joinRoom(roomId);
      container.appendChild(div);
    }

  });


// ═══════════════════════════════════════════════════════
//  LOBBY UI  —  DOM references
// ═══════════════════════════════════════════════════════

const document_LOBBY_PANEL = document.getElementById("lobby-panel");
const document_LOBBY_ROOM_ID = document.getElementById("lobby-room-id");
const document_LOBBY_HOST = document.getElementById("lobby-host");
const document_LOBBY_PLAYER_COUNT = document.getElementById("lobby-player-count");
const document_LOBBY_PLAYER_LIST = document.getElementById("lobby-player-list");
const document_LOBBY_START_BUTTON = document.getElementById("lobby-start-button");
const document_SHOW_ROLE_DIV = document.getElementById("show-role");


/** Re-renders all lobby info whenever the room snapshot updates. */
function updatePlayersUI(room) {

  document_LOBBY_ROOM_ID.innerText = "room id : " + room.roomID;
  document_LOBBY_HOST.innerText = "host : " + room.players[room.host].name;
  document_LOBBY_PLAYER_COUNT.innerText = "player count : " +
    Object.keys(room.players).length + "/" + room.settings.maxPlayers;

  // Only the host sees the Start button
  if (currentPlayer === room.host) {
    document_LOBBY_START_BUTTON.classList.remove("hidden");
  } else {
    document_LOBBY_START_BUTTON.classList.add("hidden");
  }

  // Rebuild player list
  let playerListHTML = "";
  for (const playerId in room.players) {
    playerListHTML += `<p>${room.players[playerId].name}</p>`;
  }
  document_LOBBY_PLAYER_LIST.innerHTML = playerListHTML;
}


// ═══════════════════════════════════════════════════════
//  START GAME  (host only)
// ═══════════════════════════════════════════════════════

// TYPO FIX: was "Start Gmae by host"
/** Host triggers a 3-second countdown then sets room state to "playing". */
async function startGameByHost() {

  // Extract the numeric room ID from the displayed text ("room id : 1234" → "1234")
  const roomId = document_LOBBY_ROOM_ID.innerText.trim().split(/\s+/).pop();
  const roomRef = db.ref("games/Who_Fits/rooms/room_" + roomId);

  document_LOBBY_START_BUTTON.classList.add("hidden");

  const countdown = document.getElementById("lobby-countdown");
  countdown.innerText = "Starting Game in 3..."; await wait(1000);
  countdown.innerText = "Starting Game in 2..."; await wait(1000);
  countdown.innerText = "Starting Game in 1..."; await wait(1000);
  countdown.innerText = ""; // Clear countdown text when done

  // Changing state to "playing" triggers startGame() via listenToRoom()
  roomRef.update({ state: "playing" });
}


// ═══════════════════════════════════════════════════════
//  UTILITY
// ═══════════════════════════════════════════════════════

/** Returns a Promise that resolves after `ms` milliseconds. */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function votedTo(i, room) {
  document_VOTNG_TABLET.classList.add("voted");

  document.getElementById(`voting-tablet-child-${i + 1}`).style.backgroundColor = "var(--accent)";

  const votesRef = db.ref("games/Who_Fits/rooms/" + currentRoom + "/votes");
  votesRef.update({
    [currentPlayer]: room.game.playerOrder[i]
  });

  console.log(currentPlayer, room.game.playerOrder[i]);
  console.log(`Player: ${room.players[currentPlayer].name}, Voted to: ${room.players[room.game.playerOrder[i]].name}`);
}

// ═══════════════════════════════════════════════════════
//  MEETING TABLET  —  DOM references & helpers
// ═══════════════════════════════════════════════════════

const document_MEETING_TABLET = document.getElementById("meeting-tablet");
const document_VOTNG_TABLET = document.getElementById("voting-tablet");


/**
 * Fills a parent div with `num` child cards, one per player.
 * Each card shows the player's name in discussion order.
 */
function createDivs(parentDIV, num, room) {
  parentDIV.innerHTML = '';

  for (let i = 0; i < num; i++) {
    const newDiv = document.createElement("div");

    newDiv.id = `${parentDIV.id}-child-${i + 1}`;

    const newP = document.createElement("p");
    newP.textContent = room.players[room.game.playerOrder[i]].name;
    newP.style.display = "inline-block";

    const newButton = document.createElement("button");
    newButton.textContent = "Vote";
    newButton.classList.add("vote-btn");
    newButton.style.display = "inline-block";
    newButton.addEventListener("click", () => {
      votedTo(i, room);
    });

    newDiv.appendChild(newP);
    newDiv.appendChild(newButton);

    // Base card styles
    newDiv.style.margin = "0px";
    newDiv.style.padding = "15px 35px";
    newDiv.style.backgroundColor = "#000";
    newDiv.style.borderRadius = "10px";
    newDiv.classList.add("child-div");

    parentDIV.appendChild(newDiv);
  }
}

/** Hook for future per-card modifications (currently a placeholder). */
function modifyMeetingTablet(numberOfPlayers) {
  for (let i = 0; i < numberOfPlayers; i++) {
    // const div = document.getElementById(`meeting-tablet-child-${i + 1}`);
    // Future per-card customizations go here
  }
}


// ═══════════════════════════════════════════════════════
//  PLAYER TURN TIMER
// ═══════════════════════════════════════════════════════

const document_MEETING_ROUND = document.getElementById("meeting-round");

/**
 * Highlights the active player's card and counts down their discussion timer.
 * @param {number} i      - Zero-based index of the current speaker.
 * @param {object} room   - Current room snapshot.
 * @param {number} round  - Current round number (1-based).
 */
async function playerTurn(i, room, round) {

  document_MEETING_ROUND.innerText = `Round : ${round}/${room.settings.maxRounds}`;

  const div = document.getElementById(`meeting-tablet-child-${i + 1}`);
  const timer = room.settings.eachRoundTime;

  // Highlight the active player's card
  div.style.backgroundColor = "var(--accent)";
  div.style.color = "var(--text-secondary)";
  div.style.width = "100%";
  div.style.flexDirection = "row";
  div.style.justifyContent = "space-between";
  div.innerHTML = `
    <p>${room.players[room.game.discussionOrder[i]].name}</p>
    <p id='player${i + 1}-timer'>${timer} sec</p>
  `;

  // Count down every second
  for (let j = timer - 1; j >= 0; j--) {
    await wait(1000);
    document.getElementById(`player${i + 1}-timer`).innerText = `${j} sec`;
  }
}


// ═══════════════════════════════════════════════════════
//  ACCOUNT  —  Username
// ═══════════════════════════════════════════════════════

const document_CURRENT_USERNAME = document.getElementById("current-username");
const document_USERNAME_INPUT = document.getElementById("username-input");

// Load saved username or generate a random guest name
var username = localStorage.getItem("username") || "Player_" + Math.floor(Math.random() * 100);
document_CURRENT_USERNAME.innerText = "Current Username: " + username;


/** Saves the new username to localStorage and updates the display. */
function setUserName() {
  const tag = document_USERNAME_INPUT.value.trim().replaceAll(" ", "_");

  // TYPO/BUG FIX: was checking `username.length` (old value) instead of `tag.length` (new value)
  if (tag.length === 0) {
    alert("Username cannot be empty");
    return;
  }

  localStorage.setItem("username", tag);
  username = tag;
  document_CURRENT_USERNAME.innerText = "Current Username: " + username;
  document_USERNAME_INPUT.value = "";
}


// ═══════════════════════════════════════════════════════
//  ROOM SETTINGS  —  Sliders
// ═══════════════════════════════════════════════════════

// Default values (must match the HTML range input defaults in index.html)
var maxPlayers = 6;
var totalRounds = 2;
var eachRoundTime = 60;
var maxVotesPerPlayer = 1;
var anonymousVote = false;

document.getElementById('maxPlayer-input').addEventListener('input', function () {
  maxPlayers = parseInt(this.value);
  document.getElementById('maxPlayer-val').textContent = maxPlayers;
});

document.getElementById('totalRounds-input').addEventListener('input', function () {
  totalRounds = parseInt(this.value);
  document.getElementById('totalRounds-val').textContent = totalRounds;
});

document.getElementById('eachRoundTime-input').addEventListener('input', function () {
  eachRoundTime = parseInt(this.value);
  document.getElementById('discussionTime-val').textContent = eachRoundTime;
});

document.getElementById('maxVotes-input').addEventListener('input', function () {
  maxVotesPerPlayer = parseInt(this.value);
  document.getElementById('maxVotes-input').textContent = maxVotesPerPlayer;
});

document.getElementById('anonymousVote-input').addEventListener('change', () => {
  anonymousVote = document.getElementById('anonymousVote-input').checked;
});


// ═══════════════════════════════════════════════════════
//  UID  —  Persistent player identity
// ═══════════════════════════════════════════════════════

// Generated once per browser and stored forever; used as the Firebase player key
var UID = localStorage.getItem("uid");
if (!UID) {
  UID = "player_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
  localStorage.setItem("uid", UID);
}


// ═══════════════════════════════════════════════════════
//  POST-GAME  —  Restart & Play-Again UI
// ═══════════════════════════════════════════════════════

/** Host resets the room back to lobby state so a new game can begin. */
function restartGame() {
  gameJoined = false;
  lastShownRound = 0;
  lastResultsRound = 0;
  const roomRef = db.ref("games/Who_Fits/rooms/" + currentRoom);

  roomRef.update({
    state: "lobby",
    votes: null,
    game: { round: 1 }
  });
}

/**
 * Shows the "Play Again" button to the host and a waiting message to other players.
 * Called at the end of startMeeting() when the voting panel is displayed.
 */
function showPlayAgainUI(room) {
  const btn = document.getElementById("play-again-btn");
  const msg = document.getElementById("play-again-msg");

  if (currentPlayer === room.host) {
    btn.classList.remove("hidden");
    msg.classList.add("hidden");
  } else {
    btn.classList.add("hidden");
    msg.classList.remove("hidden");
  }
}

document.getElementById('play-again-btn').addEventListener('click', restartGame);



/**
 * Renders the vote breakdown for each player.
 * Shows who voted for whom (or vote counts if anonymous).
 */
function renderVoteResults(room) {
  const resultsTablet = document.getElementById("results-tablet");
  resultsTablet.innerHTML = "";

  const votes = room.votes || {};
  const isAnonymous = room.settings.anonymousVoting;

  // Reverse the votes: votedForId -> [voterId1, voterId2, ...]
  const voteBreakdown = {};
  for (const voterId in votes) {
    const votedForId = votes[voterId];
    if (!voteBreakdown[votedForId]) {
      voteBreakdown[votedForId] = [];
    }
    voteBreakdown[votedForId].push(voterId);
  }

  // Create a card for each player showing who voted for them
  for (const playerId of room.game.playerOrder) {
    const player = room.players[playerId];
    const voters = voteBreakdown[playerId] || [];

    const card = document.createElement("div");
    card.style.backgroundColor = "#000";
    card.style.border = "1px solid var(--border)";
    card.style.borderRadius = "10px";
    card.style.padding = "15px";
    card.style.width = "100%";
    card.style.marginBottom = "10px";
    card.style.margin = "0";
    card.classList.add("results-card");

    const playerNameEl = document.createElement("p");
    playerNameEl.style.fontWeight = "bold";
    playerNameEl.style.fontSize = "1.1rem";
    playerNameEl.style.marginBottom = "8px";
    playerNameEl.style.margin = "0 0 8px 0";
    playerNameEl.textContent = player.name + ` (${voters.length} votes)`;

    card.appendChild(playerNameEl);

    // Show voter names or just count
    if (isAnonymous) {
      const countEl = document.createElement("p");
      countEl.style.fontSize = "0.9rem";
      countEl.style.color = "var(--text-secondary)";
      countEl.style.margin = "0";
      countEl.textContent = `Total votes: ${voters.length}`;
      card.appendChild(countEl);
    } else {
      const voterList = document.createElement("div");
      voterList.style.display = "flex";
      voterList.style.flexDirection = "column";
      voterList.style.gap = "4px";
      voterList.style.margin = "0";

      if (voters.length === 0) {
        const noVotesEl = document.createElement("p");
        noVotesEl.style.fontSize = "0.9rem";
        noVotesEl.style.color = "var(--text-secondary)";
        noVotesEl.style.margin = "0";
        noVotesEl.textContent = "No votes";
        voterList.appendChild(noVotesEl);
      } else {
        voters.forEach(voterId => {
          const voterEl = document.createElement("p");
          voterEl.style.fontSize = "0.9rem";
          voterEl.style.color = "var(--text-secondary)";
          voterEl.style.margin = "0";
          voterEl.textContent = "• " + room.players[voterId].name;
          voterList.appendChild(voterEl);
        });
      }

      card.appendChild(voterList);
    }

    resultsTablet.appendChild(card);
  }
}