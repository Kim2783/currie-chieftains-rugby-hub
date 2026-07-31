export const INITIAL_CLIPS = [];

export const SCOTTISH_AGE_GROUPS = [
  // Minis Section (P1 - P7)
  { id: "p1", name: "P1", category: "minis" },
  { id: "p2", name: "P2", category: "minis" },
  { id: "p3", name: "P3", category: "minis" },
  { id: "p4", name: "P4", category: "minis" },
  { id: "p5", name: "P5", category: "minis" },
  { id: "p6", name: "P6", category: "minis" },
  { id: "p7", name: "P7", category: "minis" },

  // Youth Section (U13 - U18)
  { id: "u13", name: "U13", category: "youth" },
  { id: "u14", name: "U14", category: "youth" },
  { id: "u15", name: "U15", category: "youth" },
  { id: "u16", name: "U16", category: "youth" },
  { id: "u18", name: "U18", category: "youth" },

  // Adult Rugby Section
  { id: "adult-1st", name: "1st XV", category: "adults" },
  { id: "adult-2nd", name: "2nd XV", category: "adults" },
  { id: "adult-womens", name: "Women's", category: "adults" },
  { id: "adult-vets", name: "Vets", category: "adults" }
];

export const SKILL_CATEGORIES = [
  { id: "all", name: "All Skills", icon: "🏉" },
  { id: "tackling", name: "Tackling & Defense", icon: "🛡️" },
  { id: "passing", name: "Passing & Offloading", icon: "⚡" },
  { id: "scrums", name: "Scrums & Set-Piece", icon: "💪" },
  { id: "lineouts", name: "Lineouts & Jumps", icon: "⬆️" },
  { id: "kicking", name: "Kicking & Territory", icon: "👟" },
  { id: "breakdown", name: "Breakdown & Rucking", icon: "🔥" },
  { id: "counter-attack", name: "Counter-Attack & Running", icon: "🚀" },
  { id: "tactics", name: "Team Tactics & Strike Plays", icon: "📋" },
  { id: "fitness", name: "Fitness & Conditioning", icon: "🏋️" }
];

export const RUGBY_POSITIONS = [
  { id: "all", name: "All Positions" },
  { id: "none", name: "General / Team Drill (No position tagged)" },
  { id: "props", name: "Props (1 / 3)" },
  { id: "hooker", name: "Hooker (2)" },
  { id: "locks", name: "Locks (4 / 5)" },
  { id: "flankers", name: "Flankers (6 / 7)" },
  { id: "number-8", name: "Number 8 (8)" },
  { id: "scrum-half", name: "Scrum-half (9)" },
  { id: "fly-half", name: "Fly-half (10)" },
  { id: "centers", name: "Centers (12 / 13)" },
  { id: "wings", name: "Wings (11 / 14)" },
  { id: "fullback", name: "Fullback (15)" },
  { id: "back-row", name: "Back Row Group" },
  { id: "back-three", name: "Back Three Group" }
];

export const RUGBY_EQUIPMENT = [
  { id: "all", name: "🏋️ All Equipment Types" },
  { id: "none", name: "🏉 No Equipment / Ball Only" },
  { id: "cones", name: "🔺 Cones & Markers" },
  { id: "tackle-bags", name: "🛡️ Tackle Bags & Contact Pads" },
  { id: "ladder", name: "🏃 Agility Ladder & Hurdles" },
  { id: "tee", name: "🎯 Kicking Tee" },
  { id: "target-net", name: "🥅 Target Net / Rebounder" },
  { id: "bands", name: "💪 Resistance Bands / Gym Gear" }
];

export const CHIEFTAINS_PLAYLISTS = [
  {
    id: "pl-minis-p13",
    title: "Currie Minis (P1 - P3) Fun & Movement",
    description: "Fundamental movement, tag rugby games, coordination drills, and active play for P1-P3.",
    clipCount: 0,
    clipIds: [],
    bannerColor: "from-emerald-700 to-green-900"
  },
  {
    id: "pl-minis-p45",
    title: "Currie Minis (P4 - P5) Safe Contact Intro",
    description: "Introduction to safe tackle entry, falling techniques, and building confidence in 1v1 contact.",
    clipCount: 0,
    clipIds: [],
    bannerColor: "from-green-600 to-emerald-800"
  },
  {
    id: "pl-minis-p67",
    title: "Currie Minis (P6 - P7) Foundation Phase",
    description: "Play Fast - Keep Ball Alive (KBA). Catch & pass early, evasion/offloading, and tackle completion.",
    clipCount: 0,
    clipIds: [],
    bannerColor: "from-teal-700 to-emerald-950"
  },
  {
    id: "pl-youth",
    title: "Chieftains Youth (U13 - U18) Development",
    description: "Spiral passing off both hands, lineout throw precision, box kicking, and scrum power.",
    clipCount: 0,
    clipIds: [],
    bannerColor: "from-amber-600 to-amber-900"
  },
  {
    id: "pl-adults",
    title: "Adult Rugby (Seniors & Vets) Tactical System",
    description: "Low chop tackle & jackal clearout combined with midfield dummy switch attack patterns.",
    clipCount: 0,
    clipIds: [],
    bannerColor: "from-slate-800 to-black"
  }
];

export const DAILY_CHALLENGES = [
  "🎯 **P1-P7 Mini Challenge:** 30 pop passes with a teammate while staying in a 5m mini grid.",
  "🛡️ **P4-P5 Tackle Entry:** 10 repetitions of low shoulder cheek-to-thigh target tackle on a soft pad.",
  "⚡ **Youth U13-U15 Pass:** Complete 50 spiral passes off your non-dominant hand hitting a 10m target.",
  "⬆️ **U16-U18 Lineout Release:** Hookers throw 30 consecutive lineout passes onto a wall target at 5m, 10m, and 15m.",
  "👟 **Adult Rugby Box Kick Drop:** Scrum-halves practice 20 box kicks into a 5-meter corner zone off the base.",
  "🔥 **Jackal Speed Drill:** 10 repetitions of down-and-up into low wide jackal stance under 3 seconds per rep."
];
