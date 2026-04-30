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

  /* ── Personality Chaos ── */
  [
    ["Accidentally funny", "Laughs at everything", "Laughs at nothing"],
    ["Calm in chaos", "Panics instantly"],
    ["Confident for no reason", "Doubts even correct answers"],
    ["Energy of 100 coffees", "Battery always at 1%"]
  ],

  /* ── Social Madness ── */
  [
    ["Would start drama for entertainment", "Avoids drama like a ghost"],
    ["Trustworthy… probably", "Looks guilty even when innocent"],
    ["Group's unpaid therapist", "Group's biggest problem"],
    ["Talks non-stop", "Communicates via nods"]
  ],

  /* ── Brain & Decisions ── */
  [
    ["Smart but lazy", "Dumb but confident"],
    ["Overthinks everything", "Thinks nothing"],
    ["Wins arguments using logic", "Wins arguments by being louder"],
    ["Would believe anything", "Trusts absolutely no one"]
  ],

  /* ── Daily Life Struggles ── */
  [
    ["Always late but chill", "Early and judging everyone"],
    ["Forgets why they opened the app", "Remembers things from 2012"],
    ["Spends money like it's fake", "Acts poor with money saved"],
    ["Replies in 0.2 seconds", "Replies after 3-5 business days"]
  ],

  /* ── Pure Chaos ── */
  [
    ["Laughs during serious moments", "Serious during funny moments"],
    ["Trips on flat ground", "Walks like a final boss"],
    ["Prank mastermind", "Prank victim"],
    ["Embarrasses self daily", "Witnesses others' embarrassment"]
  ],

  /* ── Internet Energy ── */
  [
    ["Would go viral accidentally", "Tries to go viral and fails"],
    ["Future meme legend", "Doesn't understand memes"],
    ["Chronically online", "Still uses internet like it's 2010"],
    ["Influencer energy", "NPC in comment section"]
  ],

  /* ── Survival Logic ── */
  [
    ["Survives by skill", "Survives by luck"],
    ["Runs toward danger", "Hides immediately"],
    ["Sacrifices self for team", "Uses team as shield"],
    ["Gets lost in own neighborhood", "Human GPS"]
  ],

  /* ── Weird Vibes ── */
  [
    ["Main character in their head", "Background extra in reality"],
    ["Looks innocent, plots chaos", "Looks dangerous, is soft"],
    ["Fake genius energy", "Silent actual genius"],
    ["Unpredictable NPC", "Scripted dialogue person"]
  ],

  /* ── Wild & Random ── */
  [
    ["Talks to animals like they understand", "Animals avoid them"],
    ["Would survive on vibes alone", "Needs tutorial for everything"],
    ["Accidentally starts a cult", "Accidentally join a cult"]
  ],

  /* ── Dark Humor Lite ── */
  [
    ["Can laugh at their own funeral", "Can cry at a meme", "Can get offended by a meme"],
    ["Would be the main villain origin story", "Would be the sidekick who dies first"],
    ["Trusts the wrong person every time", "Is the wrong person to trust"],
    ["Would sell friends for snacks", "Would buy friends snacks"]
  ],

  /* ── Niche (Rare Drops) ── */
  [
    ["Says 'one more game' and plays 5 hours", "Rages but still queues again"],
    ["Blames lag for everything", "Actually is the lag"],
    ["Carries the team silently", "Needs carrying but gives advice"],
    ["Tries hardest, still loses", "Does nothing, still wins"],

    ["Writes code that somehow works", "Breaks things by touching them"],
    ["Fixes bug by doing nothing", "Creates 5 bugs fixing 1"],
    ["Says 'it's easy' (and it's never easy)", "Googles everything (and still confused)"],

    ["Future YouTuber energy", "Thinks they are famous already"],
    ["Records everything, posts nothing", "Posts once, disappears forever"],
    ["Main character in reels", "Accidentally in the background of reels"]
  ],

  /* ── Morality & Speech ── */
  [
    ["Curses close to none", "Curses in every sentence"],
    ["Too pure for this world", "Corrupts everyone around them"],
    ["Follows rules blindly", "Breaks rules for fun"],
    ["Would return lost money", "Would keep lost money and feel smart"],
    ["Guilt hits instantly", "Sleeps peacefully after chaos"],
    ["Apologizes even when right", "Never apologizes when right" ,"Never apologizes even when wrong"],
    ["Believes in karma", "Thinks consequences are optional (not in karma)"],
    ["Acts nice, secretly evil", "Looks evil, actually kind", "Looks evil and actually evil", "Looks nice and actually nice"]
  ]
];