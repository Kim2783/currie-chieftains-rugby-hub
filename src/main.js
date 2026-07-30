import { INITIAL_CLIPS, SKILL_CATEGORIES, RUGBY_POSITIONS, SCOTTISH_AGE_GROUPS, CHIEFTAINS_PLAYLISTS, DAILY_CHALLENGES } from './data/initialData.js';
import { isConfigured } from './firebase/config.js';
import { subscribeToClips, addClipToCloud, upvoteClipInCloud, addCommentToCloud, seedInitialClipsIfEmpty, uploadVideoFileToCloud } from './firebase/service.js';

// Application State
let state = {
  clips: [],
  savedClipIds: [],
  activeCategory: 'all',
  activePosition: 'all',
  activeAgeGroup: 'all',
  activeSquadSection: 'all',
  activePlatform: 'all',
  sortBy: 'newest',
  searchQuery: '',
  currentModalClipId: null,
  activePlaylistFilter: null,
  showOnlySaved: false,

  // Add modal upload state
  activeMediaTab: 'url', // 'url' or 'file'
  selectedVideoFile: null
};

// Storage Keys
const STORAGE_KEY_CLIPS = 'chieftains_rugby_clips_v1';
const STORAGE_KEY_SAVED = 'chieftains_saved_clips_v1';

// DOM Elements
const clipsGrid = document.getElementById('clipsGrid');
const categoryTabs = document.getElementById('categoryTabs');
const ageGroupSelect = document.getElementById('ageGroupSelect');
const positionSelect = document.getElementById('positionSelect');
const platformSelect = document.getElementById('platformSelect');
const sortSelect = document.getElementById('sortSelect');
const searchInput = document.getElementById('searchInput');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');
const clipsCountText = document.getElementById('clipsCountText');
const statTotalClips = document.getElementById('statTotalClips');
const statTotalUpvotes = document.getElementById('statTotalUpvotes');
const savedCount = document.getElementById('savedCount');

// Modal Elements
const playerModal = document.getElementById('playerModal');
const closePlayerModal = document.getElementById('closePlayerModal');
const videoEmbedWrapper = document.getElementById('videoEmbedWrapper');
const modalClipTitle = document.getElementById('modalClipTitle');
const modalAgeBadgesWrapper = document.getElementById('modalAgeBadgesWrapper');
const modalAuthorRole = document.getElementById('modalAuthorRole');
const modalDescription = document.getElementById('modalDescription');
const modalUpvotesCount = document.getElementById('modalUpvotesCount');
const modalUpvoteBtn = document.getElementById('modalUpvoteBtn');
const modalSaveBtn = document.getElementById('modalSaveBtn');
const modalCoachingList = document.getElementById('modalCoachingList');
const modalCommentList = document.getElementById('modalCommentList');
const commentForm = document.getElementById('commentForm');

// Add Clip Modal Elements
const addModal = document.getElementById('addModal');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const closeAddModal = document.getElementById('closeAddModal');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const addClipForm = document.getElementById('addClipForm');
const clipAgeCheckboxes = document.getElementById('clipAgeCheckboxes');
const tabPasteUrl = document.getElementById('tabPasteUrl');
const tabUploadFile = document.getElementById('tabUploadFile');
const urlInputContainer = document.getElementById('urlInputContainer');
const fileUploadContainer = document.getElementById('fileUploadContainer');
const videoFileInput = document.getElementById('videoFileInput');
const fileSelectedInfo = document.getElementById('fileSelectedInfo');
const uploadProgressContainer = document.getElementById('uploadProgressContainer');
const uploadProgressBar = document.getElementById('uploadProgressBar');
const uploadProgressText = document.getElementById('uploadProgressText');
const submitClipBtn = document.getElementById('submitClipBtn');

// Playlists & Challenge Elements
const playlistCards = document.getElementById('playlistCards');
const openPlaylistsBtn = document.getElementById('openPlaylistsBtn');
const openSavedBtn = document.getElementById('openSavedBtn');
const spinChallengeBtn = document.getElementById('spinChallengeBtn');
const challengeOutput = document.getElementById('challengeOutput');

// Initialize App
async function init() {
  loadSavedIds();
  renderAgeGroupOptions();
  renderPositionOptions();
  renderCategoryTabs();
  renderFormAgeCheckboxes();
  renderPlaylists();
  setupEventListeners();

  if (isConfigured) {
    console.log("🔥 Connecting to Firebase Firestore Real-Time Stream...");
    updateCloudStatusBadge(true);
    await seedInitialClipsIfEmpty(INITIAL_CLIPS);
    
    subscribeToClips((cloudClips) => {
      // Merge cloud clips with any local temporary uploads
      const localOnly = state.clips.filter(c => c.platform === 'uploaded' && !cloudClips.some(cc => cc.id === c.id));
      state.clips = [...localOnly, ...cloudClips];
      updateStats();
      renderClips();
      if (state.currentModalClipId) {
        const activeClip = state.clips.find(c => c.id === state.currentModalClipId);
        if (activeClip) {
          modalUpvotesCount.textContent = activeClip.upvotes || 0;
          renderModalComments(activeClip);
        }
      }
    });
  } else {
    updateCloudStatusBadge(false);
    loadLocalStorageClips();
    updateStats();
    renderClips();
  }
}

function updateCloudStatusBadge(active) {
  const heroTag = document.querySelector('.hero-tag');
  if (heroTag) {
    if (active) {
      heroTag.innerHTML = `🔥 Malleny Park Vault • <strong>Live Sync Active</strong>`;
      heroTag.style.borderColor = '#10b981';
      heroTag.style.color = '#34d399';
    } else {
      heroTag.innerHTML = `⚡ Malleny Park Vault • Direct Device Mode`;
    }
  }
}

function loadLocalStorageClips() {
  try {
    const storedClips = localStorage.getItem(STORAGE_KEY_CLIPS);
    if (storedClips) {
      state.clips = JSON.parse(storedClips);
    } else {
      state.clips = [...INITIAL_CLIPS];
      saveClipsToStorage();
    }
  } catch (err) {
    console.error('LocalStorage load error:', err);
    state.clips = [...INITIAL_CLIPS];
  }
}

function loadSavedIds() {
  try {
    const storedSaved = localStorage.getItem(STORAGE_KEY_SAVED);
    if (storedSaved) {
      state.savedClipIds = JSON.parse(storedSaved);
    }
  } catch (err) {
    console.error('Saved IDs error:', err);
  }
}

function saveClipsToStorage() {
  localStorage.setItem(STORAGE_KEY_CLIPS, JSON.stringify(state.clips));
}

function saveSavedIdsToStorage() {
  localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(state.savedClipIds));
  savedCount.textContent = state.savedClipIds.length;
}

function updateStats() {
  statTotalClips.textContent = state.clips.length;
  const totalUpvotes = state.clips.reduce((acc, c) => acc + (c.upvotes || 0), 0);
  statTotalUpvotes.textContent = totalUpvotes;
  savedCount.textContent = state.savedClipIds.length;
}

function renderAgeGroupOptions() {
  ageGroupSelect.innerHTML = `<option value="all">🏴󠁧󠁢󠁳󠁣󠁴󠁿 All Specific Age Levels</option>` +
    SCOTTISH_AGE_GROUPS.map(ag => `<option value="${ag.id}">${ag.name}</option>`).join('');
}

function renderPositionOptions() {
  positionSelect.innerHTML = RUGBY_POSITIONS.map(pos => 
    `<option value="${pos.id}">${pos.name}</option>`
  ).join('');
}

function renderCategoryTabs() {
  categoryTabs.innerHTML = SKILL_CATEGORIES.map(cat => `
    <button class="tab-btn ${cat.id === state.activeCategory ? 'active' : ''}" data-category="${cat.id}">
      <span>${cat.icon}</span> ${cat.name}
    </button>
  `).join('');
}

function renderFormAgeCheckboxes() {
  if (!clipAgeCheckboxes) return;
  clipAgeCheckboxes.innerHTML = SCOTTISH_AGE_GROUPS.map(ag => `
    <label class="age-checkbox-tile">
      <input type="checkbox" name="clipAgeCheck" value="${ag.id}" ${ag.id === 'u14' ? 'checked' : ''}>
      <span>${ag.name}</span>
    </label>
  `).join('');
}

function getFilteredClips() {
  return state.clips.filter(clip => {
    const clipAges = clip.ageGroups || (clip.ageGroup ? [clip.ageGroup] : ['u14']);
    const clipCats = clip.ageCategories || [getAgeCategoryFromId(clipAges[0])];

    // Search query
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      const matchTitle = clip.title.toLowerCase().includes(q);
      const matchDesc = clip.description.toLowerCase().includes(q);
      const matchAuthor = clip.author.toLowerCase().includes(q);
      const matchTags = clip.tags.some(t => t.toLowerCase().includes(q));
      const matchAge = clipAges.some(a => a.toLowerCase().includes(q) || getAgeGroupLabel(a).toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchAuthor && !matchTags && !matchAge) return false;
    }

    // Playlist filter
    if (state.activePlaylistFilter) {
      const playlist = CHIEFTAINS_PLAYLISTS.find(p => p.id === state.activePlaylistFilter);
      if (playlist && !playlist.clipIds.includes(clip.id)) return false;
    }

    // Saved filter
    if (state.showOnlySaved && !state.savedClipIds.includes(clip.id)) {
      return false;
    }

    // Squad Section pill filter (Minis, Youth, Adult Rugby)
    if (state.activeSquadSection !== 'all') {
      const hasSquadCategory = clipCats.includes(state.activeSquadSection) ||
        clipAges.some(a => getAgeCategoryFromId(a) === state.activeSquadSection);
      if (!hasSquadCategory) return false;
    }

    // Specific Age Group Dropdown Filter
    if (state.activeAgeGroup !== 'all') {
      if (!clipAges.includes(state.activeAgeGroup)) return false;
    }

    // Category filter
    if (state.activeCategory !== 'all' && clip.category !== state.activeCategory) {
      return false;
    }

    // Position filter (supports "none" for no position tagged)
    if (state.activePosition !== 'all') {
      if (!clip.positions.includes(state.activePosition)) return false;
    }

    // Platform filter
    if (state.activePlatform !== 'all' && clip.platform !== state.activePlatform) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (state.sortBy === 'newest') {
      return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
    } else if (state.sortBy === 'upvotes') {
      return (b.upvotes || 0) - (a.upvotes || 0);
    } else if (state.sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });
}

function getAgeCategoryFromId(ageId) {
  if (!ageId) return 'youth';
  if (ageId.startsWith('p') || ageId === 'minis') return 'minis';
  if (ageId.startsWith('u') || ageId === 'youth') return 'youth';
  if (ageId.includes('adult') || ageId.includes('senior')) return 'adults';
  return 'youth';
}

function getAgeGroupLabel(ageId) {
  const ag = SCOTTISH_AGE_GROUPS.find(a => a.id === ageId);
  return ag ? ag.name : ageId.toUpperCase();
}

function renderClips() {
  const filtered = getFilteredClips();
  clipsCountText.textContent = `Showing ${filtered.length} of ${state.clips.length} clips`;

  if (filtered.length === 0) {
    clipsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🏉</div>
        <h3 style="font-size: 1.3rem; margin-bottom: 0.5rem; color: #ffffff;">No Rugby Clips Found</h3>
        <p style="color: var(--text-muted); max-width: 450px; margin: 0 auto 1.5rem auto;">
          No skill videos match your active filter selection. Try adjusting your search term or squad level.
        </p>
        <button class="btn btn-primary" onclick="window.resetAllFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  clipsGrid.innerHTML = filtered.map(clip => {
    const isSaved = state.savedClipIds.includes(clip.id);
    const platformLabel = clip.platform === 'youtube-shorts' ? 'Shorts ⚡' :
                          clip.platform === 'youtube' ? 'YouTube ▶' :
                          clip.platform === 'instagram' ? 'Instagram 📸' : 'Uploaded Video 📱';
    const platformClass = `platform-${clip.platform}`;
    const clipAges = clip.ageGroups || (clip.ageGroup ? [clip.ageGroup] : ['u14']);

    const ageBadgesHtml = clipAges.slice(0, 3).map(agId => {
      const ageCat = getAgeCategoryFromId(agId);
      return `<span class="badge-level badge-age-${ageCat}">${getAgeGroupLabel(agId)}</span>`;
    }).join(' ');

    return `
      <article class="clip-card" data-id="${clip.id}">
        <div class="card-thumbnail ${clip.isShort ? 'shorts-ratio' : ''}" onclick="window.openClipModal('${clip.id}')">
          <img src="${clip.thumbnail}" alt="${clip.title}" loading="lazy">
          <div class="card-play-overlay">
            <div class="play-btn-circle">▶</div>
          </div>
          <div class="card-badge-platform ${platformClass}">
            ${platformLabel}
          </div>
          <div class="card-duration">${clip.duration || 'Video'}</div>
        </div>

        <div class="card-body">
          <div class="card-meta">
            ${ageBadgesHtml}
            <span class="card-category">${getCategoryName(clip.category)}</span>
          </div>

          <h4 class="card-title" onclick="window.openClipModal('${clip.id}')" style="cursor: pointer;">${clip.title}</h4>

          <div class="card-tags">
            ${clip.tags.slice(0, 3).map(tag => `<span class="tag-chip">${tag}</span>`).join('')}
          </div>

          <div class="card-footer">
            <span style="font-weight: 600; font-size: 0.8rem;">👤 ${clip.author}</span>
            
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <button class="resp-btn" onclick="event.stopPropagation(); window.upvoteClip('${clip.id}')" title="Give Rugby Resps">
                🏉 ${clip.upvotes || 0}
              </button>

              <button class="btn btn-ghost" style="padding: 0.2rem 0.4rem; font-size: 1rem;" onclick="event.stopPropagation(); window.toggleSaveClip('${clip.id}')" title="${isSaved ? 'Remove from Training Bag' : 'Save to Training Bag'}">
                ${isSaved ? '⭐' : '☆'}
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function renderPlaylists() {
  playlistCards.innerHTML = CHIEFTAINS_PLAYLISTS.map(pl => `
    <div class="playlist-card ${state.activePlaylistFilter === pl.id ? 'border-gold' : ''}" onclick="window.filterByPlaylist('${pl.id}')">
      <div class="playlist-title">${pl.title}</div>
      <div class="playlist-desc">${pl.description}</div>
      <div class="playlist-meta">📁 ${pl.clipCount} Skill Clips • Click to Filter</div>
    </div>
  `).join('');
}

function getCategoryName(catId) {
  const cat = SKILL_CATEGORIES.find(c => c.id === catId);
  return cat ? cat.name : catId;
}

window.openClipModal = function(clipId) {
  const clip = state.clips.find(c => c.id === clipId);
  if (!clip) return;

  state.currentModalClipId = clipId;
  modalClipTitle.textContent = clip.title;
  
  const clipAges = clip.ageGroups || (clip.ageGroup ? [clip.ageGroup] : ['u14']);
  modalAgeBadgesWrapper.innerHTML = clipAges.map(agId => {
    const ageCat = getAgeCategoryFromId(agId);
    return `<span class="badge-level badge-age-${ageCat}">${getAgeGroupLabel(agId)}</span>`;
  }).join(' ') + `<span class="badge-level level-${clip.level}">${clip.level.toUpperCase()}</span>`;

  modalAuthorRole.textContent = `${clip.author} (${clip.authorRole || 'Contributor'})`;
  modalDescription.textContent = clip.description;
  modalUpvotesCount.textContent = clip.upvotes || 0;

  renderVideoEmbed(clip);

  if (clip.coachingPoints && clip.coachingPoints.length > 0) {
    modalCoachingList.innerHTML = clip.coachingPoints.map((pt, idx) => `
      <li class="checklist-item">
        <input type="checkbox" id="chk-${idx}">
        <label for="chk-${idx}">${pt}</label>
      </li>
    `).join('');
    document.getElementById('modalCoachingBox').style.display = 'block';
  } else {
    document.getElementById('modalCoachingBox').style.display = 'none';
  }

  renderModalComments(clip);

  const isSaved = state.savedClipIds.includes(clipId);
  modalSaveBtn.textContent = isSaved ? '⭐ In Training Bag' : '⭐ Save to Bag';

  playerModal.classList.add('active');
};

function renderVideoEmbed(clip) {
  videoEmbedWrapper.className = `video-player-wrapper ${clip.isShort ? 'shorts-player' : ''}`;

  if (clip.platform === 'youtube' || clip.platform === 'youtube-shorts') {
    const embedUrl = `https://www.youtube-nocookie.com/embed/${clip.embedId}?autoplay=1&rel=0`;
    videoEmbedWrapper.innerHTML = `
      <iframe src="${embedUrl}" title="${clip.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    `;
  } else if (clip.platform === 'instagram') {
    videoEmbedWrapper.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 2rem; background: linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%); color: white; text-align: center; gap: 1rem;">
        <div style="font-size: 3rem;">📸</div>
        <h3 style="font-size: 1.3rem; font-weight: 800;">Instagram Reel Preview</h3>
        <p style="font-size: 0.9rem; max-width: 400px; color: #fff;">
          Watch this reel directly on Instagram for full audio and high resolution.
        </p>
        <a href="${clip.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="background: #ffffff; color: #111; font-weight: 800;">
          Open Reel on Instagram ↗
        </a>
      </div>
    `;
  } else if (clip.platform === 'uploaded') {
    videoEmbedWrapper.innerHTML = `
      <video controls autoplay style="width: 100%; height: 100%; object-fit: contain;">
        <source src="${clip.url}">
        Your browser does not support HTML5 video playback.
      </video>
    `;
  } else {
    videoEmbedWrapper.innerHTML = `
      <video controls autoplay src="${clip.url}"></video>
    `;
  }
}

function renderModalComments(clip) {
  if (!clip.comments || clip.comments.length === 0) {
    modalCommentList.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-dim);">No coaching notes yet. Be the first to post feedback!</p>`;
    return;
  }

  modalCommentList.innerHTML = clip.comments.map(c => `
    <div class="comment-card">
      <div class="comment-author">${c.author}</div>
      <div class="comment-text">${c.text}</div>
      <div class="comment-time">${c.timestamp || 'Recently'}</div>
    </div>
  `).join('');
}

window.upvoteClip = async function(clipId) {
  const clip = state.clips.find(c => c.id === clipId);
  if (clip) {
    clip.upvotes = (clip.upvotes || 0) + 1;
    
    if (isConfigured) {
      await upvoteClipInCloud(clipId);
    } else {
      saveClipsToStorage();
      updateStats();
      renderClips();
    }

    if (state.currentModalClipId === clipId) {
      modalUpvotesCount.textContent = clip.upvotes;
    }
  }
};

window.toggleSaveClip = function(clipId) {
  const idx = state.savedClipIds.indexOf(clipId);
  if (idx > -1) {
    state.savedClipIds.splice(idx, 1);
  } else {
    state.savedClipIds.push(clipId);
  }
  saveSavedIdsToStorage();
  renderClips();
  if (state.currentModalClipId === clipId) {
    const isSaved = state.savedClipIds.includes(clipId);
    modalSaveBtn.textContent = isSaved ? '⭐ In Training Bag' : '⭐ Save to Bag';
  }
};

window.filterByPlaylist = function(playlistId) {
  if (state.activePlaylistFilter === playlistId) {
    state.activePlaylistFilter = null;
  } else {
    state.activePlaylistFilter = playlistId;
  }
  state.showOnlySaved = false;
  renderPlaylists();
  renderClips();
  document.getElementById('toolbarSection').scrollIntoView({ behavior: 'smooth' });
};

window.resetAllFilters = function() {
  state.activeCategory = 'all';
  state.activePosition = 'all';
  state.activeAgeGroup = 'all';
  state.activeSquadSection = 'all';
  state.activePlatform = 'all';
  state.searchQuery = '';
  state.sortBy = 'newest';
  state.activePlaylistFilter = null;
  state.showOnlySaved = false;

  searchInput.value = '';
  ageGroupSelect.value = 'all';
  positionSelect.value = 'all';
  platformSelect.value = 'all';
  sortSelect.value = 'newest';
  
  document.querySelectorAll('.pill-filter').forEach(btn => btn.classList.remove('active'));
  document.querySelector('.pill-filter[data-squad="all"]').classList.add('active');

  renderCategoryTabs();
  renderPlaylists();
  renderClips();
};

function setupEventListeners() {
  // Tab switching in modal (Link vs Device Upload)
  tabPasteUrl.addEventListener('click', () => {
    state.activeMediaTab = 'url';
    tabPasteUrl.classList.add('active');
    tabUploadFile.classList.remove('active');
    urlInputContainer.style.display = 'flex';
    fileUploadContainer.style.display = 'none';
  });

  tabUploadFile.addEventListener('click', () => {
    state.activeMediaTab = 'file';
    tabUploadFile.classList.add('active');
    tabPasteUrl.classList.remove('active');
    urlInputContainer.style.display = 'none';
    fileUploadContainer.style.display = 'flex';
  });

  // Native file input listener
  videoFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectedVideoFile(e.target.files[0]);
    }
  });

  function handleSelectedVideoFile(file) {
    state.selectedVideoFile = file;
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    fileSelectedInfo.innerHTML = `✅ Selected Video: <strong>${file.name}</strong> (${sizeMb} MB)`;
    fileSelectedInfo.style.display = 'block';
  }

  categoryTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    state.activeCategory = btn.dataset.category;
    state.activePlaylistFilter = null;
    renderCategoryTabs();
    renderClips();
  });

  document.querySelectorAll('.pill-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pill-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeSquadSection = btn.dataset.squad;
      renderClips();
    });
  });

  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderClips();
  });

  ageGroupSelect.addEventListener('change', (e) => {
    state.activeAgeGroup = e.target.value;
    renderClips();
  });

  positionSelect.addEventListener('change', (e) => {
    state.activePosition = e.target.value;
    renderClips();
  });

  platformSelect.addEventListener('change', (e) => {
    state.activePlatform = e.target.value;
    renderClips();
  });

  sortSelect.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    renderClips();
  });

  resetFiltersBtn.addEventListener('click', window.resetAllFilters);

  openSavedBtn.addEventListener('click', () => {
    state.showOnlySaved = !state.showOnlySaved;
    state.activePlaylistFilter = null;
    if (state.showOnlySaved) {
      openSavedBtn.classList.add('btn-primary');
      openSavedBtn.classList.remove('btn-secondary');
    } else {
      openSavedBtn.classList.remove('btn-primary');
      openSavedBtn.classList.add('btn-secondary');
    }
    renderClips();
  });

  openPlaylistsBtn.addEventListener('click', () => {
    document.getElementById('playlistsWidget').scrollIntoView({ behavior: 'smooth' });
  });

  closePlayerModal.addEventListener('click', () => {
    playerModal.classList.remove('active');
    videoEmbedWrapper.innerHTML = '';
  });

  playerModal.addEventListener('click', (e) => {
    if (e.target === playerModal) {
      playerModal.classList.remove('active');
      videoEmbedWrapper.innerHTML = '';
    }
  });

  modalUpvoteBtn.addEventListener('click', () => {
    if (state.currentModalClipId) {
      window.upvoteClip(state.currentModalClipId);
    }
  });

  modalSaveBtn.addEventListener('click', () => {
    if (state.currentModalClipId) {
      window.toggleSaveClip(state.currentModalClipId);
    }
  });

  commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const clip = state.clips.find(c => c.id === state.currentModalClipId);
    if (!clip) return;

    const author = document.getElementById('commentNameInput').value.trim();
    const text = document.getElementById('commentTextInput').value.trim();

    if (author && text) {
      const commentObj = {
        id: 'c_' + Date.now(),
        author: author,
        text: text,
        timestamp: 'Just now'
      };

      if (!clip.comments) clip.comments = [];
      clip.comments.unshift(commentObj);

      if (isConfigured) {
        await addCommentToCloud(state.currentModalClipId, commentObj);
      } else {
        saveClipsToStorage();
        renderModalComments(clip);
      }

      document.getElementById('commentTextInput').value = '';
    }
  });

  openAddModalBtn.addEventListener('click', () => addModal.classList.add('active'));
  closeAddModal.addEventListener('click', () => addModal.classList.remove('active'));
  cancelAddBtn.addEventListener('click', () => addModal.classList.remove('active'));

  addModal.addEventListener('click', (e) => {
    if (e.target === addModal) addModal.classList.remove('active');
  });

  addClipForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('clipTitleInput').value.trim();
    const checkedAgeBoxes = Array.from(document.querySelectorAll('input[name="clipAgeCheck"]:checked')).map(cb => cb.value);
    const ageGroups = checkedAgeBoxes.length > 0 ? checkedAgeBoxes : ['u14'];
    const ageCategories = Array.from(new Set(ageGroups.map(ag => getAgeCategoryFromId(ag))));

    const category = document.getElementById('clipCategoryInput').value;
    const author = document.getElementById('clipAuthorInput').value.trim();
    const position = document.getElementById('clipPositionInput').value;
    const rawTags = document.getElementById('clipTagsInput').value.trim();
    const description = document.getElementById('clipDescInput').value.trim();
    const rawPoints = document.getElementById('clipPointsInput').value.trim();

    let videoUrl = '';
    let platform = 'youtube';
    let embedId = '';
    let isShort = false;
    let thumbnail = 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&w=800&q=80';

    if (state.activeMediaTab === 'file') {
      if (!state.selectedVideoFile) {
        alert("Please tap 'Choose Video File from Phone' to select your pitch recording.");
        return;
      }

      submitClipBtn.disabled = true;
      submitClipBtn.textContent = '⏳ Processing Pitch Video...';
      uploadProgressContainer.style.display = 'block';

      try {
        if (isConfigured) {
          videoUrl = await uploadVideoFileToCloud(state.selectedVideoFile, (progress) => {
            const p = Math.round(progress);
            uploadProgressBar.style.width = p + '%';
            uploadProgressText.textContent = `Processing ${p}%`;
          });
        } else {
          videoUrl = URL.createObjectURL(state.selectedVideoFile);
          uploadProgressBar.style.width = '100%';
          uploadProgressText.textContent = 'Ready (Local Mode)';
        }
        platform = 'uploaded';
      } catch (err) {
        console.warn("Storage processing fallback:", err);
        videoUrl = URL.createObjectURL(state.selectedVideoFile);
        platform = 'uploaded';
      }
    } else {
      const rawUrl = document.getElementById('clipUrlInput').value.trim();
      if (!rawUrl) {
        alert("Please enter a valid video URL.");
        return;
      }
      videoUrl = rawUrl;
      const parsed = parseMediaUrl(rawUrl);
      platform = parsed.platform;
      embedId = parsed.embedId;
      isShort = parsed.isShort;
      thumbnail = parsed.thumbnail;
    }

    const tagsArr = rawTags ? rawTags.split(',').map(t => {
      let trimmed = t.trim();
      if (!trimmed.startsWith('#')) trimmed = '#' + trimmed;
      return trimmed;
    }) : ageGroups.map(ag => `#${ag}`);

    const pointsArr = rawPoints ? rawPoints.split('\n').filter(p => p.trim()) : [];

    const newClip = {
      id: 'clip-' + Date.now(),
      title,
      description: description || 'Pitch-side rugby video shared to Malleny Park vault.',
      platform,
      url: videoUrl,
      embedId,
      isShort,
      thumbnail,
      category,
      level: ageCategories.includes('minis') ? 'beginner' : ageCategories.includes('youth') ? 'intermediate' : 'advanced',
      ageGroups,
      ageCategories,
      positions: [position],
      tags: tagsArr,
      author,
      authorRole: 'Coach / Player',
      upvotes: 1,
      duration: 'Pitch Video 📱',
      coachingPoints: pointsArr,
      comments: [],
      dateAdded: new Date().toISOString().split('T')[0]
    };

    // Immediate local UI update
    state.clips.unshift(newClip);
    saveClipsToStorage();
    updateStats();
    renderClips();

    if (isConfigured) {
      addClipToCloud(newClip).catch(err => console.error("Firestore cloud add error:", err));
    }

    // Success Feedback & Auto-close modal after 800ms
    submitClipBtn.textContent = '✅ Success! Video Added';
    submitClipBtn.style.background = '#10b981';

    setTimeout(() => {
      addClipForm.reset();
      submitClipBtn.disabled = false;
      submitClipBtn.textContent = '➕ Share to Vault';
      submitClipBtn.style.background = '';
      uploadProgressContainer.style.display = 'none';
      fileSelectedInfo.style.display = 'none';
      state.selectedVideoFile = null;
      renderFormAgeCheckboxes();
      addModal.classList.remove('active');
      window.openClipModal(newClip.id);
    }, 800);
  });

  spinChallengeBtn.addEventListener('click', () => {
    spinChallengeBtn.disabled = true;
    challengeOutput.textContent = '🎲 Spinning the challenge wheel...';

    let count = 0;
    const interval = setInterval(() => {
      const randomMsg = DAILY_CHALLENGES[Math.floor(Math.random() * DAILY_CHALLENGES.length)];
      challengeOutput.innerHTML = randomMsg;
      count++;

      if (count >= 10) {
        clearInterval(interval);
        spinChallengeBtn.disabled = false;
      }
    }, 100);
  });
}

function parseMediaUrl(url) {
  let platform = 'youtube';
  let embedId = '';
  let isShort = false;
  let thumbnail = 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&w=800&q=80';

  if (url.includes('youtube.com/shorts/') || url.includes('youtu.be/shorts/')) {
    platform = 'youtube-shorts';
    isShort = true;
    const parts = url.split('/shorts/');
    if (parts[1]) embedId = parts[1].split('?')[0];
    thumbnail = `https://img.youtube.com/vi/${embedId}/hqdefault.jpg`;
  } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
    platform = 'youtube';
    if (url.includes('v=')) {
      embedId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      embedId = url.split('youtu.be/')[1].split('?')[0];
    }
    thumbnail = `https://img.youtube.com/vi/${embedId}/hqdefault.jpg`;
  } else if (url.includes('instagram.com')) {
    platform = 'instagram';
    isShort = true;
    thumbnail = 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=800&q=80';
  }

  return { platform, embedId, isShort, thumbnail };
}

document.addEventListener('DOMContentLoaded', init);
