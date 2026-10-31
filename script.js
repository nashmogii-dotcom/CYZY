
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            serif: ['"Playfair Display"', 'serif'],
            sans: ['Inter', 'sans-serif'],
            cursive: ['Caveat', 'cursive'],
          },
          colors: {
            scrapbook: {
              paper: 'var(--sb-paper, #FAF6EE)',
              ink: 'var(--sb-ink, #2C2520)',
              accent: 'var(--sb-accent, #D4A373)',
              accentHover: 'var(--sb-accent-hover, #B88555)',
              board: 'var(--sb-board, #E0D4C3)',
              rose: 'var(--sb-rose, #E8A598)',
            }
          }
        }
      }
    }
  


    window.handleImageLoadError = function(img) {
      img.onerror = null; 
      img.src = `https://placehold.co/600x600/FAF6EE/2C2520?text=Photo+Unavailable`;
    };

    // Safe Storage Helper to seamlessly handle sandboxed iframe storage restrictions
    const safeStorage = {
      data: {},
      getItem(key) {
        try {
          return localStorage.getItem(key);
        } catch (e) {
          return this.data[key] || null;
        }
      },
      setItem(key, value) {
        try {
          localStorage.setItem(key, value);
        } catch (e) {
          this.data[key] = String(value);
        }
      },
      removeItem(key) {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          delete this.data[key];
        }
      }
    };

    // Apply background pattern dynamically on startup to HTML and Body
    document.addEventListener("DOMContentLoaded", () => {
      document.body.classList.add("scrapbook-bg-pattern");
    });

    const CLOUD_NAME = "deaqqmj3d"; // Regular Memories cloud
    const NFILM_CLOUD_NAME = "mxfiiht0"; // N Film cloud
    const PFP_CLOUD_NAME = "uigl7v2b"; // Profile photos and account metadata cloud
    // Create this unsigned upload preset in Cloudinary (Settings > Upload > Upload presets).
    const PFP_UPLOAD_PRESET = "presetsprints";
    let isDumpMode = false;
    let selectedAuthName = "";

    const CLASSMATE_NAMES = [
      "Aishrae", "Aliza", "Angel", "Caitlyn", "Cassandra", 
      "Chloe", "Geo", "Gia", "Jay", "Jemar", 
      "Justin", "Kacy", "Keziah", "Kiersten", "Khyla", 
      "Michael", "Niña", "Raven", "Rebecca", "Reyna", 
      "Richel", "Ryan", "Sitty", "Trisha", "Vercie", 
      "Victoria", "Vieness", "Jolian", "Marvee"
    ].sort(); 

    const CLASSMATE_PROFILES = {};
    const PFP_ACCOUNTS = new Map();
    CLASSMATE_NAMES.forEach(name => {
      CLASSMATE_PROFILES[name] = `https://placehold.co/150x150/FAF6EE/2C2520?text=${name[0]}`;
    });

    // Fallback media with high quality sample videos and images carrying YYYY-MM-DD name indicators
    const fallbackCloudinaryMedia = [
      {
        filename: "Aliza_2026-04-15_grad_photo",
        url: "https://placehold.co/600x600/FAF6EE/2C2520?text=Aliza+Graduation",
        owners: ["Aliza"],
        date: "2026-04-15",
        type: "image",
        uploader: "Aliza"
      },
      {
        filename: "Jay_2025-05-20_summer_vibe",
        url: "https://placehold.co/600x600/E0D4C3/2C2520?text=Jay+Summer+Trip",
        owners: ["Jay", "Justin"],
        date: "2025-05-20",
        type: "image",
        uploader: "Jay"
      },
      {
        filename: "Aishrae_2025-08-15_dance_practice.mp4",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        owners: ["Aishrae", "Gia"],
        date: "2025-08-15",
        type: "video",
        uploader: "Aishrae"
      },
      {
        filename: "Cassandra_2025-06-10_class_coffee",
        url: "https://placehold.co/600x600/FAF6EE/2C2520?text=Coffee+Break",
        owners: ["Cassandra", "Chloe"],
        date: "2025-06-10",
        type: "image",
        uploader: "Cassandra"
      },
      {
        filename: "Michael_2024-11-20_campus_tour.mp4",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        owners: ["Michael", "Ryan"],
        date: "2024-11-20",
        type: "video",
        uploader: "Michael"
      },
      {
        filename: "Raven_2024-09-05_study_session",
        url: "https://placehold.co/600x600/E0D4C3/2C2520?text=Study+Session",
        owners: ["Raven", "Rebecca", "Reyna"],
        date: "2024-09-05",
        type: "image",
        uploader: "Raven"
      },
      {
        filename: "Niña_2026-02-14_valentines_vlog.mp4",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        owners: ["Niña", "Trisha"],
        date: "2026-02-14",
        type: "video",
        uploader: "Niña"
      },
      {
        filename: "Jemar_2026-08-27_2GB_Drive_Embed",
        url: "https://drive.google.com/file/d/1jVCQmMcToV41p1IGjZufRMtIHVu3k1YS/preview",
        embedUrl: "https://drive.google.com/file/d/1jVCQmMcToV41p1IGjZufRMtIHVu3k1YS/preview",
        owners: ["Reyna", "Riche", "Niña", "Chloe", "Kacy", "Justin", "Sitty", "Victoria", "Jemar"],
        date: "2026-08-27",
        type: "video",
        isEmbed: true,
        uploader: "Jemar"
      }
    ];

    let memories = [];
    let activeGalleryItems = []; 
    let currentViewerIndex = -1; 
    let favoritesList = [];
    try {
      favoritesList = JSON.parse(safeStorage.getItem('scrapbook_favorites')) || [];
    } catch (e) {
      favoritesList = [];
    }
    const SHARE_SETTINGS_KEY = 'scrapbook_media_share_settings';
    const SHARE_BASE_URL = 'https://cyzy.netlify.app';
    let mediaShareSettings = {};
    try {
      mediaShareSettings = JSON.parse(safeStorage.getItem(SHARE_SETTINGS_KEY)) || {};
    } catch (e) {
      mediaShareSettings = {};
    }
    let activeShareFilename = null;

    function persistMediaShareSettings() {
      safeStorage.setItem(SHARE_SETTINGS_KEY, JSON.stringify(mediaShareSettings));
    }

    function getMediaShareSettings(itemOrFilename) {
      const filename = typeof itemOrFilename === 'string' ? itemOrFilename : itemOrFilename?.filename;
      const existing = mediaShareSettings[filename];
      return {
        privacy: existing?.privacy === 'public' ? 'public' : 'private',
        // Private media defaults to every classmate having access.
        allowedUsers: Array.isArray(existing?.allowedUsers) ? existing.allowedUsers : [...CLASSMATE_NAMES]
      };
    }

    function getShareYear(item) {
      const year = parseYearFromResource(item);
      if (year) return year;
      const d = new Date(item.date);
      return !isNaN(d.getTime()) ? d.getFullYear() : new Date().getFullYear();
    }

    function getShareType(item) {
      // N Film embed media is played as an embedded video inside the N Film player,
      // even when the underlying Cloudinary asset is technically a photo.
      if (isNFilmEmbed(item)) return 'video';
      return item?.type === 'video' ? 'video' : 'photo';
    }

    // N Film uses its own album route namespace. Regular memories keep their year route.
    function getShareAlbumSegment(item) {
      return isNFilmItem(item) ? 'nfilm' : String(getShareYear(item));
    }

    function getShareCloudinaryKey(item) {
      // N Film embed media use the Cloudinary Public ID plus an _embed suffix.
      // The actual external embed URL stays in metadata and never appears in the route.
      const publicId = item?.cloudinaryPublicId || item?.publicId || item?.filename || '';
      if (isNFilmEmbed(item) && publicId) return `${publicId}_embed`;
      return publicId;
    }

    function getShareLink(item, privacyOverride = null) {
      if (!item) return '';
      const privacy = privacyOverride || getMediaShareSettings(item).privacy;
      return `${SHARE_BASE_URL}/album/${getShareAlbumSegment(item)}/${getShareType(item)}/${encodeURIComponent(getShareCloudinaryKey(item))}/${privacy}`;
    }

    function getMediaByShareKey(key) {
      if (!key) return null;
      const decoded = decodeURIComponent(key);

      // _embed is a route-only marker. Resolve the real Cloudinary Public ID,
      // then use that asset's embed metadata when the media is opened.
      if (/_embed$/i.test(decoded)) {
        const publicId = decoded.replace(/_embed$/i, '');
        return memories.find(item =>
          isNFilmItem(item) &&
          item.cloudinaryPublicId === publicId &&
          isNFilmEmbed(item)
        ) || null;
      }

      return memories.find(item => item.cloudinaryPublicId === decoded) ||
             memories.find(item => item.filename === decoded) ||
             memories.find(item => item.url === decoded);
    }

    window.openShareAccessModalByFilename = function(encodedFilename) {
      const filename = decodeURIComponent(encodedFilename || '');
      const item = memories.find(m => m.filename === filename);
      if (!item) return;
      openShareAccessModal(item);
    };

    function openShareAccessModal(item) {
      activeShareFilename = item.filename;
      const modal = document.getElementById('share-access-modal');
      const title = document.getElementById('share-access-title');
      const subtitle = document.getElementById('share-access-subtitle');
      const linkInput = document.getElementById('share-access-link');
      const privacy = getMediaShareSettings(item);
      if (!modal) return;

      // Keep the share/access modal at the document root. The regular media
      // viewer is also moved to <body>, and album/Finder containers can create
      // stacking contexts. Mounting this modal at the root guarantees that the
      // Manage Access button always produces a visible, clickable dialog.
      if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
      }

      if (title) title.textContent = item.type === 'video' ? 'Video access & link' : 'Photo access & link';
      if (subtitle) subtitle.textContent = item.filename;
      if (linkInput) linkInput.value = getShareLink(item);

      const publicRadio = document.getElementById('share-privacy-public');
      const privateRadio = document.getElementById('share-privacy-private');
      if (publicRadio) publicRadio.checked = privacy.privacy === 'public';
      if (privateRadio) privateRadio.checked = privacy.privacy === 'private';

      renderShareAllowedUsers(privacy.allowedUsers);
      updateShareAccessVisibility();
      const canEdit = currentUser === 'Jemar';
      const editor = document.getElementById('share-access-editor');
      const saveBtn = document.getElementById('share-save-btn');
      const note = document.getElementById('share-access-readonly-note');
      if (editor) editor.classList.toggle('opacity-50', !canEdit);
      if (editor) editor.classList.toggle('pointer-events-none', !canEdit);
      if (saveBtn) saveBtn.classList.toggle('hidden', !canEdit);
      if (note) note.classList.toggle('hidden', canEdit);
      // Explicitly restore the modal's interactive state. The close operation
      // hides it with both opacity and display so it can never leave an
      // invisible overlay sitting above the viewer.
      modal.style.display = 'flex';
      modal.style.visibility = 'visible';
      modal.style.opacity = '1';
      modal.style.pointerEvents = 'auto';
      modal.style.zIndex = '2147483647';
      modal.classList.remove('pointer-events-none', 'opacity-0', 'hidden', 'nfilm-popup-closing');
      const panel = modal.querySelector('.share-access-panel');
      if (panel) { panel.style.pointerEvents = 'auto'; panel.classList.remove('scale-95'); panel.style.transform=''; }
      // Start the lightweight fade/slide animation after the modal is mounted.
      void modal.offsetWidth;
      modal.classList.add('nfilm-popup-opening');
      setTimeout(()=>modal.classList.remove('nfilm-popup-opening'),240);
    }

    window.closeShareAccessModal = function() {
      const modal = document.getElementById('share-access-modal');
      const panel = modal?.querySelector('.share-access-panel');
      if (modal) {
        modal.classList.remove('nfilm-popup-opening');
        modal.classList.add('nfilm-popup-closing','pointer-events-none','opacity-0');
        modal.style.pointerEvents = 'none';
        setTimeout(()=>{
          if(modal.classList.contains('nfilm-popup-closing')){
            modal.style.display='none'; modal.style.visibility='hidden';
            modal.classList.remove('nfilm-popup-closing');
          }
        },220);
      }
      activeShareFilename = null;
    };

    function renderShareAllowedUsers(selectedUsers = []) {
      const container = document.getElementById('share-allowed-users');
      if (!container) return;
      const selected = new Set(selectedUsers);
      container.innerHTML = CLASSMATE_NAMES.map(name => `
        <label class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-scrapbook-board/20 cursor-pointer">
          <input type="checkbox" class="share-user-checkbox accent-[#D4A373]" value="${name}" ${selected.has(name) ? 'checked' : ''}>
          <span class="text-xs font-semibold text-scrapbook-ink">${name}</span>
        </label>
      `).join('');
    }

    window.updateShareAccessVisibility = function() {
      const isPrivate = document.getElementById('share-privacy-private')?.checked;
      const usersPanel = document.getElementById('share-users-panel');
      if (usersPanel) usersPanel.classList.toggle('hidden', !isPrivate);
      const item = memories.find(m => m.filename === activeShareFilename);
      const linkInput = document.getElementById('share-access-link');
      if (item && linkInput) linkInput.value = getShareLink(item, isPrivate ? 'private' : 'public');
    };

    window.saveShareAccessSettings = function() {
      if (!activeShareFilename) return;
      const isPrivate = document.getElementById('share-privacy-private')?.checked;
      if (currentUser !== 'Jemar') return;
      const saveBtn = document.getElementById('share-save-btn');
      if (saveBtn) { saveBtn.disabled = true; saveBtn.style.pointerEvents = 'none'; }
      const allowedUsers = [...document.querySelectorAll('.share-user-checkbox:checked')].map(el => el.value);
      const newPrivacy = isPrivate ? 'private' : 'public';
      mediaShareSettings[activeShareFilename] = {
        privacy: newPrivacy,
        allowedUsers: isPrivate ? allowedUsers : []
      };
      persistMediaShareSettings();
      const item = memories.find(m => m.filename === activeShareFilename);
      const linkInput = document.getElementById('share-access-link');
      if (item && linkInput) linkInput.value = getShareLink(item, newPrivacy);

      // If the user is currently viewing this media through a direct share URL,
      // keep the browser URL synchronized with the newly saved privacy setting.
      if (item && directMediaRoute && directMediaRoute.key === encodeURIComponent(item.filename)) {
        directMediaRoute.privacy = newPrivacy;
        const newPath = `/album/${getShareAlbumSegment(item)}/${getShareType(item)}/${encodeURIComponent(getShareCloudinaryKey(item))}/${newPrivacy}`;
        history.replaceState({ directMedia: true }, '', newPath);
        setDirectRouteChrome(true, newPrivacy === 'public');
      }
      closeShareAccessModal();
      if (saveBtn) { saveBtn.disabled = false; saveBtn.style.pointerEvents = 'auto'; }
    };

    window.copyActiveShareLink = async function() {
      if (!activeShareFilename) return;
      const item = memories.find(m => m.filename === activeShareFilename);
      if (!item) return;
      const input = document.getElementById('share-access-link');
      const link = getShareLink(item);
      if (input) input.value = link;
      try {
        await navigator.clipboard.writeText(link);
      } catch (e) {
        if (input) { input.focus(); input.select(); document.execCommand('copy'); }
      }
      const btn = document.getElementById('share-copy-btn');
      if (btn) {
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
        setTimeout(() => { btn.innerHTML = original; }, 1400);
      }
    };

    function parseDirectMediaRoute() {
      const match = window.location.pathname.match(/^\/album\/([^/]+)\/(photo|video)\/([^/]+)\/(public|private)\/?$/i);
      return match ? { year: match[1], type: match[2].toLowerCase(), key: match[3], privacy: match[4].toLowerCase() } : null;
    }

    function setDirectRouteChrome(isDirect, isPublic) {
      // A pasted/direct media URL opens directly into the media experience.
      // It must not expose an X/back control that suggests returning to an
      // album, because the user did not navigate there from an album page.
      const closeBtn = document.querySelector('#media-viewer-modal > button');
      if (closeBtn) closeBtn.classList.toggle('hidden', !!isDirect);

      const nfilmBackBtn = document.querySelector('#nfilm-player-modal button[onclick*="closeNFilmPlayer"]');
      if (nfilmBackBtn) nfilmBackBtn.classList.toggle('hidden', !!isDirect);
    }

    function handleDirectMediaRoute() {
      const route = parseDirectMediaRoute();
      if (!route) return false;
      directMediaRoute = route;
      const item = getMediaByShareKey(route.key);
      if (!item || String(getShareAlbumSegment(item)).toLowerCase() !== String(route.year).toLowerCase() || getShareType(item) !== route.type) {
        alert('This media link is invalid or the media is no longer available.');
        return true;
      }

      const settings = getMediaShareSettings(item);
      // N Film direct links use the dedicated N Film player.
      if (isNFilmItem(item) && (item.type === 'video' || isNFilmEmbed(item)) && route.privacy === 'public') { openNFilmPlayer(item); return true; }
      // A private direct link should respect an already-authenticated session.
      // Only show the authentication gate when there is no authenticated user yet.
      if (route.privacy === 'private') {
        if (currentUser) {
          return openDirectRouteAfterAuthentication();
        }
        directMediaAuthenticated = false;
        showPrivateDirectLinkGate(item);
        return true;
      }

      activeYearFilter = getShareYear(item);
      activeGalleryItems = [item];
      setDirectRouteChrome(true, true);
      openViewer(0);
      return true;
    }

    function showPrivateDirectLinkGate(item) {
      const overlay = document.getElementById('onboarding-overlay');
      const title = overlay?.querySelector('h2');
      const text = overlay?.querySelector('p');
      if (title) title.textContent = 'Private Memory';
      if (text) text.textContent = 'This private link requires you to authenticate before the memory can be shown.';
      document.body.classList.add('private-direct-route');
      if (overlay) overlay.classList.remove('hidden', 'opacity-0');
      lockScroll();
      renderOnboardingSelectionGrid();
      selectedOnboardingUser = null;
    }

    function openDirectRouteAfterAuthentication() {
      if (!directMediaRoute) return false;
      const item = getMediaByShareKey(directMediaRoute.key);
      if (!item) return false;
      if (directMediaRoute.privacy === 'private') {
        const settings = getMediaShareSettings(item);
        const allowed = settings.allowedUsers || CLASSMATE_NAMES;
        if (!allowed.includes(currentUser)) {
          alert('This media is private and your account does not have access.');
          return true;
        }
        directMediaAuthenticated = true;
      }
      const overlay = document.getElementById('onboarding-overlay');
      document.body.classList.remove('private-direct-route');
      if (overlay) { overlay.classList.add('opacity-0'); setTimeout(() => overlay.classList.add('hidden'), 350); }
      unlockScroll();
      activeYearFilter = getShareYear(item);
      activeGalleryItems = [item];
      setDirectRouteChrome(true, directMediaRoute.privacy === 'public');
      if (isNFilmItem(item) && (item.type === 'video' || isNFilmEmbed(item))) { openNFilmPlayer(item); } else { openViewer(0); }
      return true;
    }

    let activeCategory = 'all'; 
    let activeClassmateFilter = null; 
    let activeYearFilter = null;
    let activeMonthFilter = null; 
    let activeTab = 'home';
    let currentActivePage = 'home'; // Tracks primary page states ('home' or 'search')

    let classmatesModal;
    let scrapbookTimelineContainer;
    let emptyState;
    let statTotal;
    let statPhotos;
    let statVideos;

    let isDragging = false;
    let isGuiCleared = false;
    let zoomScale = 1;
    let panX = 0;
    let panY = 0;
    let startX = 0;
    let startY = 0;

    // Fullscreen scale/pan tracking
    let fsScale = 1;
    let fsPanX = 0;
    let fsPanY = 0;
    let isFsDragging = false;
    let fsStartX = 0;
    let fsStartY = 0;

    let currentUser = safeStorage.getItem('scrapbook_user') || null;
    let selectedOnboardingUser = null; 
    let activeProfileClassmate = null; 
    let activeProfileTab = 'all';
    let activeNFilmCategory = 'all';
    let finderMoreTags = false;
    let finderSource = 'any';
    let finderMedia = 'any'; 
    let slideshowInterval = null; 
    let slideshowImages = [];
    let currentSlideshowIndex = 0;

    let activePopupStackList = [];
    let activeExpandedPeriod = null;
    let isLibraryOpen = false;
    let isCommentsVisible = false;
    let isAutoZoomOn = safeStorage.getItem('scrapbook_auto_zoom') !== 'false';

    let simulatedCommentsDb = {};
    try {
      simulatedCommentsDb = JSON.parse(safeStorage.getItem('scrapbook_comments_db')) || {};
    } catch (e) {
      simulatedCommentsDb = {};
    }
    let activeReplyTargetId = null;

    // Configurator state variables
    let currentCloudName = CLOUD_NAME;
    let customMediaList = [];

    try {
      const storedMedia = safeStorage.getItem('scrapbook_custom_media');
      if (storedMedia) {
        customMediaList = JSON.parse(storedMedia);
      }
    } catch (e) {
      customMediaList = [];
    }

    function parseCustomMediaText(text) {
      if (!text) return [];
      return text.split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0)
        .map((url, i) => {
          const isVideo = url.endsWith('.mp4') || url.endsWith('.mov') || url.includes('/video/');
          const filename = `custom_${i}_2026-07-10_${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`;
          return {
            filename: filename,
            url: url,
            owners: [currentUser || CLASSMATE_NAMES[i % CLASSMATE_NAMES.length]],
            date: "2026-07-10",
            type: isVideo ? 'video' : 'image',
            uploader: currentUser || "Classmate"
          };
        });
    }

    window.saveCustomMediaSettings = function() {
      const cloudInput = document.getElementById('config-cloud-name');
      const mediaInput = document.getElementById('config-custom-media');
      if (!cloudInput || !mediaInput) return;

      const newCloud = cloudInput.value.trim() || CLOUD_NAME;
      safeStorage.setItem('scrapbook_cloud_name', newCloud);
      // The live archive clouds are fixed: Memories uses CLOUD_NAME and N Film uses NFILM_CLOUD_NAME.
      currentCloudName = CLOUD_NAME;

      const text = mediaInput.value.trim();
      const parsed = parseCustomMediaText(text);
      safeStorage.setItem('scrapbook_custom_media', JSON.stringify(parsed));
      customMediaList = parsed;

      closeSandboxModal();
      loadMediaFromCloudinary();
    };

    window.resetCustomMediaSettings = function() {
      safeStorage.removeItem('scrapbook_cloud_name');
      safeStorage.removeItem('scrapbook_custom_media');
      currentCloudName = CLOUD_NAME;
      customMediaList = [];

      const cloudInput = document.getElementById('config-cloud-name');
      const mediaInput = document.getElementById('config-custom-media');
      if (cloudInput) cloudInput.value = '';
      if (mediaInput) mediaInput.value = '';

      closeSandboxModal();
      loadMediaFromCloudinary();
    };

    function populateConfigFields() {
      const cloudInput = document.getElementById('config-cloud-name');
      const mediaInput = document.getElementById('config-custom-media');
      if (cloudInput) cloudInput.value = currentCloudName === CLOUD_NAME ? '' : currentCloudName;
      if (mediaInput && customMediaList.length > 0) {
        mediaInput.value = customMediaList.map(item => item.url).join('\n');
      }
    }

    const DB_NAME = "ScrapbookAssetOfflineDatabase";
    const STORE_NAME = "local_media_caches";
    let dbInstance = null;

    function initIndexedDB() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 2);
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: "filename" });
          }
        };
        request.onsuccess = (e) => {
          dbInstance = e.target.result;
          resolve(dbInstance);
        };
        request.onerror = (e) => {
          console.error("IndexedDB initialization failure:", e.target.error);
          reject(e.target.error);
        };
      });
    }

    async function storeAssetBlob(filename, blob, url) {
      if (!dbInstance) await initIndexedDB();
      return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({
          filename: filename,
          blob: blob,
          originalUrl: url,
          size: blob.size,
          timestamp: Date.now()
        });
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
      });
    }

    async function getStoredAsset(filename) {
      if (!dbInstance) await initIndexedDB();
      return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(filename);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
      });
    }

    async function removeStoredAsset(filename) {
      if (!dbInstance) await initIndexedDB();
      return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(filename);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
      });
    }

    async function getAllStoredAssets() {
      if (!dbInstance) await initIndexedDB();
      return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = (e) => reject(e.target.error);
      });
    }

    // Active downloading tracks
    let activeDownloads = {};

    async function triggerAssetDownload(filename, url) {
      if (activeDownloads[filename]) return;
      activeDownloads[filename] = true;

      // Uncover download banner layout
      const banner = document.getElementById('download-progress-banner');
      const bannerTitle = document.getElementById('progress-banner-title');
      const bannerPercent = document.getElementById('progress-banner-percent');
      const bannerBar = document.getElementById('progress-banner-bar');

      if (banner) banner.classList.remove('hidden');
      if (bannerTitle) bannerTitle.textContent = `Downloading ${filename.slice(0, 20)}...`;

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("CORS or Network Fetch Exception");

        const contentLength = response.headers.get('content-length');
        const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
        
        const reader = response.body.getReader();
        let receivedBytes = 0;
        const chunks = [];

        while(true) {
          const {done, value} = await reader.read();
          if (done) break;
          chunks.push(value);
          receivedBytes += value.length;
          
          if (totalBytes > 0) {
            const percent = Math.round((receivedBytes / totalBytes) * 100);
            if (bannerPercent) bannerPercent.textContent = `${percent}%`;
            if (bannerBar) bannerBar.style.width = `${percent}%`;
            updateCardDownloadIndicator(filename, percent);
          }
        }

        const blob = new Blob(chunks);
        await storeAssetBlob(filename, blob, url);

        // Success Update
        if (banner) banner.classList.add('hidden');
        delete activeDownloads[filename];
        updateCardDownloadIndicator(filename, 100, true);

        // Force reload relevant galleries
        refreshLocalCachingMappings();
      } catch (err) {
        console.error("Local caching abort:", err);
        delete activeDownloads[filename];
        if (banner) banner.classList.add('hidden');
      }
    }

    function updateCardDownloadIndicator(filename, percent, complete = false) {
      const indicators = document.querySelectorAll(`[data-dl-filename="${filename}"]`);
      indicators.forEach(el => {
        if (complete) {
          el.innerHTML = `<i class="fa-solid fa-circle-check text-green-500 text-sm"></i>`;
        } else {
          el.innerHTML = `<span class="text-[10px] text-scrapbook-accent font-bold">${percent}%</span>`;
        }
      });
    }

    async function triggerAssetDownloadFromViewer() {
      if (currentViewerIndex < 0) return;
      const item = activeGalleryItems[currentViewerIndex];
      const icon = document.getElementById('viewer-asset-download-icon');
      if (icon) icon.className = "fa-solid fa-spinner animate-spin text-base";
      await triggerAssetDownload(item.filename, item.url);
      if (icon) icon.className = "fa-solid fa-circle-check text-green-500 text-base";
    }

    async function triggerDownloadAllAssetsInPeriod() {
      if (!activeExpandedPeriod) return;
      const periodMemories = memories.filter(item => {
        if (item.isPending) return false;
        if (!isRegularMemoryItem(item)) return false;
        if (item.type !== 'video') return false; // Only cache videos offline
        const dateObj = new Date(item.date);
        const monthYear = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        return monthYear === activeExpandedPeriod;
      });

      for (const item of periodMemories) {
        await triggerAssetDownload(item.filename, item.url);
      }
    }

    // Mapping of filename -> local Object URL
    let localAssetMappings = {};

    async function refreshLocalCachingMappings() {
      const stored = await getAllStoredAssets();
      
      // Clean previous Object URLs to prevent memory leaks
      for (const url of Object.values(localAssetMappings)) {
        URL.revokeObjectURL(url);
      }
      
      localAssetMappings = {};
      stored.forEach(item => {
        localAssetMappings[item.filename] = URL.createObjectURL(item.blob);
      });

      // Rerender grids with updated URLs
      updateDashboardStats();
      if (activeYearFilter) renderGallery();
      if (activeProfileClassmate) renderProfileGrid();
      if (activeTab === 'search') runSearchFilter();
      refreshAssetsDrawer();
    }

    async function deleteLocalCachedAsset(filename) {
      await removeStoredAsset(filename);
      refreshLocalCachingMappings();
    }

    async function refreshAssetsDrawer() {
      const stored = await getAllStoredAssets();
      const listContainer = document.getElementById('drawer-assets-list');
      const counterLabel = document.getElementById('drawer-storage-count');
      const progressBar = document.getElementById('drawer-storage-bar');

      if (!listContainer) return;
      listContainer.innerHTML = '';

      let totalSize = 0;
      stored.forEach(item => {
        totalSize += item.size;
      });

      const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
      if (counterLabel) counterLabel.textContent = `${stored.length} Items (${totalSizeMB} MB)`;
      
      const storageLimit = 150 * 1024 * 1024; // 150MB target progress boundary
      const progressPercent = Math.min((totalSize / storageLimit) * 100, 100);
      if (progressBar) progressBar.style.width = `${progressPercent}%`;

      if (stored.length === 0) {
        listContainer.innerHTML = `
          <div class="text-center py-16 text-scrapbook-ink/40">
            <i class="fa-solid fa-box-open text-4xl block mb-2 opacity-30"></i>
            <p class="text-xs font-semibold">No Stored Offline Assets</p>
            <p class="text-[10px] text-scrapbook-ink/50 mt-1">Stored photos/videos will be instantly available here.</p>
          </div>
        `;
        return;
      }

      stored.forEach(item => {
        const card = document.createElement('div');
        card.className = "flex items-center justify-between p-3 bg-white border border-[#D4A373]/20 rounded-xl shadow-sm hover:border-scrapbook-ink transition-all";
        
        const sizeMB = (item.size / (1024 * 1024)).toFixed(2);
        const objUrl = localAssetMappings[item.filename] || item.originalUrl;

        card.innerHTML = `
          <div class="flex items-center space-x-3 min-w-0 flex-1">
            <div class="w-12 h-12 rounded-lg overflow-hidden border border-[#D4A373]/30 bg-scrapbook-paper flex-shrink-0">
              <img src="${get380pUrl(objUrl)}" class="w-full h-full object-cover" onerror="handleImageLoadError(this)">
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-bold text-scrapbook-ink truncate">${item.filename}</p>
              <p class="text-[10px] text-scrapbook-ink/50 mt-0.5">${sizeMB} MB</p>
            </div>
          </div>
          <button onclick="deleteLocalCachedAsset('${item.filename}')" class="w-8 h-8 rounded-full bg-[#FAF6EE] text-scrapbook-rose hover:bg-scrapbook-rose hover:text-white transition-all flex items-center justify-center shadow-sm ml-2 active:scale-90" title="Delete Cache"><i class="fa-solid fa-trash-can text-xs"></i></button>
        `;
        listContainer.appendChild(card);
      });
    }

    // Helper to restore tab bar focus back to the correct primary page view
    function restoreTabBarHighlight() { renderContextTabs(); }

    function toggleAssetsDrawer(open) {
      const drawer = document.getElementById('assets-drawer');
      const wrapper = document.getElementById('app-viewport-wrapper');
      const backdrop = document.getElementById('drawer-backdrop');

      if (!drawer || !wrapper || !backdrop) return;
      if (open) {
        drawer.classList.remove('translate-x-full');
        drawer.classList.add('pointer-events-auto');
        drawer.style.zIndex = '120';
        backdrop.classList.remove('opacity-0', 'pointer-events-none');
        backdrop.classList.add('opacity-100', 'pointer-events-auto');
        backdrop.style.zIndex = '110';
        wrapper.classList.add('scale-[0.94]', 'blur-[2px]', 'pointer-events-none');
        lockScroll();
        refreshAssetsDrawer();
      } else {
        drawer.classList.add('translate-x-full', 'pointer-events-none');
        wrapper.classList.remove('scale-[0.94]', 'blur-[2px]', 'pointer-events-none');
        backdrop.classList.add('opacity-0', 'pointer-events-none');
        backdrop.classList.remove('opacity-100', 'pointer-events-auto');
        backdrop.classList.remove('opacity-100');
        unlockScroll();
        restoreTabBarHighlight();
      }
    }
  


    /**
     * Unified Filename Date Checker
     * Scans filenames for the YYYY-MM-DD pattern to file correctly in Volumes and Month groupings.
     */
    function parseFilenameDate(filename) {
      if (!filename) return null;
      // Regex pattern to capture YYYY-MM-DD indicators
      const match = filename.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        const year = parseInt(match[1], 10);
        const monthIndex = parseInt(match[2], 10) - 1; 
        const day = parseInt(match[3], 10);
        
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        
        if (year >= 2024 && year <= 2026 && monthIndex >= 0 && monthIndex < 12 && day >= 1 && day <= 31) {
          return {
            year: year,
            monthName: monthNames[monthIndex],
            day: day,
            formatted: `${monthNames[monthIndex]} ${day} ${year}`
          };
        }
      }
      return null;
    }

    // Helper function to extract years accurately from resource metadata or filename
    function parseYearFromResource(item) {
      const parsed = parseFilenameDate(item.filename);
      if (parsed) {
        return parsed.year;
      }

      // Cloudinary's created_at is the authoritative date when the public ID
      // doesn't contain a YYYY-MM-DD date. Do this before heuristic filename
      // guessing so newly tagged assets land in their real year/month album.
      if (item.createdAt) {
        const created = new Date(item.createdAt);
        if (!isNaN(created.getTime())) {
          const yr = created.getFullYear();
          if (yr >= 1900 && yr <= 2100) return yr;
        }
      }

      const publicId = item.filename || "";

      // Scans fallback regex strings for exact years 2024, 2025, or 2026
      const yearMatch = publicId.match(/\b(2024|2025|2026)\b/) || publicId.match(/(2024|2025|2026)/);
      if (yearMatch) {
        return parseInt(yearMatch[1], 10);
      }

      // Context scan fallback
      if (item.cloudinaryContext) {
        const ctxStr = JSON.stringify(item.cloudinaryContext);
        const ctxMatch = ctxStr.match(/\b(2024|2025|2026)\b/);
        if (ctxMatch) {
          return parseInt(ctxMatch[1], 10);
        }
      }

      // Date property parsing
      if (item.date) {
        const d = new Date(item.date);
        if (!isNaN(d.getTime())) {
          const yr = d.getFullYear();
          if (yr >= 2024 && yr <= 2026) {
            return yr;
          }
        }
      }

      // Keyword associations
      const lowerId = publicId.toLowerCase();
      if (lowerId.includes("grad") || lowerId.includes("senior") || lowerId.includes("final") || lowerId.includes("2026")) {
        return 2026;
      }
      if (lowerId.includes("practice") || lowerId.includes("sophomore") || lowerId.includes("class") || lowerId.includes("summer") || lowerId.includes("2025")) {
        return 2025;
      }
      if (lowerId.includes("freshman") || lowerId.includes("start") || lowerId.includes("first") || lowerId.includes("2024")) {
        return 2024;
      }

      // Distribute evenly if no indicator exists
      let hash = 0;
      for (let i = 0; i < publicId.length; i++) {
        hash = publicId.charCodeAt(i) + ((hash << 5) - hash);
      }
      return 2024 + Math.abs(hash % 3);
    }

    // Dynamic Date Parser utilizing filename indicators first, then secondary fallbacks
    function resolveDynamicDate(item) {
      // 1. Prioritize an explicit YYYY-MM-DD in the public ID.
      const parsed = parseFilenameDate(item.filename);
      if (parsed) {
        return parsed.formatted;
      }

      // 2. Otherwise use Cloudinary's real creation date. This prevents
      // public IDs without dates from being assigned a random month/day.
      if (item.createdAt) {
        const created = new Date(item.createdAt);
        if (!isNaN(created.getTime())) {
          return created.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        }
      }

      // 3. Secondary fallback checks for local/fallback assets.
      const filename = item.filename || "";
      const targetYear = parseYearFromResource(item);
      
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const monthShorts = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      
      let detectedMonthIdx = -1;
      let detectedDay = 15; 
      
      const lowerName = filename.toLowerCase();
      for (let i = 0; i < 12; i++) {
        if (lowerName.includes(monthNames[i].toLowerCase()) || lowerName.includes(monthShorts[i])) {
          detectedMonthIdx = i;
          break;
        }
      }
      
      if (detectedMonthIdx === -1) {
        if (lowerName.includes("grad") || lowerName.includes("congrat") || lowerName.includes("senior")) {
          detectedMonthIdx = 4; // May (Graduation)
        } else if (lowerName.includes("summer") || lowerName.includes("beach") || lowerName.includes("vacation") || lowerName.includes("camp")) {
          detectedMonthIdx = 5; // June
        } else if (lowerName.includes("christmas") || lowerName.includes("xmas") || lowerName.includes("winter") || lowerName.includes("holiday")) {
          detectedMonthIdx = 11; // December
        } else if (lowerName.includes("halloween") || lowerName.includes("spooky") || lowerName.includes("october")) {
          detectedMonthIdx = 9; // October
        } else if (lowerName.includes("start") || lowerName.includes("freshman") || lowerName.includes("welcome") || lowerName.includes("opening")) {
          detectedMonthIdx = 8; // September
        } else if (lowerName.includes("valentine") || lowerName.includes("love") || lowerName.includes("heart") || lowerName.includes("date")) {
          detectedMonthIdx = 1; // February
        }
      }
      
      if (detectedMonthIdx === -1) {
        let hash = 0;
        for (let i = 0; i < filename.length; i++) {
          hash = filename.charCodeAt(i) + ((hash << 5) - hash);
        }
        hash = Math.abs(hash);
        detectedMonthIdx = hash % 12;
        detectedDay = 1 + (hash % 28);
      } else {
        const dayMatch = filename.match(/\b([1-9]|[12]\d|3[01])\b/);
        if (dayMatch) {
          detectedDay = parseInt(dayMatch[1], 10);
        } else {
          let hash = 0;
          for (let i = 0; i < filename.length; i++) {
            hash = filename.charCodeAt(i) + ((hash << 5) - hash);
          }
          detectedDay = 1 + (Math.abs(hash) % 28);
        }
      }
      
      return `${monthNames[detectedMonthIdx]} ${detectedDay} ${targetYear}`;
    }

    // Unified classmates tagging parser for both live fetch and offline arrays
    function processMemoryItem(item) {
      const rawName = item.filename || "";
      const uploaderMatch = rawName.match(/^([A-Za-z]+)id_/i);
      let ownersSearchString = rawName.toLowerCase();

      // Extract uploader 
      if (uploaderMatch) {
        const rawUploader = uploaderMatch[1];
        const normalizedUploader = CLASSMATE_NAMES.find(c => c.toLowerCase() === rawUploader.toLowerCase());
        if (normalizedUploader) {
          item.uploader = normalizedUploader;
          const uploaderTargetPattern = new RegExp("^" + rawUploader + "id_", "i");
          ownersSearchString = rawName.replace(uploaderTargetPattern, "").toLowerCase();
        }
      }

      // Populate tags / owners from matched names. Drive embeds may provide an explicit classmate list.
      if (!item.isEmbed || !Array.isArray(item.owners) || item.owners.length === 0) {
        item.owners = CLASSMATE_NAMES.filter(name => ownersSearchString.includes(name.toLowerCase()));
      }

      // Fallbacks to avoid orphaned items
      if (item.owners.length === 0) {
        if (item.uploader) {
          item.owners.push(item.uploader);
        } else {
          let hash = 0;
          for (let i = 0; i < rawName.length; i++) {
            hash = rawName.charCodeAt(i) + ((hash << 5) - hash);
          }
          const distributedClassmate = CLASSMATE_NAMES[Math.abs(hash % CLASSMATE_NAMES.length)];
          item.owners.push(distributedClassmate);
          item.uploader = distributedClassmate;
        }
      } else if (!item.uploader) {
        item.uploader = item.owners[0];
      }

      // Preserve explicitly supplied dates for special embeds; use the normal resolver for regular media.
      if (!item.isEmbed) item.date = resolveDynamicDate(item);

      return item;
    }

    function parseCloudinaryResource(res, isVideo, sourceTag = "", cloudName = currentCloudName) {
      const filename = res.public_id || `media_${Date.now()}`;
      const cloudinaryContext = normalizeCloudinaryContext(res.context || res.contextual_metadata || res.custom_context || {});
      // N Film images can be represented by an external embed instead of the
      // Cloudinary image itself. The Cloudinary contextual metadata key is
      // `embed`; its value is the external URL (any HTTP/HTTPS link).
      const embedValue = Object.entries(cloudinaryContext).find(([k,v]) =>
        String(k).trim().toLowerCase() === 'embed' && v !== undefined && v !== null && String(v).trim()
      )?.[1];
      const embedUrl = embedValue ? String(embedValue).trim() : '';
      const isExternalEmbed = String(cloudName).toLowerCase() === NFILM_CLOUD_NAME.toLowerCase()
        && String(sourceTag).toLowerCase() === 'studio' && /^https?:\/\//i.test(embedUrl);
      return {
        filename: filename,
        cloudinaryPublicId: res.public_id,
        sourceCloudName: cloudName,
        url: `https://res.cloudinary.com/${cloudName}/${isVideo ? 'video' : 'image'}/upload/${res.public_id}.${res.format}`,
        owners: [],
        // Keep the raw Cloudinary creation timestamp so year/month albums use
        // the actual asset date instead of guessing from the public ID.
        createdAt: res.created_at || res.createdAt || null,
        date: res.created_at ? new Date(res.created_at).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'}) : "2026-07-10",
        type: isVideo ? 'video' : 'image',
        uploader: "Classmate",
        cloudinaryContext: cloudinaryContext,
        cloudinaryTags: Array.isArray(res.tags) ? res.tags : (typeof res.tags === 'string' ? res.tags.split(',').map(s => s.trim()).filter(Boolean) : []),
        // The /list/<tag>.json endpoint may not include the tag array in every response.
        // Preserve the tag that was used to discover this resource so album filtering still works.
        discoveryTags: sourceTag ? [sourceTag] : [],
        isEmbed: isExternalEmbed,
        embedUrl: isExternalEmbed ? embedUrl : ''
      };
    }

    function fetchWithTimeout(url, options = {}) {
      const { timeout = 3500 } = options;
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      return fetch(url, { ...options, signal: controller.signal })
        .then(res => {
          clearTimeout(id);
          return res;
        })
        .catch(err => {
          clearTimeout(id);
          throw err;
        });
    }


    async function loadPfpAccounts() {
      // Try the standard Cloudinary tag-list endpoint first, then simpler URL
      // variants. Some Cloudinary configurations reject/ignore extra query params.
      // Never clear known-good accounts unless a valid resources response arrives.
      let data = null;
      let lastError = null;
      const urls = [
        `https://res.cloudinary.com/${PFP_CLOUD_NAME}/image/list/pfps.json?cb=${Date.now()}`,
        `https://res.cloudinary.com/${PFP_CLOUD_NAME}/image/list/pfps.json?include_context=true&cb=${Date.now()}`
      ];
      for (const url of urls) {
        try {
          const response = await fetchWithTimeout(url, { timeout: 8000, cache: 'no-store' });
          if (!response.ok) { lastError = new Error(`Cloudinary tag list returned HTTP ${response.status}`); continue; }
          const parsed = await response.json();
          if (!Array.isArray(parsed?.resources)) { lastError = new Error('Cloudinary tag list did not return a resources array'); continue; }
          data = parsed;
          break;
        } catch (e) { lastError = e; }
      }
      if (!data) {
        console.warn('Unable to list Cloudinary pfps. Check that List Delivery is enabled for this cloud and the pfps tag is publicly listable.', lastError);
        return false;
      }
      try {
        PFP_ACCOUNTS.clear();
        for (const res of data.resources) {
          // Cloudinary can return contextual values as context.custom, a flat
          // context object/string, or as key/value metadata depending on how the
          // asset was uploaded. Merge all supported shapes before matching Name.
          const ctx = {
            ...normalizeCloudinaryContext(res.context),
            ...normalizeCloudinaryContext(res.contextual_metadata),
            ...normalizeCloudinaryContext(res.custom_context),
            ...normalizeCloudinaryContext(res.metadata)
          };
          const val = key => {
            const found = Object.entries(ctx).find(([k]) => String(k).trim().toLowerCase() === key.toLowerCase());
            if (found) {
              const value = found[1];
              if (value && typeof value === 'object') return String(value.value ?? value.val ?? value.text ?? '').trim();
              return String(value ?? '').trim();
            }
            // Also accept arrays of {key/name, value} pairs.
            for (const source of [res.context, res.contextual_metadata, res.custom_context, res.metadata]) {
              if (Array.isArray(source)) {
                const pair = source.find(x => String(x?.key ?? x?.name ?? '').trim().toLowerCase() === key.toLowerCase());
                if (pair) return String(pair.value ?? pair.val ?? '').trim();
              }
            }
            return '';
          };
          const name = val('Name'); if (!name) continue;
          const photoUrl = res.secure_url || `https://res.cloudinary.com/${PFP_CLOUD_NAME}/image/upload/f_auto,q_auto/${String(res.public_id).split('/').map(encodeURIComponent).join('/')}${res.format ? '.' + res.format : ''}`;
          const normalizedName = name.toLowerCase();
          const account = {name, passcode:val('Passcode'), status:val('Status'), description:val('Description'), photoUrl, publicId:res.public_id};
          // Some Cloudinary list responses expose custom metadata in additional wrappers.
          if (!account.description) {
            for (const source of [res.context, res.contextual_metadata, res.custom_context, res.metadata]) {
              const candidate = normalizeCloudinaryContext(source);
              const entry = Object.entries(candidate).find(([k]) => String(k).trim().toLowerCase() === 'description');
              if (entry) {
                const v = entry[1];
                account.description = String(v && typeof v === 'object' ? (v.value ?? v.val ?? v.text ?? '') : (v ?? '')).trim();
                if (account.description) break;
              }
            }
          }
          // Prefer a record with an explicit status/passcode if duplicate profile
          // uploads exist for the same username, rather than a stale incomplete one.
          const prior = PFP_ACCOUNTS.get(normalizedName);
          if (!prior || ((!prior.status || !prior.passcode) && (account.status || account.passcode))) PFP_ACCOUNTS.set(normalizedName, account);
          CLASSMATE_PROFILES[name] = photoUrl;
        }
        // Pfps are the single source of truth for profile photos across the whole
        // site, including the authentication overlay. Refresh already-rendered avatars.
        applyPfpPhotosToDocument();
        renderOnboardingSelectionGrid();
        refreshProfileAvatarDots();
        if (!window.__profileDotObserver) {
          window.__profileDotObserver = new MutationObserver(() => {
            applyPfpPhotosToDocument();
            refreshProfileAvatarDots();
          });
          window.__profileDotObserver.observe(document.body, {childList:true, subtree:true});
        }
        if (currentUser) enforceCurrentAccountStatus();
        return true;
      } catch (e) { console.warn('Unable to parse Cloudinary pfps tag', e); return false; }
    }
    function applyPfpPhotosToDocument() {
      if (!PFP_ACCOUNTS.size) return;
      document.querySelectorAll('img[alt]').forEach(img => {
        const account = getPfpAccount(String(img.alt || '').trim());
        if (!account?.photoUrl) return;
        if (img.dataset.pfpResolvedUrl !== account.photoUrl) {
          img.src = account.photoUrl;
          img.dataset.pfpResolvedUrl = account.photoUrl;
        }
      });
      const headerLogoPfp = document.getElementById('header-logo-pfp');
      if (currentUser && headerLogoPfp) {
        const account = getPfpAccount(currentUser);
        if (account?.photoUrl && headerLogoPfp.src !== account.photoUrl) headerLogoPfp.src = account.photoUrl;
      }
    }
    function getPfpAccount(name) { return PFP_ACCOUNTS.get(String(name || '').trim().toLowerCase()) || null; }
    function showAuthWaiting(account, message='Your account is waiting to be checked by the administrator.') {
      const overlay=document.getElementById('onboarding-overlay'); if(!overlay)return;
      const title=document.getElementById('auth-title'), desc=document.getElementById('auth-description');
      document.getElementById('auth-choice-actions')?.classList.add('hidden');
      document.getElementById('auth-login-area')?.classList.add('hidden');
      document.getElementById('auth-waiting-area')?.classList.remove('hidden');
      const denied=String(account?.status||'').trim().toLowerCase()==='denied';
      if(title) title.textContent=String(account?.name||selectedAuthName||'Username');
      if(desc) desc.textContent='';
      const process=document.getElementById('auth-selected-process');if(process){process.textContent='Requesting For Account';process.classList.remove('hidden');}
      const wait=document.getElementById('auth-waiting-message');
      const reason=String(account?.description||account?.Description||'').trim();
      if(wait) wait.textContent=denied?(reason||'Your account was denied by the administrator. No Description was provided.'):message;
      const avatar=document.getElementById('auth-avatar');if(avatar){avatar.classList.toggle('auth-avatar-denied',denied);avatar.classList.add('auth-avatar-missing');}
      const del=document.getElementById('delete-account-prompt');if(del)del.classList.add('hidden');
      overlay.classList.remove('hidden','opacity-0'); lockScroll();
    }
    function openDeleteAccountPrompt(){const el=document.getElementById('delete-account-prompt');if(el){el.classList.remove('hidden');el.classList.add('flex');}}
    function closeDeleteAccountPrompt(){const el=document.getElementById('delete-account-prompt');if(el){el.classList.add('hidden');el.classList.remove('flex');}}
    function simulateDeleteAccount(){
      closeDeleteAccountPrompt();
      const wait=document.getElementById('auth-waiting-area');
      if(wait)wait.innerHTML='<div class="py-6"><div class="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-stone-200 border-t-stone-700 animate-spin"></div><p class="font-semibold">Returning to accounts…</p></div>';
      setTimeout(()=>{if(wait)wait.innerHTML=`<i class="fa-solid fa-hourglass-half text-3xl text-amber-600 mb-3"></i><p id="auth-waiting-message" class="text-sm text-scrapbook-ink/80">Please wait for the administrator to review your account.</p><div class="flex flex-wrap gap-2 justify-center mt-4"><button onclick="chooseAuthMode('choice')" class="px-5 py-2 rounded-full border border-scrapbook-accent/30 font-semibold">Back</button><button onclick="enterAsDump()" class="px-5 py-2 rounded-full bg-scrapbook-ink text-white font-semibold">Enter As Dummy</button></div><button type="button" onclick="openDeleteAccountPrompt()" class="mt-4 block mx-auto text-sm text-red-600 underline">Do you want to delete this account?</button>`;chooseAuthMode('choice');},800);
    }
    window.openDeleteAccountPrompt=openDeleteAccountPrompt;window.closeDeleteAccountPrompt=closeDeleteAccountPrompt;window.simulateDeleteAccount=simulateDeleteAccount;
    function refreshProfileAvatarDots() {
      if (!PFP_ACCOUNTS.size) return;
      document.querySelectorAll('img').forEach(img => {
        const altName = String(img.alt || '').trim();
        let account = getPfpAccount(altName);
        if (!account) {
          const src = img.currentSrc || img.src || '';
          account = Array.from(PFP_ACCOUNTS.values()).find(a => src.includes(a.photoUrl) || a.photoUrl === src) || null;
        }
        if (!account || !img.parentElement) return;
        const host = img.parentElement;
        if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
        let dot = host.querySelector(':scope > .profile-status-dot');
        if (!dot) { dot = document.createElement('span'); dot.className = 'profile-status-dot'; host.appendChild(dot); }
        const online = String(account.status || '').toLowerCase() === 'online';
        dot.style.cssText = `position:absolute;right:0;bottom:0;width:10px;height:10px;border-radius:50%;border:2px solid white;background:${online ? '#22c55e' : '#ef4444'};z-index:5;pointer-events:none`;
        dot.title = online ? 'Online' : 'Offline';
      });
    }
    function enforceCurrentAccountStatus() {
      const savedName = currentUser || safeStorage.getItem('scrapbook_user');
      if(!savedName)return;
      const account=getPfpAccount(savedName);
      // Do not silently discard a saved session just because the public list endpoint
      // temporarily failed to return the profile. Keep the gate visible until it can be verified.
      if(!account) {
        currentUser=null;
        safeStorage.removeItem('scrapbook_authenticated');
        showAuthWaiting({name:savedName,status:'Locked'},'We could not verify your profile yet. Please wait while your account is checked, then reload or go Back to try again.');
        return;
      }
      const status=String(account.status||'Locked').trim().toLowerCase();
      if(!['online','offline'].includes(status)) {
        currentUser=null; safeStorage.removeItem('scrapbook_user'); safeStorage.removeItem('scrapbook_authenticated');
        showAuthWaiting(account, status==='denied'?(account.description||'Your account was denied by the administrator.'):'Your account is locked or waiting for administrator approval.');
        return;
      }
      // A previously authenticated user whose status is now Online/Offline should
      // return straight to the app after refresh, rather than being sent to Login.
      currentUser=account.name;
      safeStorage.setItem('scrapbook_user', currentUser);
      safeStorage.setItem('scrapbook_authenticated','true');
      const overlay=document.getElementById('onboarding-overlay');
      overlay?.classList.add('opacity-0');
      setTimeout(()=>overlay?.classList.add('hidden'),250);
      unlockScroll();
      updateCurrentUserUI();
    }
    function setAuthSelectedHeader(name, account=null, detected=false) {
      const title=document.getElementById('auth-title'), desc=document.getElementById('auth-description'), avatar=document.getElementById('auth-avatar');
      const clean=String(name||'').trim();
      if(title) title.textContent=clean || (document.getElementById('auth-login-area')?.classList.contains('hidden') ? 'Welcome to Cyzy' : 'Login');
      if(desc) desc.textContent=clean ? (detected ? 'Logging In' : 'Requesting For Account') : 'Type your username and select the matching account.';
      if(avatar && clean){
        avatar.classList.toggle('auth-avatar-detected',!!detected);
        avatar.classList.toggle('auth-avatar-missing',!detected);
        avatar.innerHTML='';
        if(detected && account?.photoUrl){const img=document.createElement('img');img.src=account.photoUrl;img.alt=`${clean} profile`;avatar.appendChild(img);}
        else {avatar.textContent=Array.from(clean)[0]?.toUpperCase()||'?';avatar.style.setProperty('--avatar-hue',String(Array.from(clean).reduce((h,c)=>h+c.charCodeAt(0),0)%360));}
      } else if(avatar){avatar.classList.remove('auth-avatar-detected','auth-avatar-missing');avatar.innerHTML='<i class="fa-solid fa-book-open"></i>';avatar.style.removeProperty('--avatar-hue');}
      const label=document.querySelector('label[for="auth-name-search"]'), input=document.getElementById('auth-name-search');
      if(label)label.classList.toggle('hidden',!!clean); if(input)input.classList.toggle('hidden',!!clean);
      const check=document.getElementById('auth-account-check'); if(check)check.classList.add('hidden');
    }
    function chooseAuthMode(mode) {
      window.__authUsernameSelected = false;
      document.getElementById('auth-choice-actions')?.classList.toggle('hidden',mode!=='choice');
      document.getElementById('auth-login-area')?.classList.toggle('hidden',mode!=='login');
      document.getElementById('auth-waiting-area')?.classList.add('hidden');
      document.getElementById('auth-existing-account-area')?.classList.add('hidden');
      document.getElementById('auth-create-profile-area')?.classList.add('hidden');
      document.getElementById('auth-account-check')?.classList.add('hidden');
      document.getElementById('auth-search-back')?.classList.add('hidden');
      const title=document.getElementById('auth-title'), desc=document.getElementById('auth-description');
      const process=document.getElementById('auth-selected-process');if(process){process.textContent='';process.classList.add('hidden');}
      if(title)title.textContent=mode==='login'?'Login':'Welcome to Cyzy';
      if(desc)desc.textContent=mode==='login'?'Searching for user accounts…':'Log in to your existing account or create a new account.';
      setAuthSelectedHeader('',null,false);
      document.getElementById('auth-login-controls')?.classList.add('hidden');
      document.getElementById('auth-forgot-login')?.classList.add('hidden');
      const loginStepHeader=document.querySelector('.auth-login-step-header');loginStepHeader?.classList.remove('hidden');
      const usernameLabel=document.querySelector('label[for="auth-name-search"]');usernameLabel?.classList.remove('hidden');
      document.getElementById('auth-name-search')?.classList.remove('hidden');
      const loginHeaderTitle=document.getElementById('auth-login-step-title');if(loginHeaderTitle)loginHeaderTitle.textContent='Choose Existing Accounts';
      const loginHeaderAction=document.getElementById('auth-login-header-action');if(loginHeaderAction){loginHeaderAction.classList.add('hidden');loginHeaderAction.textContent='Log In';}
      if(mode==='login'){
        selectedAuthName='';const i=document.getElementById('auth-name-search');if(i){i.value='';i.classList.add('hidden');}
        const lab=document.querySelector('label[for="auth-name-search"]');lab?.classList.add('hidden');
        const grid=document.getElementById('onboarding-grid');if(grid){grid.classList.add('hidden');grid.innerHTML='';}
        const check=document.getElementById('auth-account-check');if(check){check.textContent='Searching for user accounts…';check.classList.remove('hidden');}
        const actions=document.getElementById('auth-login-area');actions?.classList.remove('hidden');
        document.getElementById('auth-existing-account-area')?.classList.add('hidden');document.getElementById('auth-create-profile-area')?.classList.add('hidden');
        document.getElementById('auth-login-submit')?.classList.add('hidden');document.getElementById('auth-forgot-login')?.classList.add('hidden');
        document.getElementById('auth-passcode').value='';document.getElementById('auth-passcode-boxes')?._clear?.();
        loadPfpAccounts().finally(()=>{if(!document.getElementById('auth-login-area')?.classList.contains('hidden')&&!selectedAuthName){if(check)check.classList.add('hidden');if(i){i.classList.remove('hidden');i.focus();}lab?.classList.remove('hidden');if(title)title.textContent='Choose Existing Accounts';if(desc)desc.textContent='Choose Existing Accounts';renderOnboardingSelectionGrid();const submit=document.getElementById('auth-login-submit');submit?.classList.add('hidden');document.getElementById('auth-login-controls')?.classList.add('hidden');}});
      }
    }
    function selectAuthUsername(name) {
      window.__authUsernameSelected = true;
      const popupSearch=document.getElementById('auth-popup-search');
      if(popupSearch) popupSearch.blur();
      selectedAuthName=String(name||'').trim();
      setAuthSelectedHeader(selectedAuthName,null,false);
      const process=document.getElementById('auth-selected-process');if(process){process.textContent='Searching for user accounts…';process.classList.remove('hidden');}
      const input=document.getElementById('auth-name-search'); if(input) input.value=selectedAuthName;
      const grid=document.getElementById('onboarding-grid'); if(grid)grid.classList.add('hidden');
      const check=document.getElementById('auth-account-check'); check?.classList.add('hidden');
      const loginHeaderTitle=document.getElementById('auth-login-step-title');if(loginHeaderTitle)loginHeaderTitle.textContent='Enter Passcode';
      const loginHeaderAction=document.getElementById('auth-login-header-action');if(loginHeaderAction){loginHeaderAction.classList.add('hidden');loginHeaderAction.textContent='Log In';}
      document.getElementById('auth-existing-account-area')?.classList.add('hidden');
      document.getElementById('auth-create-profile-area')?.classList.add('hidden');
      document.getElementById('auth-login-error')?.classList.add('hidden');
      document.getElementById('auth-create-error')?.classList.add('hidden');
      // Never offer an upload when Cloudinary lookup fails. Otherwise a temporary
      // list/API error could let the same user upload duplicate profile images.
      (async()=>{
        const fetched=await loadPfpAccounts();
        const account=getPfpAccount(selectedAuthName);
        if(!fetched && account){
          // A previous successful fetch already knows this account. Keep using it
          // instead of treating a temporary refresh failure as a missing profile.
          check?.classList.add('hidden');
        } else if(!fetched && !account){
          // If the public tag-list endpoint cannot provide a match, let the user
          // submit an account request as requested. Clearly label the uncertainty
          // so a transient Cloudinary outage is not mistaken for a confirmed miss.
          if(check)check.classList.add('hidden');
          const createArea=document.getElementById('auth-create-profile-area');
          document.querySelector('.auth-login-step-header')?.classList.add('hidden');
          document.querySelector('label[for="auth-name-search"]')?.classList.add('hidden');
          document.getElementById('auth-name-search')?.classList.add('hidden');
          document.getElementById('onboarding-grid')?.classList.add('hidden');
          createArea?.classList.remove('hidden');
          const process=document.getElementById('auth-selected-process');if(process){process.textContent='Edit Profile Picture';process.classList.remove('hidden');}
          const avatar=document.getElementById('auth-avatar');if(avatar){avatar.classList.remove('auth-avatar-detected','auth-avatar-denied');avatar.classList.add('auth-avatar-missing');avatar.innerHTML='<i class="fa-solid fa-book-open"></i>';}
          const title=document.getElementById('auth-title');if(title)title.textContent=selectedAuthName;
          const desc=document.getElementById('auth-description');if(desc)desc.textContent='';
          const fileInput=document.getElementById('auth-new-pfp');if(fileInput)fileInput.value='';
          const passInput=document.getElementById('auth-new-passcode');if(passInput)passInput.value='';
          document.getElementById('auth-new-passcode-boxes')?._clear?.();
          document.getElementById('auth-new-passcode-area')?.classList.add('hidden');
          
          const createError=document.getElementById('auth-create-error');
          if(createError){createError.textContent='';createError.classList.add('hidden');}
          const btn=document.getElementById('auth-login-submit');if(btn)btn.textContent='Request Account';
          return;
        }
        if(check)check.classList.add('hidden');
        setAuthSelectedHeader(selectedAuthName,account,!!account);
        if(account){
          // Gate accounts by Cloudinary Status immediately after detection.
          // Locked or missing Status must never remain on the passcode/login form;
          // Denied shows the administrator's Description on the waiting screen.
          const detectedStatus=String(account.status||'Locked').trim().toLowerCase();
          if(detectedStatus==='denied'){
            showAuthWaiting(account, account.description||'Your account was denied by the administrator.');
            return;
          }
          if(detectedStatus!=='online' && detectedStatus!=='offline'){
            showAuthWaiting({...account,status:account.status||'Locked'},'Your account is locked or waiting for administrator approval.');
            return;
          }
          document.getElementById('auth-existing-account-area')?.classList.remove('hidden');
          const selectedProcess=document.getElementById('auth-selected-process');if(selectedProcess)selectedProcess.classList.add('hidden');
          document.getElementById('auth-login-controls')?.classList.remove('hidden');
          const loginHeaderAction=document.getElementById('auth-login-header-action');if(loginHeaderAction){loginHeaderAction.textContent='Log In';loginHeaderAction.classList.remove('hidden');}
          const existingHeading=document.getElementById('auth-existing-passcode-heading');if(existingHeading)existingHeading.textContent='Enter Passcode';
          const forgotLogin=document.getElementById('auth-forgot-login');if(forgotLogin)forgotLogin.classList.remove('hidden');
          document.getElementById('auth-create-profile-area')?.classList.add('hidden');
          const fileInput=document.getElementById('auth-new-pfp');if(fileInput)fileInput.value='';
          const passInput=document.getElementById('auth-new-passcode');if(passInput)passInput.value='';
          document.getElementById('auth-new-passcode-boxes')?._clear?.();
          const loginPass=document.getElementById('auth-passcode');if(loginPass)loginPass.value='';
          document.getElementById('auth-passcode-boxes')?._clear?.();
          document.querySelector('#auth-passcode-boxes input')?.focus();
        } else {
          document.querySelector('.auth-login-step-header')?.classList.add('hidden');
          document.querySelector('label[for="auth-name-search"]')?.classList.add('hidden');
          document.getElementById('auth-name-search')?.classList.add('hidden');
          document.getElementById('onboarding-grid')?.classList.add('hidden');
          document.getElementById('auth-create-profile-area')?.classList.remove('hidden');
          document.getElementById('auth-login-controls')?.classList.add('hidden');
          const process=document.getElementById('auth-selected-process');if(process){process.textContent='Edit Profile Picture';process.classList.remove('hidden');}
          const avatar=document.getElementById('auth-avatar');if(avatar){avatar.classList.remove('auth-avatar-detected','auth-avatar-denied');avatar.classList.add('auth-avatar-missing');avatar.innerHTML='<i class="fa-solid fa-book-open"></i>';}
          const title=document.getElementById('auth-title');if(title)title.textContent=selectedAuthName;
          const desc=document.getElementById('auth-description');if(desc)desc.textContent='';
          const forgotLogin=document.getElementById('auth-forgot-login');if(forgotLogin)forgotLogin.classList.add('hidden');
          pfpShowPage('preview');
          const fileInput=document.getElementById('auth-new-pfp');if(fileInput)fileInput.value='';
          const passInput=document.getElementById('auth-new-passcode');if(passInput)passInput.value='';
          document.getElementById('auth-new-passcode-boxes')?._clear?.();
          
          document.getElementById('auth-new-passcode-area')?.classList.add('hidden');
        }
        const btn=document.getElementById('auth-login-submit');if(btn){btn.textContent=account?'Log In':'Request Account';if(!account)btn.style.display='none';}
      })();
    }
    function setupPasscodeBoxes(boxId, hiddenInputId) {
      const host=document.getElementById(boxId), hidden=document.getElementById(hiddenInputId);
      if(!host||!hidden||host.dataset.ready==='1')return;
      host.dataset.ready='1'; host.innerHTML='';
      const boxes=[];
      for(let i=0;i<4;i++){
        const box=document.createElement('input'); box.type='password'; box.inputMode='numeric'; box.maxLength=1; box.autocomplete='off';
        box.setAttribute('aria-label',`Passcode digit ${i+1}`); box.className='auth-code-box';
        box.addEventListener('input',()=>{box.value=box.value.replace(/\D/g,'').slice(-1);if(box.value&&boxes[i+1])boxes[i+1].focus();sync();});
        box.addEventListener('keydown',e=>{if(e.key==='Backspace'&&!box.value&&boxes[i-1])boxes[i-1].focus();if(e.key==='ArrowLeft'&&boxes[i-1])boxes[i-1].focus();if(e.key==='ArrowRight'&&boxes[i+1])boxes[i+1].focus();if(e.key==='Enter'){e.preventDefault();submitAccountLogin();}});
        box.addEventListener('paste',e=>{const text=(e.clipboardData||window.clipboardData).getData('text').replace(/\D/g,'').slice(0,4);if(text){e.preventDefault();text.split('').forEach((d,j)=>{if(boxes[j])boxes[j].value=d;});sync();boxes[Math.min(text.length,3)]?.focus();}});
        boxes.push(box);host.appendChild(box);
      }
      function sync(){hidden.value=boxes.map(b=>b.value).join('');}
      host._clear=()=>{boxes.forEach(b=>b.value='');sync();};
    }
    function setupAuthPasscodeUI(){setupPasscodeBoxes('auth-passcode-boxes','auth-passcode');setupPasscodeBoxes('auth-new-passcode-boxes','auth-new-passcode');}

    // Step-by-step profile creator (only used when the selected username has no profile).
    let pfpImageUrl='', pfpTransform={x:0,y:0,scale:1,rotation:0}, pfpUndoState=null, pfpSavedTransform=null, pfpPointers=new Map(), pfpGesture=null;
    function pfpShowPage(which){
      const createError=document.getElementById('auth-create-error');if(createError){createError.textContent='';createError.classList.add('hidden');}
      const loginError=document.getElementById('auth-login-error');if(loginError){loginError.textContent='';loginError.classList.add('hidden');}
      ['preview','editor','passcode','forgot'].forEach(k=>document.getElementById(`pfp-wizard-${k}-page`)?.classList.toggle('hidden',k!==which));
      const headerNext=document.getElementById('pfp-header-next');if(headerNext){headerNext.disabled=!(which==='preview'&&!!pfpImageUrl);headerNext.textContent=which==='preview'?'Next':(which==='passcode'?'Request':'Next');}
      const avatar=document.getElementById('auth-avatar');if(avatar){if(which==='passcode' && pfpImageUrl){avatar.innerHTML='';const aimg=document.createElement('img');aimg.src=pfpImageUrl;aimg.alt='Selected profile';avatar.appendChild(aimg);avatar.classList.add('auth-avatar-missing');}else if(which==='preview'||which==='editor'){avatar.innerHTML='<i class="fa-solid fa-book-open"></i>';avatar.classList.add('auth-avatar-missing');}}
      const submit=document.getElementById('auth-login-submit'); if(submit){submit.style.display='none';submit.textContent='Request Account';}
      if(which==='passcode'){const heading=document.getElementById('pfp-passcode-heading');if(heading)heading.textContent='Create Your Passcode';const process=document.getElementById('auth-selected-process');if(process){process.textContent='Creating Passcode';process.classList.remove('hidden');}const title=document.getElementById('auth-title');if(title)title.textContent=selectedAuthName||'Username';const desc=document.getElementById('auth-description');if(desc)desc.textContent='';document.querySelector('#auth-new-passcode-boxes input')?.focus();} else if(which==='preview'){const process=document.getElementById('auth-selected-process');if(process){process.textContent='Edit Profile Picture';process.classList.remove('hidden');}} else if(which==='forgot'){const process=document.getElementById('auth-selected-process');if(process){process.textContent='Account Recovery';process.classList.remove('hidden');}const title=document.getElementById('auth-title');if(title)title.textContent=selectedAuthName||'Username';const desc=document.getElementById('auth-description');if(desc)desc.textContent='';}
    }
    let authForgotReturnToLogin=false;
    function showAuthForgotPasscode(){
      if(window.__authForgotTransition)return;
      window.__authForgotTransition=true;
      const loginHeader=document.querySelector('.auth-login-step-header');
      authForgotReturnToLogin=!!document.getElementById('auth-existing-account-area')&&!document.getElementById('auth-existing-account-area').classList.contains('hidden');
      loginHeader?.classList.add('hidden');
      document.querySelector('label[for="auth-name-search"]')?.classList.add('hidden');
      document.getElementById('auth-name-search')?.classList.add('hidden');
      document.getElementById('onboarding-grid')?.classList.add('hidden');
      document.getElementById('auth-account-check')?.classList.add('hidden');
      document.getElementById('auth-existing-account-area')?.classList.add('hidden');
      document.getElementById('auth-login-controls')?.classList.add('hidden');
      document.getElementById('auth-login-header-action')?.classList.add('hidden');
      document.getElementById('auth-create-profile-area')?.classList.remove('hidden');
      pfpShowPage('forgot');
      requestAnimationFrame(()=>{window.__authForgotTransition=false;});
    }
    function backFromAuthForgotPasscode(){
      if(window.__authForgotTransition)return;
      window.__authForgotTransition=true;
      if(authForgotReturnToLogin){
        document.getElementById('auth-create-profile-area')?.classList.add('hidden');
        document.querySelector('.auth-login-step-header')?.classList.remove('hidden');
        document.querySelector('label[for="auth-name-search"]')?.classList.add('hidden');
        document.getElementById('auth-name-search')?.classList.add('hidden');
        document.getElementById('onboarding-grid')?.classList.add('hidden');
        document.getElementById('auth-existing-account-area')?.classList.remove('hidden');
        document.getElementById('auth-login-controls')?.classList.remove('hidden');
        document.getElementById('auth-forgot-login')?.classList.remove('hidden');
        document.getElementById('auth-login-header-action')?.classList.remove('hidden');
        authForgotReturnToLogin=false;
      }else{pfpShowPage('passcode');}
      requestAnimationFrame(()=>{window.__authForgotTransition=false;});
    }
    window.showAuthForgotPasscode=showAuthForgotPasscode;window.backFromAuthForgotPasscode=backFromAuthForgotPasscode;
    function pfpShowError(message){const e=document.getElementById('auth-create-error');if(e){e.textContent=message;e.classList.remove('hidden');}}
    function pfpUpdateTransform(){const img=document.getElementById('pfp-editor-image');if(img)img.style.transform=`translate(${pfpTransform.x}px,${pfpTransform.y}px) scale(${pfpTransform.scale}) rotate(${pfpTransform.rotation}deg)`;}
    function openPfpEditor(){const file=document.getElementById('auth-new-pfp')?.files?.[0];if(!file)return;pfpUndoState={...pfpTransform};const im=document.getElementById('pfp-editor-image');if(im)im.src=pfpImageUrl;pfpUpdateTransform();pfpShowPage('editor');}
    function pfpRotate(deg){pfpUndoState={...pfpTransform};pfpTransform.rotation=(pfpTransform.rotation+deg)%360;pfpUpdateTransform();}
    function pfpUndo(){if(pfpUndoState){pfpTransform={...pfpUndoState};pfpUndoState=null;pfpUpdateTransform();}}
    async function pfpSaveEdit(){
      pfpSavedTransform={...pfpTransform};
      const file=document.getElementById('auth-new-pfp')?.files?.[0];
      // Keep animated GIFs animated: do not rasterize them into a still canvas image.
      if(file && !/\.gif$/i.test(file.name) && !/image\/gif/i.test(file.type)){
        try{
          const image=document.getElementById('pfp-editor-image');
          const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
          const ctx=canvas.getContext('2d');const iw=image.naturalWidth,ih=image.naturalHeight;
          const base=Math.min(512/iw,512/ih),w=iw*base,h=ih*base;
          ctx.translate(256+pfpTransform.x*512/Math.max(1,document.getElementById('pfp-editor-stage').clientWidth),256+pfpTransform.y*512/Math.max(1,document.getElementById('pfp-editor-stage').clientWidth));
          ctx.rotate(pfpTransform.rotation*Math.PI/180);ctx.scale(pfpTransform.scale,pfpTransform.scale);ctx.drawImage(image,-w/2,-h/2,w,h);
          const blob=await new Promise(resolve=>canvas.toBlob(resolve,file.type||'image/png'));
          if(blob){const edited=new File([blob],file.name,{type:blob.type||file.type,lastModified:Date.now()});const dt=new DataTransfer();dt.items.add(edited);document.getElementById('auth-new-pfp').files=dt.files;pfpImageUrl=URL.createObjectURL(edited);}
        }catch(err){console.warn('Could not bake profile edit; keeping original image.',err);}
      }
      const img=document.getElementById('pfp-big-preview');if(img){img.src=pfpImageUrl;img.style.objectFit='cover';img.style.transform=(file && (/\.gif$/i.test(file.name)||/image\/gif/i.test(file.type)))?`translate(${pfpTransform.x/3}px,${pfpTransform.y/3}px) scale(${pfpTransform.scale}) rotate(${pfpTransform.rotation}deg)`:'none';}
      
      pfpShowPage('preview');
    }
    function pfpWizardNext(){if(!document.getElementById('auth-new-pfp')?.files?.[0]){pfpShowError('Upload a profile photo first.');return;}pfpShowPage('passcode');}
    window.pfpShowPage=pfpShowPage;window.openPfpEditor=openPfpEditor;window.pfpRotate=pfpRotate;window.pfpUndo=pfpUndo;window.pfpSaveEdit=pfpSaveEdit;window.pfpWizardNext=pfpWizardNext;
    function setupPfpEditor(){const stage=document.getElementById('pfp-editor-stage');if(!stage||stage.dataset.ready)return;stage.dataset.ready='1';
      stage.addEventListener('wheel',e=>{e.preventDefault();pfpUndoState={...pfpTransform};pfpTransform.scale=Math.max(.25,Math.min(5,pfpTransform.scale*(e.deltaY<0?1.08:.92)));pfpUpdateTransform();},{passive:false});
      stage.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;stage.setPointerCapture(e.pointerId);pfpGesture={x:e.clientX,y:e.clientY,tx:pfpTransform.x,ty:pfpTransform.y};pfpUndoState={...pfpTransform};});
      stage.addEventListener('pointermove',e=>{if(!pfpGesture||e.pointerType==='touch')return;pfpTransform.x=pfpGesture.tx+e.clientX-pfpGesture.x;pfpTransform.y=pfpGesture.ty+e.clientY-pfpGesture.y;pfpUpdateTransform();});
      ['pointerup','pointercancel','lostpointercapture'].forEach(n=>stage.addEventListener(n,()=>pfpGesture=null));
      stage.addEventListener('touchstart',e=>{if(e.touches.length!==2)return;e.preventDefault();pfpUndoState={...pfpTransform};const a=e.touches[0],b=e.touches[1];pfpGesture={dist:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),angle:Math.atan2(b.clientY-a.clientY,b.clientX-a.clientX),cx:(a.clientX+b.clientX)/2,cy:(a.clientY+b.clientY)/2,base:{...pfpTransform}};},{passive:false});
      stage.addEventListener('touchmove',e=>{if(e.touches.length!==2||!pfpGesture)return;e.preventDefault();const a=e.touches[0],b=e.touches[1],dist=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),angle=Math.atan2(b.clientY-a.clientY,b.clientX-a.clientX),cx=(a.clientX+b.clientX)/2,cy=(a.clientY+b.clientY)/2;pfpTransform.x=pfpGesture.base.x+cx-pfpGesture.cx;pfpTransform.y=pfpGesture.base.y+cy-pfpGesture.cy;pfpTransform.scale=Math.max(.25,Math.min(5,pfpGesture.base.scale*dist/(pfpGesture.dist||dist)));pfpTransform.rotation=pfpGesture.base.rotation+(angle-pfpGesture.angle)*180/Math.PI;pfpUpdateTransform();},{passive:false});
      stage.addEventListener('touchend',e=>{if(e.touches.length<2)pfpGesture=null;},{passive:true});
    }

    function authProfileFileChanged(){
      const file=document.getElementById('auth-new-pfp')?.files?.[0];
      if(!file){const headerNext=document.getElementById('pfp-header-next');if(headerNext)headerNext.disabled=true;const passInput=document.getElementById('auth-new-passcode');if(passInput)passInput.value='';document.getElementById('auth-new-passcode-boxes')?._clear?.();return;}
      if(pfpImageUrl)URL.revokeObjectURL(pfpImageUrl);pfpImageUrl=URL.createObjectURL(file);
      ['pfp-big-preview','pfp-editor-image'].forEach(id=>{const im=document.getElementById(id);if(im)im.src=pfpImageUrl;});
      document.getElementById('pfp-edit-open')?.classList.remove('hidden');const next=document.getElementById('pfp-next');if(next)next.disabled=false;const headerNext=document.getElementById('pfp-header-next');if(headerNext)headerNext.disabled=false;
      const avatar=document.getElementById('auth-avatar');if(avatar){avatar.classList.add('auth-avatar-missing');avatar.classList.remove('auth-avatar-detected');avatar.innerHTML='<i class="fa-solid fa-book-open"></i>'; }
      pfpTransform={x:0,y:0,scale:1,rotation:0};pfpSavedTransform=null;pfpShowPage('preview');
      document.getElementById('auth-create-error')?.classList.add('hidden');
    }
    window.authProfileFileChanged=authProfileFileChanged;

    function validNewPasscode(pass) {
      if(!/^\d{4}$/.test(pass))return false;
      if(/^([0-9])\1{3}$/.test(pass))return false;
      const digits=pass.split('').map(Number);
      const asc=digits.every((d,i)=>i===0||d===digits[i-1]+1);
      const desc=digits.every((d,i)=>i===0||d===digits[i-1]-1);
      return !asc&&!desc;
    }
    async function setCloudinaryAccountStatus(account, status) {
      if (!account?.publicId) return false;
      try { const response = await fetch('/.netlify/functions/update-profile-status', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ publicId:account.publicId, status }) }); return response.ok; } catch (e) { console.warn('Could not update account status:', e); return false; }
    }
    function showReturningUserLoading(accountName, photoUrl) {
      document.getElementById('cyzy-returning-loading')?.remove();
      const overlay=document.createElement('div');
      overlay.id='cyzy-returning-loading';
      overlay.setAttribute('aria-label','Loading your photos');
      overlay.style.cssText='position:fixed;inset:0;z-index:100001;display:flex;align-items:center;justify-content:center;background:#FAF6EE;background-image:radial-gradient(#E0D4C3 1px,transparent 1px);background-size:24px 24px;';
      const avatar=document.createElement('img');
      avatar.alt='';
      avatar.src=photoUrl||`https://placehold.co/150x150/FAF6EE/2C2520?text=${encodeURIComponent((accountName||'?')[0])}`;
      avatar.style.cssText='width:104px;height:104px;object-fit:cover;border-radius:50%;border:4px solid white;box-shadow:0 10px 35px #2c252022;animation:cyzy-returning-breathe 1.8s ease-in-out infinite alternate;';
      overlay.appendChild(avatar);document.body.appendChild(overlay);
      if(!document.getElementById('cyzy-returning-loading-style')){
        const style=document.createElement('style');style.id='cyzy-returning-loading-style';
        style.textContent='@keyframes cyzy-returning-breathe{from{transform:scale(.96);box-shadow:0 8px 28px #2c252018}to{transform:scale(1.04);box-shadow:0 12px 36px #2c252030}}';document.head.appendChild(style);
      }
      return overlay;
    }

    async function playWelcomeIntro(accountName, photoUrl) {
      const onboarding = document.getElementById('onboarding-overlay');
      const header = document.getElementById('header-logo-container');
      if (onboarding) { onboarding.classList.add('opacity-0'); onboarding.classList.add('hidden'); }
      const old = document.getElementById('cyzy-welcome-intro'); old?.remove();
      const intro = document.createElement('div');
      intro.id = 'cyzy-welcome-intro';
      intro.setAttribute('aria-live', 'polite');
      intro.style.cssText = 'position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:#FAF6EE;background-image:radial-gradient(#E0D4C3 1px,transparent 1px);background-size:24px 24px;opacity:1;transition:opacity .7s ease;overflow:hidden;';
      const stack = document.createElement('div');
      stack.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:22px;';
      const avatar = document.createElement('img');
      avatar.alt = '';
      avatar.src = photoUrl || `https://placehold.co/150x150/FAF6EE/2C2520?text=${encodeURIComponent((accountName||'?')[0])}`;
      avatar.style.cssText = 'width:104px;height:104px;object-fit:cover;border-radius:50%;border:4px solid white;box-shadow:0 10px 35px #2c252022;opacity:0;transform:scale(.72);transition:transform .75s cubic-bezier(.2,.8,.2,1),opacity .55s ease,width .75s,height .75s;';
      const welcome = document.createElement('div');
      welcome.style.cssText = 'max-width:90vw;text-align:center;font:700 clamp(22px,4vw,34px)/1.25 system-ui,sans-serif;color:#2C2520;letter-spacing:-.02em;';
      const message = `Welcome Back ${accountName}`;
      const chars = [...message];
      const spans = chars.map(ch => { const span=document.createElement('span'); span.textContent=ch===' '?'\u00a0':ch; span.style.cssText='display:inline-block;opacity:0;filter:blur(4px);transform:translateY(8px);transition:opacity .45s ease,filter .45s ease,transform .45s ease;'; welcome.appendChild(span); return span; });
      stack.append(avatar,welcome); intro.appendChild(stack); document.body.appendChild(intro);
      requestAnimationFrame(()=>{avatar.style.opacity='1';avatar.style.transform='scale(1)';});
      await new Promise(r=>setTimeout(r,650));
      // Reveal characters in a randomized order, rather than typing sequentially.
      const order=spans.map((_,i)=>i).sort(()=>Math.random()-.5);
      order.forEach((idx,n)=>setTimeout(()=>{spans[idx].style.opacity='1';spans[idx].style.filter='blur(0)';spans[idx].style.transform='translateY(0)';},Math.random()*520+n*5));
      await new Promise(r=>setTimeout(r,1500));
      if (header) {
        const target=header.getBoundingClientRect();
        const start=avatar.getBoundingClientRect();
        const dx=target.left+target.width/2-(start.left+start.width/2);
        const dy=target.top+target.height/2-(start.top+start.height/2);
        avatar.style.transition='transform .8s cubic-bezier(.22,.75,.25,1),width .8s,height .8s,border-width .8s,box-shadow .8s';
        avatar.style.width=`${Math.max(20,target.width)}px`; avatar.style.height=`${Math.max(20,target.height)}px`;
        avatar.style.borderWidth='2px'; avatar.style.boxShadow='none'; avatar.style.transform=`translate(${dx}px,${dy}px) scale(1)`;
        welcome.style.transition='opacity .45s ease'; welcome.style.opacity='0';
        await new Promise(r=>setTimeout(r,820));
      } else { await new Promise(r=>setTimeout(r,350)); }
      intro.style.opacity='0';
      await new Promise(r=>setTimeout(r,720));
      intro.remove();
    }

    async function submitAccountLogin() {
      const name=selectedAuthName||String(document.getElementById('auth-name-search')?.value||'').trim();
      const error=document.getElementById('auth-login-error'), account=getPfpAccount(name);
      if(!name){if(error){error.textContent='Type and select a username first.';error.classList.remove('hidden');}return;}
      if(!account){
        const file=document.getElementById('auth-new-pfp')?.files?.[0];
        const pass=String(document.getElementById('auth-new-passcode')?.value||'');
        const createError=document.getElementById('auth-create-error');
        const fail=msg=>{if(createError){createError.textContent=msg;createError.classList.remove('hidden');}};
        if(!file){fail('Choose a profile photo first.');return;}
        if(!validNewPasscode(pass)){fail('Use 4 digits. Avoid repeated digits and ascending or descending sequences.');return;}
        if(!PFP_UPLOAD_PRESET.trim()){fail('Cloudinary upload preset is not configured.');return;}
        const submit=document.getElementById('auth-login-submit');if(submit){submit.disabled=true;submit.textContent='Uploading…';}
        try{
          const form=new FormData();form.append('file',file);form.append('upload_preset',PFP_UPLOAD_PRESET);form.append('tags','pfps');form.append('context',`Name=${name}|Status=Locked|Passcode=${pass}`);
          const response=await fetch(`https://api.cloudinary.com/v1_1/${PFP_CLOUD_NAME}/image/upload`,{method:'POST',body:form});
          const result=await response.json();if(!response.ok)throw new Error(result?.error?.message||'Cloudinary upload failed.');
          await loadPfpAccounts();
          // Clear the request form so Back/Login cannot accidentally resubmit the same photo.
          const fileInput=document.getElementById('auth-new-pfp');if(fileInput)fileInput.value='';
          const passInput=document.getElementById('auth-new-passcode');if(passInput)passInput.value='';
          document.getElementById('auth-new-passcode-boxes')?._clear?.();
          
          document.getElementById('auth-new-passcode-area')?.classList.add('hidden');
          selectedAuthName=name;
          showAuthWaiting({name,status:'Locked'},'Your account request was submitted. Please wait for the administrator to review it.');
        }catch(e){fail(`Could not upload the profile photo: ${e.message}`);}finally{if(submit){submit.disabled=false;submit.textContent='Request Account';}}
        return;
      }
      const pass=String(document.getElementById('auth-passcode')?.value||'');
      if(!/^\d{4}$/.test(pass)||!account.passcode||pass!==account.passcode){if(error){error.textContent='Incorrect 4-digit passcode.';error.classList.remove('hidden');}return;}
      const status=String(account.status||'Locked').trim().toLowerCase();
      if(!['online','offline'].includes(status)){showAuthWaiting(account, status==='denied'?(account.description||'Your account was denied by the administrator.'):'Your account is locked or waiting for administrator approval.');return;}
      isDumpMode=false;document.body.classList.remove('dump-mode');currentUser=account.name; safeStorage.setItem('scrapbook_authenticated','true');safeStorage.setItem('scrapbook_user',currentUser);
      if(status==='offline') { const updated=await setCloudinaryAccountStatus(account,'Online'); if(updated){account.status='Online'; PFP_ACCOUNTS.set(account.name.toLowerCase(),account);} }
      unlockScroll();
      updateCurrentUserUI();updateNotificationsBadge();renderClassmatesSection();updateHeaderUI();
      await playWelcomeIntro(currentUser, account.photoUrl || CLASSMATE_PROFILES[currentUser]);
      if(directMediaRoute)openDirectRouteAfterAuthentication();
    }
    function enterAsDump(){
      isDumpMode=true;currentUser=null;safeStorage.removeItem('scrapbook_authenticated');safeStorage.removeItem('scrapbook_user');document.body.classList.add('dump-mode');
      const overlay=document.getElementById('onboarding-overlay');overlay?.classList.add('opacity-0');setTimeout(()=>overlay?.classList.add('hidden'),250);unlockScroll();updateCurrentUserUI();
      document.querySelectorAll('#viewer-fav-btn,.favorite-btn,[data-action="favorite"],#comment-form,#nfilm-comments-modal form').forEach(el=>el.classList.add('dump-hidden'));
      document.querySelectorAll('#classmate-initial-grid,#classmates-modal-grid').forEach(el=>el.innerHTML='');
      const section=document.getElementById('classmate-initial-grid')?.closest('section');if(section)section.classList.add('dump-hidden');
      if(directMediaRoute)openDirectRouteAfterAuthentication();
    }
    window.selectAuthUsername=selectAuthUsername;window.enterAsDump=enterAsDump;
    function showCreateAccountNotice(){const title=document.getElementById('auth-title'),desc=document.getElementById('auth-description');if(title)title.textContent='Create New Account';if(desc)desc.textContent='Account creation has not been changed yet. Please use Login if you already have an account.';}
    window.chooseAuthMode=chooseAuthMode;window.submitAccountLogin=submitAccountLogin;window.showCreateAccountNotice=showCreateAccountNotice;

    async function loadMediaFromCloudinary() {
      await loadPfpAccounts();
      const badge = document.getElementById('cloudinary-status-badge');
      let liveResources = [];
      let memoriesFetched = 0;
      let nfilmFetched = 0;

      // IMPORTANT: these are two independent archives. Do not use the user's
      // saved/custom cloud name for the live archives.
      const fetchList = async (cloudName, mediaType, tag) => {
        const url = `https://res.cloudinary.com/${cloudName}/${mediaType}/list/${tag}.json?cb=${Date.now()}`;
        try {
          const response = await fetchWithTimeout(url, { timeout: 8000, cache: 'no-store' });
          if (!response.ok) {
            console.warn(`Cloudinary ${cloudName} ${mediaType}/${tag} returned HTTP ${response.status}`);
            return [];
          }
          const data = await response.json();
          if (!data || !Array.isArray(data.resources)) return [];
          return data.resources.map(res => parseCloudinaryResource(res, mediaType === 'video', tag, cloudName));
        } catch (err) {
          console.warn(`Cloudinary ${cloudName} ${mediaType}/${tag} list failed`, err);
          return [];
        }
      };

      // Memories: ONLY the original Cloudinary cloud + memories tag.
      for (const mediaType of ['image', 'video']) {
        const resources = await fetchList(CLOUD_NAME, mediaType, 'memories');
        if (resources.length) {
          liveResources.push(...resources);
          memoriesFetched += resources.length;
        }
      }

      // N Film: separate Cloudinary cloud only. Every asset in mxfiiht0 tagged "film"
      // is discovered independently for both images and videos. The discovery tag is
      // preserved so the asset remains an N Film item even when Cloudinary's list JSON
      // omits the tags array.
      const nfilmResources = await Promise.all(
        ['image', 'video'].map(mediaType => fetchList(NFILM_CLOUD_NAME, mediaType, 'studio'))
      );
      for (const resources of nfilmResources) {
        if (resources.length) {
          liveResources.push(...resources);
          nfilmFetched += resources.length;
        }
      }

      // De-duplicate resources by cloud + type + public ID.
      const deduped = new Map();
      for (const item of liveResources) {
        const key = `${item.sourceCloudName}|${item.type}|${item.cloudinaryPublicId || item.filename}`;
        if (!deduped.has(key)) deduped.set(key, item);
        else {
          const existing = deduped.get(key);
          existing.discoveryTags = Array.from(new Set([...(existing.discoveryTags || []), ...(item.discoveryTags || [])]));
          existing.cloudinaryTags = Array.from(new Set([...(existing.cloudinaryTags || []), ...(item.cloudinaryTags || [])]));
          existing.cloudinaryContext = { ...(existing.cloudinaryContext || {}), ...(item.cloudinaryContext || {}) };
        }
      }
      liveResources = Array.from(deduped.values());

      let activeSource;
      const hasAnyLive = liveResources.length > 0;
      if (hasAnyLive) {
        // Keep the special Drive catalog item available alongside live media.
        activeSource = [...liveResources, ...fallbackCloudinaryMedia.filter(f => f.isEmbed)];
        if (badge) {
          badge.classList.remove('text-scrapbook-ink', 'text-amber-600');
          badge.classList.add('text-green-600');
          badge.title = `Live Cloudinary: ${memoriesFetched} Memories + ${nfilmFetched} N Film assets.`;
        }
      } else {
        activeSource = [...fallbackCloudinaryMedia];
        if (badge) {
          badge.classList.remove('text-green-600', 'text-scrapbook-ink');
          badge.classList.add('text-amber-600');
          badge.title = 'Cloudinary lists could not be fetched. Check List Delivery Type / security settings for both clouds.';
        }
      }

      if (customMediaList.length > 0) activeSource = [...customMediaList, ...activeSource];

      memories = activeSource.map(item => processMemoryItem(item));

      resolveClassmateProfiles();
      renderClassmatesSection();
      populateSearchClassmatesGrid();
      updateDashboardStats();
      updateAlbumCounters();
      renderNFilmHomeCover();
      const nfilmHomeCount = document.getElementById('nfilm-home-count');
      if (nfilmHomeCount) nfilmHomeCount.textContent = `# ${getNFilmItems().length} Films`;
      updateNotificationsBadge();

      await initIndexedDB();
      await refreshLocalCachingMappings();
      updateHeaderUI();

      if (!handleDirectMediaRoute()) handleAppPathRoute();
      const initialTabEl = document.querySelector('#bottom-tab-bar button:first-of-type');
      renderContextTabs();
    }

    function normalizeCloudinaryContext(ctx) {
      if (!ctx) return {};
      if (typeof ctx === 'string') {
        return Object.fromEntries(ctx.split('|').map(pair => {
          const i = pair.indexOf('=');
          return i > -1 ? [pair.slice(0,i).trim(), pair.slice(i+1).trim()] : [pair.trim(), ''];
        }).filter(([k]) => k));
      }
      if (Array.isArray(ctx)) {
        return Object.fromEntries(ctx.map(item => [String(item?.key ?? item?.name ?? '').trim(), item?.value ?? item?.val ?? '']).filter(([k]) => k));
      }
      if (typeof ctx !== 'object') return {};
      // Cloudinary context is commonly {custom:{Name:"Jemar"}}. Some
      // endpoints wrap it again or expose the custom pairs directly.
      let out = { ...ctx };
      for (const key of ['custom','context','contextual_metadata','metadata']) {
        const nested = ctx[key];
        if (nested && nested !== ctx && typeof nested === 'object') out = { ...out, ...normalizeCloudinaryContext(nested) };
      }
      return out;
    }
    function getCloudinaryContextValue(item, key) {
      const ctx = normalizeCloudinaryContext(item?.cloudinaryContext);
      const wanted = String(key).toLowerCase();
      for (const [k,v] of Object.entries(ctx)) {
        if (String(k).toLowerCase() === wanted && v !== undefined && v !== null) return String(v);
      }
      return '';
    }
    function getCloudinaryTags(item) {
      const raw = [];
      const add = value => {
        if (Array.isArray(value)) raw.push(...value);
        else if (typeof value === 'string') raw.push(...value.split(',').map(s => s.trim()).filter(Boolean));
      };
      add(item?.cloudinaryTags);
      add(item?.discoveryTags);
      add(item?.tags);
      return Array.from(new Set(raw.map(String).map(s => s.trim()).filter(Boolean)));
    }
    function hasTag(item, wantedTag) {
      const wanted = String(wantedTag).trim().toLowerCase();
      return getCloudinaryTags(item).some(t => String(t).trim().toLowerCase() === wanted);
    }
    // N Film is an independent category. The second Cloudinary cloud uses the "studio" tag.
    // `aspect=cover` marks cover media; `aspect=list` (or no aspect at all) is normal album media.
    function hasNFilmTag(item) { return isNFilmItem(item); }
    function hasMemoriesTag(item) { return hasTag(item, 'memories'); }
    function isNFilmItem(item) {
      if (!item) return false;
      const sameCloud = String(item.sourceCloudName || '').toLowerCase() === NFILM_CLOUD_NAME.toLowerCase();
      if (!sameCloud) return false;
      const tags = getCloudinaryTags(item).map(t => String(t).trim().toLowerCase());
      const discoveredAsStudio = (item.discoveryTags || []).some(t => String(t).trim().toLowerCase() === 'studio');
      return tags.includes('studio') || discoveredAsStudio;
    }
    function isRegularMemoryItem(item) {
      return !!item && String(item.sourceCloudName || '').toLowerCase() === CLOUD_NAME.toLowerCase() && hasMemoriesTag(item);
    }
    function getNFilmTitle(item) { return getCloudinaryContextValue(item, 'title') || 'N Film'; }
    function getNFilmUploader(item) { return getCloudinaryContextValue(item, 'uploader') || getCloudinaryContextValue(item, 'Uploader') || ''; }
    function getNFilmDescription(item) { return getCloudinaryContextValue(item, 'description') || 'No description was provided for this film.'; }
    function getNFilmAspects(item) {
      const raw = getCloudinaryContextValue(item, 'aspect').trim().toLowerCase();
      if (!raw) return [];
      return raw.split(/[,|;\s]+/).map(v => v.trim()).filter(Boolean);
    }
    function hasNFilmAspect(item, value) { return getNFilmAspects(item).includes(String(value).trim().toLowerCase()); }
    function getNFilmAspect(item) { return getNFilmAspects(item).join(','); }
    function getNFilmDate(item) {
      const ctxDate = getCloudinaryContextValue(item, 'date').trim();
      if (ctxDate) return ctxDate;
      return item.date || item.createdAt || '';
    }
    function getNFilmClassmates(item) {
      const ctx = getCloudinaryContextValue(item, 'classmates').trim();
      if (ctx) return ctx.split(',').map(x => x.trim()).filter(Boolean);
      return Array.isArray(item.owners) ? item.owners : [];
    }
    function getNFilmEmbedUrl(item) {
      if (!item || !isNFilmItem(item)) return '';
      const value = getCloudinaryContextValue(item, 'embed').trim();
      return /^https?:\/\//i.test(value) ? value : (item.isEmbed && /^https?:\/\//i.test(String(item.embedUrl || '').trim()) ? String(item.embedUrl).trim() : '');
    }
    function isNFilmEmbed(item) {
      return !!getNFilmEmbedUrl(item);
    }
    function isNFilmCover(item) {
      return isNFilmItem(item) && !isNFilmEmbed(item) && hasNFilmAspect(item, 'cover');
    }
    function isNFilmListItem(item) {
      return isNFilmItem(item) && (!getNFilmAspects(item).length || hasNFilmAspect(item, 'list'));
    }
    function isNFilmThumbnail(item) {
      return isNFilmItem(item) && !isNFilmEmbed(item) && hasNFilmAspect(item, 'thumbnail');
    }
    function getNFilmItems() {
      return memories.filter(isNFilmListItem).sort((a,b) => new Date(getNFilmDate(b)) - new Date(getNFilmDate(a)));
    }
    function getNFilmAllItems() {
      return memories.filter(isNFilmItem).sort((a,b) => new Date(getNFilmDate(b)) - new Date(getNFilmDate(a)));
    }
    function getNFilmCoverItems() {
      // Cover media is independent from the list/card classification. A cover-only
      // asset (aspect=cover) must still be eligible for the N Film cover.
      return memories.filter(isNFilmCover).sort((a,b) => new Date(getNFilmDate(b)) - new Date(getNFilmDate(a)));
    }
    function getNFilmCover() { return getNFilmCoverItems()[0] || null; }
    // Cover-only playback rule. The custom `time` metadata is intentionally
    // ignored everywhere except aspect=cover media. `time=full` means the
    // entire video duration; `time=rule` (or missing) keeps the normal rule.
    function getNFilmCoverTimeMode(item) {
      if (!isNFilmCover(item)) return 'rule';
      const raw = getCloudinaryContextValue(item, 'time').trim().toLowerCase();
      return raw === 'full' ? 'full' : 'rule';
    }
    function getNFilmPlaybackSeconds(video, item) {
      const duration = Number(video?.duration || 0);
      if (!isFinite(duration) || duration <= 0) return 30;
      if (getNFilmCoverTimeMode(item) === 'full') return duration;
      if (duration <= 40) return Math.max(1, duration / 2);
      return 30;
    }
    function formatNFilmFullDate(item) {
      const raw = getNFilmDate(item);
      const d = new Date(raw);
      if (!isNaN(d.getTime())) return d.toLocaleDateString('en-US', {month:'long', day:'numeric', year:'numeric'});
      return raw || 'Date unavailable';
    }
    function renderNFilmHomeCover() {
      const host=document.getElementById('nfilm-home-cover'); if(!host) return;
      const thumb=memories.filter(isNFilmThumbnail).sort((a,b)=>new Date(getNFilmDate(b))-new Date(getNFilmDate(a)))[0] || null;
      if(!thumb){ host.innerHTML='<div class="w-full h-full flex items-center justify-center text-white/50 text-[10px] tracking-[0.25em] uppercase">N Film</div>'; return; }
      host.innerHTML = thumb.type === 'image'
        ? `<img src="${thumb.url}" class="nfilm-cover-video" alt="N Studio Album">`
        : `<video src="${thumb.url}" class="nfilm-cover-video" muted autoplay loop playsinline webkit-playsinline preload="metadata"></video>`;
      const v=host.querySelector('video'); if(v){ v.muted=true; v.volume=0; v.play().catch(()=>{}); }
    }
    function renderNFilmCasts(names) {
      const host=document.getElementById('nfilm-details-casts'); if(!host)return; host.innerHTML='';
      const list=(names||[]).filter(Boolean);
      if(!list.length){ host.innerHTML='<p class="text-sm text-scrapbook-ink/50 col-span-full">None listed</p>'; return; }
      list.forEach(name=>{ const safe=String(name).replace(/[<>]/g,''); const wrap=document.createElement('div'); wrap.className='flex flex-col items-center gap-2 text-center'; wrap.innerHTML=`<div class="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow bg-scrapbook-board/30"><img src="${CLASSMATE_PROFILES[safe]||`https://placehold.co/150x150/FAF6EE/2C2520?text=${safe.charAt(0)}`}" class="w-full h-full object-cover" alt="${safe}"></div><span class="text-xs font-semibold text-scrapbook-ink leading-tight">${safe}</span>`; host.appendChild(wrap); });
    }
    function hexToRgb(hex){ const m=String(hex).replace('#','').match(/.{2}/g); return m?m.map(x=>parseInt(x,16)):null; }
    function rgbToHex(r,g,b){ return '#'+[r,g,b].map(x=>Math.max(0,Math.min(255,Math.round(x))).toString(16).padStart(2,'0')).join(''); }
    function softenDominant(rgb){ const [r,g,b]=rgb; return [Math.round(r+(255-r)*.72),Math.round(g+(255-g)*.72),Math.round(b+(255-b)*.72)]; }
    function applyCardColor(card, rgb){ if(!rgb)return; const soft=softenDominant(rgb); card.style.background=rgbToHex(...soft); card.style.color=rgbToHex(...[Math.max(25,rgb[0]*.32),Math.max(25,rgb[1]*.32),Math.max(25,rgb[2]*.32)]); }
    function applyNFilmDominantColor(card,item){
      const sampleImage=(src)=>{ const img=new Image(); img.crossOrigin='anonymous'; img.onload=()=>{ try{ const c=document.createElement('canvas'); c.width=32;c.height=32; const x=c.getContext('2d',{willReadFrequently:true}); x.drawImage(img,0,0,32,32); const d=x.getImageData(0,0,32,32).data; let r=0,g=0,b=0,n=0; for(let i=0;i<d.length;i+=4){ if(d[i+3]<80)continue; r+=d[i];g+=d[i+1];b+=d[i+2];n++; } if(n)applyCardColor(card,[r/n,g/n,b/n]); }catch(e){} }; img.src=src; };
      if(item.type==='image') sampleImage(item.url); else { const v=card.querySelector('video'); if(!v)return; const sample=()=>{ try{ const c=document.createElement('canvas'); c.width=32;c.height=32; const x=c.getContext('2d',{willReadFrequently:true}); x.drawImage(v,0,0,32,32); const d=x.getImageData(0,0,32,32).data; let r=0,g=0,b=0,n=0; for(let i=0;i<d.length;i+=4){ if(d[i+3]<80)continue; r+=d[i];g+=d[i+1];b+=d[i+2];n++; } if(n)applyCardColor(card,[r/n,g/n,b/n]); }catch(e){} }; v.addEventListener('loadeddata',sample,{once:true}); v.addEventListener('canplay',sample,{once:true}); }
    }
    function openNFilmDetails(item) {
      if(!item) return;
      let modal=document.getElementById('nfilm-details-modal');
      if(!modal) return;

      // The details modal is also opened from N Film cards and the cover. Those elements
      // can live inside transformed/filtered containers, which can trap a fixed modal
      // underneath the album and leave only the blur visible. Move the modal to <body>
      // so it always gets its own top-level stacking context.
      if(modal.parentElement !== document.body) document.body.appendChild(modal);

      document.getElementById('nfilm-details-title').textContent=getNFilmTitle(item);
      document.getElementById('nfilm-details-description').textContent=getNFilmDescription(item);
      document.getElementById('nfilm-details-uploader').textContent=getNFilmUploader(item)||item.uploader||'Unknown';
      document.getElementById('nfilm-details-date').textContent=formatNFilmFullDate(item);
      renderNFilmCasts(getNFilmClassmates(item));

      document.documentElement.classList.add('nfilm-modal-open');
      document.body.classList.add('nfilm-modal-open');
      modal.style.display='flex';
      modal.style.visibility='visible';
      modal.style.opacity='1';
      modal.style.pointerEvents='auto';
      modal.style.zIndex='2147483646';
      modal.classList.remove('hidden','pointer-events-none','opacity-0','nfilm-popup-closing');
      const panel=modal.querySelector('.nfilm-details-panel');
      if(panel){
        panel.classList.remove('scale-95');
        panel.style.transform='';
        panel.style.opacity='';
      }
      void modal.offsetWidth;
      modal.classList.add('nfilm-popup-opening');
      setTimeout(()=>modal.classList.remove('nfilm-popup-opening'),240);
    }
    window.closeNFilmDetails=function(){
      const modal=document.getElementById('nfilm-details-modal');
      if(modal){
        modal.classList.remove('nfilm-popup-opening');
        modal.classList.add('nfilm-popup-closing','pointer-events-none','opacity-0');
        modal.style.pointerEvents='none';
        setTimeout(()=>{
          if(modal.classList.contains('nfilm-popup-closing')){
            modal.style.display='none';
            modal.style.visibility='hidden';
            modal.classList.remove('nfilm-popup-closing');
          }
        },220);
      }
      document.documentElement.classList.remove('nfilm-modal-open');
      document.body.classList.remove('nfilm-modal-open');
      if (activeNFilmPlayerItem) lockScroll();
    };

    // Pick a useful video frame instead of the common black opening frame. The video stays
    // paused on the chosen frame so the card behaves like a real thumbnail. If the browser
    // allows canvas access, very dark frames are rejected and another timestamp is tried.
    function setupNFilmVideoThumbnail(card) {
      const v=card?.querySelector('.nfilm-card-video');
      if(!v) return;
      v.muted=true; v.loop=false; v.autoplay=false; v.controls=false; v.preload='metadata';
      v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline','');
      try { v.crossOrigin='anonymous'; } catch(e) {}
      let candidates=[], attempt=0, decided=false;
      const makeCandidates=(duration)=>{
        const max=Math.max(.1, Number(duration)||1);
        const points=[.18,.28,.38,.48,.58,.68,.78,.88].filter(x=>x*max>0.05 && x*max<max-.05);
        for(let i=points.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [points[i],points[j]]=[points[j],points[i]]; }
        return points.map(x=>x*max);
      };
      const looksBlack=()=>{
        try {
          const c=document.createElement('canvas'); c.width=48; c.height=27;
          const ctx=c.getContext('2d',{willReadFrequently:true}); ctx.drawImage(v,0,0,c.width,c.height);
          const d=ctx.getImageData(0,0,c.width,c.height).data;
          let lum=0, bright=0, count=0;
          for(let i=0;i<d.length;i+=4){
            const l=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];
            lum+=l; if(l>42) bright++; count++;
          }
          const avg=lum/Math.max(1,count), brightRatio=bright/Math.max(1,count);
          return avg<24 || brightRatio<.07;
        } catch(e) { return false; }
      };
      const tryNext=()=>{
        if(decided || !candidates.length) return;
        if(attempt>=candidates.length){ decided=true; v.pause(); return; }
        v.currentTime=Math.min(candidates[attempt++], Math.max(.05,(v.duration||1)-.05));
      };
      v.addEventListener('loadedmetadata',()=>{ candidates=makeCandidates(v.duration); tryNext(); },{once:true});
      v.addEventListener('seeked',()=>{
        if(decided) return;
        if(!looksBlack() || attempt>=candidates.length){ decided=true; v.pause(); }
        else tryNext();
      });
      v.addEventListener('error',()=>{ decided=true; },{once:true});
      if(v.readyState>=1 && !candidates.length){ candidates=makeCandidates(v.duration); tryNext(); }
    }
    window.openNFilmAlbum=function(updateUrl=true){
      window.nFilmAlbumActive=true;
      if(updateUrl) history.pushState({page:'nfilm'},'', '/album/nfilm'); activeYearFilter=null; activeMonthFilter=null; closeSearchView(); document.body.classList.add('nfilm-theater-active'); document.documentElement.classList.add('nfilm-theater-active');
      document.getElementById('homepage-view')?.classList.add('hidden'); document.getElementById('year-album-workspace')?.classList.add('hidden');
      const root=document.getElementById('nfilm-album-workspace'); if(!root)return; root.classList.remove('hidden'); renderNFilmAlbum(); renderContextTabs(); updateHeaderUI();
    };
    window.closeNFilmAlbum=function(updateUrl=true){ window.nFilmAlbumActive=false; document.getElementById('nfilm-album-workspace')?.classList.add('hidden'); document.getElementById('homepage-view')?.classList.remove('hidden'); document.body.classList.remove('nfilm-theater-active'); document.documentElement.classList.remove('nfilm-theater-active'); if(updateUrl)history.pushState({page:'home'},'', '/home'); renderContextTabs(); updateHeaderUI(); };
    function renderNFilmAlbum(){
      const root=document.getElementById('nfilm-album-workspace'); if(!root)return;
      const items=getFilteredNFilmItems(), covers=getNFilmCoverItems();
      const titleEl=root.querySelector('#nfilm-cover-title'), dateEl=root.querySelector('#nfilm-cover-date'), host=root.querySelector('#nfilm-cover-media');
      const bgA=document.getElementById('nfilm-bg-layer-a'), bgB=document.getElementById('nfilm-bg-layer-b');
      if(titleEl)titleEl.textContent=''; if(dateEl)dateEl.textContent='';
      if(host){
        host.innerHTML='';
        if(covers.length){
          const stage=document.createElement('div'); stage.className='absolute inset-0'; host.appendChild(stage);
          let idx=0, timer=null, activeBg=bgA, spareBg=bgB, currentSlide=null;
          const clearLayer=(el)=>{ if(!el)return; el.classList.remove('active'); el.innerHTML=''; };
          const makeVisual=(item, cls='')=>{
            const el=item.type==='image'?document.createElement('img'):document.createElement('video');
            el.className=cls;
            el.src=item.url; el.muted=true; el.playsInline=true; el.setAttribute('playsinline',''); el.setAttribute('webkit-playsinline','');
            if(item.type==='video'){ el.autoplay=true; el.loop=true; el.controls=false; el.preload='auto'; }
            return el;
          };
          const swapBackground=(item)=>{
            if(!activeBg||!spareBg)return;
            clearLayer(spareBg);
            const bg=makeVisual(item);
            if(item.type==='video'){ bg.autoplay=true; bg.loop=true; bg.muted=true; bg.play().catch(()=>{}); }
            spareBg.appendChild(bg);
            requestAnimationFrame(()=>{
              activeBg.classList.remove('active'); spareBg.classList.add('active');
              const old=activeBg; activeBg=spareBg; spareBg=old;
              setTimeout(()=>{ if(old!==activeBg)clearLayer(old); },1300);
            });
          };
          const updateCopy=(item,animate=true)=>{
            const copy=root.querySelector('.nfilm-cover-copy');
            if(animate){ copy?.classList.add('nfilm-copy-fading'); setTimeout(()=>{
              if(dateEl)dateEl.textContent=formatNFilmFullDate(item);
              if(titleEl)titleEl.textContent=getNFilmTitle(item);
              copy?.classList.remove('nfilm-copy-fading');
            },520); } else { if(dateEl)dateEl.textContent=formatNFilmFullDate(item); if(titleEl)titleEl.textContent=getNFilmTitle(item); }
          };
          const showCover=(n,initial=false)=>{
            if(timer)clearTimeout(timer);
            idx=((n%covers.length)+covers.length)%covers.length;
            const item=covers[idx];
            const next=makeVisual(item,'w-full h-full object-cover');
            const slide=document.createElement('div');
            slide.className='nfilm-cover-slide';
            slide.appendChild(next);
            stage.appendChild(slide);

            // IMPORTANT: never fade the current cover out until the incoming cover
            // has actually loaded enough to paint. This prevents the hero from
            // becoming empty/transparent during a cover-to-cover transition.
            let revealed=false;
            const reveal=()=>{
              if(revealed) return;
              revealed=true;
              requestAnimationFrame(()=>{
                slide.classList.add('active');
                if(currentSlide){
                  const old=currentSlide;
                  old.classList.remove('active');
                  setTimeout(()=>old.remove(),1300);
                }
                currentSlide=slide;
                updateCopy(item,!initial);
                // Keep the existing background behavior exactly as-is.
                swapBackground(item);
              });
            };

            const advance=()=>{
              const mode=getNFilmCoverTimeMode(item);
              const secs=Math.max(1,getNFilmPlaybackSeconds(next,item));
              // Full-time covers are allowed to reach the end of their video.
              // Rule-mode covers retain the existing early crossfade behavior.
              const delayMs = mode === 'full'
                ? Math.max(800, secs * 1000)
                : Math.max(800, secs * 1000 - 1200);
              timer=setTimeout(()=>showCover(idx+1,false), delayMs);
            };

            if(item.type==='video'){
              next.muted=true;
              next.volume=0;
              next.preload='auto';
              let readyStarted=false;
              const ready=()=>{
                if(readyStarted) return;
                readyStarted=true;
                reveal();
                next.currentTime=0;
                next.play().catch(()=>{});
                advance();
              };
              next.addEventListener('loadeddata',ready,{once:true});
              next.addEventListener('canplay',ready,{once:true});
              next.addEventListener('error',()=>{
                // If an individual cover cannot load, retain the current cover
                // rather than exposing an empty hero.
                if(!currentSlide) reveal();
              },{once:true});
              if(next.readyState>=2) ready();
              else next.load();
            } else {
              next.addEventListener('load',()=>{ reveal(); advance(); },{once:true});
              if(next.complete) { reveal(); advance(); }
            }

            const d=root.querySelector('#nfilm-cover-details'); if(d)d.onclick=()=>openNFilmDetails(item);
            const w=root.querySelector('#nfilm-cover-watch'); if(w)w.onclick=()=>openNFilmPlayer(item);
          };
          showCover(0,true);
        } else {
          host.innerHTML='<div class="h-full flex items-center justify-center text-white/60 text-xs uppercase tracking-widest">No N Film cover found</div>';
          if(bgA)clearLayer?.(bgA); if(bgB)clearLayer?.(bgB);
        }
      }
      // Size the decorative atmosphere from the header edge through the hero and into a long fade.
      // It intentionally overlaps the start of the film list, but the final part is already #080808,
      // so there is no visible rectangular/cut boundary.
      requestAnimationFrame(()=>{
        const atmosphere=document.getElementById('nfilm-dynamic-atmosphere');
        const listSection=root.querySelector('section:not(.nfilm-cover-frame)');
        if(atmosphere && listSection){
          const fadeOverlap=150;
          atmosphere.style.height=Math.max(760, listSection.offsetTop + fadeOverlap)+'px';
        }
      });
      const grid=root.querySelector('#nfilm-video-grid'); if(!grid)return; grid.innerHTML='';
      items.forEach((item,idx)=>{
        const card=document.createElement('article'); card.className='nfilm-video-card p-3';
        const title=getNFilmTitle(item).replace(/[<>]/g,'');
        const uploader=getNFilmUploader(item)||item.uploader||'Unknown';
        const embedUrl=getNFilmEmbedUrl(item);
        const mediaHtml=embedUrl
          ? `<iframe src="${embedUrl}" title="${title}" class="w-full h-full object-cover nfilm-card-embed" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe><div class="absolute inset-0 bg-transparent cursor-pointer"></div>`
          : item.type==='image'
            ? `<img src="${item.url}" class="w-full h-full object-cover" alt="N Film">`
            : `<video src="${item.url}" class="w-full h-full object-cover nfilm-card-video" muted playsinline preload="metadata"></video>`;
        const actionLabel='Watch full';
        card.innerHTML=`<div class="relative z-10"><div class="aspect-video bg-[#171411] overflow-hidden mb-4 rounded-xl nfilm-card-media relative">${mediaHtml}</div><div class="px-1"><p class="text-[9px] uppercase tracking-[0.2em] text-scrapbook-accent font-bold">${formatNFilmFullDate(item)}</p><h3 class="font-serif text-xl font-bold mt-1 text-scrapbook-ink">${title}</h3><p class="text-xs text-scrapbook-ink/55 mt-1">${uploader}</p><div class="flex gap-2 mt-4"><button class="nfilm-details-btn flex-1 bg-white/80 border border-scrapbook-ink/20 px-3 py-2 text-xs font-bold rounded-full hover:bg-scrapbook-ink hover:text-white transition-colors">Show details</button><button class="nfilm-watch-btn flex-1 bg-scrapbook-ink text-white px-3 py-2 text-xs font-bold rounded-full hover:bg-scrapbook-accent transition-colors">${actionLabel}</button></div></div></div>`;
        card.querySelector('.nfilm-details-btn').onclick=()=>openNFilmDetails(item);
        card.querySelector('.nfilm-watch-btn').onclick=(e)=>{
          e.preventDefault(); e.stopPropagation();
          activeGalleryItems=[item];
          activeYearFilter=getShareYear(item);
          // Embed videos still use the dedicated N Film player shell, but the
          // media area itself is the external iframe, so there is no second
          // timeline/player layered over Google Drive or another embed player.
          openNFilmPlayer(item);
        };
        if(embedUrl){
          card.querySelector('.nfilm-card-media').onclick=(e)=>{
            e.preventDefault(); e.stopPropagation();
            activeGalleryItems=[item];
            activeYearFilter=getShareYear(item);
            openNFilmPlayer(item);
          };
        }
        grid.appendChild(card);
        if(item.type==='video') setupNFilmVideoThumbnail(card);
        applyNFilmDominantColor(card,item);
      });
    }

    window.setNFilmCategory=function(category){
      activeNFilmCategory=category;
      renderNFilmAlbum();
      renderContextTabs();
    };
    function getFilteredNFilmItems(){
      const all=getNFilmItems();
      if(activeNFilmCategory==='all')return all;
      return all.filter(item=>getNFilmCategory(item)===activeNFilmCategory);
    }

    function resolveClassmateProfiles() {
      CLASSMATE_NAMES.forEach(name => {
        CLASSMATE_PROFILES[name] = `https://placehold.co/150x150/FAF6EE/2C2520?text=${name[0]}`;
      });

      memories.forEach(item => {
        if (item.type === 'image' && !item.isPending && item.owners.length === 1) {
          const classmateName = item.owners[0];
          if (CLASSMATE_NAMES.includes(classmateName)) {
            CLASSMATE_PROFILES[classmateName] = get380pUrl(item.url);
          }
        }
      });
    }

    window.openYearAlbum = function(year, updateUrl = true) {
      document.getElementById('nfilm-album-workspace')?.classList.add('hidden');
      activeYearFilter = Number(year);
      activeMonthFilter = null;
      if (updateUrl) history.pushState({ page: 'album-year', year: Number(year) }, '', `/album/${year}`);
      closeSearchView();
      
      document.getElementById('homepage-view').classList.add('hidden');
      const workspace = document.getElementById('year-album-workspace');
      workspace.classList.remove('hidden');
      
      document.getElementById('year-workspace-title').textContent = `${year} Yearbook Binder`;
      document.getElementById('year-workspace-subtext').textContent = `Explore visual records and chronicles archived during ${year}.`;

      setCategoryFilter('all');
      renderGallery();
      renderContextTabs();
      updateHeaderUI();
    };

    window.openMonthAlbum = function(year, month, updateUrl = true) {
      const monthName = String(month).toLowerCase();
      document.getElementById('nfilm-album-workspace')?.classList.add('hidden');
      activeYearFilter = Number(year);
      activeMonthFilter = monthName;
      if (updateUrl) history.pushState({ page: 'album-month', year: Number(year), month: monthName }, '', `/album/${year}/${encodeURIComponent(monthName)}`);
      closeSearchView();
      document.getElementById('homepage-view').classList.add('hidden');
      const workspace = document.getElementById('year-album-workspace');
      workspace.classList.remove('hidden');
      document.getElementById('year-workspace-title').textContent = `${monthName.charAt(0).toUpperCase()+monthName.slice(1)} ${year}`;
      document.getElementById('year-workspace-subtext').textContent = `Explore memories archived during ${monthName} ${year}.`;
      setCategoryFilter('all');
      renderGallery();
      renderContextTabs();
      updateHeaderUI();
    };

    window.closeYearAlbum = function(updateUrl = true) {
      activeYearFilter = null;
      activeMonthFilter = null;
      document.getElementById('nfilm-album-workspace')?.classList.add('hidden');
      if (updateUrl) history.pushState({ page: 'home' }, '', '/home');
      document.getElementById('year-album-workspace').classList.add('hidden');
      document.getElementById('homepage-view').classList.remove('hidden');
      updateHeaderUI();
    };

    function updateAlbumCounters() {
      const counts = { 2024: 0, 2025: 0, 2026: 0 };
      
      memories.forEach(item => {
        if (item.isPending) return;
        // Year/month album counters represent the regular Memories collection.
        // N Film assets are intentionally kept out of these counts.
        if (!isRegularMemoryItem(item)) return;
        const targetYr = parseYearFromResource(item);
        if (counts[targetYr] !== undefined) counts[targetYr]++;
      });

      Object.keys(counts).forEach(yr => {
        const el = document.getElementById(`album-count-${yr}`);
        if (el) el.textContent = `${counts[yr]} Memories`;
      });
    }
  


    function get380pUrl(url) {
      if (!url) return '';
      if (url.includes('cloudinary.com')) {
        return url.replace('/upload/', '/upload/w_380,c_limit,q_auto,f_auto/');
      }
      return url;
    }

    function get720pUrl(url) {
      if (!url) return '';
      if (url.includes('cloudinary.com')) {
        return url.replace('/upload/', '/upload/w_1280,c_limit,q_auto,f_auto/');
      }
      return url;
    }

    function getDownloadUrl(url) {
      if (!url) return '#';
      if (url.includes('cloudinary.com')) {
        return url.replace('/upload/', '/upload/fl_attachment/');
      }
      return url;
    }

    function parseImageDateToDMY(dateStr) {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr || "10-07-2026";
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    // Refined stack key calculation to require similar base names to prevent false merges
    function getStackGroupingKey(item) {
      const baseName = (item.filename || "").substring(0, 10).toLowerCase();
      const rawDate = item.date || "Unknown Date";
      const uploaderStr = item.uploader || "Anonymous";
      const sortedOwners = [...(item.owners || [])].sort().join('-');
      return `${baseName}_${rawDate}_${uploaderStr}_${sortedOwners}`;
    }

    function renderGallery() {
      if (!scrapbookTimelineContainer) return;

      const filteredMemories = memories.filter(item => {
        if (item.isPending) return false;
        if (!isRegularMemoryItem(item)) return false;
        if (activeYearFilter) {
          const targetYr = parseYearFromResource(item);
          if (targetYr !== activeYearFilter) {
            return false;
          }
          if (activeMonthFilter) {
            const d = new Date(item.date);
            const monthName = isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'long' }).toLowerCase();
            if (monthName !== activeMonthFilter) return false;
          }
        } else {
          return false; 
        }

        if (activeClassmateFilter && !item.owners.includes(activeClassmateFilter)) return false;
        if (activeCategory === 'photos' && item.type !== 'image') return false;
        if (activeCategory === 'videos' && item.type !== 'video') return false;
        if (activeCategory === 'favorites' && !favoritesList.includes(item.filename)) return false;

        return true;
      });

      scrapbookTimelineContainer.innerHTML = '';
      activeGalleryItems = []; 

      if (filteredMemories.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        return;
      } else {
        if (emptyState) emptyState.classList.add('hidden');
      }

      const groupedTimeline = {};
      filteredMemories.forEach(item => {
        const dateObj = new Date(item.date);
        let monthYear = "Unknown Date";
        if (!isNaN(dateObj.getTime())) {
          monthYear = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
        if (!groupedTimeline[monthYear]) {
          groupedTimeline[monthYear] = [];
        }
        groupedTimeline[monthYear].push(item);
      });

      const sortedPeriods = Object.keys(groupedTimeline).sort((a, b) => new Date(b) - new Date(a));
      let absoluteItemCounter = 0;

      sortedPeriods.forEach(period => {
        const periodContainer = document.createElement('div');
        periodContainer.className = 'timeline-period animate-fade-in w-full max-w-full overflow-visible';
        const gridId = `grid-${period.replace(/\s+/g, '-')}`;

        periodContainer.innerHTML = `
          <div class="flex items-center justify-between mb-6 border-b-2 border-dashed border-[#D4A373]/40 pb-2 px-1">
            <div class="flex items-center space-x-4">
              <span class="w-3 h-3 bg-scrapbook-accent rounded-full ring-4 ring-scrapbook-accent/20"></span>
              <button onclick="openMonthAlbum('${activeYearFilter}', '${period.split(' ')[0].toLowerCase()}')" class="font-serif text-2xl md:text-3xl font-bold tracking-tight text-scrapbook-ink hover:text-scrapbook-accent transition-colors">${period}</button>
            </div>
            <button onclick="openExpandLibrary('${period}')" class="px-4 py-1.5 bg-[#D4A373]/15 hover:bg-scrapbook-ink hover:text-white border border-[#D4A373]/30 rounded-full font-bold transition-all text-xs flex items-center gap-1 active:scale-95">
              <span>Expand</span>
              <i class="fa-solid fa-expand text-[10px]"></i>
            </button>
          </div>
          
          <div class="relative group w-full overflow-visible px-1">
            <button onclick="scrollGrid('${gridId}', -1)" class="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white hover:bg-scrapbook-ink hover:text-white text-scrapbook-ink rounded-full items-center justify-center shadow-lg transition-all z-20 border border-scrapbook-accent/30 active:scale-95"><i class="fa-solid fa-chevron-left"></i></button>
            <div class="responsive-memory-grid overflow-x-auto scroll-smooth w-full" id="${gridId}"></div>
            <button onclick="scrollGrid('${gridId}', 1)" class="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white hover:bg-scrapbook-ink hover:text-white text-scrapbook-ink rounded-full items-center justify-center shadow-lg transition-all z-20 border border-scrapbook-accent/30 active:scale-95"><i class="fa-solid fa-chevron-right"></i></button>
          </div>
        `;

        scrapbookTimelineContainer.appendChild(periodContainer);
        const gridElement = document.getElementById(gridId);

        const monthItems = groupedTimeline[period];
        const stacksMap = new Map();

        monthItems.forEach(item => {
          const key = getStackGroupingKey(item);
          if (!stacksMap.has(key)) stacksMap.set(key, []);
          stacksMap.get(key).push(item);
        });

        stacksMap.forEach((stackList, key) => {
          stackList.forEach(item => {
            activeGalleryItems.push(item);
          });

          const isStackedDeck = stackList.length > 1;
          const randomRotation = (Math.random() * 4 - 2).toFixed(1);
          const card = document.createElement('div');

          const firstItem = stackList[0];
          const mappedAssetUrl = localAssetMappings[firstItem.filename] || firstItem.url;
          const previewUrl = firstItem.type === 'video' ? mappedAssetUrl : get380pUrl(mappedAssetUrl);

          if (isStackedDeck) {
            const isFav = stackList.some(item => favoritesList.includes(item.filename));
            card.className = `polaroid-card p-3 rounded shadow-md relative overflow-visible ${isFav ? 'neon-favorite' : 'bg-white'} transform transition-all duration-300 cursor-pointer`;
            card.style.transform = `rotate(${randomRotation}deg)`;

            let ownersHtml = `<div class="flex -space-x-2 overflow-hidden py-1">`;
            firstItem.owners.slice(0, 4).forEach(owner => {
              const pUrl = CLASSMATE_PROFILES[owner] || `https://placehold.co/150x150/FAF6EE/2C2520?text=${owner[0]}`;
              ownersHtml += `
                <div class="w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow-sm" title="@${owner}">
                  <img src="${pUrl}" alt="${owner}" class="w-full h-full object-cover" onerror="handleImageLoadError(this)">
                </div>
              `;
            });
            ownersHtml += `</div>`;

            card.innerHTML = `
              <div class="absolute inset-0 bg-white rounded border border-[#FAF6EE]/50 shadow transform stack-deck-layer-1 z-0 pointer-events-none"></div>
              <div class="absolute inset-0 bg-white rounded border border-[#FAF6EE]/50 shadow transform stack-deck-layer-2 z-10 pointer-events-none"></div>

              <div class="relative z-20" onclick="openStackPopup('${encodeURIComponent(JSON.stringify(stackList))}')">
                <div class="washi-tape"></div>
                
                <div class="media-container bg-[#FAF6EE] rounded relative overflow-hidden mb-6">
                  ${firstItem.type === 'video' ? `
                    <video src="${previewUrl}" class="w-full h-full object-cover" muted loop playsinline="true" webkit-playsinline="true"></video>
                    <div class="absolute inset-0 flex items-center justify-center bg-black/20">
                      <span class="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow"><i class="fa-solid fa-play ml-0.5 text-xs"></i></span>
                    </div>
                  ` : `
                    <img src="${previewUrl}" class="w-full h-full object-cover" loading="lazy" onerror="handleImageLoadError(this)">
                  `}
                  <div class="absolute top-2 right-2 bg-scrapbook-ink/90 text-white text-[10px] px-2.5 py-1 rounded-full font-bold z-30 flex items-center gap-1.5 shadow">
                    <i class="fa-solid fa-clone text-[9px] animate-pulse"></i> ${stackList.length} Stacked
                  </div>
                </div>

                <div class="mt-3">
                  <div class="flex items-center justify-between">${ownersHtml}</div>
                  <div class="flex items-center justify-between mt-1 text-scrapbook-ink/60 text-[11px] font-medium border-t border-[#FAF6EE] pt-2">
                    <span><i class="fa-regular fa-calendar-days text-[10px] mr-1"></i> ${firstItem.date}</span>
                    <span class="text-scrapbook-accent font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">View Stack</span>
                  </div>
                </div>
              </div>
            `;
            absoluteItemCounter += stackList.length;

          } else {
            const item = stackList[0];
            const isFav = favoritesList.includes(item.filename);
            const isStored = !!localAssetMappings[item.filename];
            const boundIndex = absoluteItemCounter++;

            card.className = `polaroid-card p-3 rounded shadow-md relative overflow-visible ${isFav ? 'neon-favorite' : 'bg-white'} transform transition-all duration-300`;
            card.style.transform = `rotate(${randomRotation}deg)`;

            let ownersHtml = `<div class="flex -space-x-2 overflow-hidden py-1">`;
            item.owners.slice(0, 4).forEach(owner => {
              const pUrl = CLASSMATE_PROFILES[owner] || `https://placehold.co/150x150/FAF6EE/2C2520?text=${owner[0]}`;
              ownersHtml += `
                <div onclick="event.stopPropagation(); filterByClassmate('${owner}')" class="w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:scale-110 hover:z-10 transition-all">
                  <img src="${pUrl}" alt="${owner}" class="w-full h-full object-cover" onerror="handleImageLoadError(this)">
                </div>
              `;
            });
            ownersHtml += `</div>`;

            card.innerHTML = `
              <div class="washi-tape"></div>
              
              <div onclick="openViewer(${boundIndex})">
                <div class="media-container bg-[#FAF6EE] rounded relative overflow-hidden mb-6 cursor-pointer">
                  ${item.isEmbed ? `
                    <iframe src="${item.embedUrl || item.url}" title="${item.filename}" class="w-full h-full pointer-events-none" loading="lazy"></iframe>
                    <div class="absolute inset-0 flex items-center justify-center bg-black/10">
                      <span class="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow"><i class="fa-solid fa-play ml-0.5 text-xs"></i></span>
                    </div>
                  ` : item.type === 'video' ? `
                    <video src="${previewUrl}" class="w-full h-full object-cover" muted loop playsinline="true" webkit-playsinline="true"></video>
                    <div class="absolute inset-0 flex items-center justify-center bg-black/10">
                      <span class="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow"><i class="fa-solid fa-play ml-0.5 text-xs"></i></span>
                    </div>
                  ` : `
                    <img src="${previewUrl}" class="w-full h-full object-cover animate-fade-in" loading="lazy" onerror="handleImageLoadError(this)">
                  `}
                </div>
              </div>

              <div class="mt-3">
                <div class="flex items-center justify-between">${ownersHtml}</div>
                <div class="flex items-center justify-between mt-1 text-scrapbook-ink/60 text-[11px] font-medium border-t border-[#FAF6EE] pt-2">
                  <span><i class="fa-regular fa-calendar-days text-[10px] mr-1"></i> ${item.date}</span>
                  
                  <div class="flex items-center space-x-1 sm:opacity-0 hover:opacity-100 focus-within:opacity-100 group-hover:opacity-100 transition-opacity duration-200 card-actions">
                    <button onclick="event.stopPropagation(); toggleFavorite('${item.filename}')" class="w-7 h-7 rounded-full bg-white shadow border border-[#FAF6EE] hover:bg-scrapbook-board/30 hover:text-scrapbook-rose flex items-center justify-center text-xs transition-all active:scale-90">
                      <i class="${isFav ? 'fa-solid text-scrapbook-rose' : 'fa-regular'} fa-heart"></i>
                    </button>
                    <!-- Offline Cache Button: EXCLUDE PHOTOS, VIDEOS ONLY -->
                    ${item.type === 'video' ? `
                    <button onclick="event.stopPropagation(); triggerAssetDownload('${item.filename}', '${item.url}')" class="w-7 h-7 rounded-full bg-white shadow border border-[#FAF6EE] hover:bg-scrapbook-board/30 hover:text-scrapbook-accent flex items-center justify-center text-xs transition-all active:scale-90" data-dl-filename="${item.filename}">
                      ${isStored ? `<i class="fa-solid fa-circle-check text-green-500"></i>` : `<i class="fa-solid fa-cloud-arrow-down"></i>`}
                    </button>
                    ` : ''}
                    <button onclick="event.stopPropagation(); openShareAccessModalByFilename('${encodeURIComponent(item.filename)}')" class="w-7 h-7 rounded-full bg-white shadow border border-[#FAF6EE] hover:bg-scrapbook-board/30 hover:text-scrapbook-accent flex items-center justify-center text-xs transition-all active:scale-90" title="Manage access & copy link">
                      <i class="fa-solid fa-link"></i>

                    <a href="${getDownloadUrl(item.url)}" download="${item.filename}" onclick="event.stopPropagation()" class="w-7 h-7 rounded-full bg-white shadow border border-[#FAF6EE] hover:bg-scrapbook-board/30 hover:text-scrapbook-accent flex items-center justify-center text-xs transition-all active:scale-90">
                      <i class="fa-solid fa-download"></i>
                    </a>
                  </div>
                </div>
              </div>
            `;
          }

          if (gridElement) gridElement.appendChild(card);
        });
      });
    }
  


    function populateSearchClassmatesGrid() {
      const grid = document.getElementById('search-classmates-scroll-grid');
      if (!grid) return;
      grid.innerHTML = '';
      
      CLASSMATE_NAMES.forEach(name => {
        const pUrl = CLASSMATE_PROFILES[name] || `https://placehold.co/150x150/FAF6EE/2C2520?text=${name[0]}`;
        const item = document.createElement('div');
        item.className = "flex items-center space-x-2 bg-white border border-[#D4A373]/20 hover:border-scrapbook-ink px-3 py-1 rounded-full cursor-pointer transition-all active:scale-95 select-none shadow-sm h-10";
        item.innerHTML = `
          <div class="w-6 h-6 rounded-full overflow-hidden border border-[#D4A373]/30 bg-[#FAF6EE] flex-shrink-0">
            <img src="${pUrl}" alt="${name}" class="w-full h-full object-cover" onerror="handleImageLoadError(this)">
          </div>
          <span class="text-[11px] font-bold text-scrapbook-ink">@${name}</span>
        `;
        item.onclick = () => {
          const input = document.getElementById('search-input');
          if (input) {
            input.value = `@${name}`;
            runSearchFilter();
          }
        };
        grid.appendChild(item);
      });
    }
  


    window.openExpandLibrary = function(period) {
      activeExpandedPeriod = period;
      isLibraryOpen = true;

      document.getElementById('homepage-view').classList.add('hidden');
      document.getElementById('year-album-workspace').classList.add('hidden');
      document.getElementById('profile-page-view').classList.add('hidden');
      
      lockScroll();

      const titleEl = document.getElementById('expand-library-title');
      if (titleEl) titleEl.textContent = `${period} Archive`;

      const modal = document.getElementById('expand-library-modal');
      if (modal) modal.classList.remove('pointer-events-none', 'opacity-0');

      renderLibraryGrid();
      updateHeaderUI();
    };

    window.closeExpandLibrary = function() {
      isLibraryOpen = false;

      const workspaceEl = document.getElementById('year-album-workspace');
      if (workspaceEl) workspaceEl.classList.remove('hidden');

      unlockScroll();

      const modal = document.getElementById('expand-library-modal');
      if (modal) modal.classList.add('pointer-events-none', 'opacity-0');
      updateHeaderUI();
    };

    function getBentoClasses(index) {
      const patterns = [
        "col-span-2 row-span-2",
        "col-span-1 row-span-1",
        "col-span-1 row-span-2",
        "col-span-2 row-span-1",
        "col-span-1 row-span-1"
      ];
      return patterns[index % patterns.length];
    }

    function initBentoScrollAnimation() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.05 });

      document.querySelectorAll('.bento-item').forEach(item => {
        observer.observe(item);
      });
    }

    function renderLibraryGrid() {
      const container = document.getElementById('library-grid-container');
      if (!container || !activeExpandedPeriod) return;

      container.innerHTML = '';
      
      const periodMemories = memories.filter(item => {
        if (item.isPending) return false;
        if (!isRegularMemoryItem(item)) return false;
        const dateObj = new Date(item.date);
        const monthYear = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        return monthYear === activeExpandedPeriod;
      });

      periodMemories.forEach((item, index) => {
        const assetUrl = localAssetMappings[item.filename] || item.url;
        const previewUrl = item.type === 'video' ? assetUrl : get380pUrl(assetUrl);
        const globalIndex = activeGalleryItems.findIndex(gItem => gItem.filename === item.filename);
        const bentoSpanClass = getBentoClasses(index);
        const bentoWrapper = document.createElement('div');
        bentoWrapper.className = `bento-item ${bentoSpanClass} relative rounded-2xl overflow-hidden shadow-md bg-[#FAF6EE] border border-[#D4A373]/20 cursor-pointer group`;
        
        bentoWrapper.onclick = () => openViewer(globalIndex);
        
        bentoWrapper.innerHTML = `
          ${item.isEmbed ? `
            <iframe src="${item.embedUrl || item.url}" title="${item.filename}" class="w-full h-full pointer-events-none" loading="lazy"></iframe>
            <div class="absolute inset-0 flex items-center justify-center bg-black/10">
              <span class="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg"><i class="fa-solid fa-play ml-0.5 text-xs"></i></span>
            </div>
          ` : item.type === 'video' ? `
            <video src="${previewUrl}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" muted loop playsinline="true" webkit-playsinline="true"></video>
            <div class="absolute inset-0 flex items-center justify-center bg-black/10">
              <span class="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg"><i class="fa-solid fa-play ml-0.5 text-xs"></i></span>
            </div>
          ` : `
            <img src="${previewUrl}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" onerror="handleImageLoadError(this)">
          `}
        `;
        
        container.appendChild(bentoWrapper);
      });

      setTimeout(initBentoScrollAnimation, 50);
    }

    window.scrollGrid = function(gridId, direction) {
      const grid = document.getElementById(gridId);
      if (grid) {
        const scrollAmount = grid.clientWidth * 0.75;
        grid.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
      }
    };
  


    window.changeProfile = async function() {
      const previousAccount = currentUser ? getPfpAccount(currentUser) : null;
      if (previousAccount && String(previousAccount.status||'').toLowerCase()==='online') { const updated=await setCloudinaryAccountStatus(previousAccount,'Offline'); if(updated){previousAccount.status='Offline';PFP_ACCOUNTS.set(previousAccount.name.toLowerCase(),previousAccount);} }
      currentUser = null;
      safeStorage.removeItem('scrapbook_user');
      const onboardingOverlay = document.getElementById('onboarding-overlay');
      if (onboardingOverlay) {
        onboardingOverlay.classList.remove('hidden', 'opacity-0');
        lockScroll();
        renderOnboardingSelectionGrid();
      }
      closeProfilePage();
    };

    function openStackPopup(encodedStackList) {
      const stackList = JSON.parse(decodeURIComponent(encodedStackList));
      if (!stackList || stackList.length === 0) return;

      const firstItem = stackList[0];
      activePopupStackList = stackList; 

      lockScroll();

      const stackPopupTitle = document.getElementById('stack-popup-title');
      const stackPopupDate = document.getElementById('stack-popup-date');
      const stackPopupOwners = document.getElementById('stack-popup-owners');
      const stackPopupModal = document.getElementById('stack-popup-modal');

      if (stackPopupTitle) stackPopupTitle.textContent = `Memory Stack (${stackList.length} Items)`;
      if (stackPopupDate) stackPopupDate.innerHTML = `<i class="fa-regular fa-calendar-days mr-1"></i> ${firstItem.date}`;

      if (stackPopupOwners) {
        let headsHtml = `<div class="flex -space-x-2 overflow-hidden py-1">`;
        firstItem.owners.slice(0, 8).forEach(owner => {
          const pUrl = CLASSMATE_PROFILES[owner] || `https://placehold.co/150x150/FAF6EE/2C2520?text=${owner[0]}`;
          headsHtml += `
            <div class="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm" title="@${owner}">
              <img src="${pUrl}" alt="${owner}" class="w-full h-full object-cover" onerror="handleImageLoadError(this)">
            </div>
          `;
        });
        headsHtml += `</div>`;
        stackPopupOwners.innerHTML = headsHtml;
      }

      renderStackPopupGridItems();

      if (stackPopupModal) stackPopupModal.classList.remove('pointer-events-none', 'opacity-0');
    }

    function renderStackPopupGridItems() {
      const stackPopupGrid = document.getElementById('stack-popup-grid');
      if (!stackPopupGrid || !activePopupStackList) return;
      stackPopupGrid.innerHTML = '';

      activePopupStackList.forEach((item, index) => {
        const assetUrl = localAssetMappings[item.filename] || item.url;
        const previewUrl = item.type === 'video' ? assetUrl : get380pUrl(assetUrl);
        const globalIndex = activeGalleryItems.findIndex(gItem => gItem.filename === item.filename);
        const bentoSpanClass = getBentoClasses(index);
        const bentoWrapper = document.createElement('div');
        bentoWrapper.className = `bento-item ${bentoSpanClass} relative rounded-2xl overflow-hidden shadow-md bg-[#FAF6EE] border border-[#D4A373]/20 cursor-pointer group`;
        
        bentoWrapper.onclick = () => {
          closeStackPopupModal();
          openViewer(globalIndex);
        };
        
        bentoWrapper.innerHTML = `
          ${item.type === 'video' ? `
            <video src="${previewUrl}" class="w-full h-full object-cover" muted loop playsinline="true" webkit-playsinline="true"></video>
            <div class="absolute inset-0 flex items-center justify-center bg-black/10">
              <span class="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg"><i class="fa-solid fa-play ml-0.5 text-xs"></i></span>
            </div>
          ` : `
            <img src="${previewUrl}" class="w-full h-full object-cover" loading="lazy" onerror="handleImageLoadError(this)">
          `}
        `;
        
        stackPopupGrid.appendChild(bentoWrapper);
      });

      setTimeout(initBentoScrollAnimation, 50);
    }

    function closeStackPopupModal() {
      const stackPopupModal = document.getElementById('stack-popup-modal');
      if (stackPopupModal) stackPopupModal.classList.add('pointer-events-none', 'opacity-0');
      unlockScroll();
    }
    window.openOwnProfilePage = function() {
      if (currentUser) filterByClassmate(currentUser);
    }

    window.closeSearchView = function() {
      const searchView = document.getElementById('search-view');
      if (searchView) {
        searchView.classList.remove('translate-x-0', 'pointer-events-auto');
        searchView.classList.add('translate-x-full', 'pointer-events-none');
      }
      unlockScroll(); // Restore standard scrolling
      // Restore tab bar
      const tabBar = document.getElementById('bottom-tab-bar');
      if (tabBar) tabBar.classList.remove('tab-bar-hidden');
    };

    function filterByClassmate(name) {
      activeProfileClassmate = name;
      closeSearchView();
      
      const homepageView = document.getElementById('homepage-view');
      const workspaceView = document.getElementById('year-album-workspace');
      const profilePageView = document.getElementById('profile-page-view');
      const profilePagePfp = document.getElementById('profile-page-pfp');
      const profilePageName = document.getElementById('profile-page-name');
      const profileStatTagged = document.getElementById('profile-stat-tagged');
      const profileStatUploads = document.getElementById('profile-stat-uploads');
      const profileSlideshowContainer = document.getElementById('profile-slideshow-container');
      const profileTabFavorites = document.getElementById('profile-tab-favorites');
      const profileTabPending = document.getElementById('profile-tab-pending');

      if (homepageView) homepageView.classList.add('hidden');
      if (workspaceView) workspaceView.classList.add('hidden');
      if (profilePageView) profilePageView.classList.remove('hidden');

      if (profilePagePfp) {
        profilePagePfp.src = CLASSMATE_PROFILES[name] || `https://placehold.co/150x150/FAF6EE/2C2520?text=${name[0]}`;
      }
      if (profilePageName) profilePageName.textContent = `Memories of ${name}`;

      const taggedCount = memories.filter(m => m.owners.includes(name) && !m.isPending).length;
      const uploadsCount = memories.filter(m => m.uploader === name && !m.isPending).length;

      if (profileStatTagged) profileStatTagged.textContent = taggedCount;
      if (profileStatUploads) profileStatUploads.textContent = uploadsCount;

      if (currentUser && name === currentUser) {
        if (profileTabFavorites) profileTabFavorites.classList.remove('hidden');
        if (profileTabPending) profileTabPending.classList.remove('hidden');
      } else {
        if (profileTabFavorites) profileTabFavorites.classList.add('hidden');
        if (profileTabPending) profileTabPending.classList.add('hidden');
      }

      setProfileTab('all');
      startCoverSlideshow(name);
      renderContextTabs();
      updateHeaderUI();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function closeProfilePage() {
      activeProfileClassmate = null;
      stopCoverSlideshow();

      const homepageView = document.getElementById('homepage-view');
      const workspaceView = document.getElementById('year-album-workspace');
      const profilePageView = document.getElementById('profile-page-view');

      if (profilePageView) profilePageView.classList.add('hidden');
      
      if (activeYearFilter) {
        if (workspaceView) workspaceView.classList.remove('hidden');
      } else {
        if (homepageView) homepageView.classList.remove('hidden');
      }

      renderContextTabs();
      updateHeaderUI();
    }

    function startCoverSlideshow(classmateName) {
      stopCoverSlideshow();
      const profileSlideshowContainer = document.getElementById('profile-slideshow-container');
      if (!profileSlideshowContainer) return;
      
      profileSlideshowContainer.innerHTML = '';
      slideshowImages = memories
        .filter(item => item.owners.includes(classmateName) && item.type === 'image' && !item.isPending)
        .map(item => item.url);

      if (slideshowImages.length === 0) {
        slideshowImages = memories.filter(item => item.type === 'image' && !item.isPending).slice(0, 4).map(item => item.url);
      }

      currentSlideshowIndex = 0;
      
      slideshowImages.forEach((url, i) => {
        const img = document.createElement('img');
        img.src = url;
        img.className = `absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === 0 ? 'opacity-100' : 'opacity-0'}`;
        img.onerror = function() { handleImageLoadError(this); };
        profileSlideshowContainer.appendChild(img);
      });

      if (slideshowImages.length > 1) {
        slideshowInterval = setInterval(() => {
          const slides = profileSlideshowContainer.querySelectorAll('img');
          if (slides.length === 0) return;

          slides[currentSlideshowIndex].classList.add('opacity-0');
          slides[currentSlideshowIndex].classList.remove('opacity-100');
          currentSlideshowIndex = (currentSlideshowIndex + 1) % slides.length;
          slides[currentSlideshowIndex].classList.remove('opacity-0');
          slides[currentSlideshowIndex].classList.add('opacity-100');
        }, 5000); 
      }
    }

    function stopCoverSlideshow() {
      if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
      }
    }

    function setProfileTab(tab) {
      activeProfileTab = tab;
      document.querySelectorAll('.profile-tab-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-scrapbook-ink', 'text-white');
        btn.classList.add('bg-white', 'text-scrapbook-ink');
      });

      const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
      if (activeBtn) {
        activeBtn.classList.add('active', 'bg-scrapbook-ink', 'text-white');
        activeBtn.classList.remove('bg-white', 'text-scrapbook-ink');
      }

      renderProfileGrid();
      renderContextTabs();
    }

    function renderProfileGrid() {
      const profileGridContainer = document.getElementById('profile-grid-container');
      const profileEmptyState = document.getElementById('profile-empty-state');
      if (!profileGridContainer || !activeProfileClassmate) return;

      profileGridContainer.innerHTML = '';
      
      const filtered = memories.filter(item => {
        if (activeProfileTab === 'pending') {
          return item.isPending === true && item.uploader === activeProfileClassmate;
        }
        if (item.isPending) return false;
        if (activeProfileTab === 'uploads') {
          return item.uploader === activeProfileClassmate;
        }
        if (!item.owners.includes(activeProfileClassmate)) return false;
        if (activeProfileTab === 'photos' && item.type !== 'image') return false;
        if (activeProfileTab === 'videos' && item.type !== 'video') return false;
        if (activeProfileTab === 'favorites' && !favoritesList.includes(item.filename)) return false;

        return true;
      });

      activeGalleryItems = [...filtered];

      if (filtered.length === 0) {
        if (profileEmptyState) profileEmptyState.classList.remove('hidden');
        return;
      } else {
        if (profileEmptyState) profileEmptyState.classList.add('hidden');
      }

      filtered.forEach((item, index) => {
        const isFav = favoritesList.includes(item.filename);
        const randomRotation = (Math.random() * 4 - 2).toFixed(1);
        
        const assetUrl = localAssetMappings[item.filename] || item.url;
        const previewUrl = item.type === 'video' ? assetUrl : get380pUrl(assetUrl);
        const isStored = !!localAssetMappings[item.filename];

        const card = document.createElement('div');
        card.className = `polaroid-card p-3 rounded shadow-md relative overflow-visible ${isFav ? 'neon-favorite' : 'bg-white'} transform transition-all duration-300`;
        card.style.transform = `rotate(${randomRotation}deg)`;

        let ownersHtml = `<div class="flex -space-x-2 overflow-hidden py-1">`;
        item.owners.slice(0, 4).forEach(owner => {
          const pUrl = CLASSMATE_PROFILES[owner] || `https://placehold.co/150x150/FAF6EE/2C2520?text=${owner[0]}`;
          ownersHtml += `
            <div onclick="event.stopPropagation(); filterByClassmate('${owner}')" class="w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:scale-110 hover:z-10 transition-all">
              <img src="${pUrl}" alt="${owner}" class="w-full h-full object-cover" onerror="handleImageLoadError(this)">
            </div>
          `;
        });
        ownersHtml += `</div>`;

        card.innerHTML = `
          <div class="washi-tape"></div>
          
          <div onclick="openViewer(${index})">
            <div class="media-container bg-[#FAF6EE] rounded relative overflow-hidden mb-6 cursor-pointer">
              ${item.type === 'video' ? `
                <video src="${previewUrl}" class="w-full h-full object-cover" muted loop playsinline="true" webkit-playsinline="true"></video>
                <div class="absolute inset-0 flex items-center justify-center bg-black/10">
                  <span class="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow"><i class="fa-solid fa-play ml-0.5 text-xs"></i></span>
                </div>
              ` : `
                <img src="${previewUrl}" class="w-full h-full object-cover" loading="lazy" onerror="handleImageLoadError(this)">
              `}
            </div>
          </div>

          <div class="mt-3">
            <div class="flex items-center justify-between">${ownersHtml}</div>
            <div class="flex items-center justify-between mt-1 text-scrapbook-ink/60 text-[11px] font-medium border-t border-[#FAF6EE] pt-2">
              <span><i class="fa-regular fa-calendar-days text-[10px] mr-1"></i> ${item.date}</span>
              
              <div class="flex items-center space-x-1 sm:opacity-0 hover:opacity-100 focus-within:opacity-100 group-hover:opacity-100 transition-opacity duration-200 card-actions">
                <button onclick="event.stopPropagation(); toggleFavorite('${item.filename}'); renderProfileGrid();" class="w-7 h-7 rounded-full bg-white shadow border border-[#FAF6EE] hover:bg-scrapbook-board/30 hover:text-scrapbook-rose flex items-center justify-center text-xs transition-all active:scale-90">
                  <i class="${isFav ? 'fa-solid text-scrapbook-rose' : 'fa-regular'} fa-heart"></i>
                </button>
                <!-- Offline Cache Button: EXCLUDE PHOTOS, VIDEOS ONLY -->
                ${item.type === 'video' ? `
                <button onclick="event.stopPropagation(); triggerAssetDownload('${item.filename}', '${item.url}')" class="w-7 h-7 rounded-full bg-white shadow border border-[#FAF6EE] hover:bg-scrapbook-board/30 hover:text-scrapbook-accent flex items-center justify-center text-xs transition-all active:scale-90" data-dl-filename="${item.filename}">
                  ${isStored ? `<i class="fa-solid fa-circle-check text-green-500"></i>` : `<i class="fa-solid fa-cloud-arrow-down"></i>`}
                </button>
                ` : ''}
                <a href="${getDownloadUrl(item.url)}" download="${item.filename}" onclick="event.stopPropagation()" class="w-7 h-7 rounded-full bg-white shadow border border-[#FAF6EE] hover:bg-scrapbook-board/30 hover:text-scrapbook-accent flex items-center justify-center text-xs transition-all active:scale-90">
                  <i class="fa-solid fa-download"></i>
                </a>
              </div>
            </div>
          </div>
        `;

        profileGridContainer.appendChild(card);
      });
    }
  


    function renderClassmatesSection() {
      const classmateInitialGrid = document.getElementById('classmate-initial-grid');
      const classmatesModalGrid = document.getElementById('classmates-modal-grid');
      if (!classmateInitialGrid || !classmatesModalGrid) return;

      classmateInitialGrid.innerHTML = '';
      const initialClassmates = CLASSMATE_NAMES.slice(0, 12); // Render first 12 classmates for clean layout

      initialClassmates.forEach(name => {
        const chip = createClassmateCircle(name, true);
        classmateInitialGrid.appendChild(chip);
      });

      classmatesModalGrid.innerHTML = '';
      CLASSMATE_NAMES.forEach(name => {
        const item = createClassmateCircle(name, false);
        classmatesModalGrid.appendChild(item);
      });
    }

    function createClassmateCircle(name, isInitialGrid) {
      const active = activeClassmateFilter === name;
      const profileUrl = CLASSMATE_PROFILES[name] || `https://placehold.co/150x150/FAF6EE/2C2520?text=${name[0]}`;
      const container = document.createElement('div');
      container.className = `flex flex-col items-center cursor-pointer group text-center select-none transition-all duration-300 active:scale-95 ${isInitialGrid ? 'w-20 sm:w-28' : 'w-20'}`;

      container.innerHTML = `
        <div class="relative rounded-full p-1 transition-all duration-300 ${active ? 'ring-4 ring-scrapbook-ink scale-105' : 'ring-2 ring-scrapbook-accent/30 group-hover:ring-scrapbook-ink group-hover:scale-105'}">
          <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shadow-md bg-white relative">
            <img src="${profileUrl}" alt="${name}" class="w-full h-full object-cover" onerror="handleImageLoadError(this)">
          </div>
        </div>
        <span class="mt-2 text-xs font-bold tracking-tight text-scrapbook-ink truncate w-full group-hover:text-scrapbook-accent transition-colors">${name}</span>
      `;

      container.addEventListener('click', () => {
        filterByClassmate(name);
        closeClassmatesGrid();
      });

      return container;
    }

    function openClassmatesGrid() {
      const modal = document.getElementById('classmates-modal');
      if (modal) {
        modal.classList.remove('pointer-events-none', 'opacity-0');
        const card = modal.querySelector('.transform');
        if (card) card.classList.remove('scale-95');
        lockScroll();
      }
    }
    window.openClassmatesGrid = openClassmatesGrid;

    function closeClassmatesGrid() {
      const modal = document.getElementById('classmates-modal');
      if (modal) {
        modal.classList.add('pointer-events-none', 'opacity-0');
        const card = modal.querySelector('.transform');
        if (card) card.classList.add('scale-95');
        unlockScroll();
        restoreTabBarHighlight();
      }
    }
    window.closeClassmatesGrid = closeClassmatesGrid;

    function setCategoryFilter(category) {
      activeCategory = category;
      document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-scrapbook-ink', 'text-white');
        btn.classList.add('bg-white', 'text-scrapbook-ink');
      });

      const activeBtn = document.querySelector(`[data-category="${category}"]`);
      if (activeBtn) {
        activeBtn.classList.add('active', 'bg-scrapbook-ink', 'text-white');
        activeBtn.classList.remove('bg-white', 'text-scrapbook-ink');
      }

      renderGallery();
      renderContextTabs();
    }

    function resetFilters() {
      activeCategory = 'all';
      activeClassmateFilter = null;
      setCategoryFilter('all');
      renderClassmatesSection();
      if (activeYearFilter) renderGallery();
    }

    function toggleFavorite(filename) {
      if (isDumpMode) return;
      const index = favoritesList.indexOf(filename);
      if (index > -1) {
        favoritesList.splice(index, 1);
      } else {
        favoritesList.push(filename);
      }
      safeStorage.setItem('scrapbook_favorites', JSON.stringify(favoritesList));
      if (activeYearFilter) renderGallery();
    }

    function updateDashboardStats() {
      const statTotal = document.getElementById('stat-total');
      const statPhotos = document.getElementById('stat-photos');
      const statVideos = document.getElementById('stat-videos');
      if (!statTotal || !statPhotos || !statVideos) return;
      
      statTotal.textContent = memories.length;
      
      const photoCount = memories.filter(m => m.type === 'image' && !m.isPending).length;
      const videoCount = memories.filter(m => m.type === 'video' && !m.isPending).length;

      statPhotos.textContent = photoCount;
      statVideos.textContent = videoCount;
    }
  


    function resetZoomState() {
      zoomScale = 1;
      panX = 0;
      panY = 0;
      updateZoomTransform();
    }

    window.adjustZoom = function(factor) {
      if (factor === 0) {
        resetZoomState();
      } else {
        const oldScale = zoomScale;
        zoomScale = Math.max(1, Math.min(zoomScale + factor, 5));
        if (zoomScale === 1) {
          panX = 0;
          panY = 0;
        } else {
          panX = panX * (zoomScale / oldScale);
          panY = panY * (zoomScale / oldScale);
        }
        updateZoomTransform();
      }
    };

    function updateZoomTransform() {
      const el = document.getElementById('viewer-active-image');
      if (el) {
        el.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomScale})`;
        el.style.transition = isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)';
        el.style.cursor = zoomScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default';
      }
    }

    function setupZoomInteractionListeners() {
      const container = document.getElementById('viewer-single-media-box');
      if (!container) return;

      container.addEventListener('mousedown', (e) => {
        if (zoomScale <= 1) return; 
        const currentItem = activeGalleryItems[currentViewerIndex];
        if (currentItem && currentItem.type === 'video') return;
        isDragging = true;
        startX = e.clientX - panX;
        startY = e.clientY - panY;
        updateZoomTransform();
        e.preventDefault();
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging || zoomScale <= 1) return;
        panX = e.clientX - startX;
        panY = e.clientY - startY;
        updateZoomTransform();
      });

      window.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          updateZoomTransform();
        }
      });
    }

    function setupFullscreenViewportListeners() {
      const fsViewport = document.getElementById('fullscreen-viewport');
      if (!fsViewport) return;

      fsViewport.addEventListener('mousedown', (e) => {
        const item = activeGalleryItems[currentViewerIndex];
        if (item && item.type === 'video') return;

        isFsDragging = true;
        fsStartX = e.clientX - fsPanX;
        fsStartY = e.clientY - fsPanY;
        e.preventDefault();
      });

      window.addEventListener('mousemove', (e) => {
        if (!isFsDragging) return;
        fsPanX = e.clientX - fsStartX;
        fsPanY = e.clientY - fsPanY;
        updateFullscreenTransform();
      });

      window.addEventListener('mouseup', () => {
        isFsDragging = false;
      });
    }
  



    // ========================= N FILM CUSTOM VIDEO PLAYER =========================
    let activeNFilmPlayerItem = null;
    let nFilmPlayerVolumeOpen = false;

    function getNFilmWatchApp(item){
      const raw = item?.embedUrl || item?.url || '';
      try {
        const host = new URL(raw, window.location.href).hostname.toLowerCase();
        if(host.includes('youtube') || host.includes('youtu.be')) return 'YouTube';
        if(host.includes('tiktok')) return 'TikTok';
        if(host.includes('drive.google') || host.includes('docs.google')) return 'Google Drive';
        if(host.includes('vimeo')) return 'Vimeo';
        if(host.includes('facebook')) return 'Facebook';
        if(host.includes('instagram')) return 'Instagram';
        return host.replace(/^www\./,'').split('.')[0] || 'source';
      } catch(e){ return 'source'; }
    }

    function formatNFilmPlayerTime(seconds){
      if(!isFinite(seconds) || seconds < 0) return '0:00';
      const h=Math.floor(seconds/3600), m=Math.floor((seconds%3600)/60), sec=Math.floor(seconds%60);
      return h ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${m}:${String(sec).padStart(2,'0')}`;
    }

    function updateNFilmPlayerTimeline(){
      const video=document.getElementById('nfilm-player-video');
      const range=document.getElementById('nfilm-player-timeline');
      const time=document.getElementById('nfilm-player-time');
      const loaded=document.getElementById('nfilm-player-loaded');
      if(!video || !range || !time) return;
      const duration=video.duration || 0;
      const progress=duration ? (video.currentTime/duration)*100 : 0;
      range.value=progress;
      range.style.setProperty('--nfilm-progress', `${progress}%`);
      let buffered=0;
      if(duration && video.buffered.length){
        try { buffered=(video.buffered.end(video.buffered.length-1)/duration)*100; } catch(e){}
      }
      if(loaded) loaded.style.width=`${Math.min(100,buffered)}%`;
      time.textContent=`${formatNFilmPlayerTime(video.currentTime)} / ${formatNFilmPlayerTime(duration)}`;
    }

    function updateNFilmPlayerPlayIcon(){
      const video=document.getElementById('nfilm-player-video');
      const icon=document.getElementById('nfilm-player-play-icon');
      if(icon) icon.className=video && !video.paused ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    }

    function updateNFilmPlayerVolumeIcon(){
      const video=document.getElementById('nfilm-player-video');
      const icon=document.getElementById('nfilm-player-volume-icon');
      if(!icon || !video) return;
      icon.className=video.muted || video.volume===0 ? 'fa-solid fa-volume-xmark' : video.volume < .5 ? 'fa-solid fa-volume-low' : 'fa-solid fa-volume-high';
    }

    window.toggleNFilmPlayerPlay=function(e){
      e?.stopPropagation();
      const video=document.getElementById('nfilm-player-video'); if(!video)return;
      if(video.paused || video.ended) video.play().catch(()=>{}); else video.pause();
      updateNFilmPlayerPlayIcon();
    };

    window.seekNFilmPlayer=function(value){
      const video=document.getElementById('nfilm-player-video'); if(!video || !video.duration)return;
      video.currentTime=(Number(value)/100)*video.duration;
      updateNFilmPlayerTimeline();
    };

    window.toggleNFilmPlayerVolume=function(e){
      e?.stopPropagation();
      const wrap=document.getElementById('nfilm-player-volume-slider-wrap');
      const video=document.getElementById('nfilm-player-video');
      if(!video || !wrap)return;
      nFilmPlayerVolumeOpen=!nFilmPlayerVolumeOpen;
      wrap.classList.toggle('open',nFilmPlayerVolumeOpen);
      if(video.muted && video.volume>0) video.muted=false;
      updateNFilmPlayerVolumeIcon();
    };

    window.setNFilmPlayerVolume=function(value){
      const video=document.getElementById('nfilm-player-video'); if(!video)return;
      video.volume=Number(value); video.muted=video.volume===0;
      const slider=document.getElementById('nfilm-player-volume'); if(slider) slider.value=video.volume;
      updateNFilmPlayerVolumeIcon();
    };

    window.toggleNFilmPlayerEmbedVolume=function(e){
      e?.stopPropagation();
      // Cross-origin embeds cannot be given a universal volume API from the parent page.
      // Keep this control as a safe affordance without pretending to change the iframe audio.
      const icon=document.getElementById('nfilm-player-embed-volume-icon');
      if(icon) icon.className=icon.className.includes('volume-xmark') ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
    };

    window.toggleNFilmPlayerShift=function(e){
      e?.stopPropagation();
      const stage=document.getElementById('nfilm-player-stage');
      const btn=document.getElementById('nfilm-player-shift');
      if(!stage || !btn)return;
      // The arrow ONLY hides/shows the custom Cloudinary transport controls.
      // The video/player frame never slides horizontally or vertically.
      stage.classList.remove('player-shift-right');
      const hidden=stage.classList.toggle('player-controls-hidden');
      const icon=btn.querySelector('i');
      if(icon) icon.className=hidden?'fa-solid fa-chevron-up':'fa-solid fa-chevron-down';
      btn.title=hidden?'Show player controls':'Hide player controls';
      btn.setAttribute('aria-label',btn.title);
    };

    window.nFilmPlayerFullscreen=function(e){
      e?.stopPropagation();
      const video=document.getElementById('nfilm-player-video');
      if(video){
        if(document.fullscreenElement || document.webkitFullscreenElement){
          document.exitFullscreen?.().catch?.(()=>{});
          document.webkitExitFullscreen?.();
          return;
        }
        // Fullscreen the actual media and temporarily enable native browser video controls.
        // This gives the fullscreen view the normal media-player controls instead of fullscreening the webpage shell.
        video.controls=true;
        const clearNativeControls=()=>{
          if(!document.fullscreenElement && !document.webkitFullscreenElement){
            video.controls=false;
            document.removeEventListener('fullscreenchange',clearNativeControls);
            document.removeEventListener('webkitfullscreenchange',clearNativeControls);
          }
        };
        document.addEventListener('fullscreenchange',clearNativeControls);
        document.addEventListener('webkitfullscreenchange',clearNativeControls);
        if(video.requestFullscreen){ video.requestFullscreen().catch(()=>{ video.controls=false; }); return; }
        if(video.webkitEnterFullscreen){ video.webkitEnterFullscreen(); return; }
        if(video.webkitRequestFullscreen){ video.webkitRequestFullscreen().catch?.(()=>{ video.controls=false; }); return; }
      }
      const embed=document.querySelector('#nfilm-player-media .nfilm-player-embed');
      if(embed){
        if(embed.requestFullscreen) embed.requestFullscreen().catch(()=>{});
        else if(embed.webkitRequestFullscreen) embed.webkitRequestFullscreen();
      }
    };

    let activeNFilmReplyTargetId = null;

    function openNFilmAuthentication(){
      const overlay=document.getElementById('onboarding-overlay');
      if(!overlay) return;
      overlay.classList.remove('hidden','opacity-0');
      const confirm=document.getElementById('confirm-onboarding-modal');
      if(confirm) confirm.classList.add('pointer-events-none','opacity-0');
      renderOnboardingSelectionGrid();
      lockScroll();
    }
    window.openNFilmAuthentication=openNFilmAuthentication;

    function renderNFilmCommentsComposer(){
      const form=document.querySelector('#nfilm-comments-modal form');
      if(!form) return;
      if(!currentUser){
        form.innerHTML=`<div class="flex-1 text-xs font-bold text-red-400">You Are Not Authenticated</div><button type="button" onclick="openNFilmAuthentication()" class="px-3 py-2 rounded-full bg-white/10 text-white text-[11px] font-bold border border-white/10">Who am I?</button>`;
        return;
      }
      form.innerHTML=`<div id="nfilm-reply-indicator" class="hidden flex-1 items-center gap-2 text-[10px] text-white/55 px-3"><span>Replying to <b id="nfilm-reply-target" class="text-white"></b></span><button type="button" onclick="clearNFilmReply()" class="text-white/45 hover:text-white"><i class="fa-solid fa-xmark"></i></button></div><input id="nfilm-comment-input" type="text" placeholder="Write a comment..." class="flex-1 bg-white/[0.07] border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/20"><button type="submit" class="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center border border-white/10"><i class="fa-solid fa-paper-plane text-xs"></i></button>`;
    }

    function renderNFilmCommentsPopup(){
      const modal=document.getElementById('nfilm-comments-modal');
      const list=document.getElementById('nfilm-comments-list');
      const title=document.getElementById('nfilm-comments-title');
      if(!modal || !list || !activeNFilmPlayerItem)return;
      // Reuse the existing, fully-rendered comment system as the source of truth,
      // then place its visual content inside the N Film popup.
      const oldItems=activeGalleryItems, oldIndex=currentViewerIndex;
      activeGalleryItems=[activeNFilmPlayerItem]; currentViewerIndex=0;
      renderViewerCommentsTimeline();
      const source=document.getElementById('viewer-comments-timeline');
      list.innerHTML=source ? source.innerHTML : '';
      list.querySelectorAll('button[onclick*="initiateReplyThread"]').forEach(btn=>{
        const m=btn.getAttribute('onclick')?.match(/initiateReplyThread\('([^']*)'\s*,\s*'([^']*)'\)/);
        if(m) btn.setAttribute('onclick',`initiateNFilmReply('${m[1]}','${m[2]}')`);
      });
      list.querySelectorAll('button[onclick*="deleteSimulatedComment"]').forEach(btn=>{
        const raw=btn.getAttribute('onclick')||'';
        const m=raw.match(/deleteSimulatedComment\('([^']*)'\s*(?:,\s*'([^']*)')?\)/);
        if(m) btn.setAttribute('onclick',`deleteNFilmComment('${m[1]}',${m[2]?`'${m[2]}'`:'null'})`);
      });
      renderNFilmCommentsComposer();
      if(title) title.textContent=`Comments · ${getNFilmTitle(activeNFilmPlayerItem)}`;
      activeGalleryItems=oldItems; currentViewerIndex=oldIndex;
      modal.classList.remove('hidden','pointer-events-none','opacity-0','nfilm-popup-closing');
      modal.style.pointerEvents='auto';
      modal.style.visibility='visible';
      modal.style.display='flex';
      void modal.offsetWidth;
      modal.classList.add('nfilm-popup-opening');
      setTimeout(()=>modal.classList.remove('nfilm-popup-opening'),240);
    }

    window.submitNFilmComment=function(e){
      e?.preventDefault();
      if(!activeNFilmPlayerItem || !currentUser)return;
      const input=document.getElementById('nfilm-comment-input'); if(!input)return;
      const text=input.value.trim(); if(!text)return;
      const key=activeNFilmPlayerItem.filename;
      if(!simulatedCommentsDb[key])simulatedCommentsDb[key]=[];
      const commentId='local_'+Date.now();
      if(activeNFilmReplyTargetId){
        let parentAuthor='Classmate';
        const existing=simulatedCommentsDb[key].find(c=>c.id===activeNFilmReplyTargetId);
        if(existing) parentAuthor=existing.author;
        simulatedCommentsDb[key].push({id:commentId,type:'reply',parentId:activeNFilmReplyTargetId,parentAuthor,author:currentUser,text,date:'10-07-2026'});
      }else{
        simulatedCommentsDb[key].push({id:commentId,type:'comment',author:currentUser,text,date:'10-07-2026'});
      }
      safeStorage.setItem('scrapbook_comments_db',JSON.stringify(simulatedCommentsDb));
      input.value='';
      activeNFilmReplyTargetId=null;
      renderNFilmCommentsPopup();
    };

    window.initiateNFilmReply=function(commentId,author){
      if(!currentUser) return;
      activeNFilmReplyTargetId=commentId;
      const indicator=document.getElementById('nfilm-reply-indicator');
      const target=document.getElementById('nfilm-reply-target');
      const input=document.getElementById('nfilm-comment-input');
      if(indicator){indicator.classList.remove('hidden'); indicator.classList.add('flex');}
      if(target) target.textContent=author;
      if(input) input.focus();
    };
    window.clearNFilmReply=function(){ activeNFilmReplyTargetId=null; renderNFilmCommentsComposer(); const input=document.getElementById('nfilm-comment-input'); if(input) input.focus(); };
    window.deleteNFilmComment=function(parentId,replyId=null){
      if(!activeNFilmPlayerItem || !currentUser) return;
      const key=activeNFilmPlayerItem.filename;
      const rows=simulatedCommentsDb[key]||[];
      const target=rows.find(x=>x.id=== (replyId||parentId));
      if(!target) return;
      if(replyId){ if(target.type!=='reply' || target.author!==currentUser) return; }
      else { if(target.type!=='comment' || target.author!==currentUser) return; }
      simulatedCommentsDb[key]=replyId ? rows.filter(x=>x.id!==replyId) : rows.filter(x=>x.id!==parentId && x.parentId!==parentId);
      safeStorage.setItem('scrapbook_comments_db',JSON.stringify(simulatedCommentsDb));
      renderNFilmCommentsPopup();
    };

    window.openNFilmComments=function(e){
      e?.stopPropagation();
      renderNFilmCommentsPopup();
    };
    window.closeNFilmComments=function(e){
      e?.stopPropagation();
      activeNFilmReplyTargetId=null;
      const modal=document.getElementById('nfilm-comments-modal');
      if(modal){
        modal.classList.remove('nfilm-popup-opening');
        modal.classList.add('nfilm-popup-closing','pointer-events-none','opacity-0');
        modal.style.pointerEvents='none';
        setTimeout(()=>{ if(modal.classList.contains('nfilm-popup-closing')) { modal.style.display='none'; modal.style.visibility='hidden'; modal.classList.remove('nfilm-popup-closing'); } },220);
      }
    };

    window.openNFilmPlayer=function(item){
      // Embedded N Film videos may be stored as Cloudinary photo resources because
      // the actual video lives at the external `embed` URL. They still belong in
      // the dedicated N Film player, with the iframe providing its own controls.
      const isEmbedVideo = isNFilmEmbed(item);
      if(!item || (item.type!=='video' && !isEmbedVideo)) return;
      activeNFilmPlayerItem=item;
      activeGalleryItems=[item];
      // Ensure the dedicated player always has the dark N Film treatment,
      // including when opened directly rather than from the N Film album.
      document.body.classList.add('nfilm-theater-active');
      document.documentElement.classList.add('nfilm-theater-active');
      currentViewerIndex=0;
      const modal=document.getElementById('nfilm-player-modal');
      const stage=document.getElementById('nfilm-player-stage');
      const host=document.getElementById('nfilm-player-media');
      const title=document.getElementById('nfilm-player-title');
      const source=document.getElementById('nfilm-player-source');
      const external=document.getElementById('nfilm-player-watch-on');
      if(!modal || !stage || !host)return;
      // The N Film player must live at the document root. When it remains
      // inside an album/interface container, a transformed or positioned
      // ancestor can make `position:fixed` start below the header/content.
      // That leaves the black player backdrop covering only the lower part
      // of the page while the video itself is effectively outside the visible
      // player area. Mounting it on <body> guarantees a true full-viewport
      // N Film theater layer.
      if(modal.parentElement !== document.body){
        document.body.appendChild(modal);
      }
      modal.classList.remove('hidden','pointer-events-none','opacity-0');
      modal.style.display='flex';
      modal.style.visibility='visible';
      modal.style.pointerEvents='auto';
      modal.style.position='fixed';
      modal.style.inset='0';
      modal.style.width='100vw';
      modal.style.height='100vh';
      modal.style.zIndex='2147482000';
      stage.classList.remove('player-shift-right','player-controls-hidden','player-embed-mode');
      const shiftBtn=document.getElementById('nfilm-player-shift');
      const shiftIcon=shiftBtn?.querySelector('i');
      if(shiftIcon) shiftIcon.className='fa-solid fa-chevron-down';
      if(shiftBtn){
        shiftBtn.title='Hide player controls';
        shiftBtn.setAttribute('aria-label','Hide player controls');
      }
      // Never stack the N Film player over a previously opened regular viewer.
      // Finder results can open the regular image viewer, and if the user then
      // navigates Home -> N Film, that old viewer must not become the player's
      // background.
      const oldViewer=document.getElementById('media-viewer-modal');
      if(oldViewer && !oldViewer.classList.contains('opacity-0')) closeViewer();
      lockScroll();
      if(title) title.textContent=getNFilmTitle(item);
      if(source) source.textContent=formatNFilmFullDate(item);
      if(external){
        if(item.isEmbed){
          const app=getNFilmWatchApp(item); external.innerHTML=`<i class="fa-solid fa-arrow-up-right-from-square"></i><span>Watch on ${app}</span>`; external.classList.remove('hidden');
        } else { external.classList.add('hidden'); }
      }
      // Cloud controls are placed inside a frame that matches the video's actual 16:9 bounds.
      const cloudControls=document.getElementById('nfilm-player-cloud-controls');
      const embedControls=document.getElementById('nfilm-player-embed-controls');
      host.querySelectorAll('.nfilm-player-video-frame,.nfilm-player-video,.nfilm-player-embed').forEach(el=>el.remove());
      if(cloudControls && cloudControls.parentElement!==host) host.appendChild(cloudControls);
      if(embedControls && embedControls.parentElement!==host) host.appendChild(embedControls);
      if(item.isEmbed){
        // Embedded players already provide their own playback UI. Do not show
        // any of the N Film transport controls around the iframe.
        stage.classList.add('player-embed-mode');
        const iframe=document.createElement('iframe');
        iframe.src=item.embedUrl||item.url;
        iframe.title=String(getNFilmTitle(item));
        iframe.className='nfilm-player-embed';
        iframe.setAttribute('allow','autoplay; fullscreen; picture-in-picture');
        iframe.setAttribute('allowfullscreen','');
        host.insertBefore(iframe, cloudControls || embedControls || null);
        cloudControls?.classList.add('hidden');
        embedControls?.classList.remove('hidden');
      } else {
        const frame=document.createElement('div');
        frame.className='nfilm-player-video-frame';
        const video=document.createElement('video');
        video.id='nfilm-player-video';
        video.className='nfilm-player-video';
        video.src=item.url;
        video.setAttribute('playsinline','');
        video.setAttribute('webkit-playsinline','');
        video.preload='metadata';
        frame.appendChild(video);
        host.insertBefore(frame, embedControls || null);
        if(cloudControls) frame.appendChild(cloudControls);
        cloudControls?.classList.remove('hidden');
        embedControls?.classList.add('hidden');
        video.volume=1; video.muted=false;
        video.addEventListener('loadedmetadata',updateNFilmPlayerTimeline);
        video.addEventListener('timeupdate',updateNFilmPlayerTimeline);
        video.addEventListener('progress',updateNFilmPlayerTimeline);
        video.addEventListener('play',updateNFilmPlayerPlayIcon);
        video.addEventListener('pause',updateNFilmPlayerPlayIcon);
        video.addEventListener('ended',updateNFilmPlayerPlayIcon);
        video.play().catch(()=>{});
      }
      const share=document.getElementById('nfilm-player-share');
      if(share) share.classList.toggle('hidden',false);
      // Direct/pasted media links have no parent album to return to, so hide
      // the N Film player's Back button. Internal album navigation keeps it.
      const nfilmBackBtn = modal.querySelector('button[onclick*="closeNFilmPlayer"]');
      if(nfilmBackBtn) nfilmBackBtn.classList.toggle('hidden', !!directMediaRoute);
      const download=document.getElementById('nfilm-player-download');
      if(download) download.href=getDownloadUrl(item.url);
      modal.classList.remove('hidden','pointer-events-none','opacity-0');
      modal.style.display='flex'; modal.style.pointerEvents='auto';
      // N Film keeps its own player; don't invoke the old Cyzy media viewer.
      // When the player is opened from a direct share URL, preserve the
      // privacy segment that was actually in that URL. Do not replace a
      // pasted /public link with the item's stored /private setting.
      const shareKey = encodeURIComponent(getShareCloudinaryKey(item));
      const routePrivacy = directMediaRoute &&
        String(directMediaRoute.key) === String(shareKey) &&
        (directMediaRoute.privacy === 'public' || directMediaRoute.privacy === 'private')
          ? directMediaRoute.privacy
          : getMediaShareSettings(item).privacy;
      const route=`/album/${getShareAlbumSegment(item)}/video/${shareKey}/${routePrivacy}`;
      if(window.location.pathname!==route) history.pushState({directMedia:true,nfilm:true},'',route);
      directMediaRoute={year:String(getShareAlbumSegment(item)),type:'video',key:shareKey,privacy:routePrivacy};
    };

    window.closeNFilmPlayer=function(e,restoreUrl=true){
      e?.stopPropagation();
      const modal=document.getElementById('nfilm-player-modal');
      const video=document.getElementById('nfilm-player-video');
      if(video){
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
      // External embeds (Google Drive, etc.) keep playing while an iframe
      // remains in the DOM. Remove the iframe itself when closing so its
      // audio/video is actually terminated instead of continuing in the
      // background behind the album.
      const playerMedia=document.getElementById('nfilm-player-media');
      if(playerMedia){
        playerMedia.querySelectorAll('.nfilm-player-embed').forEach(frame=>{
          frame.src='about:blank';
          frame.remove();
        });
      }
      if(document.fullscreenElement || document.webkitFullscreenElement){
        document.exitFullscreen?.().catch?.(()=>{});
        document.webkitExitFullscreen?.();
      }
      if(modal){modal.classList.add('pointer-events-none','opacity-0'); modal.style.pointerEvents='none'; setTimeout(()=>{if(modal.classList.contains('opacity-0'))modal.style.display='none';},220);}
      const comments=document.getElementById('nfilm-comments-modal');
      if(comments){comments.classList.add('pointer-events-none','opacity-0');comments.style.pointerEvents='none';comments.style.display='none';}
      nFilmPlayerVolumeOpen=false;
      activeNFilmPlayerItem=null;
      currentViewerIndex=-1;
      if(restoreUrl && window.location.pathname.match(/^\/album\/[^/]+\/video\/[^/]+\/(public|private)\/?$/i)) history.replaceState({page:'nfilm'},'', '/album/nfilm');
      directMediaRoute=null;
      unlockScroll();
    };

    window.nFilmPlayerWatchOn=function(e){
      e?.stopPropagation();
      if(!activeNFilmPlayerItem?.isEmbed)return;
      const url=activeNFilmPlayerItem.embedUrl||activeNFilmPlayerItem.url; if(url)window.open(url,'_blank','noopener,noreferrer');
    };

    function openViewer(startIndex) {
      if (startIndex < 0 || startIndex >= activeGalleryItems.length) return;
      currentViewerIndex = startIndex;

      const mediaViewerModal = document.getElementById('media-viewer-modal');
      const viewerDate = document.getElementById('viewer-date');
      const viewerDownloadBtn = document.getElementById('viewer-download-btn');
      if (!viewerDate || !viewerDownloadBtn || !mediaViewerModal) return;

      // Keep the regular media viewer in the top-level document. The Finder
      // modal is also moved to <body>, and regular album/page containers can
      // have transforms/stacking contexts. If the viewer stays inside one of
      // those contexts, its URL can update correctly while the actual preview
      // is rendered underneath the page.
      if (mediaViewerModal.parentElement !== document.body) {
        document.body.appendChild(mediaViewerModal);
      }
      mediaViewerModal.classList.remove('hidden', 'pointer-events-none', 'opacity-0');
      mediaViewerModal.style.display = 'flex';
      mediaViewerModal.style.visibility = 'visible';
      mediaViewerModal.style.pointerEvents = 'auto';
      mediaViewerModal.style.zIndex = '2147482000';

      lockScroll();

      const mediaBox = document.getElementById('viewer-single-media-box');
      if (!mediaBox) return;

      const item = activeGalleryItems[startIndex];

      // Keep the browser address bar synchronized with the media currently
      // open in the viewer. The share key is the Cloudinary Public ID, so
      // the URL remains stable even when the original filename changes.
      const sharePrivacy = getMediaShareSettings(item).privacy;
      const mediaRoute = `/album/${getShareAlbumSegment(item)}/${getShareType(item)}/${encodeURIComponent(getShareCloudinaryKey(item))}/${sharePrivacy}`;
      const currentPath = window.location.pathname;
      if (currentPath !== mediaRoute) {
        history.pushState({ directMedia: true, fromViewer: true }, '', mediaRoute);
      }
      directMediaRoute = {
        year: String(getShareAlbumSegment(item)),
        type: getShareType(item),
        key: encodeURIComponent(getShareCloudinaryKey(item)),
        privacy: sharePrivacy
      };

      mediaBox.innerHTML = '';

      let resolvedQuote = "";
      if (item.cloudinaryContext && (item.cloudinaryContext.qoute || item.cloudinaryContext.quote)) {
        resolvedQuote = item.cloudinaryContext.qoute || item.cloudinaryContext.quote;
      }

      const attribution = (resolvedQuote && item.uploader) ? `— ${item.uploader}` : '';
      const assetUrl = localAssetMappings[item.filename] || item.url;

      if (item.isEmbed) {
        mediaBox.innerHTML = `
          <div class="relative w-full h-full flex items-center justify-center bg-black/10">
            <iframe src="${item.embedUrl || item.url}" title="${item.filename}" class="w-full h-full min-h-[60vh] rounded-lg border border-white/10 shadow-2xl bg-black" allow="autoplay; fullscreen" allowfullscreen loading="lazy"></iframe>
          </div>
        `;
      } else if (item.type === 'video') {
        mediaBox.innerHTML = `
          <div class="relative w-full h-full flex items-center justify-center">
            <video id="viewer-active-video" src="${assetUrl}" class="max-w-full max-h-full object-contain rounded-lg border border-white/10 shadow-2xl transition-all duration-300" muted loop playsinline="true" webkit-playsinline="true"></video>
          </div>
        `;
      } else {
        const autoZoomClass = isAutoZoomOn ? 'object-cover w-full h-full' : 'object-contain max-w-full max-h-full';
        mediaBox.innerHTML = `
          <div class="relative w-full h-full flex items-center justify-center">
            <img id="viewer-active-image" src="${get720pUrl(assetUrl)}" class="rounded-lg border border-white/10 shadow-2xl transition-all duration-300 ${autoZoomClass}" onerror="handleImageLoadError(this)">
            
            ${resolvedQuote ? `
              <div class="absolute bottom-0 left-0 right-0 p-6 pt-20 bg-gradient-to-t from-black/95 via-black/55 to-transparent text-left z-20 pointer-events-none rounded-b-lg flex flex-col justify-end pr-28 md:pr-36 max-w-full">
                <p class="font-cursive text-xl sm:text-2xl md:text-3xl font-bold leading-relaxed drop-shadow-lg text-amber-100 max-w-[85%] md:max-w-[75%]">
                  "${resolvedQuote}"
                </p>
                ${attribution ? `
                  <span class="font-sans text-[10px] sm:text-xs uppercase tracking-widest text-white/80 mt-2 font-extrabold block">${attribution}</span>
                ` : ''}
              </div>
            ` : ''}
          </div>
        `;
      }

      // Re-assert visibility after rebuilding the media contents. This also
      // clears any stale hidden state left by a previous navigation.
      mediaViewerModal.classList.remove('hidden', 'pointer-events-none', 'opacity-0');
      mediaViewerModal.style.display='flex';
      mediaViewerModal.style.visibility='visible';
      mediaViewerModal.style.pointerEvents='auto';
      mediaViewerModal.style.zIndex='2147482000';
      isCommentsVisible = window.innerWidth >= 768;

      onActiveFeedCardChange(startIndex);
      updateHeaderUI();
    }

    function onActiveFeedCardChange(index) {
      currentViewerIndex = index;
      const item = activeGalleryItems[index];
      if (!item) return;

      resetZoomState();
      clearActiveReplyTarget();

      const uploaderName = item.uploader || (item.owners.length > 0 ? item.owners[0] : 'Classmate');
      const uploaderPfp = document.getElementById('viewer-uploader-pfp-img');
      if (uploaderPfp) {
        uploaderPfp.src = CLASSMATE_PROFILES[uploaderName] || `https://placehold.co/150x150/FAF6EE/2C2520?text=${uploaderName[0]}`;
      }

      const formAvatar = document.getElementById('viewer-comment-form-avatar');
      if (formAvatar && currentUser) {
        formAvatar.src = CLASSMATE_PROFILES[currentUser] || `https://placehold.co/150x150/FAF6EE/2C2520?text=${currentUser[0]}`;
      }

      const uploaderContainer = document.getElementById('viewer-uploader');
      if (uploaderContainer) {
        if (item.uploader) {
          uploaderContainer.innerHTML = `
            <i class="fa-solid fa-cloud-arrow-up text-scrapbook-accent"></i>
            <span>Uploaded by <span class="text-stone-700 font-bold">${item.uploader}</span></span>
          `;
          uploaderContainer.classList.remove('hidden');
        } else {
          uploaderContainer.classList.add('hidden');
        }
      }

      const avatarsContainer = document.getElementById('viewer-owners-avatars');
      if (avatarsContainer) {
        let headsHtml = `<div class="flex -space-x-2 overflow-hidden py-1">`;
        item.owners.slice(0, 4).forEach(owner => {
          const pUrl = CLASSMATE_PROFILES[owner] || `https://placehold.co/150x150/FAF6EE/2C2520?text=${owner[0]}`;
          headsHtml += `
            <div onclick="tagClassmateInComment('${owner}')" class="w-8 h-8 rounded-full overflow-hidden border-2 border-[#FAF6EE] shadow-sm cursor-pointer" title="Tap to tag @${owner}">
              <img src="${pUrl}" alt="${owner}" class="w-full h-full object-cover" onerror="handleImageLoadError(this)">
            </div>
          `;
        });
        headsHtml += `</div>`;
        avatarsContainer.innerHTML = headsHtml;
      }

      const viewerDate = document.getElementById('viewer-date');
      const viewerDownloadBtn = document.getElementById('viewer-download-btn');
      if (viewerDate) viewerDate.innerHTML = `<i class="fa-regular fa-calendar-days mr-1"></i> ${item.date}`;
      if (viewerDownloadBtn) viewerDownloadBtn.href = getDownloadUrl(item.url);

      updateViewerFavoriteUI(item.filename);

      // Check offline stored state for viewer download button
      const viewDownloadBtn = document.getElementById('viewer-asset-download-btn');
      if (item.type === 'video' && !item.isEmbed) {
        if (viewDownloadBtn) viewDownloadBtn.classList.remove('hidden');
        const isStored = !!localAssetMappings[item.filename];
        const viewDownloadIcon = document.getElementById('viewer-asset-download-icon');
        if (viewDownloadIcon) {
          if (isStored) {
            viewDownloadIcon.className = "fa-solid fa-circle-check text-green-500 text-base";
          } else {
            viewDownloadIcon.className = "fa-solid fa-cloud-arrow-down text-base";
          }
        }
      } else {
        if (viewDownloadBtn) viewDownloadBtn.classList.add('hidden');
      }

      const activeVideo = document.getElementById('viewer-active-video');
      const controlsContainer = document.getElementById('media-controls-container');

      if (activeVideo && !item.isEmbed) {
        activeVideo.play().catch(() => {});
        const playIconSymbol = document.getElementById('custom-video-play-icon');
        if (playIconSymbol) playIconSymbol.className = "fa-solid fa-pause text-xs";
        if (controlsContainer) controlsContainer.classList.remove('hidden');

        activeVideo.removeEventListener('timeupdate', updateCustomVideoTrackTime);
        activeVideo.removeEventListener('loadedmetadata', initCustomVideoTrackLength);
        activeVideo.removeEventListener('ended', resetCustomVideoPlayIcon);

        activeVideo.addEventListener('timeupdate', updateCustomVideoTrackTime);
        activeVideo.addEventListener('loadedmetadata', initCustomVideoTrackLength);
        activeVideo.addEventListener('ended', resetCustomVideoPlayIcon);
      } else {
        if (controlsContainer) controlsContainer.classList.add('hidden');
      }

      const zoomBtn = document.getElementById('viewer-zoom-toggle-btn');
      const volumeBtn = document.getElementById('viewer-volume-btn');
      const volumeSlider = document.getElementById('viewer-volume-slider');

      if (item.type === 'image' || item.isEmbed) {
        if (zoomBtn) {
          zoomBtn.classList.remove('hidden');
          const zoomIcon = document.getElementById('viewer-zoom-toggle-icon');
          if (zoomIcon) {
            zoomIcon.className = isAutoZoomOn ? "fa-solid fa-compress text-base text-scrapbook-accent animate-pulse" : "fa-solid fa-maximize text-base text-white";
          }
        }
        if (volumeBtn) volumeBtn.classList.add('hidden');
        if (volumeSlider) volumeSlider.classList.add('hidden');
      } else {
        if (zoomBtn) zoomBtn.classList.add('hidden');
        if (volumeBtn) volumeBtn.classList.remove('hidden');
        
        if (activeVideo && volumeSlider) {
          activeVideo.muted = false;
          volumeSlider.value = activeVideo.volume;
          const pct = activeVideo.volume * 100;
          volumeSlider.style.background = `linear-gradient(to right, #86efac 0%, #86efac ${pct}%, rgba(255, 255, 255, 0.2) ${pct}%, rgba(255, 255, 255, 0.2) 100%)`;
          updateVolumeIcon(activeVideo.volume);
        }
      }

      renderViewerCommentsTimeline();
      applyCommentsVisibility();
    }

    window.toggleCustomVideoPlay = function() {
      const video = document.getElementById('viewer-active-video');
      const icon = document.getElementById('custom-video-play-icon');
      if (!video || !icon) return;

      if (video.paused || video.ended) {
        video.play();
        icon.className = "fa-solid fa-pause text-xs";
      } else {
        video.pause();
        icon.className = "fa-solid fa-play ml-0.5 text-xs";
      }
    };

    window.seekCustomVideo = function(val) {
      const video = document.getElementById('viewer-active-video');
      const timeline = document.getElementById('custom-video-timeline');
      if (!video || !video.duration) return;
      video.currentTime = (val / 100) * video.duration;
      if (timeline) {
        timeline.style.background = `linear-gradient(to right, #86efac 0%, #86efac ${val}%, rgba(255, 255, 255, 0.2) ${val}%, rgba(255, 255, 255, 0.2) 100%)`;
      }
    };

    function updateCustomVideoTrackTime() {
      const video = document.getElementById('viewer-active-video');
      const timeline = document.getElementById('custom-video-timeline');
      const stamp = document.getElementById('custom-video-timestamp');
      if (!video || !timeline || !stamp || isNaN(video.duration)) return;

      const progress = (video.currentTime / video.duration) * 100;
      timeline.value = progress;
      timeline.style.background = `linear-gradient(to right, #86efac 0%, #86efac ${progress}%, rgba(255, 255, 255, 0.2) ${progress}%, rgba(255, 255, 255, 0.2) 100%)`;
      stamp.textContent = `${formatVideoTime(video.currentTime)} / ${formatVideoTime(video.duration)}`;
    }

    function initCustomVideoTrackLength() {
      const video = document.getElementById('viewer-active-video');
      const stamp = document.getElementById('custom-video-timestamp');
      const timeline = document.getElementById('custom-video-timeline');
      if (!video || !stamp) return;
      stamp.textContent = `0:00 / ${formatVideoTime(video.duration)}`;
      if (timeline) {
        timeline.value = 0;
        timeline.style.background = `linear-gradient(to right, #86efac 0%, #86efac 0%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.2) 100%)`;
      }
    }

    function resetCustomVideoPlayIcon() {
      const playIcon = document.getElementById('custom-video-play-icon');
      if (playIcon) playIcon.className = "fa-solid fa-play ml-0.5 text-xs";
    }

    function formatVideoTime(seconds) {
      if (isNaN(seconds)) return "0:00";
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    window.toggleActiveViewerFullscreen = function() {
      if (currentViewerIndex < 0) return;
      toggleViewerFullscreen(true);
    };

    window.tagClassmateInComment = function(name) {
      const input = document.getElementById('comment-input-field');
      if (!input) return;

      const val = input.value.trim();
      if (val === "") {
        input.value = `@${name} `;
      } else {
        input.value = `${input.value.trim()} @${name} `;
      }
      input.focus();
    };

    window.handleCommentInputTyping = function(text) {
      const dropdown = document.getElementById('autocomplete-tagging-dropdown');
      if (!dropdown) return;

      const cursorPosition = document.getElementById('comment-input-field').selectionStart;
      const textBeforeCursor = text.substring(0, cursorPosition);
      const words = textBeforeCursor.split(/\s+/);
      const lastWord = words[words.length - 1];

      if (lastWord.startsWith('@')) {
        const query = lastWord.substring(1).toLowerCase();
        let matches = CLASSMATE_NAMES.filter(name => name.toLowerCase().includes(query));

        if (matches.length > 0) {
          dropdown.innerHTML = '';
          matches.forEach(item => {
            const pfpUrl = CLASSMATE_PROFILES[item];
            const optionRow = document.createElement('button');
            optionRow.className = "w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-scrapbook-paper transition-all font-sans text-xs font-bold text-scrapbook-ink";
            optionRow.type = "button";
            optionRow.innerHTML = `
              <div class="w-6 h-6 rounded-full overflow-hidden border border-scrapbook-accent/30 bg-[#FAF6EE] flex-shrink-0">
                <img src="${pfpUrl}" alt="${item}" class="w-full h-full object-cover">
              </div>
              <span>@${item}</span>
            `;
            optionRow.onclick = (e) => {
              e.preventDefault();
              applyAutocompleteSelection(item, lastWord);
            };
            dropdown.appendChild(optionRow);
          });
          dropdown.classList.remove('hidden');
        } else {
          dropdown.classList.add('hidden');
        }
      } else {
        dropdown.classList.add('hidden');
      }
    };

    function applyAutocompleteSelection(name, lastWordToken) {
      const input = document.getElementById('comment-input-field');
      if (!input) return;

      const cursorPosition = input.selectionStart;
      const text = input.value;
      const beforeToken = text.substring(0, cursorPosition - lastWordToken.length);
      const afterCursor = text.substring(cursorPosition);

      input.value = `${beforeToken}@${name} ${afterCursor}`;
      input.focus();
      document.getElementById('autocomplete-tagging-dropdown').classList.add('hidden');
    }
  


    function renderViewerCommentsTimeline() {
      const timeline = document.getElementById('viewer-comments-timeline');
      if (!timeline || currentViewerIndex < 0) return;

      timeline.innerHTML = '';
      const item = activeGalleryItems[currentViewerIndex];
      const fallbackDate = parseImageDateToDMY(item.date);

      const commentsPool = {};
      const repliesPool = [];
      const ctx = item.cloudinaryContext || {};

      for (const [key, value] of Object.entries(ctx)) {
        if (key.startsWith('comment') && key.endsWith('ID')) {
          const author = key.substring(7, key.length - 2);
          const normalizedAuthor = CLASSMATE_NAMES.find(c => c.toLowerCase() === author.toLowerCase()) || author;
          commentsPool[key] = {
            id: key,
            author: normalizedAuthor,
            text: value,
            isLocal: false,
            date: fallbackDate,
            replies: []
          };
        } else if (key.includes('IDrepliedto') && key.endsWith('ID')) {
          const tokens = key.split('IDrepliedto');
          if (tokens.length === 2) {
            const replier = tokens[0];
            const parentBase = tokens[1].replace(/ID$/, ''); 
            const normalizedReplier = CLASSMATE_NAMES.find(c => c.toLowerCase() === replier.toLowerCase()) || replier;
            const normalizedParent = CLASSMATE_NAMES.find(c => c.toLowerCase() === parentBase.toLowerCase()) || parentBase;
            
            repliesPool.push({
              id: key,
              replier: normalizedReplier,
              parentAuthor: normalizedParent,
              parentCommentId: null,
              text: value,
              isLocal: false,
              date: fallbackDate
            });
          }
        }
      }

      const localKey = item.filename;
      if (simulatedCommentsDb[localKey]) {
        simulatedCommentsDb[localKey].forEach(comment => {
          if (comment.type === 'reply') {
            repliesPool.push({
              id: comment.id,
              replier: comment.author,
              parentAuthor: comment.parentAuthor,
              parentCommentId: comment.parentId,
              text: comment.text,
              isLocal: true,
              date: comment.date || fallbackDate
            });
          } else {
            commentsPool[comment.id] = {
              id: comment.id,
              author: comment.author,
              text: comment.text,
              isLocal: true,
              date: comment.date || fallbackDate,
              replies: []
            };
          }
        });
      }

      repliesPool.forEach(reply => {
        let matchedParent = null;
        if (reply.parentCommentId) {
          matchedParent = commentsPool[reply.parentCommentId];
        } else {
          matchedParent = Object.values(commentsPool).find(c => c.author.toLowerCase() === reply.parentAuthor.toLowerCase());
        }

        if (matchedParent) {
          matchedParent.replies.push(reply);
        } else {
          commentsPool[reply.id] = {
            id: reply.id,
            author: reply.replier,
            text: reply.text,
            isLocal: reply.isLocal,
            date: reply.date || fallbackDate,
            replies: []
          };
        }
      });

      const commentsArray = Object.values(commentsPool);
      if (commentsArray.length === 0) {
        timeline.innerHTML = `
          <div class="text-center py-10 text-scrapbook-ink/40">
            <i class="fa-regular fa-comments text-3xl mb-2 block opacity-30"></i>
            <p class="text-xs">No comments yet.</p>
          </div>
        `;
        return;
      }

      commentsArray.forEach(comment => {
        const pfpUrl = CLASSMATE_PROFILES[comment.author] || `https://placehold.co/150x150/FAF6EE/2C2520?text=${comment.author[0]}`;
        const canDeleteComment = comment.isLocal && comment.author === currentUser;
        const commentDate = comment.date || fallbackDate;
        const commentBlock = document.createElement('div');
        commentBlock.className = "flex items-start gap-2.5 group/comment animate-fade-in";
        
        let repliesHtml = "";
        comment.replies.forEach(reply => {
          const replyPfpUrl = CLASSMATE_PROFILES[reply.replier] || `https://placehold.co/150x150/FAF6EE/2C2520?text=${reply.replier[0]}`;
          const canDeleteReply = reply.isLocal && reply.replier === currentUser;
          const formattedReplyText = parseCommentTagsHtml(reply.text);
          const replyDate = reply.date || fallbackDate;

          repliesHtml += `
            <div class="flex items-start gap-2.5 mt-3 pl-6 border-l border-scrapbook-accent/15 group/reply">
              <div class="w-6 h-6 rounded-full overflow-hidden border border-scrapbook-accent/20 flex-shrink-0">
                <img src="${replyPfpUrl}" alt="${reply.replier}" class="w-full h-full object-cover" onerror="handleImageLoadError(this)">
              </div>
              <div class="flex-1">
                <div class="bg-scrapbook-paper/90 p-2.5 rounded-2xl relative">
                  <p class="text-xs font-bold text-scrapbook-ink mb-0.5">@${reply.replier}</p>
                  <p class="text-xs text-scrapbook-ink/80 leading-normal">${formattedReplyText}</p>
                  ${canDeleteReply ? `
                    <button onclick="deleteSimulatedComment('${comment.id}', '${reply.id}')" class="absolute right-2 top-2 text-[10px] text-scrapbook-ink/40 hover:text-scrapbook-rose opacity-0 group-hover/reply:opacity-100 transition-opacity" title="Delete Reply"><i class="fa-solid fa-trash"></i></button>
                  ` : ''}
                </div>
                <div class="flex items-center gap-3 mt-1 ml-2.5 mb-1 text-[10px] text-scrapbook-ink/50">
                  <span>${replyDate}</span>
                  <button onclick="initiateReplyThread('${comment.id}', '${reply.replier}')" class="text-scrapbook-accent font-bold hover:underline"><i class="fa-solid fa-reply"></i> Reply</button>
                </div>
              </div>
            </div>
          `;
        });

        const formattedCommentText = parseCommentTagsHtml(comment.text);

        commentBlock.innerHTML = `
          <div class="w-8 h-8 rounded-full overflow-hidden border border-scrapbook-accent/30 flex-shrink-0">
            <img src="${pfpUrl}" alt="${comment.author}" class="w-full h-full object-cover" onerror="handleImageLoadError(this)">
          </div>
          <div class="flex-1">
            <div class="bg-scrapbook-paper/40 p-3 rounded-2xl relative">
              <p class="text-xs font-bold text-scrapbook-ink mb-0.5">@${comment.author}</p>
              <p class="text-xs text-scrapbook-ink/80 leading-normal">${formattedCommentText}</p>
              ${canDeleteComment ? `
                <button onclick="deleteSimulatedComment('${comment.id}')" class="absolute right-3 top-3 text-[11px] text-scrapbook-ink/40 hover:text-scrapbook-rose opacity-0 group-hover/comment:opacity-100 transition-opacity" title="Delete Comment"><i class="fa-solid fa-trash"></i></button>
              ` : ''}
            </div>
            <div class="flex items-center gap-3 mt-1 ml-3 mb-2 text-[10px] text-scrapbook-ink/50">
              <span>${commentDate}</span>
              <button onclick="initiateReplyThread('${comment.id}', '${comment.author}')" class="text-scrapbook-accent font-bold hover:underline"><i class="fa-solid fa-reply text-[8px]"></i> Reply</button>
            </div>
            <div class="space-y-2">${repliesHtml}</div>
          </div>
        `;
        timeline.appendChild(commentBlock);
      });
    }

    function parseCommentTagsHtml(rawText) {
      if (!rawText) return "";
      return rawText.replace(/@([A-Za-z]+)/g, (match, tagToken) => {
        const query = tagToken.toLowerCase();
        const foundClassmate = CLASSMATE_NAMES.find(c => c.toLowerCase() === query);
        if (foundClassmate) {
          return `<strong class="text-scrapbook-accent font-bold hover:underline cursor-pointer" onclick="filterByClassmate('${foundClassmate}'); closeViewer();">@${foundClassmate}</strong>`;
        }
        return match; 
      });
    }

    window.submitNewComment = function(e) {
      if (e) e.preventDefault();
      const input = document.getElementById('comment-input-field');
      if (!input || !currentUser || currentViewerIndex < 0) return;

      const text = input.value.trim();
      if (!text) return;

      const item = activeGalleryItems[currentViewerIndex];
      const key = item.filename;

      if (!simulatedCommentsDb[key]) simulatedCommentsDb[key] = [];

      const commentId = 'local_' + Date.now();
      if (activeReplyTargetId) {
        const parentComment = simulatedCommentsDb[key].find(c => c.id === activeReplyTargetId);
        const itemCtx = item.cloudinaryContext || {};
        let parentAuthor = "Classmate";
        if (parentComment) {
          parentAuthor = parentComment.author;
        } else if (itemCtx[activeReplyTargetId]) {
          parentAuthor = activeReplyTargetId.substring(7, activeReplyTargetId.length - 2);
        }

        simulatedCommentsDb[key].push({
          id: commentId,
          type: 'reply',
          parentId: activeReplyTargetId,
          parentAuthor: parentAuthor,
          author: currentUser,
          text: text,
          date: "10-07-2026"
        });
      } else {
        simulatedCommentsDb[key].push({
          id: commentId,
          type: 'comment',
          author: currentUser,
          text: text,
          date: "10-07-2026"
        });
      }

      safeStorage.setItem('scrapbook_comments_db', JSON.stringify(simulatedCommentsDb));
      input.value = '';
      clearActiveReplyTarget();
      renderViewerCommentsTimeline();
    };

    window.initiateReplyThread = function(commentId, author) {
      activeReplyTargetId = commentId;
      const indicator = document.getElementById('reply-metadata-indicator');
      const targetUser = document.getElementById('reply-target-username');
      const input = document.getElementById('comment-input-field');

      if (indicator && targetUser && input) {
        targetUser.textContent = author;
        indicator.classList.remove('hidden');
        input.focus();
      }
    };

    window.clearActiveReplyTarget = function() {
      activeReplyTargetId = null;
      const indicator = document.getElementById('reply-metadata-indicator');
      if (indicator) indicator.classList.add('hidden');
    };

    window.deleteSimulatedComment = function(parentId, replyId = null) {
      if (currentViewerIndex < 0) return;
      const item = activeGalleryItems[currentViewerIndex];
      const key = item.filename;

      if (!simulatedCommentsDb[key]) return;

      if (replyId) {
        simulatedCommentsDb[key] = simulatedCommentsDb[key].filter(r => r.id !== replyId);
      } else {
        simulatedCommentsDb[key] = simulatedCommentsDb[key].filter(c => c.id !== parentId && c.parentId !== parentId);
      }

      safeStorage.setItem('scrapbook_comments_db', JSON.stringify(simulatedCommentsDb));
      renderViewerCommentsTimeline();
    };
  


    window.toggleViewerFullscreen = function(enable) {
      const overlay = document.getElementById('viewer-fullscreen-overlay');
      const activeVideo = document.getElementById('viewer-active-video');

      if (!overlay || currentViewerIndex < 0) return;
      const item = activeGalleryItems[currentViewerIndex];
      const assetUrl = localAssetMappings[item.filename] || item.url;

      if (enable) {
        fsScale = 1;
        fsPanX = 0;
        fsPanY = 0;

        if (item.type === 'video' && !item.isEmbed && activeVideo) {
          const currentPlayhead = activeVideo.currentTime;
          activeVideo.pause();

          const tempContainer = document.getElementById('fullscreen-viewport');
          if (tempContainer) {
            tempContainer.innerHTML = '';
            const video = document.createElement('video');
            video.src = assetUrl;
            video.controls = true;
            video.autoplay = true;
            video.className = "max-w-full max-h-screen object-contain";
            video.addEventListener('loadedmetadata', () => {
              video.currentTime = currentPlayhead;
            });
            tempContainer.appendChild(video);
          }
        } else {
          const tempContainer = document.getElementById('fullscreen-viewport');
          if (tempContainer) {
            tempContainer.innerHTML = `
              <img id="viewer-fullscreen-img" class="max-w-full max-h-full object-contain pointer-events-none transition-transform duration-75 origin-center" src="${get720pUrl(assetUrl)}" onerror="handleImageLoadError(this)">
            `;
          }
        }
        overlay.classList.remove('hidden');
        updateFullscreenTransform();
      } else {
        if (item.type === 'video' && !item.isEmbed) {
          const tempContainer = document.getElementById('fullscreen-viewport');
          const fsVideo = tempContainer ? tempContainer.querySelector('video') : null;
          if (fsVideo) {
            fsVideo.pause();
            if (activeVideo) {
              activeVideo.currentTime = fsVideo.currentTime;
              activeVideo.play();
            }
          }
        }
        overlay.classList.add('hidden');
      }
    };

    window.adjustFullscreenZoom = function(factor) {
      const oldScale = fsScale;
      fsScale = Math.max(1, Math.min(fsScale + factor, 8));
      if (fsScale === 1) {
        fsPanX = 0;
        fsPanY = 0;
      } else {
        fsPanX = fsPanX * (fsScale / oldScale);
        fsPanY = fsPanY * (fsScale / oldScale);
      }
      updateFullscreenTransform();
    };

    function updateFullscreenTransform() {
      const img = document.getElementById('viewer-fullscreen-img');
      if (img) img.style.transform = `translate(${fsPanX}px, ${fsPanY}px) scale(${fsScale})`;
    }

    function toggleViewerFavorite() {
      if (isDumpMode) return;
      if (currentViewerIndex < 0) return;
      const item = activeGalleryItems[currentViewerIndex];
      toggleFavorite(item.filename);
      updateViewerFavoriteUI(item.filename);
    }

    function updateViewerFavoriteUI(filename) {
      const viewerFavIcon = document.getElementById('viewer-fav-icon');
      const viewerFavBtn = document.getElementById('viewer-fav-btn');
      if (!viewerFavIcon || !viewerFavBtn) return;

      const isFav = favoritesList.includes(filename);
      if (isFav) {
        viewerFavIcon.className = "fa-solid fa-heart text-scrapbook-rose text-lg animate-bounce";
        viewerFavBtn.classList.add('ring-2', 'ring-scrapbook-rose/50');
      } else {
        viewerFavIcon.className = "fa-regular fa-heart text-lg";
        viewerFavBtn.classList.remove('ring-2', 'ring-scrapbook-rose/50');
      }
    }

    function closeViewer() {
      const mediaViewerModal = document.getElementById('media-viewer-modal');
      if (!mediaViewerModal) return;
      
      const mediaBox = document.getElementById('viewer-single-media-box');
      if (mediaBox) {
        const video = mediaBox.querySelector('video');
        if (video) video.pause();
        mediaBox.innerHTML = ''; 
      }
      
      const sliderContainer = document.getElementById('volume-slider-container');
      if (sliderContainer) {
        sliderContainer.className = "w-0 overflow-hidden transition-all duration-300 ease-in-out flex items-center";
      }

      // Fully deactivate the viewer when closing.  It is intentionally moved
      // to <body> when opened, so leaving it mounted as a flex element can
      // leave a top-level overlay/stacking layer behind even when it is faded
      // out.  Hide it completely and explicitly disable interaction.
      mediaViewerModal.classList.add('pointer-events-none', 'opacity-0', 'hidden');
      mediaViewerModal.style.pointerEvents = 'none';
      mediaViewerModal.style.visibility = 'hidden';
      mediaViewerModal.style.display = 'none';
      setDirectRouteChrome(false, false);

      // Opening a media item creates its own browser-history entry. When the
      // viewer is closed from inside the album, return the address bar to the
      // album URL instead of leaving the media route behind.
      if (directMediaRoute && window.location.pathname.match(/^\/album\/[^/]+\/(photo|video)\/[^/]+\/(public|private)\/?$/i)) {
        const year = directMediaRoute.year;
        history.replaceState({ page: 'album-year', year: Number(year) }, '', `/album/${encodeURIComponent(year)}`);
      }
      directMediaRoute = null;
      currentViewerIndex = -1;
      resetZoomState();

      unlockScroll();
      updateHeaderUI();
    }
  


    function showAllOwnersPopup(encodedOwners) {
      const ownersPopupList = document.getElementById('owners-popup-list');
      const ownersPopupModal = document.getElementById('owners-popup-modal');
      if (!ownersPopupList || !ownersPopupModal) return;

      const owners = JSON.parse(decodeURIComponent(encodedOwners));
      ownersPopupList.innerHTML = '';

      owners.forEach(name => {
        const pUrl = CLASSMATE_PROFILES[name] || `https://placehold.co/150x150/FAF6EE/2C2520?text=${name[0]}`;
        const row = document.createElement('div');
        row.className = "flex items-center space-x-3 p-3 rounded-lg bg-white border border-[#D4A373]/20 hover:border-scrapbook-ink hover:bg-scrapbook-paper transition-all cursor-pointer shadow-sm active:scale-95";
        row.innerHTML = `
          <div class="w-8 h-8 rounded-full overflow-hidden border border-[#D4A373]/40">
            <img src="${pUrl}" class="w-full h-full object-cover" onerror="handleImageLoadError(this)">
          </div>
          <span class="text-xs font-bold text-scrapbook-ink flex-1">@${name}</span>
          <i class="fa-solid fa-chevron-right text-[10px] text-scrapbook-ink/40"></i>
        `;
        row.addEventListener('click', () => {
          filterByClassmate(name);
          closeOwnersPopup();
        });
        ownersPopupList.appendChild(row);
      });

      ownersPopupModal.classList.remove('pointer-events-none', 'opacity-0');
      lockScroll();
    }

    function closeOwnersPopup() {
      const ownersPopupModal = document.getElementById('owners-popup-modal');
      if (ownersPopupModal) ownersPopupModal.classList.add('pointer-events-none', 'opacity-0');
      unlockScroll();
    }

    window.toggleVolumeSlider = function(e) {
      if (e) e.stopPropagation();
      const container = document.getElementById('volume-slider-container');
      if (container) {
        if (container.classList.contains('w-0')) {
          container.classList.remove('w-0');
          container.classList.add('w-16', 'ml-2.5');
        } else {
          container.classList.remove('w-16', 'ml-2.5');
          container.classList.add('w-0');
        }
      }
    };

    window.setVideoVolume = function(val) {
      const video = document.getElementById('viewer-active-video');
      const slider = document.getElementById('viewer-volume-slider');
      if (video) {
        video.volume = val;
        video.muted = (val === '0');
        updateVolumeIcon(val);
      }
      if (slider) {
        const pct = val * 100;
        slider.style.background = `linear-gradient(to right, #86efac 0%, #86efac ${pct}%, rgba(255, 255, 255, 0.2) ${pct}%, rgba(255, 255, 255, 0.2) 100%)`;
      }
    };

    function updateVolumeIcon(volume) {
      const icon = document.getElementById('viewer-volume-icon');
      if (!icon) return;
      if (volume == 0) {
        icon.className = "fa-solid fa-volume-mute text-xs text-white";
      } else if (volume < 0.5) {
        icon.className = "fa-solid fa-volume-low text-xs text-white";
      } else {
        icon.className = "fa-solid fa-volume-high text-xs text-white";
      }
    }

    window.toggleCommentsVisibility = function(e) {
      if (e) e.stopPropagation();
      isCommentsVisible = !isCommentsVisible;
      applyCommentsVisibility();
    };

    // Open the access/share controls for the media currently shown in the viewer.
    // This button intentionally sits directly below the Comments toggle in the viewer controls.
    window.openShareAccessModalFromViewer = function(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      const item = (currentViewerIndex >= 0 && activeGalleryItems)
        ? activeGalleryItems[currentViewerIndex]
        : null;
      if (!item) return;
      openShareAccessModal(item);
    };

    window.applyCommentsVisibility = function() {
      const rightPane = document.getElementById('viewer-discussion-pane');
      const leftPane = document.getElementById('viewer-media-pane');
      const card = document.getElementById('media-viewer-modal');
      const toggleButtons = document.querySelectorAll('.viewer-comment-toggle-btn-class');

      if (!rightPane || !leftPane || !card) return;
      const isMobile = window.innerWidth < 768;

      if (isCommentsVisible) {
        rightPane.classList.remove('hidden');
        rightPane.classList.add('flex');
        
        if (isMobile) {
          leftPane.classList.remove('h-full');
          leftPane.classList.add('h-[45vh]');
          leftPane.style.width = '100%';
          card.classList.remove('overflow-hidden');
          card.classList.add('overflow-y-auto');
        } else {
          leftPane.classList.remove('md:w-full');
          leftPane.classList.add('md:w-3/5');
          leftPane.style.height = '100%';
          card.classList.remove('overflow-y-auto');
          card.classList.add('overflow-hidden');
        }

        toggleButtons.forEach(btn => {
          btn.classList.add('bg-scrapbook-accent', 'text-[#FAF6EE]', 'ring-2', 'ring-scrapbook-accent/40');
        });
      } else {
        rightPane.classList.add('hidden');
        rightPane.classList.remove('flex');

        if (isMobile) {
          leftPane.classList.remove('h-[45vh]');
          leftPane.classList.add('h-full');
          leftPane.style.width = '100%';
          card.classList.remove('overflow-y-auto');
          card.classList.add('overflow-hidden');
        } else {
          leftPane.classList.remove('md:w-3/5');
          leftPane.classList.add('md:w-full');
          leftPane.style.height = '100%';
          card.classList.remove('overflow-y-auto');
          card.classList.add('overflow-hidden');
        }

        toggleButtons.forEach(btn => {
          btn.classList.remove('bg-scrapbook-accent', 'text-[#FAF6EE]', 'ring-2', 'ring-scrapbook-accent/40');
        });
      }
    };

    window.toggleAutoZoom = function(e) {
      if (e) e.stopPropagation();
      isAutoZoomOn = !isAutoZoomOn;
      safeStorage.setItem('scrapbook_auto_zoom', isAutoZoomOn);

      const zoomBtn = document.getElementById('viewer-zoom-toggle-btn');
      const zoomIcon = document.getElementById('viewer-zoom-toggle-icon');
      if (zoomBtn && zoomIcon) {
        zoomIcon.className = isAutoZoomOn 
          ? "fa-solid fa-compress text-base text-scrapbook-accent animate-pulse" 
          : "fa-solid fa-maximize text-base text-white";
      }

      const img = document.getElementById('viewer-active-image');
      if (img) {
        if (isAutoZoomOn) {
          img.className = "rounded-lg border border-white/10 shadow-2xl transition-all duration-300 object-cover w-full h-full";
        } else {
          img.className = "rounded-lg border border-white/10 shadow-2xl transition-all duration-300 object-contain max-w-full max-h-full";
        }
      }
    };

    window.goToUploaderProfile = function() {
      if (currentViewerIndex < 0) return;
      const item = activeGalleryItems[currentViewerIndex];
      const uploaderName = item.uploader || (item.owners.length > 0 ? item.owners[0] : null);
      if (uploaderName) {
        filterByClassmate(uploaderName);
        closeViewer();
      }
    };
  


    const NAV_DEFS = {
      home: [
        ['home','fa-house','Home'], ['finder','fa-compass','Finder'], ['classmates','fa-users','Classmates'], ['assets','fa-box-archive','Archives']
      ],
      album: [
        ['album-all','fa-border-all','All'], ['album-photos','fa-image','Photos'], ['album-videos','fa-film','Videos'], ['album-favorites','fa-star','Favorites']
      ],
      nfilm: [
        ['nfilm-all','fa-border-all','All'], ['nfilm-trailers','fa-clapperboard','Trailers'], ['nfilm-films','fa-film','Films'], ['nfilm-bts','fa-video','Behind The Scenes'], ['nfilm-cgi','fa-cubes','CGI Breakdown']
      ],
      ownProfile: [
        ['profile-all','fa-border-all','All Media'], ['profile-photos','fa-image','Photos'], ['profile-videos','fa-film','Videos'], ['profile-uploads','fa-cloud-arrow-up','Uploads'], ['profile-favorites','fa-star','Favorites'], ['profile-pending','fa-clock','Pending Approval']
      ],
      otherProfile: [
        ['profile-all','fa-border-all','All Media'], ['profile-photos','fa-image','Photos'], ['profile-videos','fa-film','Videos'], ['profile-uploads','fa-cloud-arrow-up','Uploads']
      ]
    };

    function getNavigationContext(){
      if(window.nFilmAlbumActive) return 'nfilm';
      if(activeProfileClassmate) return (currentUser && activeProfileClassmate === currentUser) ? 'ownProfile' : 'otherProfile';
      if(activeYearFilter) return 'album';
      return 'home';
    }
    function navButtonIsSelected(id, context){
      if(context==='home') return id==='home';
      if(context==='album') return id === `album-${activeCategory === 'all' ? 'all' : activeCategory}`;
      if(context==='nfilm') return id === `nfilm-${activeNFilmCategory === 'all' ? 'all' : activeNFilmCategory}`;
      if(context==='ownProfile' || context==='otherProfile') return id === `profile-${activeProfileTab}`;
      return false;
    }
    function renderContextTabs(preferredId=null){
      const host=document.getElementById('context-tab-list');
      const bar=document.getElementById('bottom-tab-bar');
      if(!host || !bar) return;
      const context=getNavigationContext();
      const defs=NAV_DEFS[context] || NAV_DEFS.home;
      host.innerHTML='';
      defs.forEach(([id,icon,label])=>{
        const btn=document.createElement('button');
        btn.type='button';
        btn.dataset.navId=id;
        btn.className='context-tab-btn relative flex flex-col items-center justify-center min-w-[48px] md:min-w-[60px] px-2 py-1 text-scrapbook-ink/60 focus:outline-none transition-all duration-200 hover:scale-105 active:scale-90';
        btn.innerHTML=`<i class="fa-solid ${icon} text-base md:text-lg"></i><span class="mt-0.5 text-[9px] md:text-[10px] font-bold leading-none">${label}</span>`;
        const selected=preferredId===id || (!preferredId && navButtonIsSelected(id,context));
        if(selected){btn.classList.remove('text-scrapbook-ink/60');btn.classList.add('text-scrapbook-ink','active');}
        btn.onclick=()=>handleContextTab(id,btn);
        host.appendChild(btn);
      });
      const selected=host.querySelector('.active') || host.firstElementChild;
      if(selected) moveTabIndicator(selected);
      if(window.lucide?.createIcons) lucide.createIcons();
    }
    function handleContextTab(id,btn){
      if(id==='home'){ switchTab('home',btn); return; }
      if(id==='finder'){ switchTab('finder',btn); return; }
      if(id==='classmates'){ switchTab('classmates',btn); return; }
      if(id==='assets'){ switchTab('assets',btn); return; }
      if(id.startsWith('album-')){ setCategoryFilter(id.slice(6)); return; }
      if(id.startsWith('nfilm-')){ setNFilmCategory(id.slice(6)); return; }
      if(id.startsWith('profile-')){ setProfileTab(id.slice(8)); return; }
    }
    window.refreshContextTabs=renderContextTabs;

    function openFinder(){
      const modal=document.getElementById('finder-modal'), panel=document.getElementById('finder-panel');
      if(!modal) return;
      // The Finder must be positioned against the viewport, not the transformed
      // search-view container. Move it to <body> before opening so fixed centering
      // always lands in the exact middle of the current frame.
      if(modal.parentElement !== document.body) document.body.appendChild(modal);
      modal.classList.remove('pointer-events-none','opacity-0'); modal.setAttribute('aria-hidden','false');
      panel?.classList.remove('scale-95');
      populateFinderControls();
      lockScroll();
      const finderBtn=document.querySelector('[data-nav-id="finder"]');
      if(finderBtn){ document.querySelectorAll('.context-tab-btn').forEach(b=>b.classList.remove('active','text-scrapbook-ink')); finderBtn.classList.add('active','text-scrapbook-ink'); moveTabIndicator(finderBtn); }
    }
    window.openFinder=openFinder;
    window.closeFinder=function(){
      const modal=document.getElementById('finder-modal'), panel=document.getElementById('finder-panel');
      if(!modal) return;
      panel?.classList.add('scale-95'); modal.classList.add('opacity-0','pointer-events-none'); modal.setAttribute('aria-hidden','true');
      unlockScroll(); renderContextTabs();
    };
    function populateFinderControls(){
      const dates=document.getElementById('finder-date-presets'), tags=document.getElementById('finder-tag-suggestions'), sources=document.getElementById('finder-source-options'), media=document.getElementById('finder-media-options');
      if(!dates||!tags||!sources||!media)return;
      const now=new Date(); now.setHours(0,0,0,0);
      const iso=d=>d.toISOString().slice(0,10);
      const dayOffset=n=>{const d=new Date(now);d.setDate(d.getDate()+n);return d;};
      const startWeek=new Date(now); startWeek.setDate(now.getDate()-((now.getDay()+6)%7));
      const startMonth=new Date(now.getFullYear(),now.getMonth(),1);
      const startYear=new Date(now.getFullYear(),0,1);
      const prevMonth=new Date(now.getFullYear(),now.getMonth()-1,1);
      const preset=[['Today',iso(now)],['Yesterday',iso(dayOffset(-1))],['This Week',iso(startWeek)],['Last 7 Days',iso(dayOffset(-6))],['This Month',iso(startMonth)],['Last Month',iso(prevMonth)],['This Year',iso(startYear)],['All Dates','']];
      dates.innerHTML=preset.map(([label,val])=>`<button type="button" data-date-value="${val}" class="finder-chip">${label}</button>`).join('');
      dates.querySelectorAll('button').forEach(b=>b.onclick=()=>{document.getElementById('finder-date-input').value=b.dataset.dateValue||''; dates.querySelectorAll('button').forEach(x=>x.classList.remove('selected')); b.classList.add('selected');});
      const tagList=CLASSMATE_NAMES.slice();
      tags.innerHTML=tagList.slice(0,finderMoreTags?tagList.length:6).map(t=>`<button type="button" class="finder-chip" data-tag-value="${t}">${t}</button>`).join('');
      tags.querySelectorAll('button').forEach(b=>b.onclick=()=>{document.getElementById('finder-tag-input').value=b.dataset.tagValue; tags.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');});
      const more=document.getElementById('finder-more-tags'); if(more) more.textContent=finderMoreTags?'Show less':'Show more';
      sources.innerHTML=[['regular','Regular'],['nfilm','N Film']].map(([v,l])=>`<button type="button" class="finder-choice ${finderSource===v?'selected':''}" data-source="${v}">${l}</button>`).join('');
      sources.querySelectorAll('button').forEach(b=>b.onclick=()=>{finderSource=b.dataset.source;finderMedia='any';populateFinderControls();});
      const opts=finderSource==='nfilm' ? [['trailer','Trailer'],['film','Film'],['bts','Behind The Scenes'],['cgi','CGI Breakdown'],['any','Any']] : [['video','Video'],['photo','Photo'],['any','Any']];
      media.innerHTML=opts.map(([v,l])=>`<button type="button" class="finder-choice ${finderMedia===v?'selected':''}" data-media="${v}">${l}</button>`).join('');
      media.querySelectorAll('button').forEach(b=>b.onclick=()=>{finderMedia=b.dataset.media;populateFinderControls();});
    }
    window.toggleFinderMoreTags=function(){finderMoreTags=!finderMoreTags;populateFinderControls();};
    window.clearFinderDate=function(){const e=document.getElementById('finder-date-input');if(e)e.value='';populateFinderControls();};
    window.clearFinderTag=function(){const e=document.getElementById('finder-tag-input');if(e)e.value='';populateFinderControls();};
    window.clearFinderMedia=function(){finderSource='any';finderMedia='any';populateFinderControls();};
    function finderItemDate(item){const raw=isNFilmItem(item)?getNFilmDate(item):(item.createdAt||item.date||'');const d=new Date(raw);return isNaN(d)?null:d;}
    function finderDateMatch(item, value){if(!value)return true;const d=finderItemDate(item);if(!d)return false;const target=new Date(value+'T00:00:00');return d.getFullYear()===target.getFullYear()&&d.getMonth()===target.getMonth()&&d.getDate()===target.getDate();}
    function finderTagMatch(item, value){if(!value)return true;const q=value.toLowerCase().trim();if(!q)return true;const hay=[...(item.owners||[]),...(getCloudinaryTags(item)||[]),...Object.values(item.cloudinaryContext||{})].map(String).map(x=>x.toLowerCase());return hay.some(x=>x===q||x.includes(q));}
    function getNFilmCategory(item){
      if(!isNFilmItem(item))return null;
      const vals=['category','media','kind','classification','genre','type'].map(k=>getCloudinaryContextValue(item,k)).filter(Boolean).join(' ').toLowerCase();
      const hay=[vals,...getCloudinaryTags(item),getNFilmTitle(item),getNFilmDescription(item)].join(' ').toLowerCase();
      if(/behind[ _-]?the[ _-]?scenes|\bbts\b/.test(hay))return 'bts';
      if(/cgi[ _-]?breakdown|\bcgi\b/.test(hay))return 'cgi';
      if(/\btrailer\b|teaser/.test(hay))return 'trailer';
      if(/\bfilm\b|feature/.test(hay))return 'film';
      return null;
    }
    function finderMediaMatch(item){
      if(finderSource==='regular' && !isRegularMemoryItem(item))return false;
      if(finderSource==='nfilm' && !isNFilmItem(item))return false;
      if(finderMedia==='any')return true;
      if(finderSource==='nfilm')return getNFilmCategory(item)===finderMedia;
      return finderMedia==='photo' ? item.type==='image' : item.type==='video';
    }
    function renderFinderResults(items){
      const wrap=document.getElementById('finder-results'), grid=document.getElementById('finder-results-grid'), count=document.getElementById('finder-result-count');
      if(!wrap||!grid||!count)return; wrap.classList.remove('hidden'); count.textContent=`${items.length} ${items.length===1?'match':'matches'}`; grid.innerHTML='';
      items.forEach(item=>{const card=document.createElement('button');card.type='button';card.className='text-left bg-white rounded-2xl overflow-hidden border border-scrapbook-accent/20 shadow-sm hover:shadow-md active:scale-[.98]';const u=localAssetMappings[item.filename]||item.url;card.innerHTML=`<div class="aspect-video bg-black/5 overflow-hidden">${item.type==='video'?`<video src="${u}" muted playsinline preload="metadata" class="w-full h-full object-cover"></video>`:`<img src="${get380pUrl(u)}" class="w-full h-full object-cover" loading="lazy">`}</div><div class="p-2.5"><p class="text-[9px] uppercase tracking-widest text-scrapbook-accent font-bold">${isNFilmItem(item)?formatNFilmFullDate(item):(item.date||'Date unavailable')}</p><p class="text-xs font-bold text-scrapbook-ink truncate">${isNFilmItem(item)?getNFilmTitle(item):(item.uploader||'Memory')}</p></div>`;card.onclick=()=>{activeGalleryItems=[item];activeYearFilter=getShareYear(item);closeFinder();if(isNFilmItem(item)&&item.type==='video'){openNFilmPlayer(item);}else{openViewer(0);}};grid.appendChild(card);});
    }
    window.runFinder=function(mode){
      const date=document.getElementById('finder-date-input')?.value||''; const tag=(document.getElementById('finder-tag-input')?.value||'').trim();
      const candidates=memories.filter(i=>!i.isPending);
      const exact=candidates.filter(i=>finderDateMatch(i,date)&&finderTagMatch(i,tag)&&finderMediaMatch(i));
      if(mode==='match'){renderFinderResults(exact);return;}
      const scored=candidates.map(item=>{let score=0; if(finderSource!=='any')score+=((finderSource==='nfilm')===isNFilmItem(item))?4:0; if(finderMedia!=='any')score+=finderMediaMatch(item)?4:0; if(date){const d=finderItemDate(item),t=new Date(date+'T00:00:00');if(d){const days=Math.abs(d-t)/86400000;score+=Math.max(0,4-Math.min(4,days));}} if(tag){if(finderTagMatch(item,tag))score+=4;else if([...(item.owners||[]),...(getCloudinaryTags(item)||[])].some(x=>String(x).toLowerCase().includes(tag.toLowerCase())))score+=2;} return {item,score};}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||((finderItemDate(b.item)?.getTime()||0)-(finderItemDate(a.item)?.getTime()||0))).slice(0,18).map(x=>x.item);renderFinderResults(scored);
    };

    window.switchTab = function(tab, element) {
      if(tab==='finder'){ renderContextTabs('finder'); openFinder(); return; }
      if(tab==='home'){
        activeTab='home'; currentActivePage='home';
        // Home navigation must dismiss any media viewer/player that was left
        // open by Finder. Otherwise that media remains mounted underneath the
        // next N Film player and becomes its visible background.
        closeViewer();
        if(document.getElementById('nfilm-player-modal')?.style.display==='flex'){
          closeNFilmPlayer(false);
        }
        closeProfilePage(); closeYearAlbum(); closeFinder(); closeSearchView();
        document.getElementById('homepage-view')?.classList.remove('hidden');
        renderContextTabs('home'); updateHeaderUI(); return;
      }
      if(tab==='classmates'){ openClassmatesGrid(); renderContextTabs('classmates'); return; }
      if(tab==='assets'){ toggleAssetsDrawer(true); renderContextTabs('assets'); return; }
      if(tab==='search'){ openFinder(); return; }
    };

    function moveTabIndicator(element) {
      const indicator = document.getElementById('tab-indicator');
      if (indicator && element) {
        const rect = element.getBoundingClientRect();
        const parentRect = element.parentElement.getBoundingClientRect();
        indicator.style.width = `${rect.width * 0.6}px`;
        indicator.style.left = `${rect.left - parentRect.left + (rect.width * 0.2)}px`;
      }
    }

    window.setSearchFilterKeyword = function(keyword) {
      const input = document.getElementById('search-input');
      if (input) {
        input.value = keyword;
        runSearchFilter();
      }
    };

    window.runSearchFilter = function() {
      const rawQuery = document.getElementById('search-input').value.trim().toLowerCase();
      const resultsGrid = document.getElementById('search-results-grid');
      const emptyState = document.getElementById('search-empty-state');
      
      if (!resultsGrid || !emptyState) return;
      resultsGrid.innerHTML = '';

      if (rawQuery === '') {
        emptyState.classList.add('hidden');
        resultsGrid.innerHTML = '';
        return;
      }

      const matches = memories.filter(item => {
        if (item.isPending) return false;

        // Smart Metadata Key-Value Parsing
        if (rawQuery === 'type:image') {
          return item.type === 'image';
        }
        if (rawQuery === 'type:video') {
          return item.type === 'video';
        }
        if (rawQuery === 'has:quote') {
          return !!(item.cloudinaryContext && (item.cloudinaryContext.quote || item.cloudinaryContext.qoute));
        }
        if (rawQuery === 'uploader:self') {
          return item.uploader === currentUser;
        }

        // Clean query of classmate prefixes
        let query = rawQuery;
        if (query.startsWith('@')) {
          query = query.substring(1);
        }
        
        // Match classmates tags
        const ownersMatch = item.owners.some(owner => owner.toLowerCase().includes(query));
        // Match comments text
        let commentMatch = false;
        const key = item.filename;
        const ctx = item.cloudinaryContext || {};

        for (const [k, v] of Object.entries(ctx)) {
          if (k.startsWith('comment') && String(v).toLowerCase().includes(query)) {
            commentMatch = true;
          }
        }
        if (simulatedCommentsDb[key]) {
          commentMatch = commentMatch || simulatedCommentsDb[key].some(c => c.text.toLowerCase().includes(query));
        }

        // Match date, filename or uploader
        const uploaderMatch = item.uploader && item.uploader.toLowerCase().includes(query);
        const fileMatch = item.filename.toLowerCase().includes(query);
        const dateMatch = item.date && item.date.toLowerCase().includes(query);

        return ownersMatch || commentMatch || uploaderMatch || fileMatch || dateMatch;
      });

      if (matches.length === 0) {
        emptyState.classList.remove('hidden');
        return;
      }

      emptyState.classList.add('hidden');

      matches.forEach(item => {
        const card = document.createElement('div');
        const randomRotation = (Math.random() * 4 - 2).toFixed(1);
        const assetUrl = localAssetMappings[item.filename] || item.url;
        const previewUrl = item.type === 'video' ? assetUrl : get380pUrl(assetUrl);

        card.className = "polaroid-card p-3 rounded bg-white shadow-md cursor-pointer";
        card.style.transform = `rotate(${randomRotation}deg)`;
        
        card.onclick = () => {
          activeGalleryItems = [item];
          openViewer(0);
        };

        let headsHtml = `<div class="flex -space-x-1.5 overflow-hidden">`;
        item.owners.slice(0, 3).forEach(owner => {
          const pUrl = CLASSMATE_PROFILES[owner] || `https://placehold.co/150x150/FAF6EE/2C2520?text=${owner[0]}`;
          headsHtml += `<div class="w-6 h-6 rounded-full overflow-hidden border border-white"><img src="${pUrl}" class="w-full h-full object-cover"></div>`;
        });
        headsHtml += `</div>`;

        card.innerHTML = `
          <div class="media-container rounded relative overflow-hidden mb-3">
            ${item.type === 'video' ? `
              <video src="${previewUrl}" class="w-full h-full object-cover" muted loop playsinline="true" webkit-playsinline="true"></video>
              <div class="absolute inset-0 flex items-center justify-center bg-black/10">
                <span class="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow"><i class="fa-solid fa-play ml-0.5 text-xs"></i></span>
              </div>
            ` : `
              <img src="${previewUrl}" class="w-full h-full object-cover" loading="lazy" onerror="handleImageLoadError(this)">
            `}
          </div>
          <div class="flex items-center justify-between text-[11px] text-scrapbook-ink/60 font-medium pt-1">
            <span>${item.date}</span>
            ${headsHtml}
          </div>
        `;

        resultsGrid.appendChild(card);
      });
    }
  


    function updateHeaderUI() {
      const headerLogoContainer = document.getElementById('header-logo-container');
      const headerBackArrow = document.getElementById('header-back-arrow');
      const headerDynamicTitle = document.getElementById('header-dynamic-title');
      const headerRightActions = document.getElementById('header-right-actions');
      const mainHeader = document.getElementById('main-header');

      if (!headerLogoContainer || !headerBackArrow || !headerDynamicTitle || !headerRightActions) return;

      // Hide main global header completely in search tab to make room for scrollable search header
      if (activeTab === 'search') {
        if (mainHeader) mainHeader.classList.add('hidden');
        return;
      } else {
        if (mainHeader) mainHeader.classList.remove('hidden');
      }

      headerRightActions.classList.remove('hidden');

      if (activeProfileClassmate) {
        // Profile Interface State
        headerLogoContainer.classList.add('hidden');
        headerBackArrow.classList.remove('hidden');
        headerDynamicTitle.textContent = `${activeProfileClassmate}'s Profile`;
      } else if (window.nFilmAlbumActive) {
        headerLogoContainer.classList.add('hidden');
        headerBackArrow.classList.remove('hidden');
        headerDynamicTitle.textContent = 'N Film Studio';
      } else if (activeYearFilter) {
        // Secondary Interface State
        headerLogoContainer.classList.add('hidden');
        headerBackArrow.classList.remove('hidden');
        headerDynamicTitle.textContent = `${activeYearFilter} Volume`;
      } else {
        // Main Interface State
        headerLogoContainer.classList.remove('hidden');
        headerBackArrow.classList.add('hidden');
        headerDynamicTitle.textContent = "SejongNIM";
      }
    }

    window.handleHeaderLeftClick = function() {
      if (activeTab === 'search') {
        const homeBtn = document.querySelector('#bottom-tab-bar button:first-of-type');
        switchTab('home', homeBtn);
        return;
      }
      if (activeProfileClassmate) {
        closeProfilePage();
      } else if (window.nFilmAlbumActive) {
        closeNFilmAlbum();
      } else if (activeYearFilter) {
        closeYearAlbum();
      } else {
        openOwnProfilePage();
      }
    };

    window.handleHeaderTitleClick = function() {
      if (activeProfileClassmate || activeYearFilter) {
        closeProfilePage();
        closeYearAlbum();
      }
    };

    /* Safe and Standardized Page Scroll Locking management using HTML/CSS class toggling */
    let preservedScrollY = 0;
    function lockScroll() {
      preservedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
      document.body.dataset.modalScrollY = String(preservedScrollY);
      document.body.classList.add('scroll-locked');
      document.documentElement.classList.add('scroll-locked');
      document.body.style.top = `-${preservedScrollY}px`;
    }

    function unlockScroll() {
      document.body.classList.remove('scroll-locked');
      document.documentElement.classList.remove('scroll-locked');
      document.body.style.top = '';
      window.scrollTo(0, preservedScrollY);
    }

    function getNotificationsForUser(username) {
      if (!username) return [];
      const notifications = [];
      memories.forEach(item => {
        if (item.isPending) return;
        
        // Tagged alerts
        if (item.owners.includes(username) && item.uploader !== username) {
          notifications.push({
            id: `notif_tag_${item.filename}`,
            text: `<strong>@${item.uploader || "Classmate"}</strong> tagged you in a memory snapshot.`,
            pfp: CLASSMATE_PROFILES[item.uploader] || CLASSMATE_PROFILES[item.owners[0]],
            date: item.date,
            type: "tag",
            assetFilename: item.filename
          });
        }

        // Comments alerts
        const key = item.filename;
        const ctx = item.cloudinaryContext || {};
        for (const [k, v] of Object.entries(ctx)) {
          if (k.startsWith('comment') && k.endsWith('ID') && String(v).includes(`@${username}`)) {
            const commenter = k.substring(7, k.length - 2);
            notifications.push({
              id: `notif_comm_${key}_${k}`,
              text: `<strong>@${commenter}</strong> mentioned you in comments: "${v}"`,
              pfp: CLASSMATE_PROFILES[commenter] || `https://placehold.co/150x150/FAF6EE/2C2520?text=${commenter[0]}`,
              date: item.date,
              type: "mention",
              assetFilename: item.filename
            });
          }
        }
      });
      return notifications;
    }

    function updateNotificationsBadge() {
      const badge = document.getElementById('notifications-unread-count');
      if (!badge) return;
      const count = getNotificationsForUser(currentUser).length;
      if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }

    function navigateToNotificationAsset(filename) {
      closeNotificationsModal();
      const matchIndex = memories.findIndex(item => item.filename === filename);
      if (matchIndex > -1) {
        activeGalleryItems = [...memories];
        openViewer(matchIndex);
      }
    }

    window.openNotificationsModal = function() {
      const modal = document.getElementById('notifications-modal');
      const listContainer = document.getElementById('notifications-list');
      if (!modal || !listContainer) return;

      // Mount the popup directly under <body> so it cannot be trapped behind
      // a transformed page/interface stacking context.
      if (modal.parentElement !== document.body) document.body.appendChild(modal);
      modal.classList.remove('pointer-events-none', 'opacity-0');
      modal.style.display = 'flex';
      modal.style.visibility = 'visible';
      modal.style.pointerEvents = 'auto';
      modal.style.zIndex = '2147483000';

      listContainer.innerHTML = '';
      lockScroll();

      const list = getNotificationsForUser(currentUser);
      if (list.length === 0) {
        listContainer.innerHTML = `
          <div class="text-center py-12 text-scrapbook-ink/40">
            <i class="fa-regular fa-bell-slash text-4xl block mb-2 opacity-30"></i>
            <p class="text-xs font-semibold">No notifications right now.</p>
          </div>
        `;
      } else {
        list.forEach(notif => {
          const card = document.createElement('div');
          card.className = "flex items-start space-x-3.5 py-4 cursor-pointer hover:bg-scrapbook-accent/10 transition-all px-2 rounded-xl";
          card.onclick = () => navigateToNotificationAsset(notif.assetFilename);

          card.innerHTML = `
            <div class="w-9 h-9 rounded-full overflow-hidden border border-[#D4A373]/30 bg-scrapbook-paper flex-shrink-0">
              <img src="${notif.pfp}" class="w-full h-full object-cover" onerror="handleImageLoadError(this)">
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-scrapbook-ink leading-relaxed">${notif.text}</p>
              <div class="flex items-center gap-2 mt-1.5 text-[9px] text-scrapbook-ink/50">
                <span><i class="fa-regular fa-clock"></i> ${notif.date}</span>
                <span class="bg-scrapbook-accent/20 text-scrapbook-ink px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[8px]">${notif.type}</span>
              </div>
            </div>
            <div class="w-2 h-2 rounded-full bg-scrapbook-rose mt-2"></div>
          `;
          listContainer.appendChild(card);
        });
      }

      modal.classList.remove('pointer-events-none', 'opacity-0');
      const trans = modal.querySelector('.transform');
      if (trans) trans.classList.remove('scale-95');
    };

    window.closeNotificationsModal = function() {
      const modal = document.getElementById('notifications-modal');
      if (modal) {
        modal.classList.add('pointer-events-none', 'opacity-0');
        modal.style.pointerEvents = 'none';
        modal.style.visibility = 'hidden';
        modal.style.display = 'none';
      }
      unlockScroll();
    };

    function openSandboxModal() {
      const modal = document.getElementById('sandbox-info-modal');
      if (modal) {
        // Keep this popup outside interface containers/stacking contexts.
        if (modal.parentElement !== document.body) document.body.appendChild(modal);
        populateConfigFields();
        modal.classList.remove('pointer-events-none', 'opacity-0');
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.pointerEvents = 'auto';
        modal.style.zIndex = '2147483000';
        const trans = modal.querySelector('.transform');
        if (trans) trans.classList.remove('scale-95');
        lockScroll();
      }
    }
    window.openSandboxModal = openSandboxModal;

    function closeSandboxModal() {
      const modal = document.getElementById('sandbox-info-modal');
      if (modal) {
        modal.classList.add('pointer-events-none', 'opacity-0');
        modal.style.pointerEvents = 'none';
        modal.style.visibility = 'hidden';
        modal.style.display = 'none';
        const trans = modal.querySelector('.transform');
        if (trans) trans.classList.add('scale-95');
      }
      unlockScroll();
    }
    window.closeSandboxModal = closeSandboxModal;
  


    function initializeOnboardingEngine() {
      const overlay=document.getElementById('onboarding-overlay');
      if(!currentUser){overlay?.classList.remove('hidden');lockScroll();chooseAuthMode('choice');}
      else {overlay?.classList.add('hidden');updateCurrentUserUI();unlockScroll();}
    }
    function renderOnboardingSelectionGrid() {
      const grid=document.getElementById('onboarding-grid');if(!grid)return;
      // Cloudinary refreshes call this renderer too. Once a username is selected,
      // keep the chooser closed while the account lookup/login form is active.
      if(window.__authUsernameSelected){grid.classList.add('hidden');return;}
      const source=document.getElementById('auth-name-search');
      const q=String(document.activeElement?.id==='auth-popup-search' ? document.getElementById('auth-popup-search')?.value : source?.value||'').trim().toLowerCase();
      if(!q){grid.classList.add('hidden');return;}
      if(!grid.querySelector('#auth-popup-search')){
        grid.innerHTML='<div class="max-w-3xl mx-auto"><div class="flex items-center gap-3 mb-5"><button type="button" id="auth-popup-close" class="rounded-full border px-4 py-2">Back</button><h3 class="text-xl font-bold">Choose username</h3></div><input id="auth-popup-search" type="text" autocomplete="off" placeholder="Search usernames…" class="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 mb-3 text-stone-900 outline-none"><div id="auth-popup-results"></div></div>';
        grid.querySelector('#auth-popup-close').onclick=()=>grid.classList.add('hidden');
        const popupInput=grid.querySelector('#auth-popup-search');popupInput.addEventListener('input',()=>{if(source)source.value=popupInput.value;renderOnboardingSelectionGrid();});
      }
      const popupInput=grid.querySelector('#auth-popup-search');if(popupInput&&popupInput.value!==q)popupInput.value=source?.value||q;
      grid.classList.remove('hidden');
      const results=grid.querySelector('#auth-popup-results');if(!results)return;results.innerHTML='';
      const names=Array.from(new Set([...CLASSMATE_NAMES,...Array.from(PFP_ACCOUNTS.values()).map(a=>a.name)]))
        .filter(n=>n.toLowerCase().startsWith(q)).sort((a,b)=>a.localeCompare(b));
      if(!names.length){results.innerHTML='<p class="text-sm p-4">No usernames begin with that text.</p>';return;}
      names.forEach(name=>{const b=document.createElement('button');b.type='button';b.className='w-full flex items-center gap-3 p-3 text-left border-b border-stone-200 hover:bg-stone-100';
        const img=document.createElement('img');img.src=CLASSMATE_PROFILES[name]||`https://placehold.co/150x150/FAF6EE/2C2520?text=${encodeURIComponent(name[0])}`;img.className='w-10 h-10 rounded-full object-cover';
        const label=document.createElement('span');label.className='text-sm font-bold';label.textContent=name;b.append(img,label);b.addEventListener('click',()=>selectAuthUsername(name));results.appendChild(b);
      });
    }
    function acceptOnboardingSelection(){submitAccountLogin();}
    function closeOnboardingConfirmation(){document.getElementById('confirm-onboarding-modal')?.classList.add('hidden');}

    function updateCurrentUserUI() {
      const headerLogoPfp = document.getElementById('header-logo-pfp');
      const headerLogoFallback = document.getElementById('header-logo-fallback');

      if (currentUser) {
        if (headerLogoPfp) {
          headerLogoPfp.src = CLASSMATE_PROFILES[currentUser] || `https://placehold.co/150x150/FAF6EE/2C2520?text=${currentUser[0]}`;
          headerLogoPfp.classList.remove('hidden');
        }
        if (headerLogoFallback) headerLogoFallback.classList.add('hidden');
      } else {
        if (headerLogoPfp) headerLogoPfp.classList.add('hidden');
        if (headerLogoFallback) headerLogoFallback.classList.remove('hidden');
      }
    }

    function handleAppPathRoute() {
      const path = window.location.pathname.replace(/\/+$/, '') || '/';
      if (/^\/album\/[^/]+\/[^/]+\/[^/]+\/(public|private)$/i.test(path)) return false;
      if (path.toLowerCase() === '/album/nfilm') { openNFilmAlbum(false); return true; }
      const monthMatch = path.match(/^\/album\/([^/]+)\/([^/]+)$/i);
      if (monthMatch) { openMonthAlbum(monthMatch[1], decodeURIComponent(monthMatch[2]), false); return true; }
      const yearMatch = path.match(/^\/album\/([^/]+)$/i);
      if (yearMatch) { openYearAlbum(yearMatch[1], false); return true; }
      if (path === '/authenticate') {
        const overlay = document.getElementById('onboarding-overlay');
        if (overlay) overlay.classList.remove('hidden', 'opacity-0');
        lockScroll();
        renderOnboardingSelectionGrid();
        return true;
      }
      if (path === '/home' || path === '/') {
        activeYearFilter = null; activeMonthFilter = null;
        document.getElementById('nfilm-album-workspace')?.classList.add('hidden');
        const home = document.getElementById('homepage-view');
        const workspace = document.getElementById('year-album-workspace');
        if (home) home.classList.remove('hidden');
        if (workspace) workspace.classList.add('hidden');
        return true;
      }
      return false;
    }

    window.addEventListener('DOMContentLoaded', () => {
      scrapbookTimelineContainer = document.getElementById('scrapbook-timeline-container');
      emptyState = document.getElementById('empty-state');

      const cloudinaryBadge = document.getElementById('cloudinary-status-badge');
      if (cloudinaryBadge) {
        cloudinaryBadge.addEventListener('click', openSandboxModal);
      }

      // Discover pfps on every route, even while the visitor is on the auth page.
      // Refresh periodically so new/updated Cloudinary profile photos propagate site-wide.
      loadPfpAccounts();
      if (!window.__pfpAutoRefresh) window.__pfpAutoRefresh = setInterval(() => loadPfpAccounts(), 60000);
      initializeOnboardingEngine();
      setupAuthPasscodeUI();
      document.getElementById('auth-new-pfp')?.addEventListener('change', authProfileFileChanged);
      setupPfpEditor();
      document.getElementById('auth-passcode')?.addEventListener('keydown', e => { if(e.key === 'Enter') submitAccountLogin(); });
      
      // Ensure view is scrollable on launch
      if (currentUser) {
        unlockScroll();
      }
      
      const shouldReplayWelcome = !!currentUser && window.location.pathname !== '/authenticate';
      const returningName = currentUser;
      const returningPhoto = (getPfpAccount(returningName)?.photoUrl) || CLASSMATE_PROFILES[returningName];
      const returningLoader = shouldReplayWelcome ? showReturningUserLoading(returningName, returningPhoto) : null;
      const mediaLoadPromise = loadMediaFromCloudinary();
      if (shouldReplayWelcome) {
        Promise.resolve(mediaLoadPromise).catch(()=>{}).finally(async()=>{
          const account=getPfpAccount(returningName);
          const photo=(account?.photoUrl)||CLASSMATE_PROFILES[returningName]||returningPhoto;
          returningLoader?.remove();
          await playWelcomeIntro(returningName,photo);
          if(directMediaRoute)openDirectRouteAfterAuthentication();
        });
      }
      setupFullscreenViewportListeners();
      window.addEventListener('popstate', () => { if (!handleDirectMediaRoute()) handleAppPathRoute(); });
      updateHeaderUI();

      const viewerFavBtn = document.getElementById('viewer-fav-btn');
      if (viewerFavBtn) viewerFavBtn.addEventListener('click', toggleViewerFavorite);

      window.addEventListener('click', (e) => {
        const notifyModal = document.getElementById('notifications-modal');
        if (notifyModal && e.target === notifyModal) closeNotificationsModal();
      });

      const finderModal=document.getElementById('finder-modal'); if(finderModal) finderModal.addEventListener('click',e=>{if(e.target===finderModal) closeFinder();});

      setupZoomInteractionListeners();

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeClassmatesGrid();
          closeViewer();
          closeOwnersPopup();
          closeStackPopupModal();
          closeExpandLibrary();
          closeSandboxModal();
          closeNotificationsModal();
          closeFinder();
          toggleAssetsDrawer(false);
        }
      });

      const ownersPopupModal = document.getElementById('owners-popup-modal');
      if (ownersPopupModal) {
        ownersPopupModal.addEventListener('click', (e) => {
          if (e.target === ownersPopupModal) closeOwnersPopup();
        });
      }

      const stackPopupModal = document.getElementById('stack-popup-modal');
      if (stackPopupModal) {
        stackPopupModal.addEventListener('click', (e) => {
          if (e.target === stackPopupModal) closeStackPopupModal();
        });
      }

      window.addEventListener('resize', () => {
        applyCommentsVisibility();
        
        // Recalculate indicator position on resize
        const activeTabBtn = document.querySelector('#bottom-tab-bar button.text-scrapbook-ink');
        if (activeTabBtn) moveTabIndicator(activeTabBtn);
      });
    });
  