// words.js
// ─────────────────────────────────────────────────────────────────
// All word categories used by the game to assign a secret word.
// Structure:  PHRASE_LIST  →  category[]  →  subCategory[]  →  word[]
//
// When startGame() picks a word it does:
//   category    = random pick from PHRASE_LIST
//   subCategory = random pick from that category
//   word        = random pick from that subCategory
// ─────────────────────────────────────────────────────────────────

const PHRASE_LIST = [

  /* ── Personality & Behavior ── */
  [
    ["Very funny", "Very calm", "Very confident", "Least confident"],
    ["Most chaotic", "Most unpredictable", "Most reliable", "Most mysterious"],
    ["Most dramatic", "Most lazy", "Most hardworking", "Most creative"],
    ["Most annoying (in a fun way)", "Most serious", "Most talkative", "Most quiet"]
  ],

  /* ── Social & Group Dynamics ── */
  [
    ["Most likely to become a leader", "Most likely to fail as a leader"],
    ["Most likely to start a fight", "Most likely to end a fight"],
    ["Most likely to betray the group", "Most loyal"],
    ["Most likely to be trusted", "Most suspicious"]
  ],

  /* ── Intelligence & Decisions ── */
  [
    ["Secretly very smart", "Most likely to overthink"],
    ["Most likely to make smart decisions", "Most likely to make bad decisions"],
    ["Best liar", "Worst liar", "Most likely to lie"],
    ["Most likely to win an argument", "Most likely to lose an argument"]
  ],

  /* ── Daily Life & Habits ── */
  [
    ["Most likely to be late", "Most likely to sleep all day"],
    ["Most likely to forget things", "Most likely to remember everything"],
    ["Most likely to waste money", "Most likely to save money"],
    ["Most likely to ignore messages", "Most likely to reply instantly"]
  ],

  /* ── Funny & Chaos ── */
  [
    ["Most likely to laugh at the wrong time", "Most likely to laugh at their own joke"],
    ["Most likely to trip while running", "Most likely to fall for a prank"],
    ["Most likely to create a prank", "Most likely to get caught doing something stupid"],
    ["Most likely to do something embarrassing", "Most likely to panic in a crisis"]
  ],

  /* ── Fame & Internet ── */
  [
    ["Most likely to become famous", "Most likely to go viral"],
    ["Most likely to become a YouTuber", "Most likely to become a meme"],
    ["Most likely to get famous for something random", "Most likely to be cancelled"],
    ["Most likely to be popular online", "Most likely to be ignored online"]
  ],

  /* ── Survival & Extreme Situations ── */
  [
    ["Most likely to survive a zombie apocalypse", "First to die in a horror movie"],
    ["Most likely to survive a horror movie", "Most likely to go missing in a horror movie"],
    ["Most likely to survive alone in a forest", "Most likely to get lost quickly"],
    ["Most likely to save others", "Most likely to run away first"]
  ],

  /* ── Vibes & Roles ── */
  [
    ["Main character energy", "Side character energy", "NPC energy"],
    ["Looks innocent but isn't", "Actually dangerous"],
    ["Fake cool", "Actually cool"],
    ["Most likely to be underestimated", "Most likely to surprise everyone"]
  ]

];