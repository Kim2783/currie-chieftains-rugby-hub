# Currie Chieftains Rugby Hub - Skill & Video Vault

Welcome to the **Currie Chieftains RFC Skill & Video Vault** repository. This application is a premium, lightweight, real-time rugby coaching tool built for players, coaches, and supporters at Malleny Park. It allows tagging, sharing, searching, and analyzing coaching drills, match plays, and training videos.

---

## 🛠️ Technology Stack

1. **Frontend Core**: Standard HTML5 structure and clean client-side JavaScript using ES Modules.
2. **Styling**: Premium, responsive Vanilla CSS (`src/style.css`) with a modern dark theme, gold accents matching the club colors, fluid animations, and custom scrollbars. No Tailwind or third-party CSS utilities are used.
3. **Build Tool**: Vite is configured for fast hot-module-reloading (HMR) dev sessions and clean production asset bundling.
4. **Backend Integrations**:
   - **Firebase Firestore**: Real-time synchronization of skill clips, upvotes, and coach/player discussion comments.
   - **Firebase Storage**: Direct host and upload target for MP4, MOV, and WEBM video files recorded on mobile phones.
   - **Direct Device Fallback**: If Firebase configurations are absent, the application gracefully degrades to local storage mode (`localStorage`) to remain 100% functional offline or in offline staging.

---

## 📁 Repository Structure

```
├── .agents/
│   └── AGENTS.md            # Workspace customization rules for AI agents
├── src/
│   ├── data/
│   │   └── initialData.js   # Prepopulated skill categories, age levels, equipment, and challenges
│   ├── firebase/
│   │   ├── config.js        # Firebase app initialization and check-state helpers
│   │   └── service.js       # Firestore streams, upvotes, uploads, and data seeding
│   ├── main.js              # Application state, UI event listeners, and DOM render loops
│   └── style.css            # Custom layout rules, dark theme variables, and mobile layouts
├── index.html               # Main single-page application structure and modals
├── cors.json                # Storage bucket CORS configuration for pitch recordings
├── firebase.json            # Firebase hosting and configuration rules
└── package.json             # Build script dependencies (Vite)
```

---

## 🧑‍💻 Developer & Agent Instructions

If you are an AI coding agent or a human developer onboarding to this project, you **must** strictly adhere to the following rules:

### 1. Scottish Rugby Conventions & UI Labels (Strict Rule)
- Never rename, alter, or embellish existing UI labels, filter option names, titles, or Scottish rugby age group labels unless explicitly requested by the user.
- **Specific Age Groups**: `P1`–`P7` (Minis), `U13`–`U18` (Youth), `1st XV`, `2nd XV`, `Women's`, and `Vets` (Adult Rugby). Maintain these exact labels.
- **Squad Sections**:
  - `minis` ➔ `🏉 Minis (P1 - P7)`
  - `youth` ➔ `🔥 Youth (U13 - U18)`
  - `adults` ➔ `👑 Adult Rugby (Seniors & Vets)`

### 2. Safeguarding & PVG Compliance
- All modifications related to video uploads, sharing, or player records must comply with the official **Scottish Rugby Safeguarding Policy** and the **Protecting Vulnerable Groups (PVG) Scheme** guidelines.
- The Club Child Protection Officer (CPO) details (Donald Urquhart) must remain prominent in the Safeguarding Policy modals.

### 3. Layout & Mobile Responsiveness
- The application is optimized for both wide screen desktop display and phone screens (tested down to `320px` viewport widths).
- **Collapsible Menus**: On viewport widths below `900px`, the header actions collapse into a hamburger menu button (`#hamburgerMenuBtn`) toggling `#mobileNav`.
- **Collapsible Filters**: On viewport widths below `768px`, the filter dropdown selectors collapse underneath a `#toggleFiltersBtn` button. When expanded, they display in a neat 2-column or 1-column grid.
- **Scrollbars**: Keep scrollbars hidden on horizontal scrolling lists (`.category-tabs` and `.pill-group`) to preserve native-app touch feels.

### 4. Build Validation
- Always test the build locally before committing.
- Install dependencies: `npm install`
- Verify production build compilation: `npm run build`
