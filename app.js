// ========================================
// ASSET LOADING CONFIGURATION
// ========================================
// Hier kannst du neue Dateien hinzufügen, die beim Start geladen werden sollen
const ASSETS_TO_LOAD = {
  backgrounds: [
    'Hintergrund1.jpg', 'Hintergrund2.jpg', 'Hintergrund3.jpg',
    'Hintergrund4.jpg', 'Hintergrund5.jpg', 'Hintergrund6.jpg',
    'Hintergrund7.jpg', 'Hintergrund8.jpg', 'Hintergrund9.jpg',
    'Hintergrund10.jpg', 'Hintergrund11.jpg'
  ],
  videos: [
    'Flugzeug.mp4', 'THE-MENACE.mp4', 'Waschmachine.mp4',
    'Angler.mp4', 'Schlafen.mp4'
  ],
  audio: ['Heartbeat.mp3', 'Quiz.mp3'],
  images: ['Logo.png']
};

// ========================================
// LOADING SCREEN SYSTEM
// ========================================
let assetsLoaded = 0;
let totalAssets = 0;

function initLoadingScreen() {
  // Count total assets
  totalAssets = ASSETS_TO_LOAD.backgrounds.length + 
                ASSETS_TO_LOAD.videos.length + 
                ASSETS_TO_LOAD.audio.length + 
                ASSETS_TO_LOAD.images.length;
  
  console.log(`Starting to load ${totalAssets} assets...`);
  
  // Safety timeout: force continue after 10 seconds
  setTimeout(() => {
    if (document.getElementById('loadingScreen').style.display !== 'none') {
      console.warn('Loading timeout - forcing continue');
      hideLoadingScreen();
    }
  }, 10000);
  
  // Load all assets
  loadAssets();
}

function loadAssets() {
  const promises = [];
  
  // Load backgrounds
  ASSETS_TO_LOAD.backgrounds.forEach(bg => {
    promises.push(loadImage(bg));
  });
  
  // Load images
  ASSETS_TO_LOAD.images.forEach(img => {
    promises.push(loadImage(img));
  });
  
  // Load videos
  ASSETS_TO_LOAD.videos.forEach(video => {
    promises.push(loadVideo(video));
  });
  
  // Load audio
  ASSETS_TO_LOAD.audio.forEach(audio => {
    promises.push(loadAudio(audio));
  });
  
  // Wait for all assets to load
  Promise.all(promises).then(() => {
    console.log('All assets loaded!');
    hideLoadingScreen();
  }).catch(error => {
    console.error('Error loading assets:', error);
    // Show error but continue anyway after 1 second
    setTimeout(hideLoadingScreen, 1000);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let resolved = false;
    
    const finish = () => {
      if (!resolved) {
        resolved = true;
        updateLoadingProgress();
        resolve();
      }
    };
    
    // Timeout after 3 seconds
    setTimeout(() => {
      if (!resolved) {
        console.warn(`Image loading timeout: ${src}`);
        finish();
      }
    }, 3000);
    
    img.onload = finish;
    img.onerror = () => {
      console.warn(`Failed to load image: ${src}`);
      finish();
    };
    img.src = src;
  });
}

function loadVideo(src) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    let resolved = false;
    
    const finish = () => {
      if (!resolved) {
        resolved = true;
        updateLoadingProgress();
        resolve();
      }
    };
    
    // Timeout after 3 seconds
    setTimeout(() => {
      if (!resolved) {
        console.warn(`Video loading timeout: ${src}`);
        finish();
      }
    }, 3000);
    
    video.onloadeddata = finish;
    video.onerror = () => {
      console.warn(`Failed to load video: ${src}`);
      finish();
    };
    video.preload = 'auto';
    video.src = src;
    video.load();
  });
}

function loadAudio(src) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    let resolved = false;
    
    const finish = () => {
      if (!resolved) {
        resolved = true;
        updateLoadingProgress();
        resolve();
      }
    };
    
    // Timeout after 3 seconds
    setTimeout(() => {
      if (!resolved) {
        console.warn(`Audio loading timeout: ${src}`);
        finish();
      }
    }, 3000);
    
    audio.oncanplaythrough = finish;
    audio.onerror = () => {
      console.warn(`Failed to load audio: ${src}`);
      finish();
    };
    audio.preload = 'auto';
    audio.src = src;
    audio.load();
  });
}

function updateLoadingProgress() {
  assetsLoaded++;
  const percentage = Math.round((assetsLoaded / totalAssets) * 100);
  
  // Update progress bar
  const progressBar = document.getElementById('loadingProgressBar');
  const progressText = document.getElementById('loadingProgressText');
  
  if (progressBar) {
    progressBar.style.width = percentage + '%';
  }
  
  if (progressText) {
    progressText.textContent = percentage + '%';
  }
  
  console.log(`Loading progress: ${assetsLoaded}/${totalAssets} (${percentage}%)`);
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  const startScreen = document.getElementById('startScreen');
  
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      if (startScreen) {
        startScreen.style.display = 'flex';
      }
      
      // Versuche automatisch in Vollbildmodus zu wechseln
      enterFullscreen();
    }, 300);
  }
}

function enterFullscreen() {
  const elem = document.documentElement;
  
  if (elem.requestFullscreen) {
    elem.requestFullscreen().catch(err => {
      console.log('Fullscreen request failed:', err);
    });
  } else if (elem.webkitRequestFullscreen) { // Safari
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { // IE11
    elem.msRequestFullscreen();
  }
}

// ========================================
// HAPTIC FEEDBACK SYSTEM
// ========================================
// Global vibration enabled state (loaded from localStorage)
let vibrationEnabled = true;

// Global realistic mode state (loaded from localStorage)
let realisticMode = true;

// Global show remaining score state (loaded from localStorage)
let showRemainingScore = true;
let boxDimmingEnabled = false;

// Challenge mode video shuffle playlist
const challengeVideoList = ['Flugzeug.mp4', 'THE-MENACE.mp4', 'Waschmachine.mp4', 'Angler.mp4', 'Schlafen.mp4'];
let challengeVideoPlaylist = [];
let challengeVideoPlaylistIndex = 0;

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getNextChallengeVideo() {
  if (challengeVideoPlaylistIndex >= challengeVideoPlaylist.length) {
    // All videos played - reshuffle, but avoid starting with the last video of previous round
    const lastVideo = challengeVideoPlaylist[challengeVideoPlaylist.length - 1];
    let newPlaylist = shuffleArray(challengeVideoList);
    // If first video of new round is same as last of previous, swap it with second
    if (newPlaylist[0] === lastVideo && newPlaylist.length > 1) {
      [newPlaylist[0], newPlaylist[1]] = [newPlaylist[1], newPlaylist[0]];
    }
    challengeVideoPlaylist = newPlaylist;
    challengeVideoPlaylistIndex = 0;
  }
  return challengeVideoPlaylist[challengeVideoPlaylistIndex++];
}

// Load vibration setting from localStorage
try {
  const savedSetting = localStorage.getItem('dartTrainerVibrationEnabled');
  if (savedSetting !== null) {
    vibrationEnabled = savedSetting === 'true';
  }
} catch (e) {
  console.error('Could not load vibration setting:', e);
}

// Load realistic mode setting from localStorage
try {
  const savedRealisticMode = localStorage.getItem('dartTrainerRealisticMode');
  if (savedRealisticMode !== null) {
    realisticMode = savedRealisticMode === 'true';
  }
} catch (e) {
  console.error('Could not load realistic mode setting:', e);
}

// Load show remaining score setting from localStorage
try {
  const savedShowRemaining = localStorage.getItem('dartTrainerShowRemainingScore');
  if (savedShowRemaining !== null) {
    showRemainingScore = savedShowRemaining === 'true';
  }
} catch (e) {
  console.error('Could not load realistic mode setting:', e);
}

// Load box dimming setting from localStorage
try {
  const savedBoxDimming = localStorage.getItem('dartTrainerBoxDimming');
  if (savedBoxDimming !== null) {
    boxDimmingEnabled = savedBoxDimming === 'true';
  }
} catch (e) {
  console.error('Could not load box dimming setting:', e);
}

function vibrate(duration) {
  if (vibrationEnabled && 'vibrate' in navigator) {
    navigator.vibrate(duration);
  }
}

// Different vibration patterns for different actions
function vibrateLight() {
  vibrate(30); // Short tap for normal buttons
}

function vibrateMedium() {
  vibrate(50); // Medium tap for important buttons
}

function vibrateHeavy() {
  vibrate(100); // Long tap for feedback (correct/wrong)
}

function vibratePattern(pattern) {
  if (vibrationEnabled && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

function toggleVibration() {
  vibrationEnabled = !vibrationEnabled;
  localStorage.setItem('dartTrainerVibrationEnabled', vibrationEnabled.toString());
  
  // Update menu item text
  updateMenuItems();
  
  // Give haptic feedback if turning ON
  if (vibrationEnabled) {
    vibrateMedium();
  }
  
  console.log('Vibration', vibrationEnabled ? 'enabled' : 'disabled');
}

function toggleBoxDimming() {
  boxDimmingEnabled = !boxDimmingEnabled;
  localStorage.setItem('dartTrainerBoxDimming', boxDimmingEnabled.toString());
}

function toggleShowRemainingScore() {
  showRemainingScore = !showRemainingScore;
  localStorage.setItem('dartTrainerShowRemainingScore', showRemainingScore.toString());
  
  // Update menu item text
  updateMenuItems();
  
  // Update display immediately
  updateUserInputs();
  
  vibrateMedium();
  
  console.log('Show remaining score', showRemainingScore ? 'enabled' : 'disabled');
}

function toggleRealisticMode() {
  // Im Challenge-Modus ist Realistisch-Modus nicht erlaubt
  if (window.challengeMode) {
    return;
  }
  
  // Im Lernmodus ist Realistisch-Modus nicht erlaubt
  if (window.learnModeActive) {
    return;
  }
  
  realisticMode = !realisticMode;
  localStorage.setItem('dartTrainerRealisticMode', realisticMode.toString());
  
  // CRITICAL: Reset ALL error-state variables
  isInErrorState = false;
  currentRemainingScore = null;
  dartsUsedInRound = 0;
  errorStateCheckout = [];
  dartsInErrorState = 0;
  feedback = null;
  highlightedFields = [];
  
  // Remove error and warning class from score card
  const scoreCard = document.getElementById('scoreCard');
  if (scoreCard) {
    scoreCard.classList.remove('error', 'warning');
  }
  
  // Reset userInputs display
  const userInputsContainer = document.getElementById('userInputs');
  if (userInputsContainer) {
    userInputsContainer.classList.remove('correct', 'wrong', 'active');
    const existingSolution = userInputsContainer.querySelector('.solution-text');
    if (existingSolution) {
      existingSolution.remove();
    }
  }
  
  // Reset dartboard flash
  const outerRing = document.getElementById('dartboard-outer-ring');
  if (outerRing) {
    outerRing.classList.remove('flash-correct', 'flash-wrong');
  }
  
  // Update display immediately
  updateUserInputs();
  
  // Update menu item text
  updateMenuItems();
  
  vibrateMedium();
  console.log('Realistic Mode', realisticMode ? 'enabled' : 'disabled');
}


function updateMenuItems() {
  // Update Zahlenring menu item
  const blackRingMenuItem = document.getElementById('blackRingMenuItem');
  if (blackRingMenuItem) {
    blackRingMenuItem.textContent = `Zahlenring: ${numbersVisible ? 'AN' : 'AUS'}`;
  }
  
  // Update Vibration menu item
  const vibrationMenuItem = document.getElementById('vibrationMenuItem');
  if (vibrationMenuItem) {
    vibrationMenuItem.textContent = `Vibration: ${vibrationEnabled ? 'AN' : 'AUS'}`;
  }
  
  // Update Box ausblenden menu item
  const boxDimmingMenuItem = document.getElementById('boxDimmingMenuItem');
  if (boxDimmingMenuItem) {
    boxDimmingMenuItem.textContent = `Box ausblenden: ${boxDimmingEnabled ? 'AN' : 'AUS'}`;
  }

  // Update Restwert menu item
  const showRemainingMenuItem = document.getElementById('showRemainingMenuItem');
  if (showRemainingMenuItem) {
    showRemainingMenuItem.textContent = `Restwert: ${showRemainingScore ? 'AN' : 'AUS'}`;
  }
  
  // Update Freies Spiel menu item
  const realisticModeMenuItem = document.getElementById('realisticModeMenuItem');
  if (realisticModeMenuItem) {
    realisticModeMenuItem.textContent = `Freies Spiel: ${realisticMode ? 'AN' : 'AUS'}`;
    
    // Deaktiviere im Lernmodus
    if (window.learnModeActive) {
      realisticModeMenuItem.style.opacity = '0.5';
      realisticModeMenuItem.style.cursor = 'not-allowed';
      realisticModeMenuItem.disabled = true;
    } else {
      realisticModeMenuItem.style.opacity = '1';
      realisticModeMenuItem.style.cursor = 'pointer';
      realisticModeMenuItem.disabled = false;
    }
  }
}

// Start loading when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLoadingScreen);
} else {
  initLoadingScreen();
}

// ========================================
// CHECKOUT DATABASE
// ========================================
// Vollständige Checkout-Datenbank
    let defaultCheckouts = {
      2: ['D1'], 3: ['S1', 'D1'], 4: ['D2'], 5: ['S1', 'D2'], 6: ['D3'], 7: ['S3', 'D2'], 8: ['D4'], 
      9: ['S1', 'D4'], 10: ['D5'], 11: ['S3', 'D4'], 12: ['D6'], 13: ['S5', 'D4'], 14: ['D7'], 
      15: ['S7', 'D4'], 16: ['D8'], 17: ['S9', 'D4'], 18: ['D9'], 19: ['S11', 'D4'], 20: ['D10'], 
      21: ['S17', 'D2'], 22: ['D11'], 23: ['S7', 'D8'], 24: ['D12'], 25: ['S17', 'D4'], 26: ['D13'], 
      27: ['S7', 'D10'], 28: ['D14'], 29: ['S13', 'D8'], 30: ['D15'], 31: ['S7', 'D12'], 32: ['D16'], 
      33: ['S17', 'D8'], 34: ['D17'], 35: ['S3', 'D16'], 36: ['D18'], 37: ['S17', 'D10'], 38: ['D19'], 
      39: ['S7', 'D16'], 40: ['D20'], 41: ['S9', 'D16'], 42: ['S10', 'D16'], 43: ['S3', 'D20'], 
      44: ['S4', 'D20'], 45: ['S13', 'D16'], 46: ['S6', 'D20'], 47: ['S7', 'D20'], 48: ['S8', 'D20'], 
      49: ['S9', 'D20'], 50: ['S10', 'D20'], 51: ['S11', 'D20'], 52: ['T12', 'D8'], 53: ['S13', 'D20'], 
      54: ['S14', 'D20'], 55: ['S15', 'D20'], 56: ['S16', 'D20'], 57: ['S17', 'D20'], 58: ['S18', 'D20'], 
      59: ['S19', 'D20'], 60: ['S20', 'D20'], 61: ['T15', 'D8'], 62: ['T10', 'D16'], 63: ['T17', 'D6'], 
      64: ['T16', 'D8'], 65: ['T11', 'D16'], 66: ['T10', 'D18'], 67: ['T9', 'D20'], 68: ['T16', 'D10'], 
      69: ['T15', 'D12'], 70: ['T18', 'D8'], 71: ['T13', 'D16'], 72: ['T20', 'D6'], 73: ['T19', 'D8'], 
      74: ['T14', 'D16'], 75: ['T15', 'D15'], 76: ['T20', 'D8'], 77: ['T19', 'D10'], 78: ['T18', 'D12'], 
      79: ['T19', 'D11'], 80: ['T20', 'D10'], 81: ['T15', 'D18'], 82: ['Bull', 'D16'], 83: ['T17', 'D16'], 
      84: ['T20', 'D12'], 85: ['T15', 'D20'], 86: ['T18', 'D16'], 87: ['T17', 'D18'], 88: ['T20', 'D14'], 
      89: ['T19', 'D16'], 90: ['T20', 'D15'], 91: ['Bull', 'S9', 'D16'], 92: ['Bull', 'S10', 'D16'], 
      93: ['Bull', 'S3', 'D20'], 94: ['Bull', 'S4', 'D20'], 95: ['Bull', 'S13', 'D16'], 96: ['T20', 'D18'], 
      97: ['T19', 'D20'], 98: ['T20', 'D19'], 99: ['T19', 'S10', 'D16'], 100: ['T20', 'D20'], 
      101: ['T20', 'S9', 'D16'], 102: ['T20', 'S10', 'D16'], 103: ['T19', 'S6', 'D20'], 104: ['T19', 'S7', 'D20'], 
      105: ['T20', 'S13', 'D16'], 106: ['T20', 'S6', 'D20'], 107: ['T19', 'S10', 'D20'], 108: ['T18', 'S14', 'D20'], 
      109: ['T20', 'S9', 'D20'], 110: ['T20', 'S10', 'D20'], 111: ['T20', 'S11', 'D20'], 112: ['T20', 'T12', 'D8'], 
      113: ['T19', 'S16', 'D20'], 114: ['T18', 'S20', 'D20'], 115: ['T20', 'S15', 'D20'], 116: ['T19', 'S19', 'D20'], 
      117: ['T19', 'S20', 'D20'], 118: ['T20', 'S18', 'D20'], 119: ['T19', 'T12', 'D13'], 120: ['T20', 'S20', 'D20'], 
      121: ['T20', 'T11', 'D14'], 122: ['T18', 'T18', 'D7'], 123: ['T19', 'T16', 'D9'], 124: ['T20', 'T14', 'D11'], 
      125: ['Bull', 'T15', 'D15'], 126: ['T19', 'T19', 'D6'], 127: ['T20', 'T17', 'D8'], 128: ['T18', 'T14', 'D16'], 
      129: ['T19', 'D18', 'D18'], 130: ['T20', 'T20', 'D5'], 131: ['T20', 'T17', 'D10'], 132: ['Bull', 'Bull', 'D16'], 
      133: ['T20', 'T19', 'D8'], 134: ['T20', 'T14', 'D16'], 135: ['Bull', 'T15', 'D20'], 136: ['T20', 'T20', 'D8'], 
      137: ['T20', 'T19', 'D10'], 138: ['T19', 'T19', 'D12'], 139: ['T20', 'T19', 'D11'], 140: ['T20', 'D20', 'D20'], 
      141: ['T20', 'T19', 'D12'], 142: ['T19', 'T19', 'D14'], 143: ['T20', 'T17', 'D16'], 144: ['T20', 'T20', 'D12'], 
      145: ['T20', 'T15', 'D20'], 146: ['T19', 'T19', 'D16'], 147: ['T20', 'T17', 'D18'], 148: ['T20', 'T16', 'D20'], 
      149: ['T20', 'T19', 'D16'], 150: ['T19', 'T19', 'D18'], 151: ['T20', 'T17', 'D20'], 152: ['T19', 'T19', 'D19'], 
      153: ['T20', 'T19', 'D18'], 154: ['T20', 'T18', 'D20'], 155: ['T20', 'T19', 'D19'], 156: ['T20', 'T20', 'D18'], 
      157: ['T20', 'T19', 'D20'], 158: ['T20', 'T20', 'D19'], 159: ['T20', 'T19', 'S10'], 160: ['T20', 'T20', 'D20'], 
      161: ['T20', 'T17', 'Bull'], 162: ['T20', 'T20', 'S10'], 163: ['T20', 'T19', 'S6'], 164: ['T19', 'T19', 'Bull'], 
      165: ['T20', 'T20', 'S13'], 166: ['T20', 'T20', 'S6'], 167: ['T20', 'T19', 'Bull'], 168: ['T20', 'T18', 'S14'], 
      169: ['T20', 'T20', 'S9'], 170: ['T20', 'T20', 'Bull']
    };
    
    let twoDartCheckouts = {
      61: ['T11', 'D14'], 62: ['T12', 'D13'], 63: ['T13', 'D12'], 64: ['T14', 'D11'], 65: ['T15', 'D10'], 
      66: ['T16', 'D9'], 67: ['T17', 'D8'], 68: ['T18', 'D7'], 69: ['T19', 'D6'], 70: ['T20', 'D5'], 
      71: ['T17', 'D10'], 72: ['D18', 'D18'], 80: ['D20', 'D20'], 81: ['T19', 'D12'], 82: ['T14', 'D20'], 
      88: ['T16', 'D20'], 90: ['T18', 'D18'], 91: ['T17', 'D20'], 92: ['T20', 'D16'], 93: ['T19', 'D18'], 
      94: ['T18', 'D20'], 95: ['T19', 'D19'], 101: ['T17', 'Bull'], 104: ['T18', 'Bull'], 107: ['T19', 'Bull'], 
      110: ['T20', 'Bull']
    };
    
    // Create deep copies of original checkouts for reset functionality
    const originalDefaultCheckouts = JSON.parse(JSON.stringify(defaultCheckouts));
    const originalTwoDartCheckouts = JSON.parse(JSON.stringify(twoDartCheckouts));
    
    const boardOrder = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
    const stellZahlen = [159, 162, 163, 165, 166, 168, 169];
    
    let currentMode = '3darts';
    let currentCheckouts = defaultCheckouts;
    let currentScore = 87;
    let currentCheckout = ['T17', 'D18'];
    let userInputs = [];
    let highlightedFields = [];
    
    // Realistic Mode Variables (realisticMode is global)
    let currentRemainingScore = null;
    let dartsUsedInRound = 0;
    let maxDartsForRound = 3;
    let isInErrorState = false;
    let errorStateCheckout = []; // Das Checkout-Array für den Restwert
    let dartsInErrorState = 0; // Wie viele Darts wurden im Error-State geworfen
    
    // Track current range for challenge mode
    let currentRangeMin = 2;
    let currentRangeMax = 170;
    
    // Track manual score entry
    let manualScoreActive = false;
    
    // Track recently generated scores to avoid repetition
    // Each entry: { score: number, mode: '2darts'|'3darts'|'mixed' }
    let recentlyGenerated = [];
    
    // Generation mode: 'random', 'ascending', 'descending'
    let generationMode = 'random';
    let currentSequentialScore = null; // Track current position in sequential mode
    let currentSequentialMode = null; // Track current mode ('2darts'/'3darts') in mixed sequential mode
    
    // Helper function to clear anti-repetition history (call when changing range/mode)
    function clearAntiRepetitionHistory() {
      recentlyGenerated = [];
    }
    
    // Track black ring visibility
    let numbersVisible = true;
    
    // Make challengeMode and challengeTimer global (no let)
    window.challengeMode = false;
    window.challengeTimer = null;
    
    // RangeCard dimming state
    window.rangeCardActive = true;  // Container is active at start
    
    let challengeStats = { correct: 0, wrong: 0 };
    
    let leaderboard = [];
    let problemScores = {};
    let feedback = null;
    let mainSettingsVisible = true;
    let visibleElements = {
      'userInputs': true
    };
    
    function createDartboard() {
      const svg = document.getElementById('dartboard');
      svg.innerHTML = '';
      
      // Background circle (large black ring - ALWAYS visible)
      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      bg.setAttribute('cx', '250');
      bg.setAttribute('cy', '250');
      bg.setAttribute('r', '248');
      bg.setAttribute('fill', '#1a1a1a');
      bg.setAttribute('stroke', 'white');
      bg.setAttribute('stroke-width', '2');
      bg.setAttribute('id', 'dartboard-outer-ring');
      svg.appendChild(bg);
      
      // Create segments
      boardOrder.forEach((number, index) => {
        const angle = (index * 18) - 100;
        const startAngle = angle * Math.PI / 180;
        const endAngle = (angle + 18) * Math.PI / 180;
        
        const isDouble = highlightedFields.includes(`D${number}`);
        const isSingle = highlightedFields.includes(`S${number}`);
        const isTriple = highlightedFields.includes(`T${number}`);
        
        const isBlack = index % 2 === 0;
        
        // Double ring (30% bigger: 29px, 177-206)
        createSegment(svg, 177, 206, startAngle, endAngle, 
          isDouble ? '#60A5FA' : (isBlack ? '#DC2626' : '#16A34A'),
          isDouble ? '#2563EB' : '#C0C0C0',
          isDouble ? '4' : '1',
          () => handleDartClick(`D${number}`));
        
        // Outer single (118-177, 59px)
        createSegment(svg, 118, 177, startAngle, endAngle,
          isSingle ? '#60A5FA' : (isBlack ? '#1F2937' : '#FEF3C7'),
          isSingle ? '#2563EB' : '#C0C0C0',
          isSingle ? '4' : '1',
          () => handleDartClick(`S${number}`));
        
        // Triple ring (30% bigger: 30px, 88-118, CENTERED between singles)
        createSegment(svg, 88, 118, startAngle, endAngle,
          isTriple ? '#60A5FA' : (isBlack ? '#DC2626' : '#16A34A'),
          isTriple ? '#2563EB' : '#C0C0C0',
          isTriple ? '4' : '1',
          () => handleDartClick(`T${number}`));
        
        // Inner single (32-88, 56px)
        createSegment(svg, 32, 88, startAngle, endAngle,
          isSingle ? '#60A5FA' : (isBlack ? '#1F2937' : '#FEF3C7'),
          isSingle ? '#2563EB' : '#C0C0C0',
          isSingle ? '4' : '1',
          () => handleDartClick(`S${number}`));
        
        // Number text (only if numbersVisible is true)
        if (numbersVisible) {
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          const textAngle = startAngle + 9 * Math.PI / 180;
          text.setAttribute('x', 250 + 227 * Math.cos(textAngle));
          text.setAttribute('y', 250 + 227 * Math.sin(textAngle));
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('dominant-baseline', 'middle');
          text.setAttribute('font-size', '28');
          text.setAttribute('font-weight', 'bold');
          text.setAttribute('fill', 'white');
          text.textContent = number;
          svg.appendChild(text);
        }
        
        // Separator line (to edge of doubles)
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', 250 + 32 * Math.cos(startAngle));
        line.setAttribute('y1', 250 + 32 * Math.sin(startAngle));
        line.setAttribute('x2', 250 + 206 * Math.cos(startAngle));
        line.setAttribute('y2', 250 + 206 * Math.sin(startAngle));
        line.setAttribute('stroke', '#999');
        line.setAttribute('stroke-width', '1.5');
        svg.appendChild(line);
      });
      
      // S25 (outer bull)
      const s25 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      s25.setAttribute('cx', '250');
      s25.setAttribute('cy', '250');
      s25.setAttribute('r', '32');
      s25.setAttribute('fill', highlightedFields.includes('S25') ? '#60A5FA' : '#16A34A');
      s25.setAttribute('stroke', highlightedFields.includes('S25') ? '#2563EB' : '#C0C0C0');
      s25.setAttribute('stroke-width', highlightedFields.includes('S25') ? '4' : '1');
      s25.style.cursor = 'pointer';
      s25.onclick = () => handleDartClick('S25');
      svg.appendChild(s25);
      
      // Bull
      const bull = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      bull.setAttribute('cx', '250');
      bull.setAttribute('cy', '250');
      bull.setAttribute('r', '16');
      bull.setAttribute('fill', highlightedFields.includes('Bull') ? '#60A5FA' : '#DC2626');
      bull.setAttribute('stroke', highlightedFields.includes('Bull') ? '#2563EB' : '#C0C0C0');
      bull.setAttribute('stroke-width', highlightedFields.includes('Bull') ? '4' : '1');
      bull.style.cursor = 'pointer';
      bull.onclick = () => handleDartClick('Bull');
      svg.appendChild(bull);
    }
    
    function createSegment(svg, innerR, outerR, startA, endA, fill, stroke, strokeWidth, onClick) {
      const cx = 250, cy = 250;
      const x1 = cx + innerR * Math.cos(startA);
      const y1 = cy + innerR * Math.sin(startA);
      const x2 = cx + outerR * Math.cos(startA);
      const y2 = cy + outerR * Math.sin(startA);
      const x3 = cx + outerR * Math.cos(endA);
      const y3 = cy + outerR * Math.sin(endA);
      const x4 = cx + innerR * Math.cos(endA);
      const y4 = cy + innerR * Math.sin(endA);
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 0 0 ${x1} ${y1}`);
      path.setAttribute('fill', fill);
      path.setAttribute('stroke', stroke);
      path.setAttribute('stroke-width', strokeWidth);
      path.style.cursor = 'pointer';
      path.onclick = onClick;
      svg.appendChild(path);
    }
    
    function toggleVisibility(elementId) {
      const element = document.getElementById(elementId);
      if (!element) return;
      
      visibleElements[elementId] = !visibleElements[elementId];
      
      // Toggle hidden class
      if (visibleElements[elementId]) {
        element.classList.remove('hidden');
      } else {
        element.classList.add('hidden');
      }
      
      // Update checkbox in menu
      const toggleMap = {
        'userInputs': 'inputsToggle'
      };
      
      const toggleId = toggleMap[elementId];
      if (toggleId) {
        const toggle = document.getElementById(toggleId);
        if (toggle) {
          toggle.textContent = visibleElements[elementId] ? '☑' : '☐';
        }
      }
    }
    
    function setMode(mode, buttonElement) {
      currentMode = mode;
      
      // Set maxDartsForRound based on mode
      if (mode === '2darts') {
        maxDartsForRound = 2;
      } else if (mode === '3darts') {
        maxDartsForRound = 3;
      } else if (mode === 'mixed') {
        maxDartsForRound = 3; // Will be updated dynamically in generateScore
      }
      
      // CRITICAL: Reset ALL state variables when changing modes
      isInErrorState = false;
      currentRemainingScore = null;
      dartsUsedInRound = 0;
      errorStateCheckout = [];
      dartsInErrorState = 0;
      feedback = null;
      highlightedFields = [];
      
      // Deaktiviere Lernmodus wenn Modus gewechselt wird
      if (window.learnModeActive) {
        window.learnModeActive = false;
        const learnBtn = document.getElementById('learnBtn');
        if (learnBtn) {
          learnBtn.classList.remove('active-range');
          learnBtn.style.borderColor = '#b91c1c';
        }
      }
      
      // Reset score card colors
      const scoreCard = document.getElementById('scoreCard');
      if (scoreCard) {
        scoreCard.classList.remove('error', 'warning');
      }
      
      // Reset userInputs display
      const userInputsContainer = document.getElementById('userInputs');
      if (userInputsContainer) {
        userInputsContainer.classList.remove('correct', 'wrong', 'active');
        const existingSolution = userInputsContainer.querySelector('.solution-text');
        if (existingSolution) {
          existingSolution.remove();
        }
      }
      
      // Reset dartboard flash
      const outerRing = document.getElementById('dartboard-outer-ring');
      if (outerRing) {
        outerRing.classList.remove('flash-correct', 'flash-wrong');
      }
      
      // Clear anti-repetition history when switching modes
      clearAntiRepetitionHistory();
      
      // Reset sequential score when changing dart mode
      currentSequentialScore = null;
      currentSequentialMode = null;
      
      document.querySelectorAll('.mode-btn').forEach(btn => {
        // Don't remove active from challenge button
        if (!btn.classList.contains('mode-btn-challenge')) {
          btn.classList.remove('active');
        }
      });
      
      if (buttonElement) {
        buttonElement.classList.add('active');
      }
      
      if (mode === '2darts') {
        currentCheckouts = twoDartCheckouts;
        updateRangeButtonsFor2Dart();
        // Set to 2-170 and activate the button
        currentRangeMin = 2;
        currentRangeMax = 170;
        const btn2_170 = document.querySelector('.range-btn.bg-blue-500');
        if (btn2_170) {
          document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active-range'));
          btn2_170.classList.add('active-range');
        }
        updateMenuItems();
        generateScore(2, 170);
        return;
      } else if (mode === '3darts') {
        currentCheckouts = defaultCheckouts;
        updateRangeButtonsFor3Dart();
        // Set to 2-170 and activate the button
        currentRangeMin = 2;
        currentRangeMax = 170;
        const btn2_170 = document.querySelector('.range-btn.bg-blue-500');
        if (btn2_170) {
          document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active-range'));
          btn2_170.classList.add('active-range');
        }
        updateMenuItems();
        generateScore(2, 170);
        return;
      } else if (mode === 'mixed') {
        // In Mix-Modus alle Bereiche erlauben (da sowohl 2-Dart als auch 3-Dart)
        document.querySelectorAll('.range-btn').forEach(btn => {
          btn.classList.remove('disabled');
        });
        
        // Set to 2-170 and activate the button
        currentRangeMin = 2;
        currentRangeMax = 170;
        const btn2_170 = document.querySelector('.range-btn.bg-blue-500');
        if (btn2_170) {
          document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active-range'));
          btn2_170.classList.add('active-range');
        }
        updateMenuItems();
        generateScore(2, 170);
        return;
      }
      
      updateMenuItems();
      updateScoreTitle();
    }
    
    function cycleGenerationMode() {
      // Reset state when changing generation mode
      feedback = null;
      highlightedFields = [];
      const outerRing = document.getElementById('dartboard-outer-ring');
      if (outerRing) {
        outerRing.classList.remove('flash-correct', 'flash-wrong');
      }
      
      // Cycle through modes: random -> repeat -> ascending -> descending -> random
      if (generationMode === 'random') {
        generationMode = 'repeat';
        const btn = document.getElementById('generationModeBtn');
        btn.textContent = '🔁';
        // Keep current score for repeat mode
      } else if (generationMode === 'repeat') {
        generationMode = 'ascending';
        const btn = document.getElementById('generationModeBtn');
        btn.textContent = '⬆️';
        // Set to null to trigger starting at first score in generateScore
        currentSequentialScore = null;
        currentSequentialMode = null;
      } else if (generationMode === 'ascending') {
        generationMode = 'descending';
        const btn = document.getElementById('generationModeBtn');
        btn.textContent = '⬇️';
        // Set to null to trigger starting at last score in generateScore
        currentSequentialScore = null;
        currentSequentialMode = null;
      } else {
        generationMode = 'random';
        const btn = document.getElementById('generationModeBtn');
        btn.textContent = '🔀';
        currentSequentialScore = null;
        currentSequentialMode = null;
        clearAntiRepetitionHistory();
      }
      
      console.log('Generation mode changed to:', generationMode, 'Starting score:', currentSequentialScore);
      
      // Always switch to 2-170 range when changing generation mode
      currentRangeMin = 2;
      currentRangeMax = 170;
      
      const btn2_170 = document.querySelector('.range-btn.bg-blue-500');
      
      // Remove active-range from all buttons
      document.querySelectorAll('.range-btn').forEach(btn => {
        btn.classList.remove('active-range');
      });
      
      // Activate 2-170 button
      if (btn2_170) {
        btn2_170.classList.add('active-range');
        console.log('Switched to 2-170 range after generation mode change');
      }
      
      // Update hint range
      currentHintRange = '2-170';
      if (hintVisible) {
        updateHintText();
      }
      
      // Deactivate learn mode if active
      if (window.learnModeActive) {
        window.learnModeActive = false;
        const learnBtn = document.getElementById('learnBtn');
        if (learnBtn) {
          learnBtn.classList.remove('active-range');
          learnBtn.style.borderColor = '#b91c1c';
        }
        updateMenuItems(); // Re-enable Freies spielen
      }
      
      // Generate new score with the new mode
      generateScore(2, 170);
    }
    
    function updateRangeButtonsFor2Dart() {
      // Dynamically check which ranges have 2-dart checkouts
      const buttons = document.querySelectorAll('.range-btn[data-min]');
      buttons.forEach(btn => {
        const min = parseInt(btn.dataset.min);
        const max = parseInt(btn.dataset.max);
        
        if (!isNaN(min) && !isNaN(max)) {
          // Check if ANY score in this range has a 2-dart checkout
          let hasCheckout = false;
          for (let score = min; score <= max; score++) {
            if (twoDartCheckouts[score] && twoDartCheckouts[score].length > 0) {
              hasCheckout = true;
              break;
            }
          }
          
          // If no checkout found in this range, disable the button
          if (!hasCheckout) {
            btn.classList.add('disabled');
          } else {
            btn.classList.remove('disabled');
          }
        }
      });
    }
    
    function updateRangeButtonsFor3Dart() {
      // Enable all buttons for 3-dart mode
      const buttons = document.querySelectorAll('.range-btn[data-min]');
      buttons.forEach(btn => {
        btn.classList.remove('disabled');
      });
    }
    
    function updateScoreTitle() {
      let title = '';
      if (currentMode === '3darts') {
        title = '3 Darts:';
      } else if (currentMode === '2darts') {
        title = '2 Darts:';
      } else if (currentMode === 'mixed') {
        // Show current mode based on which database is being used
        const is2Darts = currentCheckouts === twoDartCheckouts;
        title = is2Darts ? 'Mix (2 Darts):' : 'Mix (3 Darts):';
      }
      document.getElementById('scoreTitle').textContent = title;
    }
    
    const rangeHints = {
      '2-170': {
        title: 'Erstmal zu den wichtigsten Bereichsgrenzen:',
        content: 'Du solltest am besten…<br><br>…unter <strong>131</strong> mit dem <em>dritten Dart</em> – so wartet bei der nächsten Aufnahme ein leichteres High Finish auf dich.<br><br>…unter <strong>111</strong> mit dem <em>ersten Dart</em> und ohne eine kleine Bogey Zahl zu treffen (109, 108, 106, 105, 103, 102, 99) – damit die Out-Chance erhalten bleibt.<br><br>…unter <strong>91</strong> mit dem <em>dritten Dart</em> – dann ist bei der nächsten Aufnahme ein Out ohne T mit <strong>BULL</strong> möglich. Bei unter <strong>81</strong> mit dem <em>dritten Dart</em> geht es sogar ohne T und <strong>BULL</strong>.<br><br>…unter <strong>71</strong> mit dem <em>ersten Dart</em> – so hast du gute Chancen auf ein Out!<br><br>…unter <strong>61</strong> mit dem <em>ersten Dart</em> – dann ist ein Out über S – D möglich.'
      },
      
      '2-40': {
        title: 'Gruppe 2 – 40',
        content: 'Hier ist das Rechnen einfach, ein paar Grundregeln helfen dennoch:<br><br><strong>Doubles nutzen:</strong> Wenn ein Double verfügbar ist, zielt man meist direkt darauf. Umbauen (z. B. 14 → S6 – D4) kostet einen Dart mehr und lohnt sich nur bei starker Unsicherheit auf ein bestimmtes Double.<br><br><strong>Sichere Doubles:</strong> Manche Spieler bevorzugen D1 – nur wenn man sich dort sehr sicher fühlt, lohnt es sich. Andere Doubles sind meist besser.<br><br><strong>Überwerfen vermeiden:</strong> Wenn ein Risiko besteht, das Ziel zu überwerfen, sollte man das immer berücksichtigen.<br><br><strong>Ungerade Zahlen:</strong> Alle ungeraden Zahlen muss man sich erst stellen. Das Cluster S7 / S19 / S3 / S17 verzeiht oft einen Fehlwurf zur Seite, kann aber eventuell ein etwas kniffligeres Double zur Folge haben. Schönere Double können sich über S1, S5, S9, S11, S13 oder S15 erspielt werden.'
      },
      
      '41-60': {
        title: 'Gruppe 41 – 60',
        content: 'In diesem Bereich muss jedes Double erst vorbereitet werden.<br><br><strong>Über Single zum Double:</strong> In der Regel stellen wir immer über ein Single aufs Double-Out. Sinnvolle Ausnahme: 52 über T12 – D4, da S12 auf D20 stellt.<br><br><strong>Bevorzugte Doubles:</strong> Hohe und gerade Doubles (D20, D18, D16, D12).<br><br><strong>Überwerfen vermeiden:</strong> Das gewählte Single sollte so liegen, dass auch ein Treffer ins Double oder Triple nicht zum Überwerfen führt.<br><br><strong>Sichere Cluster:</strong> S6 / S10 oder S8 / S16. Um auf Nummer sicher zu gehen, kann man hier den Draht zwischen den Feldern anvisieren.<br><br><strong>Ungerade Cluster:</strong> S7 / S19 / S3 / S17 werden hier seltener genutzt, da sie ungünstigere Doubles ergeben.<br><br><strong>Anzahl der Darts:</strong> Ob du für die Aufnahme noch 2 oder 3 Darts übrig hast, spielt unter 61 Punkten noch keine Rolle.<br><br><strong>BULL-Finish:</strong> Tut mir leid 😅 – eher nicht. Ein beliebiges Double zu treffen ist wahrscheinlicher.'
      },
      
      '61-70': {
        title: 'Gruppe 61 – 70',
        content: 'In diesem Bereich ist es entscheidend, ob 2 oder 3-Darts zur Verfügung stehen. Mit 2-Darts braucht man entweder ein Triple oder ein BULL-Finish.<br><br><strong>Einfache Grundregel für 2-Dart-Finish (2DF) in dieser Gruppe:</strong><br>Der erste Dart geht auf das höchste Triple, das zur Einerstelle passt.<br><br><strong>Beispiele:</strong><br>7<strong>0</strong>&nbsp;&nbsp;&nbsp;T2<strong>0</strong> – D5&nbsp;&nbsp;&nbsp;&nbsp;(S20 → DB)<br>6<strong>9</strong>&nbsp;&nbsp;&nbsp;T1<strong>9</strong> – D6&nbsp;&nbsp;&nbsp;&nbsp;(S19 → DB)<br>6<strong>8</strong>&nbsp;&nbsp;&nbsp;T1<strong>8</strong> – D7&nbsp;&nbsp;&nbsp;&nbsp;(S18 → DB)<br>6<strong>7</strong>&nbsp;&nbsp;&nbsp;T1<strong>7</strong> – D8&nbsp;&nbsp;&nbsp;&nbsp;(S17 → DB)<br>6<strong>6</strong>&nbsp;&nbsp;&nbsp;T1<strong>6</strong> – D9&nbsp;&nbsp;&nbsp;&nbsp;(S16 → DB)<br>6<strong>5</strong>&nbsp;&nbsp;&nbsp;T1<strong>5</strong> – D10&nbsp;&nbsp;&nbsp;(S15 → DB)<br>6<strong>4</strong>&nbsp;&nbsp;&nbsp;T1<strong>4</strong> – D11&nbsp;&nbsp;&nbsp;(S14 → DB)<br>6<strong>3</strong>&nbsp;&nbsp;&nbsp;T1<strong>3</strong> – D12&nbsp;&nbsp;&nbsp;(S13 → DB)<br>6<strong>2</strong>&nbsp;&nbsp;&nbsp;T1<strong>2</strong> – D13&nbsp;&nbsp;&nbsp;(S12 → DB)<br>6<strong>1</strong>&nbsp;&nbsp;&nbsp;T1<strong>1</strong> – D14&nbsp;&nbsp;&nbsp;(S11 → DB)<br><br><strong>Vorteil:</strong> Trifft man statt des Triples nur das Single, bleibt immer ein Finish über BULL.<br><br><strong>Welches Double folgt auf´s Triple:</strong> Zahlen über Zahlen 🙈. Zum Glück muss man sich die Endziffern nur einmal merken, da spiegelbar:<br>T2<strong>0</strong> – D<strong>5</strong>&nbsp;&nbsp;&nbsp;&nbsp;T1<strong>5</strong> – D1<strong>0</strong><br>T1<strong>9</strong> – D<strong>6</strong>&nbsp;&nbsp;&nbsp;&nbsp;T1<strong>6</strong> – D<strong>9</strong><br>T1<strong>8</strong> – D<strong>7</strong>&nbsp;&nbsp;&nbsp;&nbsp;T1<strong>7</strong> – D<strong>8</strong><br><br>T1<strong>4</strong> – D1<strong>1</strong>&nbsp;&nbsp;&nbsp;&nbsp;T1<strong>1</strong> – D1<strong>4</strong><br>T1<strong>3</strong> – D1<strong>2</strong>&nbsp;&nbsp;&nbsp;&nbsp;T1<strong>2</strong> – D1<strong>3</strong><br><br><strong>3-Dart-Finish (3DF):</strong> Hier wählt man einen anderen Weg, um sowohl BULL als auch unangenehme Doubles zu vermeiden.<br><br><strong>Ziel beim 3DF:</strong> Trifft der erste Dart nur ein Single, muss anschließend ein Checkout aus dem Bereich 41–60 möglich sein. Deshalb wird zuerst ein Feld gewählt, das zuverlässig unter 61 Punkte führt. Da dieser Abstand klein ist, werden beim 3DF in dieser Gruppe auch niedrigere Triples bewusst angespielt.'
      },
      
      '71-90': {
        title: 'Gruppe 71 – 90',
        content: '<strong>Erster Dart im 3DF:</strong> Der Einstieg muss sicher unter 71, idealerweise unter 61 führen. Dafür werden meist hohe Triples gespielt, was die Zahl sinnvoller Wege begrenzt.<br><br><strong>2DF vs. 3DF:</strong> In diesem Bereich unterscheiden sich beide Varianten weiterhin, fallen aber häufiger zusammen als in der Gruppe 61–70.<br><br><strong>3DF-Strategie:</strong> Jeder Dart sollte dich mindestens in den nächsten Checkout-Bereich bringen<br>(Bsp. 88 Rest über T20 à D14).<br><br><strong>2DF-Strategie:</strong> Das erste Triple darf niedriger gewählt werden, um ein angenehmeres Double zu erhalten; der direkte Sprung in den nächsten Bereich ist nicht zwingend nötig<br>(Bsp. 88 Rest über T16 à D20).<br><br><strong>Routine aufbauen:</strong> Durch das Training der vorherigen Gruppen landest du nach dem ersten Dart meist in einem vertrauten 2DF-Bereich. Mit zunehmender Sicherheit läuft das Rechnen automatisch und bremst nicht mehr.'
      },
      
      '91-95': {
        title: 'Gruppe 91 – 95',
        content: '<strong>2DF:</strong> In diesem Bereich gibt es praktisch nur eine sinnvolle Variante, da alternative Wege meist zu ungünstigen Doubles führen.<br><br><strong>3DF:</strong> Die Zahlen dieser Gruppe werden bevorzugt mit einem Wurf auf BULL eröffnet. Grund: Selbst ein Treffer in S25 bringt dich sicher unter die magische 71.<br><br><strong>Hinweis:</strong> Einen Wurf auf BULL zur <em>Sicherheit</em> zu nutzen setzt ein gewisses Niveau voraus – Willkommen bei den Großen.'
      },
      
      '96-100': {
        title: 'Gruppe 96 – 100',
        content: '<strong>2DF vs. 3DF:</strong> In diesem Bereich gibt es keinen Unterschied zwischen 2DF und 3DF.<br><br><strong>Singlewurf:</strong> Ein Treffer ins Single führt direkt in einen Checkout-Bereich der vorherigen Gruppe.<br><br><strong>Kleine Bogey-Zahl:</strong> Die 99 Punkte kann man mit 2 Darts nicht checken. Als erstes 3DF könnte man hier mit T20 starten; jedoch bei S19 bleiben 80 Punkte Rest <em>(Tops–Tops)</em>.<br><br><strong>100 Punkte:</strong> Üblicher Start ist T20, wobei die S1 zu treffen schon sehr, sehr ungünstig wäre.'
      },
      
      '101-110': {
        title: 'Gruppe 101 – 110',
        content: 'Dieser Bereich ist sehr unterschiedlich aufgebaut. 2DF und 3DF überschneiden sich, zudem tauchen mehrere <em>kleine Bogey-Zahlen</em> auf.<br><br><strong>Kein 2DF möglich:</strong> 99, 102, 103, 105, 106, 108 und 109 lassen sich unter 110 nicht mit zwei Darts checken – vergleichbar mit den klassischen 3-Dart-Bogeys (z. B. 169, 168, 166 …).<br><br><strong>2DF über BULL:</strong> Die Werte 101, 104, 107 und 110 werden mit zwei Darts immer über BULL gecheckt.<br><br><strong>3DF-Spielraum:</strong> Diese kleineren High Finishes erlauben auch ein Single im 3DF.<br><br><strong>Bogey-Zahlen:</strong> Der erste Dart darf nicht auf eine kleine Bogey-Zahl führen. Beispiel: Start bei 104 über T20 und Treffer in S1 ergibt 103 – kein 2DF. Deshalb werden Sicherheitswege genutzt, um solche Restpunkte zu vermeiden.'
      },
      
      '111-130': {
        title: 'Gruppe 111 – 130',
        content: '<strong>Nur 3DF:</strong> In diesem Bereich ist ein Checkout ausschließlich mit drei Darts möglich.<br><br><strong>Ein Triple genügt:</strong> Für das Finish reicht ein einziger Triple-Treffer aus.<br><br><strong>Anforderung an den ersten Dart:</strong><br>• Als Triple muss er in den Bereich unter 71 führen.<br>• Als Single darf er keine kleine Bogey-Zahl hinterlassen.'
      },
      
      '131-158': {
        title: 'Gruppe 131 – 158',
        content: '<strong>Zwei Triples nötig:</strong> In diesem Bereich erfordert jedes 3DF zwei Triple. Die Ausnahmen 132 und 135 können auch über S25 eröffnet werden.<br><br><strong>Ziel nach erstem Dart:</strong> Um im Finish zu bleiben, muss der erste Wurf auf 110, 107, 104, 101, 100 oder unter 99 führen.<br><br><strong>Erster Dart:</strong> Auf gerades oder ungerades Feld ist nicht entscheidend.<br><br><strong>Start über T20:</strong> Alle Werte über 129 lassen sich grundsätzlich über T20 eröffnen.<br><br><strong>Grundprinzip:</strong> Vereinfacht besteht dieser Bereich aus T20 + einem bekannten 2DF.<br><br><strong>Alternative Triple-Wege:</strong> Von T20 abzuweichen ist sinnvoll, wenn der Rhythmus passt, z. B.:<br>T19 – T19 ≙ T20 – T18<br>T18 – T18 ≙ T20 – T16<br>T17 – T17 ≙ T20 – T14<br>T16 – T16 ≙ T20 – T12…'
      },
      
      '159-170': {
        title: 'Gruppe 159 – 170',
        content: '<strong>Struktur:</strong> Dieser Bereich ist stark von Bogey-Zahlen durchzogen.<br><br><strong>Bogey-Zahlen:</strong> 159, 162, 163, 165, 166, 168 und 169 – sie entsprechen den kleinen Bogey-Zahlen plus 60.<br><br><strong>Ziel des ersten Darts:</strong> Der Einstieg sollte in einen 2DF-Bereich von 100–110 führen.<br><br><strong>T20 zum Start:</strong> Der erste Wurf auf T20 ist hier grundsätzlich immer eine solide Wahl.<br><br><strong>Alternative:</strong> T19 – T19 besitzt einen Rhythmusvorteil zu T20 – T18.'
      }
    };
    
    let currentHintRange = '2-170';
    let hintVisible = false;
    
    // Tutorial System
    const tutorialSteps = [
      {
        element: '#btn-tutorial',
        title: '☝️ Erwischt...',
        content: 'Schon witzig: Hätte hier <strong>Bedienungsanleitung</strong> gestanden, hättest du sicher nicht getippt, oder? 😅<br><br>Na gut – wenn du schon da bist, erkläre ich dir kurz die wichtigsten Funktionen und warum es mich überhaupt gibt.',
        position: 'top',
        screen: 'start'
      },
      {
        element: '#btn-training',
        title: '🎯 Willkommen in deiner Trainingsarena',
        content: 'Dart ist mehr als nur Pfeile werfen –<br>es ist Kopfsache. Wer sicher rechnet,<br>verschafft sich einen klaren Vorteil.<br>Denn je weniger du am Board überlegen<br>musst, desto klarer bleibt dein Fokus –<br>und desto einfacher wird das Spiel.<br><br>Ob du zwei oder drei Darts zum Checken<br>hast, macht einen entscheidenden<br>Unterschied. Gute Spieler wissen: Nicht<br>jeder Checkout-Weg ist gleich sinnvoll.<br>In dieser App lernst du, warum – und wie<br>du dein Spiel mit der richtigen Strategie<br>auf das nächste Level bringst.<br><br>Mach dich zum <strong>Checkout-Champion</strong>.',
        position: 'center',
        screen: 'start'
      },
      {
        element: '#btn-checkouts',
        title: '📊 Checkouts',
        content: 'Hier findest du deine Checkout-<br>Datenbank – unterteilt in 3-Dart-<br>und 2-Dart-Finishes.<br><br>Du bevorzugst andere Wege? Kein<br>Problem - Lege hier einfach deine<br>eigenen Checkouts fest.',
        position: 'top',
        screen: 'start'
      },
      {
        element: '#btn-leaderboard',
        title: '🏆 Bestenliste',
        content: 'Hier siehst du deine Rekorde aus dem<br>Herausforderungsmodus. Wie gut bist du<br>wirklich unter Druck? Finde es heraus! 🔥',
        position: 'top',
        screen: 'start'
      },
      {
        element: '#scoreCard',
        title: '🔓 Checkout-Zahl',
        content: 'Hier wird dir die zu checkende Zahl sowie der Restwert angezeigt. Durch Antippen kannst du die Zahl manuell ändern.<br><br><strong>Bedeutung der Feldfarben:</strong><br><strong style="color: #16a34a;">Grün</strong> – 3-Dart-Finish (3DF)<br><strong style="color: #3b82f6;">Blau</strong> – 2-Dart-Finish (2DF)<br><strong style="color: #eab308;">Gelb</strong> – Bogey-Zahl<br><br><strong>Nur im freien Spiel:</strong><br><strong style="color: #f97316;">Orange</strong> – Checken noch möglich<br><strong style="color: #dc2626;">Rot</strong> – Checken nicht mehr möglich',
        position: 'bottom',
        screen: 'training',
        setup: () => {
          currentScore = 133;
          currentCheckout = ['T20', 'T13', 'D20'];
          document.getElementById('scoreValue').textContent = '170';
          const scoreRemainingEl = document.getElementById('scoreRemaining');
          if (scoreRemainingEl) {
            scoreRemainingEl.textContent = 'Rest: 50';
          }
        }
      },
      {
        element: '#dartboard',
        title: '🎯 Dartboard',
        content: 'Du musst 170 Punkte checken?! Kein<br>Problem – hier ist es genauso leicht wie<br>am echten Board! Triff (klick) <strong>T20 · T20 ·<br>BULL</strong> und schnapp dir den <strong>BIG FISH</strong> 🎣',
        position: 'bottom',
        screen: 'training'
      },
      {
        element: '#userInputs',
        title: '📝 Eingaben-Box',
        content: 'Hier siehst du, welche Felder du <em>getroffen</em><br>hast.',
        position: 'top',
        screen: 'training',
        setup: () => {
          // Set score to 170
          currentScore = 170;
          currentCheckout = ['T20', 'T20', 'Bull'];
          document.getElementById('scoreValue').textContent = '170';
          
          // Simulate some inputs (not complete)
          userInputs = ['T20', 'T20'];
          const container = document.getElementById('userInputs');
          container.innerHTML = userInputs.map(input => 
            `<div class="user-input-chip">${input}</div>`
          ).join('');
          container.classList.remove('correct', 'wrong', 'active');
          
          // Make sure the box is visible
          container.style.display = 'flex';
          
          feedback = null;
        }
      },
      {
        element: '#userInputs',
        title: '✅ Richtige Lösung',
        content: 'Bei <strong>korrekter</strong> Eingabe wird die Box <strong style="color: #059669;">grün</strong><br>und die nächste Zahl wird automatisch<br>generiert.',
        position: 'top',
        screen: 'training',
        setup: () => {
          // Set score to 170
          currentScore = 170;
          currentCheckout = ['T20', 'T20', 'Bull'];
          document.getElementById('scoreValue').textContent = '170';
          
          // Simulate correct answer
          userInputs = ['T20', 'T20', 'Bull'];
          const container = document.getElementById('userInputs');
          container.innerHTML = userInputs.map(input => 
            `<div class="user-input-chip">${input}</div>`
          ).join('');
          container.classList.remove('wrong');
          container.classList.add('correct');
          container.style.display = 'flex';
          
          feedback = 'correct';
        }
      },
      {
        element: '#userInputs',
        title: '❌ Falsche Lösung',
        content: 'Ist deine Eingabe <strong>falsch</strong>, färbt sich die<br>Box <strong style="color: #dc2626;">rot</strong> und die richtige Lösung wird<br>angezeigt.<br><br>Die falsche Zahl wird automatisch in<br>deinen <strong>Lernbereich</strong> aufgenommen,<br>damit du sie später gezielt üben kannst.',
        position: 'top',
        screen: 'training',
        setup: () => {
          // Set score to 170
          currentScore = 170;
          currentCheckout = ['T20', 'T20', 'Bull'];
          document.getElementById('scoreValue').textContent = '170';
          
          // Simulate wrong answer
          userInputs = ['T20', 'T20', 'S25'];
          const container = document.getElementById('userInputs');
          container.innerHTML = userInputs.map(input => 
            `<div class="user-input-chip">${input}</div>`
          ).join('');
          
          // Add solution text
          const solutionDiv = document.createElement('div');
          solutionDiv.className = 'solution-text';
          solutionDiv.textContent = `Lösung: ${currentCheckout.join(' → ')}`;
          container.appendChild(solutionDiv);
          
          container.classList.remove('correct');
          container.classList.add('wrong');
          container.style.display = 'flex';
          
          feedback = 'wrong';
        }
      },
      {
        element: '#learnBtn',
        title: '📖 Lernbereich',
        content: 'Beantwortest du eine Zahl dann dreimal<br>hintereinander richtig, wird sie aus dem<br>Lernbereich wieder entfernt.<br><br><strong>Taste gedrückt halten</strong> – Zahlen löschen<br><strong>Taste antippen</strong> – Lernbereich betreten',
        position: 'top-right',
        screen: 'training'
      },
      {
        element: '.mode-selector',
        title: '🎮 Modus-Tasten',
        content: 'Mit den Modus-Tasten legst du deine<br>Trainingseinstellungen fest.<br><br><strong>3DF</strong> – Nur 3-Dart-Finishes<br><strong>2DF</strong> – Nur 2-Dart-Finishes<br><strong>Mix</strong> – Mischung aus 3DF / 2DF<br><br><strong>Reihenfolge</strong><br>🔀 zufällig<br>🔁 gleichbleibend<br>⬆️ aufsteigend<br>⬇️ absteigend<br><br>🏆 <strong>Herausforderungsmodus</strong><br>60 Sekunden. Zufällige Zahlen von 2-170.<br>Wie viele Checkouts schaffst du? 🔥',
        position: 'top',
        screen: 'training'
      },
      {
        element: '.range-grid',
        title: '📊 Schnellauswahl-Tasten',
        content: 'Mit den Schnellauswahl-Tasten<br>wechselst du schnell zwischen den<br>Zahlengruppen. Neugierig, was diese<br>Gruppen so besonders macht?<br><br><strong>Taste gedrückt halten</strong> – Infos anzeigen<br><strong>Taste antippen</strong> – Bereich auswählen<br><strong>Taste grau</strong> – Keine Einträge in der<br>Checkout-Datenbank hinterlegt',
        position: 'top',
        screen: 'training'
      },
      {
        element: '#menuBtn',
        title: '⚙️ Einstellungen',
        content: 'Im Einstellungsmenü findest du zusätzliche Optionen wie <em>Freies Spiel (Fehlwürfe erlaubt), Restwert ausblenden, Zahlenring ausblenden, Vibration ausschalten, Box ausblenden</em> und <em>Hintergrund anpassen</em>.<br><br><strong>Taste gedrückt halten</strong> – Vollbildmodus<br><strong>Taste antippen</strong> – Menü öffnen',
        position: 'top-right',
        screen: 'training'
      },
      {
        element: '#dartboard',
        title: '🏁 Ende der Fahnenstange',
        content: 'Du hast alle wichtigen Funktionen<br>kennengelernt. Jetzt bist du bereit!<br><br>Viel Erfolg – und vor allem: Viel Spaß<br>beim Training! 🎯',
        position: 'center',
        screen: 'training'
      }
    ];
    
    let currentTutorialStep = 0;
    let tutorialActive = false;
    let highlightedElement = null;
    
    function showHelp() {
      startTutorial();
    }
    
    function startTutorial() {
      vibrateMedium();
      const alreadyPressed = localStorage.getItem('dartTrainerMysteryBoxPressed') === 'true';
      currentTutorialStep = alreadyPressed ? 1 : 0;
      tutorialActive = true;
      
      // Stop pulse animation and mark as pressed
      const tutorialBtn = document.getElementById('btn-tutorial');
      if (tutorialBtn) {
        tutorialBtn.classList.remove('pulse');
        localStorage.setItem('dartTrainerMysteryBoxPressed', 'true');
      }
      
      // Ensure we're on the start screen
      const startScreen = document.getElementById('startScreen');
      const mainApp = document.getElementById('mainApp');
      if (startScreen && mainApp) {
        startScreen.style.display = 'flex';
        mainApp.style.display = 'none';
      }
      
      document.getElementById('tutorialOverlay').classList.add('active');
      showTutorialStep(currentTutorialStep);
      
      // Enter fullscreen
      enterFullscreen();
    }
    
    // ========================================
    // HELPER FUNCTION: Restore rangeCard visibility
    // ========================================
    function restoreRangeCardVisibility(context = '') {
      const rangeCard = document.getElementById('rangeCard');
      if (rangeCard) {
        // Restore all children to full opacity
        Array.from(rangeCard.children).forEach(child => {
          child.style.transition = 'none';
          child.style.opacity = '1.0';
        });
        
        rangeCard.style.borderColor = 'white';  // Restore full border
        window.rangeCardDimming = false;
        window.rangeCardActive = true;
        console.log('[DEBUG] RangeCard restored to 100%' + (context ? ' - ' + context : ''));
        
        setTimeout(() => {
          Array.from(rangeCard.children).forEach(child => {
            child.style.transition = 'opacity 3s ease';
          });
        }, 50);
      }
    }
    
    // ========================================
    // TUTORIAL SYSTEM
    // ========================================
    
    function showTutorialStep(stepIndex) {
      // Restore rangeCard visibility for tutorial
      restoreRangeCardVisibility('tutorial');
      
      if (stepIndex < 0 || stepIndex >= tutorialSteps.length) {
        endTutorial();
        return;
      }
      
      currentTutorialStep = stepIndex;
      const step = tutorialSteps[stepIndex];
      
      // Rename button when step 1 ("Willkommen") is reached
      if (stepIndex >= 1) {
        const tutorialBtn = document.getElementById('btn-tutorial');
        if (tutorialBtn) {
          const btnText = tutorialBtn.querySelector('.start-btn-text');
          const btnIcon = tutorialBtn.querySelector('.start-btn-icon');
          if (btnText) btnText.innerHTML = 'Bedienungs-<br>anleitung';
          if (btnIcon) btnIcon.textContent = '📖';
        }
      }
      
      // Handle screen switching - BOTH DIRECTIONS
      const startScreen = document.getElementById('startScreen');
      const mainApp = document.getElementById('mainApp');
      
      // Check if we need to switch screens
      let needsScreenSwitch = false;
      
      if (step.screen === 'training') {
        // Switch to training if currently on start
        if (startScreen && mainApp && startScreen.style.display !== 'none') {
          needsScreenSwitch = true;
          startScreen.style.display = 'none';
          mainApp.style.display = 'block';
          
          // Activate fullscreen when switching to training
          const elem = document.documentElement;
          if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
              console.log('Fullscreen request failed:', err);
            });
          } else if (elem.webkitRequestFullscreen) { // Safari
            elem.webkitRequestFullscreen();
          } else if (elem.mozRequestFullScreen) { // Firefox
            elem.mozRequestFullScreen();
          } else if (elem.msRequestFullscreen) { // IE11
            elem.msRequestFullscreen();
          }
        }
      } else if (step.screen === 'start') {
        // Switch to start if currently on training
        if (startScreen && mainApp && mainApp.style.display !== 'none') {
          needsScreenSwitch = true;
          startScreen.style.display = 'flex';
          mainApp.style.display = 'none';
        }
      }
      
      // Only wait if we actually switched screens, otherwise continue immediately
      const delay = needsScreenSwitch ? 100 : 0;
      
      setTimeout(() => {
        // Execute setup function if provided
        if (step.setup && typeof step.setup === 'function') {
          console.log('Executing tutorial setup for step', stepIndex);
          step.setup();
        }
        
        const element = document.querySelector(step.element);
        
        if (!element) {
          console.error('Tutorial element not found:', step.element);
          // Still show navigation buttons even if element not found
          updateTutorialNavigation(stepIndex);
          return;
        }
        
        // Remove previous spotlight
        if (highlightedElement) {
          highlightedElement.classList.remove('tutorial-spotlight');
        }
        
        // Add spotlight to current element
        element.classList.add('tutorial-spotlight');
        highlightedElement = element;
        
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Update tooltip content
        document.getElementById('tutorialTitle').textContent = step.title;
        document.getElementById('tutorialContent').innerHTML = step.content;
        document.getElementById('tutorialProgress').textContent = `Schritt ${stepIndex + 1} von ${tutorialSteps.length}`;
        
        updateTutorialNavigation(stepIndex);
        
        // Position tooltip with minimal delay
        setTimeout(() => {
          positionTooltip(element, step.position);
        }, 30);
        
        // Show tooltip
        const tooltip = document.getElementById('tutorialTooltip');
        tooltip.style.display = 'block';
        tooltip.setAttribute('data-position', step.position);
      }, delay);
    }
    
    function updateTutorialNavigation(stepIndex) {
      // Update dots
      const dotsContainer = document.getElementById('tutorialDots');
      dotsContainer.innerHTML = '';
      for (let i = 0; i < tutorialSteps.length; i++) {
        const dot = document.createElement('div');
        dot.className = 'tutorial-dot' + (i === stepIndex ? ' active' : '');
        // Make dots clickable to jump to specific step
        dot.addEventListener('click', function() {
          showTutorialStep(i);
        });
        dotsContainer.appendChild(dot);
      }
      
      // Update buttons
      const backBtn = document.getElementById('tutorialBack');
      const nextBtn = document.getElementById('tutorialNext');
      
      // Show/hide back button
      if (stepIndex === 0) {
        backBtn.style.display = 'none';
      } else {
        backBtn.style.display = 'block';
      }
      
      // Update button texts
      backBtn.textContent = '<';
      nextBtn.textContent = '>';
    }
      
    
    function positionTooltip(element, position) {
      const tooltip = document.getElementById('tutorialTooltip');
      const rect = element.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      
      let top, left;
      
      switch (position) {
        case 'center':
          // Center the tooltip on the screen
          top = (window.innerHeight / 2) - (tooltipRect.height / 2);
          left = (window.innerWidth / 2) - (tooltipRect.width / 2);
          break;
        case 'bottom':
          top = rect.bottom + 20;
          left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'bottom-right':
          // Tooltip below element, arrow points to element from left
          top = rect.bottom + 20;
          left = rect.left - 30 + (rect.width / 2);
          break;
        case 'bottom-left':
          // Tooltip below element, arrow points to element from right (mirrored to bottom-right)
          top = rect.bottom + 20;
          left = rect.right - tooltipRect.width + 30 - (rect.width / 2);
          break;
        case 'top':
          top = rect.top - tooltipRect.height - 20;
          left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'top-right':
          // Tooltip above element, arrow points to element from right
          top = rect.top - tooltipRect.height - 20;
          left = rect.right - tooltipRect.width + 30;
          break;
        case 'top-left':
          // Tooltip above element, arrow points to element from left (mirrored to top-right)
          top = rect.top - tooltipRect.height - 20;
          left = rect.left - 30;
          break;
        case 'left':
          top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
          left = rect.left - tooltipRect.width - 20;
          break;
        case 'right':
          top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
          left = rect.right + 20;
          break;
      }
      
      // Keep tooltip in viewport
      const margin = 10;
      if (left < margin) left = margin;
      if (left + tooltipRect.width > window.innerWidth - margin) {
        left = window.innerWidth - tooltipRect.width - margin;
      }
      if (top < margin) top = margin;
      if (top + tooltipRect.height > window.innerHeight - margin) {
        top = window.innerHeight - tooltipRect.height - margin;
      }
      
      tooltip.style.top = top + 'px';
      tooltip.style.left = left + 'px';
    }
    
    function nextTutorialStep() {
      if (currentTutorialStep < tutorialSteps.length - 1) {
        showTutorialStep(currentTutorialStep + 1);
      } else {
        endTutorial();
      }
    }
    
    function prevTutorialStep() {
      if (currentTutorialStep > 0) {
        showTutorialStep(currentTutorialStep - 1);
      }
    }
    
    function endTutorial() {
      tutorialActive = false;
      document.getElementById('tutorialOverlay').classList.remove('active');
      document.getElementById('tutorialTooltip').style.display = 'none';
      
      if (highlightedElement) {
        highlightedElement.classList.remove('tutorial-spotlight');
        highlightedElement = null;
      }
      
      // Reset any tutorial-specific state
      userInputs = [];
      feedback = null;
      const container = document.getElementById('userInputs');
      if (container) {
        container.innerHTML = '';
        container.classList.remove('correct', 'wrong', 'active');
      }
      
      // Generate a fresh score for training
      generateScore(currentRangeMin, currentRangeMax);
    }
    
    // Swipe gesture for tutorial navigation
    let tutorialTouchStartX = 0;
    let tutorialTouchEndX = 0;
    let tutorialTouchStartY = 0;
    let tutorialTouchEndY = 0;
    
    const tutorialTooltip = document.getElementById('tutorialTooltip');
    
    if (tutorialTooltip) {
      tutorialTooltip.addEventListener('touchstart', function(e) {
        tutorialTouchStartX = e.changedTouches[0].screenX;
        tutorialTouchStartY = e.changedTouches[0].screenY;
      }, false);
      
      tutorialTooltip.addEventListener('touchend', function(e) {
        tutorialTouchEndX = e.changedTouches[0].screenX;
        tutorialTouchEndY = e.changedTouches[0].screenY;
        handleTutorialSwipe();
      }, false);
    }
    
    function handleTutorialSwipe() {
      if (!tutorialActive) return;
      
      const diffX = tutorialTouchEndX - tutorialTouchStartX;
      const diffY = tutorialTouchEndY - tutorialTouchStartY;
      
      // Check if vertical swipe is dominant (not horizontal scroll)
      if (Math.abs(diffY) > Math.abs(diffX)) {
        // Swipe up (next step)
        if (diffY < -50) {
          console.log('Swipe up detected - next tutorial step');
          nextTutorialStep();
        }
        // Swipe down (previous step)
        else if (diffY > 50) {
          console.log('Swipe down detected - previous tutorial step');
          prevTutorialStep();
        }
      }
    }
    
    // Tutorial event listeners
    document.addEventListener('DOMContentLoaded', function() {
      document.getElementById('tutorialClose').addEventListener('click', endTutorial);
      document.getElementById('tutorialNext').addEventListener('click', nextTutorialStep);
      document.getElementById('tutorialBack').addEventListener('click', prevTutorialStep);
      document.getElementById('tutorialOverlay').addEventListener('click', function(e) {
        // Do nothing - overlay click should not close tutorial
      });
      
      // Pulse animation for Mystery-Box button if never pressed before
      const mysteryPressed = localStorage.getItem('dartTrainerMysteryBoxPressed');
      if (!mysteryPressed) {
        const tutorialBtn = document.getElementById('btn-tutorial');
        if (tutorialBtn) {
          tutorialBtn.classList.add('pulse');
        }
      } else {
        // Already pressed before - show proper label and icon
        const btnText = document.querySelector('#btn-tutorial .start-btn-text');
        const btnIcon = document.querySelector('#btn-tutorial .start-btn-icon');
        if (btnText) btnText.innerHTML = 'Bedienungs-<br>anleitung';
        if (btnIcon) btnIcon.textContent = '📖';
      }
      
      // Prevent tooltip clicks from closing tutorial
      document.getElementById('tutorialTooltip').addEventListener('click', function(e) {
        e.stopPropagation();
      });
      
      // ESC key to close tutorial
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && tutorialActive) {
          endTutorial();
        }
        if (e.key === 'ArrowRight' && tutorialActive) {
          nextTutorialStep();
        }
        if (e.key === 'ArrowLeft' && tutorialActive) {
          prevTutorialStep();
        }
      });
    });
    
    function showRangeHint(hintKey) {
      // Restore rangeCard visibility for hints modal
      restoreRangeCardVisibility('hints modal');
      
      const modal = document.getElementById('hintsModal');
      const content = document.getElementById('hintsContent');
      const titleElement = modal.querySelector('.modal-title');
      
      // Get hint object
      const hintObj = rangeHints[hintKey];
      
      if (hintObj) {
        // Set title and content
        titleElement.textContent = hintObj.title;
        content.innerHTML = hintObj.content;
      } else {
        // Fallback
        titleElement.textContent = '💡 Hinweise';
        content.innerHTML = 'Keine Hinweise verfügbar.';
      }
      
      // Reset scroll position
      setTimeout(() => {
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) modalBody.scrollTop = 0;
      }, 0);
      
      modal.style.display = 'flex';
    }
    
    function closeHintsModal() {
      document.getElementById('hintsModal').style.display = 'none';
    }
    
    function showBackgroundModal() {
      // Restore rangeCard visibility for background modal
      restoreRangeCardVisibility('background modal');
      
      document.getElementById('backgroundModal').style.display = 'flex';
    }
    
    function closeBackgroundModal() {
      document.getElementById('backgroundModal').style.display = 'none';
    }
    
    
    // Color customization system
    let colorTarget = 'background'; // 'background' or 'field'
    
    function setColorTarget(target) {
      colorTarget = target;
      
      // Update toggle buttons
      const bgBtn = document.getElementById('toggleBackground');
      const fieldBtn = document.getElementById('toggleField');
      const imagesSection = document.getElementById('imagesSection');
      
      if (target === 'background') {
        bgBtn.classList.add('active');
        fieldBtn.classList.remove('active');
        // Zeige Bilder-Sektion
        if (imagesSection) {
          imagesSection.style.display = 'block';
        }
      } else {
        bgBtn.classList.remove('active');
        fieldBtn.classList.add('active');
        // Verstecke Bilder-Sektion
        if (imagesSection) {
          imagesSection.style.display = 'none';
        }
      }
    }
    
    let selectedCustomColor = '#064e3b'; // Store selected color from canvas
    
    function applyCustomColor() {
      const color = selectedCustomColor;
      
      // Create lighter version for gradient
      const lighterColor = adjustBrightness(color, 20);
      const gradient = `linear-gradient(135deg, ${color} 0%, ${lighterColor} 100%)`;
      
      if (colorTarget === 'background') {
        document.body.style.background = gradient;
        const startScreen = document.querySelector('.start-screen');
        if (startScreen) {
          startScreen.style.background = gradient;
        }
        localStorage.setItem('dartTrainerBackgroundCustom', gradient);
        // Update Session-Hintergrund
        localStorage.setItem('dartTrainerBackgroundSession', gradient);
      } else {
        const rangeCard = document.querySelector('#rangeCard');
        if (rangeCard) {
          rangeCard.style.background = gradient;
          rangeCard.style.border = '1px solid #000';
        }
        localStorage.setItem('dartTrainerFieldCustom', gradient);
        localStorage.setItem('dartTrainerFieldBorder', '1px solid #000');
      }
    }
    
    function applyPresetColor(color1, color2) {
      const gradient = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
      
      if (colorTarget === 'background') {
        document.body.style.background = gradient;
        const startScreen = document.querySelector('.start-screen');
        if (startScreen) {
          startScreen.style.background = gradient;
        }
        localStorage.setItem('dartTrainerBackgroundCustom', gradient);
        // Update Session-Hintergrund
        localStorage.setItem('dartTrainerBackgroundSession', gradient);
      } else {
        const rangeCard = document.querySelector('#rangeCard');
        if (rangeCard) {
          rangeCard.style.background = gradient;
          rangeCard.style.border = '1px solid #000';
        }
        localStorage.setItem('dartTrainerFieldCustom', gradient);
        localStorage.setItem('dartTrainerFieldBorder', '1px solid #000');
      }
    }
    
    function applyImageBackground(imageName) {
      if (colorTarget === 'background') {
        const imageStyle = `url('${imageName}') center/cover no-repeat fixed`;
        document.body.style.background = imageStyle;
        const startScreen = document.querySelector('.start-screen');
        if (startScreen) {
          startScreen.style.background = imageStyle;
        }
        localStorage.setItem('dartTrainerBackgroundCustom', imageStyle);
        // Update Session-Hintergrund
        localStorage.setItem('dartTrainerBackgroundSession', imageStyle);
        
        // Disable random mode when specific background is selected
        localStorage.setItem('dartTrainerBackgroundRandom', 'false');
        if (window.updateRandomButtonState) {
          window.updateRandomButtonState();
        }
      }
      // Image background only works for body background, not for field
    }
    
    function applyTransparent() {
      // Transparent only works for field, not for body background
      if (colorTarget === 'field') {
        const rangeCard = document.querySelector('#rangeCard');
        if (rangeCard) {
          rangeCard.style.background = 'transparent';
          rangeCard.style.border = '1px solid white';
        }
        localStorage.setItem('dartTrainerFieldCustom', 'transparent');
        localStorage.setItem('dartTrainerFieldBorder', '1px solid white');
      }
    }
    
    // Helper function to adjust color brightness
    function adjustBrightness(hex, percent) {
      // Remove # if present
      hex = hex.replace('#', '');
      
      // Convert to RGB
      let r = parseInt(hex.substring(0, 2), 16);
      let g = parseInt(hex.substring(2, 4), 16);
      let b = parseInt(hex.substring(4, 6), 16);
      
      // Adjust brightness
      r = Math.min(255, Math.floor(r * (100 + percent) / 100));
      g = Math.min(255, Math.floor(g * (100 + percent) / 100));
      b = Math.min(255, Math.floor(b * (100 + percent) / 100));
      
      // Convert back to hex
      return '#' + 
        r.toString(16).padStart(2, '0') + 
        g.toString(16).padStart(2, '0') + 
        b.toString(16).padStart(2, '0');
    }
    
    // Initialize canvas-based color picker
    function initColorPicker() {
      const canvas = document.getElementById('colorCanvas');
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      
      // Draw color spectrum
      function drawColorSpectrum() {
        // Create horizontal gradient for hue
        for (let x = 0; x < width; x++) {
          const hue = (x / width) * 360;
          
          // Create vertical gradient for saturation/value
          const gradient = ctx.createLinearGradient(0, 0, 0, height);
          gradient.addColorStop(0, `hsl(${hue}, 100%, 100%)`); // White at top
          gradient.addColorStop(0.5, `hsl(${hue}, 100%, 50%)`); // Pure color in middle
          gradient.addColorStop(1, `hsl(${hue}, 100%, 0%)`); // Black at bottom
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x, 0, 1, height);
        }
      }
      
      drawColorSpectrum();
      
      // Handle canvas click
      canvas.addEventListener('click', function(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Get pixel color at click position
        const imageData = ctx.getImageData(x, y, 1, 1);
        const data = imageData.data;
        
        // Convert RGB to hex
        const r = data[0];
        const g = data[1];
        const b = data[2];
        const hex = '#' + 
          r.toString(16).padStart(2, '0') + 
          g.toString(16).padStart(2, '0') + 
          b.toString(16).padStart(2, '0');
        
        // Update selected color
        selectedCustomColor = hex;
        
        // Update preview
        const preview = document.getElementById('colorPreview');
        if (preview) {
          preview.style.background = hex;
        }
      });
      
      // Handle touch events for mobile
      canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Get pixel color at touch position
        const imageData = ctx.getImageData(x, y, 1, 1);
        const data = imageData.data;
        
        // Convert RGB to hex
        const r = data[0];
        const g = data[1];
        const b = data[2];
        const hex = '#' + 
          r.toString(16).padStart(2, '0') + 
          g.toString(16).padStart(2, '0') + 
          b.toString(16).padStart(2, '0');
        
        // Update selected color
        selectedCustomColor = hex;
        
        // Update preview
        const preview = document.getElementById('colorPreview');
        if (preview) {
          preview.style.background = hex;
        }
      });
    }
    
    function setupRandomBackgroundButton() {
      // Find background image grid/container
      // This will add a "Random" button to the background selection
      // We'll create this button programmatically and insert it
      
      // Create toggle function for random mode
      window.toggleRandomBackground = function() {
        const currentMode = localStorage.getItem('dartTrainerBackgroundRandom');
        const newMode = currentMode === 'true' ? 'false' : 'true';
        
        localStorage.setItem('dartTrainerBackgroundRandom', newMode);
        
        // If turning ON random mode, clear custom background
        if (newMode === 'true') {
          localStorage.removeItem('dartTrainerBackgroundCustom');
          // Lösche auch Session-Hintergrund, damit beim nächsten Laden ein neuer gewählt wird
          localStorage.removeItem('dartTrainerBackgroundSession');
          console.log('[DEBUG] Random background mode enabled');
        } else {
          console.log('[DEBUG] Random background mode disabled');
        }
        
        // Reload background immediately
        loadBackground();
        
        // Update button appearance
        updateRandomButtonState();
      };
      
      // Function to update random button visual state
      window.updateRandomButtonState = function() {
        const randomBtn = document.getElementById('randomBackgroundBtn');
        if (randomBtn) {
          const isRandom = localStorage.getItem('dartTrainerBackgroundRandom') === 'true';
          if (isRandom) {
            randomBtn.style.border = '3px solid #10b981';
            randomBtn.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.5)';
          } else {
            randomBtn.style.border = '2px solid #000';
            randomBtn.style.boxShadow = 'none';
          }
        }
      };
      
      // Set initial button state
      setTimeout(() => {
        updateRandomButtonState();
      }, 100);
    }
    
    function loadBackground() {
      // ZUERST: Prüfe ob ein Session-Hintergrund existiert (vom inline Script gesetzt)
      let backgroundToUse = localStorage.getItem('dartTrainerBackgroundSession');
      
      if (backgroundToUse) {
        // Session-Hintergrund existiert - verwende diesen
        console.log('[DEBUG] Using session background from initial load');
      } else {
        // Kein Session-Hintergrund - wähle einen (Fallback)
        const randomMode = localStorage.getItem('dartTrainerBackgroundRandom');
        
        if (randomMode === 'true') {
          // Random mode: Pick a random background from available backgrounds
          const backgrounds = [
            'Hintergrund1.jpg', 'Hintergrund2.jpg', 'Hintergrund3.jpg',
            'Hintergrund4.jpg', 'Hintergrund5.jpg', 'Hintergrund6.jpg',
            'Hintergrund7.jpg', 'Hintergrund8.jpg', 'Hintergrund9.jpg',
            'Hintergrund10.jpg', 'Hintergrund11.jpg'
          ];
          const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
          backgroundToUse = `url('${randomBg}') center/cover no-repeat fixed`;
          console.log('[DEBUG] Random background mode: Selected', randomBg);
        } else {
          // Load custom background or use random as default
          const savedBg = localStorage.getItem('dartTrainerBackgroundCustom');
          if (savedBg) {
            backgroundToUse = savedBg;
          } else {
            // Default: Random background
            const backgrounds = [
              'Hintergrund1.jpg', 'Hintergrund2.jpg', 'Hintergrund3.jpg',
              'Hintergrund4.jpg', 'Hintergrund5.jpg', 'Hintergrund6.jpg',
              'Hintergrund7.jpg', 'Hintergrund8.jpg', 'Hintergrund9.jpg',
              'Hintergrund10.jpg', 'Hintergrund11.jpg'
            ];
            const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
            backgroundToUse = `url('${randomBg}') center/cover no-repeat fixed`;
            // Set random mode as default
            localStorage.setItem('dartTrainerBackgroundRandom', 'true');
            console.log('[DEBUG] First load in loadBackground() - Random enabled by default:', randomBg);
          }
        }
        
        // Speichere den gewählten Hintergrund als Session-Hintergrund
        localStorage.setItem('dartTrainerBackgroundSession', backgroundToUse);
      }
      
      document.body.style.background = backgroundToUse;
      const startScreen = document.querySelector('.start-screen');
      if (startScreen) {
        startScreen.style.background = backgroundToUse;
      }
      
      // Load custom field color
      const savedField = localStorage.getItem('dartTrainerFieldCustom');
      const savedBorder = localStorage.getItem('dartTrainerFieldBorder');
      if (savedField) {
        const rangeCard = document.querySelector('#rangeCard');
        if (rangeCard) {
          rangeCard.style.background = savedField;
          if (savedBorder) {
            rangeCard.style.border = savedBorder;
          }
        }
      }
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
      const leaderboardModal = document.getElementById('leaderboardModal');
      const hintsModal = document.getElementById('hintsModal');
      const backgroundModal = document.getElementById('backgroundModal');
      
      if (event.target === leaderboardModal) {
        closeLeaderboard();
      }
      if (event.target === hintsModal) {
        closeHintsModal();
      }
      if (event.target === backgroundModal) {
        closeBackgroundModal();
      }
    });
    
    function updateHintText() {
      const hintText = document.getElementById('hintText');
      const hint = rangeHints[currentHintRange] || 'Wähle einen Bereich aus.';
      hintText.innerHTML = hint;
    }
    
    function setRange(min, max, buttonElement) {
      // Clear anti-repetition history when switching ranges
      clearAntiRepetitionHistory();
      
      // Reset sequential score to null so generateScore starts at beginning/end
      if (generationMode !== 'random') {
        currentSequentialScore = null;
        currentSequentialMode = null;
      }
      
      window.learnModeActive = false;
      currentRangeMin = min;
      currentRangeMax = max;
      
      // Update menu items (re-enable Freies spielen)
      updateMenuItems();
      
      // Update hint range
      currentHintRange = `${min}-${max}`;
      if (hintVisible) {
        updateHintText();
      }
      
      // Remove active-range from all buttons
      document.querySelectorAll('.range-btn').forEach(btn => {
        btn.classList.remove('active-range');
      });
      
      // Reset learn button border to red
      const learnBtn = document.getElementById('learnBtn');
      if (learnBtn) {
        learnBtn.style.borderColor = '#b91c1c';
      }
      
      // Add active-range to clicked button if provided
      if (buttonElement) {
        buttonElement.classList.add('active-range');
      }
      
      // Only generate new score if NOT manual entry
      if (!manualScoreActive) {
        generateScore(min, max);
      }
    }
    
    function setManualScore() {
      // Prevent manual score entry during challenge mode
      if (window.challengeMode) {
        console.log('Manual score entry blocked during challenge mode');
        return;
      }
      
      console.log('Opening inline edit for score - Current mode:', currentMode);
      
      const scoreValueEl = document.getElementById('scoreValue');
      const currentValue = scoreValueEl.textContent;
      
      // Store current mode to maintain it after manual entry
      const originalMode = currentMode;
      const originalCheckouts = currentCheckouts;
      
      // Create contenteditable div instead of input to prevent autofill
      const editableDiv = document.createElement('div');
      editableDiv.contentEditable = 'true';
      editableDiv.textContent = currentValue;
      editableDiv.inputMode = 'numeric';
      editableDiv.setAttribute('data-score-editor', 'true');
      editableDiv.style.cssText = `
        width: 100%;
        height: 100%;
        font-size: 52px;
        font-weight: 800;
        color: white;
        background: transparent;
        border: 2px solid white;
        border-radius: 8px;
        text-align: center;
        padding: 0;
        margin: 0;
        outline: none;
        cursor: text;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      
      // Function to apply the score
      const applyScore = () => {
        // Get text content and clean it (remove non-digits)
        let value = editableDiv.textContent.trim().replace(/\D/g, '');
        const score = parseInt(value);
        
        // Validate input
        if (isNaN(score) || score < 2 || score > 170) {
          // Restore original value and mode
          scoreValueEl.textContent = currentValue;
          currentMode = originalMode;
          currentCheckouts = originalCheckouts;
          return;
        }
        
        // Check if checkout exists for current mode
        // IMPORTANT: Use originalMode to maintain consistency
        let checkout = null;
        let checkoutMode = originalMode; // Track which mode we actually use
        
        if (originalMode === '2darts') {
          checkout = twoDartCheckouts[score];
          if (!checkout) {
            // No solution - restore original value and settings
            scoreValueEl.textContent = currentValue;
            currentMode = originalMode;
            currentCheckouts = originalCheckouts;
            return;
          }
          currentCheckouts = twoDartCheckouts;
          currentMode = '2darts'; // Maintain mode consistency
        } else if (originalMode === '3darts') {
          checkout = defaultCheckouts[score];
          if (!checkout) {
            // No solution - restore original value and settings
            scoreValueEl.textContent = currentValue;
            currentMode = originalMode;
            currentCheckouts = originalCheckouts;
            return;
          }
          currentCheckouts = defaultCheckouts;
          currentMode = '3darts'; // Maintain mode consistency
        } else if (originalMode === 'mixed') {
          // Try 2-dart first, then 3-dart
          checkout = twoDartCheckouts[score];
          if (checkout) {
            currentCheckouts = twoDartCheckouts;
            checkoutMode = '2darts';
          } else {
            checkout = defaultCheckouts[score];
            currentCheckouts = defaultCheckouts;
            checkoutMode = '3darts';
          }
          if (!checkout) {
            // No solution - restore original value and settings
            scoreValueEl.textContent = currentValue;
            currentMode = originalMode;
            currentCheckouts = originalCheckouts;
            return;
          }
          currentMode = 'mixed'; // Maintain mixed mode
        }
        
        console.log('Manual score validation passed - Mode:', currentMode, 'Checkout database:', currentCheckouts === twoDartCheckouts ? '2DF' : '3DF');
        
        // Set the score
        currentScore = score;
        currentCheckout = checkout;
        userInputs = [];
        highlightedFields = [];
        feedback = null;
        
        // Update display
        scoreValueEl.textContent = currentScore;
        const userInputsBox = document.getElementById('userInputs');
        userInputsBox.innerHTML = '';
        userInputsBox.classList.remove('correct', 'wrong', 'active'); // Remove feedback classes
        document.getElementById('feedbackCard').classList.add('hidden');
        
        // Update score card styling based on ACTUAL checkout used
        const isStell = stellZahlen.includes(currentScore);
        const scoreCard = document.getElementById('scoreCard');
        scoreCard.classList.remove('stell', 'twodarts');
        if (isStell) {
          scoreCard.classList.add('stell');
        } else if (currentCheckouts === twoDartCheckouts) {
          scoreCard.classList.add('twodarts');
        }
        
        updateScoreTitle();
        createDartboard();
        
        // Always switch to 2-170 range when manually entering a score
        currentRangeMin = 2;
        currentRangeMax = 170;
        
        // Deactivate learn mode if active
        if (window.learnModeActive) {
          window.learnModeActive = false;
          const learnBtn = document.getElementById('learnBtn');
          if (learnBtn) {
            learnBtn.classList.remove('active-range');
            learnBtn.style.borderColor = '#b91c1c';
          }
          updateMenuItems(); // Re-enable Freies spielen
        }
        
        const btn2_170 = document.querySelector('.range-btn.bg-blue-500');
        
        // Remove active-range from all buttons
        document.querySelectorAll('.range-btn').forEach(btn => {
          btn.classList.remove('active-range');
        });
        
        // Activate 2-170 button
        if (btn2_170) {
          btn2_170.classList.add('active-range');
          console.log('Switched to 2-170 range after manual score entry');
        } else {
          console.warn('2-170 button not found!');
        }
        
        // Update hint range
        currentHintRange = '2-170';
        if (hintVisible) {
          updateHintText();
        }
        
        console.log('Manual score set successfully:', score, 'Mode:', currentMode, 'Checkout:', checkout);
      };
      
      // Prevent non-numeric input in real-time
      editableDiv.addEventListener('input', (e) => {
        // Get current cursor position
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const cursorPos = range.startOffset;
        
        // Remove all non-digit characters
        const text = editableDiv.textContent.replace(/\D/g, '');
        
        if (text !== editableDiv.textContent) {
          editableDiv.textContent = text;
          
          // Restore cursor position
          try {
            const newRange = document.createRange();
            const textNode = editableDiv.firstChild;
            if (textNode) {
              newRange.setStart(textNode, Math.min(cursorPos, text.length));
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          } catch (e) {
            // Cursor positioning failed, ignore
          }
        }
      });
      
      // Handle Enter key
      editableDiv.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          editableDiv.blur(); // Trigger blur event
        } else if (e.key === 'Escape') {
          scoreValueEl.textContent = currentValue;
          currentMode = originalMode;
          currentCheckouts = originalCheckouts;
        }
      });
      
      // Handle blur (focus lost)
      editableDiv.addEventListener('blur', () => {
        applyScore();
      });
      
      // Replace text with editable div
      scoreValueEl.textContent = '';
      scoreValueEl.appendChild(editableDiv);
      
      // Focus and select all text (opens keyboard on mobile)
      setTimeout(() => {
        editableDiv.focus();
        
        // Select all text in contenteditable
        const range = document.createRange();
        range.selectNodeContents(editableDiv);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }, 100);
    }
    
    function generateScore(min, max) {
      // For mixed mode, get ALL available scores (both 2DF and 3DF)
      // Then decide 2DF vs 3DF based on the selected score
      let availableScores;
      let availableScoreModes; // For sequential mode: array of {score, mode}
      
      if (currentMode === 'mixed') {
        // For Sequential mode: Create list of score+mode combinations
        if (generationMode === 'ascending' || generationMode === 'descending') {
          const twoDF_Scores = Object.keys(twoDartCheckouts).map(Number).filter(s => s >= min && s <= max);
          const threeDF_Scores = Object.keys(defaultCheckouts).map(Number).filter(s => s >= min && s <= max);
          
          // Create combinations: For each unique score, add 3DF first, then 2DF if exists
          const allScoresSet = new Set([...twoDF_Scores, ...threeDF_Scores]);
          const sortedScores = Array.from(allScoresSet).sort((a, b) => a - b);
          
          availableScoreModes = [];
          sortedScores.forEach(score => {
            // Always add 3DF first (if exists)
            if (threeDF_Scores.includes(score)) {
              availableScoreModes.push({score, mode: '3darts'});
            }
            // Then add 2DF (if exists)
            if (twoDF_Scores.includes(score)) {
              availableScoreModes.push({score, mode: '2darts'});
            }
          });
          
          // For descending, reverse the list
          if (generationMode === 'descending') {
            availableScoreModes.reverse();
          }
          
          // Extract just scores for compatibility with existing code
          availableScores = availableScoreModes.map(sm => sm.score);
          
          console.log(`[Mixed Sequential] Score+Mode combinations: ${availableScoreModes.length}`);
        } else {
          // For Random/Repeat mode: Use simple score list
          const twoDF_Scores = Object.keys(twoDartCheckouts).map(Number).filter(s => s >= min && s <= max);
          const threeDF_Scores = Object.keys(defaultCheckouts).map(Number).filter(s => s >= min && s <= max);
          const allScores = new Set([...twoDF_Scores, ...threeDF_Scores]);
          availableScores = Array.from(allScores).sort((a, b) => a - b);
          
          console.log(`[Mixed Mode] Available scores: ${availableScores.length} (2DF: ${twoDF_Scores.length}, 3DF: ${threeDF_Scores.length})`);
        }
      } else {
        // For 2darts or 3darts mode, use the appropriate checkout database
        currentCheckouts = currentMode === '2darts' ? twoDartCheckouts : defaultCheckouts;
        availableScores = Object.keys(currentCheckouts).map(Number).filter(s => s >= min && s <= max);
      }
      
      // Determine current mode for tracking
      let trackingMode = currentMode;
      
      if (availableScores.length === 0) {
        return;
      }
      
      // REPEAT MODE LOGIC - keep the same score
      if (generationMode === 'repeat') {
        // If currentScore is already set and valid in range, keep it
        if (currentScore && availableScores.includes(currentScore)) {
          // Keep the same score - skip to UI update at the end
          console.log('[Repeat Mode] Keeping score:', currentScore);
        } else {
          // No valid score yet - pick the first available one
          currentScore = availableScores[0];
          console.log('[Repeat Mode] Initialized with score:', currentScore);
        }
        
        // For mixed mode, determine if score uses 2DF or 3DF
        if (currentMode === 'mixed') {
          if (twoDartCheckouts[currentScore]) {
            currentCheckouts = twoDartCheckouts;
            maxDartsForRound = 2;
            trackingMode = '2darts';
          } else {
            currentCheckouts = defaultCheckouts;
            maxDartsForRound = 3;
            trackingMode = '3darts';
          }
        }
      }
      
      // SEQUENTIAL MODE LOGIC (ascending or descending)
      else if (generationMode === 'ascending' || generationMode === 'descending') {
        // For non-mixed modes, sort normally
        if (currentMode !== 'mixed') {
          availableScores.sort((a, b) => generationMode === 'ascending' ? a - b : b - a);
        }
        // For mixed mode, availableScoreModes is already sorted
        
        // If no current sequential score, set a dummy value to trigger proper start
        if (currentSequentialScore === null) {
          // Set to a value that doesn't exist in the list so indexOf returns -1
          // This will trigger the "start fresh" logic in the else branch
          if (generationMode === 'ascending') {
            currentSequentialScore = Math.min(...availableScores) - 1; // One before first
          } else {
            currentSequentialScore = Math.max(...availableScores) + 1; // One after first (which is highest in descending)
          }
          currentSequentialMode = null;
        }
        
        // Find next score in sequence
        let currentIndex = -1;
        
        if (currentMode === 'mixed' && availableScoreModes) {
          // For mixed mode: Find index by matching BOTH score and mode
          currentIndex = availableScoreModes.findIndex(sm => 
            sm.score === currentSequentialScore && sm.mode === currentSequentialMode
          );
        } else {
          // For non-mixed mode: Find index by score only
          currentIndex = availableScores.indexOf(currentSequentialScore);
        }
        
        if (currentIndex === -1) {
          // Not found in current range - start at beginning
          if (currentMode === 'mixed' && availableScoreModes) {
            currentScore = availableScoreModes[0].score;
            currentSequentialScore = availableScoreModes[0].score;
            currentSequentialMode = availableScoreModes[0].mode;
            
            // Set checkouts based on mode
            if (availableScoreModes[0].mode === '2darts') {
              currentCheckouts = twoDartCheckouts;
              maxDartsForRound = 2;
              trackingMode = '2darts';
            } else {
              currentCheckouts = defaultCheckouts;
              maxDartsForRound = 3;
              trackingMode = '3darts';
            }
          } else {
            currentScore = availableScores[0];
            currentSequentialScore = currentScore;
            currentSequentialMode = null;
          }
        } else if (currentIndex === (availableScoreModes ? availableScoreModes.length : availableScores.length) - 1) {
          // Reached end of current range - switch to next range
          console.log('[Sequential] End of range reached, switching to next range');
          
          if (generationMode === 'ascending') {
            // Find next range button
            const rangeButtons = Array.from(document.querySelectorAll('.range-btn[data-min]'));
            const currentBtn = rangeButtons.find(btn => 
              parseInt(btn.dataset.min) === min && parseInt(btn.dataset.max) === max
            );
            const currentBtnIndex = rangeButtons.indexOf(currentBtn);
            
            // Go to next range (or wrap to first)
            let nextBtn = rangeButtons[currentBtnIndex + 1];
            if (!nextBtn || currentBtnIndex === rangeButtons.length - 1) {
              // Wrap to first range (2-40 typically, or first available)
              nextBtn = rangeButtons[1]; // Index 1 is 2-40 (index 0 is 2-170)
            }
            
            if (nextBtn) {
              const nextMin = parseInt(nextBtn.dataset.min);
              const nextMax = parseInt(nextBtn.dataset.max);
              console.log('[Sequential] Switching to range:', nextMin, '-', nextMax);
              
              // Update range
              currentRangeMin = nextMin;
              currentRangeMax = nextMax;
              
              // Update active button
              rangeButtons.forEach(b => b.classList.remove('active-range'));
              nextBtn.classList.add('active-range');
              
              // Get scores from new range
              let nextRangeScores;
              let nextRangeScoreModes;
              
              if (currentMode === 'mixed') {
                // For mixed mode sequential, get ALL score+mode combinations from new range
                const twoDF = Object.keys(twoDartCheckouts).map(Number).filter(s => s >= nextMin && s <= nextMax);
                const threeDF = Object.keys(defaultCheckouts).map(Number).filter(s => s >= nextMin && s <= nextMax);
                
                const allScoresSet = new Set([...twoDF, ...threeDF]);
                const sortedScores = Array.from(allScoresSet).sort((a, b) => a - b);
                
                nextRangeScoreModes = [];
                sortedScores.forEach(score => {
                  // Always add 3DF first (if exists)
                  if (threeDF.includes(score)) {
                    nextRangeScoreModes.push({score, mode: '3darts'});
                  }
                  // Then add 2DF (if exists)
                  if (twoDF.includes(score)) {
                    nextRangeScoreModes.push({score, mode: '2darts'});
                  }
                });
                
                if (nextRangeScoreModes.length > 0) {
                  currentScore = nextRangeScoreModes[0].score;
                  currentSequentialScore = nextRangeScoreModes[0].score;
                  currentSequentialMode = nextRangeScoreModes[0].mode;
                  
                  // Set checkouts based on mode
                  if (nextRangeScoreModes[0].mode === '2darts') {
                    currentCheckouts = twoDartCheckouts;
                    maxDartsForRound = 2;
                  } else {
                    currentCheckouts = defaultCheckouts;
                    maxDartsForRound = 3;
                  }
                }
              } else {
                // For 2darts or 3darts mode, use current checkout database
                nextRangeScores = Object.keys(currentCheckouts).map(Number)
                  .filter(s => s >= nextMin && s <= nextMax)
                  .sort((a, b) => a - b);
                
                if (nextRangeScores.length > 0) {
                  currentScore = nextRangeScores[0];
                  currentSequentialScore = currentScore;
                  currentSequentialMode = null;
                }
              }
            }
          } else { // descending
            // Find previous range button
            const rangeButtons = Array.from(document.querySelectorAll('.range-btn[data-min]'));
            const currentBtn = rangeButtons.find(btn => 
              parseInt(btn.dataset.min) === min && parseInt(btn.dataset.max) === max
            );
            const currentBtnIndex = rangeButtons.indexOf(currentBtn);
            
            // Go to previous range (or wrap to last)
            let prevBtn = rangeButtons[currentBtnIndex - 1];
            if (!prevBtn || currentBtnIndex <= 1) {
              // Wrap to last range (159-170 typically)
              prevBtn = rangeButtons[rangeButtons.length - 2]; // -2 to skip "Lernen" button
            }
            
            if (prevBtn && prevBtn.id !== 'learnBtn') {
              const prevMin = parseInt(prevBtn.dataset.min);
              const prevMax = parseInt(prevBtn.dataset.max);
              console.log('[Sequential] Switching to range:', prevMin, '-', prevMax);
              
              // Update range
              currentRangeMin = prevMin;
              currentRangeMax = prevMax;
              
              // Update active button
              rangeButtons.forEach(b => b.classList.remove('active-range'));
              prevBtn.classList.add('active-range');
              
              // Get scores from new range and start at end
              let prevRangeScores;
              let prevRangeScoreModes;
              
              if (currentMode === 'mixed') {
                // For mixed mode sequential, get ALL score+mode combinations from new range
                const twoDF = Object.keys(twoDartCheckouts).map(Number).filter(s => s >= prevMin && s <= prevMax);
                const threeDF = Object.keys(defaultCheckouts).map(Number).filter(s => s >= prevMin && s <= prevMax);
                
                const allScoresSet = new Set([...twoDF, ...threeDF]);
                const sortedScores = Array.from(allScoresSet).sort((a, b) => a - b);
                
                prevRangeScoreModes = [];
                sortedScores.forEach(score => {
                  // Always add 3DF first (if exists)
                  if (threeDF.includes(score)) {
                    prevRangeScoreModes.push({score, mode: '3darts'});
                  }
                  // Then add 2DF (if exists)
                  if (twoDF.includes(score)) {
                    prevRangeScoreModes.push({score, mode: '2darts'});
                  }
                });
                
                // For descending, reverse the list
                prevRangeScoreModes.reverse();
                
                if (prevRangeScoreModes.length > 0) {
                  currentScore = prevRangeScoreModes[0].score;
                  currentSequentialScore = prevRangeScoreModes[0].score;
                  currentSequentialMode = prevRangeScoreModes[0].mode;
                  
                  // Set checkouts based on mode
                  if (prevRangeScoreModes[0].mode === '2darts') {
                    currentCheckouts = twoDartCheckouts;
                    maxDartsForRound = 2;
                  } else {
                    currentCheckouts = defaultCheckouts;
                    maxDartsForRound = 3;
                  }
                }
              } else {
                // For 2darts or 3darts mode, use current checkout database
                prevRangeScores = Object.keys(currentCheckouts).map(Number)
                  .filter(s => s >= prevMin && s <= prevMax)
                  .sort((a, b) => b - a);
                
                if (prevRangeScores.length > 0) {
                  currentScore = prevRangeScores[0];
                  currentSequentialScore = currentScore;
                  currentSequentialMode = null;
                }
              }
            }
          }
        } else {
          // Go to next score in current range
          if (currentMode === 'mixed' && availableScoreModes) {
            const nextEntry = availableScoreModes[currentIndex + 1];
            currentScore = nextEntry.score;
            currentSequentialScore = nextEntry.score;
            currentSequentialMode = nextEntry.mode;
            
            // Set checkouts based on mode
            if (nextEntry.mode === '2darts') {
              currentCheckouts = twoDartCheckouts;
              maxDartsForRound = 2;
              trackingMode = '2darts';
            } else {
              currentCheckouts = defaultCheckouts;
              maxDartsForRound = 3;
              trackingMode = '3darts';
            }
          } else {
            currentScore = availableScores[currentIndex + 1];
            currentSequentialScore = currentScore;
            currentSequentialMode = null;
          }
        }
        
        // For non-mixed mode, determine if selected score uses 2DF or 3DF
        if (currentMode === 'mixed' && !availableScoreModes) {
          // This is for Random/Repeat mode in mixed - already handled above for Sequential
          if (twoDartCheckouts[currentScore]) {
            currentCheckouts = twoDartCheckouts;
            maxDartsForRound = 2;
            trackingMode = '2darts';
          } else {
            currentCheckouts = defaultCheckouts;
            maxDartsForRound = 3;
            trackingMode = '3darts';
          }
        }
        
        console.log(`[Sequential ${generationMode}] Selected score: ${currentScore} (${trackingMode})`);
      } 
      // RANDOM MODE LOGIC (with anti-repetition)
      else {
        // Calculate dynamic blacklist size
        // For ranges >20 scores: blacklist max 10
        // For smaller ranges: blacklist max 40% (but always leave at least 1 available)
        const maxBlacklistSize = availableScores.length > 20 
          ? Math.min(10, availableScores.length - 1) 
          : Math.max(1, Math.floor(availableScores.length * 0.4));
        
        // For mixed mode, use 'mixed' as tracking mode for blacklist
        if (currentMode === 'mixed') {
          trackingMode = 'mixed';
        }
        
        console.log(`[Anti-Repetition] Available scores: ${availableScores.length}, Max blacklist: ${maxBlacklistSize}, Mode: ${trackingMode}`);
        
        // Filter out recently generated scores with same mode
        const blacklistedScores = recentlyGenerated
          .filter(entry => entry.mode === trackingMode)
          .map(entry => entry.score);
        
        console.log(`[Anti-Repetition] Blacklisted scores (${trackingMode}):`, blacklistedScores);
        
        let filteredScores = availableScores.filter(s => !blacklistedScores.includes(s));
        
        // If all scores are blacklisted, clear the blacklist and use all available scores
        if (filteredScores.length === 0) {
          console.log('[Anti-Repetition] All scores blacklisted - clearing history for this mode');
          recentlyGenerated = recentlyGenerated.filter(entry => entry.mode !== trackingMode);
          filteredScores = availableScores;
        }
        
        // Select random score from filtered list
        currentScore = filteredScores[Math.floor(Math.random() * filteredScores.length)];
        
        // For mixed mode, determine if selected score uses 2DF or 3DF AFTER selection
        if (currentMode === 'mixed') {
          if (twoDartCheckouts[currentScore]) {
            currentCheckouts = twoDartCheckouts;
            maxDartsForRound = 2;
            trackingMode = '2darts'; // Update for logging
          } else {
            currentCheckouts = defaultCheckouts;
            maxDartsForRound = 3;
            trackingMode = '3darts'; // Update for logging
          }
        }
        
        console.log(`[Anti-Repetition] Selected score: ${currentScore} (${trackingMode})`);
        
        // Add to recently generated list with 'mixed' mode to prevent immediate repetition
        recentlyGenerated.push({ score: currentScore, mode: currentMode === 'mixed' ? 'mixed' : trackingMode });
        
        // Trim the list to max blacklist size (keep only most recent)
        if (recentlyGenerated.length > maxBlacklistSize * 2) { // *2 because we track both 2DF and 3DF
          recentlyGenerated = recentlyGenerated.slice(-maxBlacklistSize * 2);
        }
      }
      
      currentCheckout = currentCheckouts[currentScore] || [];
      userInputs = [];
      highlightedFields = [];
      feedback = null;
      
      document.getElementById('scoreValue').textContent = currentScore;
      
      // Reset user-inputs
      const userInputsEl = document.getElementById('userInputs');
      userInputsEl.innerHTML = '';
      userInputsEl.classList.remove('correct', 'wrong', 'active');
      
      // CRITICAL: Remove remaining score display
      const scoreRemainingEl = document.getElementById('scoreRemaining');
      if (scoreRemainingEl) {
        scoreRemainingEl.textContent = '';
      }
      
      // Remove glow from outer ring when generating new score
      const outerRing = document.getElementById('dartboard-outer-ring');
      if (outerRing) {
        outerRing.classList.remove('flash-correct', 'flash-wrong');
      }
      
      const isStell = stellZahlen.includes(currentScore);
      const scoreCard = document.getElementById('scoreCard');
      
      // Remove all classes including error and warning
      scoreCard.classList.remove('stell', 'twodarts', 'error', 'warning');
      
      // Reset realistic mode state
      if (realisticMode) {
        isInErrorState = false;
        currentRemainingScore = null;
        dartsUsedInRound = 0;
        errorStateCheckout = [];
        dartsInErrorState = 0;
      }
      
      // Add appropriate class
      if (isStell) {
        scoreCard.classList.add('stell');
      } else if (currentMode === '2darts' || (currentMode === 'mixed' && currentCheckouts === twoDartCheckouts)) {
        scoreCard.classList.add('twodarts');
      }
      
      updateScoreTitle();
      createDartboard();
    }
    
    function handleDartClick(dartValue) {
      // Haptic feedback for dartboard clicks
      vibrateMedium();
      
      // Smooth dim rangeCard content on first dartboard click (3-second transition via CSS)
      if (boxDimmingEnabled) {
        const rangeCard = document.getElementById('rangeCard');
        if (rangeCard && !window.rangeCardDimming) {
          window.rangeCardDimming = true;  // Prevent further clicks from resetting
          window.rangeCardActive = false;  // Mark as inactive (needs activation click)
          
          // Dim all children to 0%, border stays at 20%
          Array.from(rangeCard.children).forEach(child => {
            child.style.opacity = '0';
          });
          rangeCard.style.borderColor = 'rgba(255, 255, 255, 0.2)';  // Border 20% sichtbar
          console.log('[DEBUG] RangeCard content dimming to 0% (border 20%) - 3-second smooth transition');
        }
      }
      
      // Wenn Feedback für falsche Antwort angezeigt wird, nächste Aufgabe bei Klick auf Dartscheibe
      // (Richtige Antworten gehen automatisch weiter)
      if (feedback === 'wrong') {
        // Im Realistisch-Modus: Bei Fehlwurf weiterspielen erlauben
        if (realisticMode && isInErrorState) {
          // Nicht sofort neue Zahl generieren - weiterspielen!
          // Feedback zurücksetzen damit weitere Würfe möglich sind
          feedback = null;
          
          // WICHTIG: Im Error-State die 'wrong' Klasse und Lösung NICHT entfernen!
          // Die rote Box soll bis zum Ende der Runde sichtbar bleiben
          
          const existingImpossible = document.getElementById('userInputs').querySelector('.impossible-checkout');
          if (existingImpossible) {
            existingImpossible.remove();
          }
          
          // Restwert-Anzeige NICHT entfernen - wird bei nächstem Wurf aktualisiert
          
          // KEINE Max-Darts Prüfung hier! Der Dart muss erst verarbeitet werden.
          // Die Prüfung kommt später, nachdem wir wissen ob ein Checkout geschafft wurde.
          
          // KEIN return hier - Dart wird sofort verarbeitet!
          // Der Code läuft weiter und verarbeitet den aktuellen Klick
        } else {
          // Normal mode oder nicht im Error-State: Reset und neue Zahl
          manualScoreActive = false;
          
          if (window.challengeMode) {
            generateScore(currentRangeMin, currentRangeMax);
          } else if (window.learnModeActive) {
            generateLearnScore();
          } else {
            generateScore(currentRangeMin, currentRangeMax);
          }
          return;
        }
      }
      
      // In Challenge-Modus: Ignore clicks when correct feedback is showing (auto-continue active)
      if (feedback === 'correct' && window.challengeMode) {
        return;
      }
      
      // Im normalen Trainingsmodus: Bei korrekter Antwort soll Click neue Zahl generieren
      if (feedback === 'correct' && !window.challengeMode) {
        // Reset feedback
        feedback = null;
        
        // Cancel auto-advance timer if running
        if (window.autoNextTimer) {
          clearTimeout(window.autoNextTimer);
          window.autoNextTimer = null;
        }
        
        // Generate new score
        if (window.learnModeActive) {
          generateLearnScore();
        } else {
          generateScore(currentRangeMin, currentRangeMax);
        }
        return;
      }
      
      // Im Realistisch-Modus: Dart-Counter erhöhen
      if (realisticMode) {
        dartsUsedInRound++;
        
        console.log(`[DEBUG] Dart ${dartsUsedInRound}/${maxDartsForRound} - dartValue: ${dartValue}`);
        
        // Prüfe ob Max-Darts erreicht BEVOR wir den Wurf verarbeiten
        if (dartsUsedInRound > maxDartsForRound) {
          // Zu viele Darts - ignoriere den Wurf und generiere neue Zahl
          dartsUsedInRound = maxDartsForRound; // Korrigiere Zähler
          
          console.log('[DEBUG] Zu viele Darts! Generiere neue Zahl.');
          
          if (window.challengeMode) {
            generateScore(currentRangeMin, currentRangeMax);
          } else if (window.learnModeActive) {
            generateLearnScore();
          } else {
            generateScore(currentRangeMin, currentRangeMax);
          }
          return;
        }
      }
      
      userInputs.push(dartValue);
      updateUserInputs();
      
      // Bestimme erwarteten Dart
      let expectedDart;
      if (isInErrorState) {
        // Im Error-State: Erwarteten Dart aus dem errorStateCheckout holen
        expectedDart = errorStateCheckout[dartsInErrorState];
        console.log(`[DEBUG] Error-State: expectedDart = ${expectedDart} (aus errorStateCheckout[${dartsInErrorState}]), dartValue = ${dartValue}`);
      } else {
        // Normal: Aus dem ursprünglichen Checkout
        expectedDart = currentCheckout[userInputs.length - 1];
        console.log(`[DEBUG] Normal: expectedDart = ${expectedDart} (aus currentCheckout[${userInputs.length - 1}]), dartValue = ${dartValue}`);
      }
      
      // Im Error-State (Realistisch-Modus): Prüfe gegen Datenbank
      if (isInErrorState && realisticMode) {
        // Berechne Punktwert des Wurfs
        const dartPoints = calculateDartValue(dartValue);
        
        // Prüfe ob der Dart dem erwarteten Dart entspricht
        if (dartValue === expectedDart) {
          // RICHTIG! Dart entspricht der Datenbank
          currentRemainingScore -= dartPoints;
          dartsInErrorState++;
          
          // Aktualisiere Restwert-Anzeige nach dem Punktabzug
          updateUserInputs();
          
          console.log(`[DEBUG] Korrekter Dart im Error-State! Restwert: ${currentRemainingScore}, isDouble: ${isDartDouble(dartValue)}`);
          
          // Prüfe ob Checkout erreicht wurde (genau 0 mit Double)
          if (currentRemainingScore === 0 && isDartDouble(dartValue)) {
            // Checkout geschafft!
            console.log('[DEBUG] ✅ CHECKOUT GESCHAFFT!');
            highlightedFields.push(dartValue);
            createDartboard();
            
            // Score-Card bleibt orange (war Fehlwurf, aber erfolgreich beendet)
            // Nur 'error' (rot) entfernen falls vorhanden
            const scoreCard = document.getElementById('scoreCard');
            scoreCard.classList.remove('error');
            if (!scoreCard.classList.contains('warning')) {
              scoreCard.classList.add('warning'); // Orange setzen falls noch nicht
            }
            
            showFeedback(true);
            
            if (window.challengeMode) {
              challengeStats.correct++;
              updateChallengeStats();
            }
            
            return;
          }
          
          console.log(`[DEBUG] Noch nicht fertig. Restwert: ${currentRemainingScore}, Darts übrig: ${maxDartsForRound - dartsUsedInRound}`);
          
          // Prüfe ob überkauft oder auf 1 gelandet
          if (currentRemainingScore < 0 || currentRemainingScore === 1) {
            // Überkauft oder unmöglich - Runde beendet, neue Zahl generieren
            
            if (window.challengeMode) {
              challengeStats.wrong++;
              updateChallengeStats();
              generateScore(currentRangeMin, currentRangeMax);
            } else if (window.learnModeActive) {
              generateLearnScore();
            } else {
              generateScore(currentRangeMin, currentRangeMax);
            }
            
            return;
          }
          
          // WICHTIG: Dart IMMER highlighten (auch wenn danach nicht mehr checkbar)
          highlightedFields.push(dartValue);
          createDartboard();
          
          // Prüfe ob Checkout mit restlichen Darts noch möglich ist
          const dartsLeft = maxDartsForRound - dartsUsedInRound;
          console.log(`[DEBUG] Prüfe Checkout-Möglichkeit: Restwert ${currentRemainingScore}, Darts übrig: ${dartsLeft}`);
          
          if (!canCheckoutWithDarts(currentRemainingScore, dartsLeft)) {
            // Checkout nicht mehr möglich → Runde beendet
            // User kann durch Klick auf Container oder Dartboard weitergehen
            
            console.log('[DEBUG] Checkout nicht mehr möglich → warte auf Klick');
            
            // Score-Card rot färben (Checkout nicht mehr möglich)
            const scoreCard3 = document.getElementById('scoreCard');
            scoreCard3.classList.remove('warning'); // Entferne orange
            scoreCard3.classList.add('error'); // Setze rot
            
            if (window.challengeMode) {
              challengeStats.wrong++;
              updateChallengeStats();
            }
            
            // WICHTIG: Beende Error-State damit keine weiteren Darts möglich sind
            isInErrorState = false;
            
            // Setze feedback = 'wrong' damit beim nächsten Klick neue Zahl generiert wird
            feedback = 'wrong';
            
            return;
          }
          
          // Checkout noch möglich - Score-Card orange färben (falls noch nicht)
          const scoreCardWarning2 = document.getElementById('scoreCard');
          if (!scoreCardWarning2.classList.contains('warning')) {
            scoreCardWarning2.classList.remove('error'); // Entferne rot falls vorhanden
            scoreCardWarning2.classList.add('warning'); // Setze orange
          }
          
          console.log('[DEBUG] Checkout noch möglich, weitermachen!');
          return;
        } else {
          // FALSCH! Erneuter Fehlwurf im Error-State
          // Highlighte das getroffene Feld
          highlightedFields.push(dartValue);
          
          // Berechne neuen Restwert
          currentRemainingScore -= dartPoints;
          
          // Aktualisiere Restwert-Anzeige nach dem Punktabzug
          updateUserInputs();
          
          console.log(`[DEBUG] Zweiter Fehlwurf! Restwert: ${currentRemainingScore}, isDouble: ${isDartDouble(dartValue)}`);
          
          // WICHTIG: Prüfe ob trotz Fehlwurf Checkout erreicht wurde (0 mit Double)
          if (currentRemainingScore === 0 && isDartDouble(dartValue)) {
            // Checkout geschafft trotz zweitem Fehlwurf!
            console.log('[DEBUG] ✅ CHECKOUT GESCHAFFT (nach 2 Fehlwürfen)!');
            createDartboard();
            
            // Score-Card bleibt orange (waren Fehlwürfe, aber erfolgreich beendet)
            const scoreCard = document.getElementById('scoreCard');
            scoreCard.classList.remove('error');
            if (!scoreCard.classList.contains('warning')) {
              scoreCard.classList.add('warning');
            }
            
            showFeedback(true);
            
            if (window.challengeMode) {
              challengeStats.correct++;
              updateChallengeStats();
            }
            
            return;
          }
          
          // Prüfe ob überkauft oder auf 1 gelandet
          if (currentRemainingScore < 0 || currentRemainingScore === 1) {
            // Überkauft oder unmöglich - Runde beendet, neue Zahl generieren
            
            if (window.challengeMode) {
              challengeStats.wrong++;
              updateChallengeStats();
              generateScore(currentRangeMin, currentRangeMax);
            } else if (window.learnModeActive) {
              generateLearnScore();
            } else {
              generateScore(currentRangeMin, currentRangeMax);
            }
            
            return;
          }
          
          // Hole neues Checkout für den neuen Restwert
          // WICHTIG: Wähle die richtige Datenbank basierend auf verbleibenden Darts!
          const dartsLeftAfterThis = maxDartsForRound - dartsUsedInRound;
          
          // WICHTIG: Wenn alle Darts aufgebraucht sind, Runde beenden
          if (dartsLeftAfterThis === 0) {
            console.log('[DEBUG] Alle Darts aufgebraucht! Checkout nicht geschafft → Runde beendet');
            
            // Score-Card rot färben (Checkout nicht geschafft)
            const scoreCard = document.getElementById('scoreCard');
            scoreCard.classList.remove('warning');
            scoreCard.classList.add('error');
            
            // Vibration und Dartboard-Flash
            vibrateHeavy();
            
            const outerRing = document.getElementById('dartboard-outer-ring');
            if (outerRing) {
              outerRing.classList.remove('flash-correct', 'flash-wrong', 'challenge-mode');
              void outerRing.offsetWidth;
              if (window.challengeMode) {
                outerRing.classList.add('challenge-mode');
              }
              outerRing.classList.add('flash-wrong');
            }
            
            // Dartboard neu zeichnen mit Highlight
            createDartboard();
            
            // Zeige Feedback
            showFeedback(false);
            
            if (window.challengeMode) {
              challengeStats.wrong++;
              updateChallengeStats();
            } else {
              // Add to problem scores
              const actualMode = currentCheckouts === twoDartCheckouts ? '2darts' : '3darts';
              problemScores[currentScore] = { count: 0, mode: actualMode };
              localStorage.setItem('problemScores', JSON.stringify(problemScores));
              updateProblemBadge();
            }
            
            // Beende Error-State
            isInErrorState = false;
            feedback = 'wrong';
            
            return;
          }
          
          if (dartsLeftAfterThis === 1) {
            // Nur 1 Dart übrig
            // SONDERFALL: Bei Restwert 50 ist Bull immer erlaubt
            if (currentRemainingScore === 50) {
              errorStateCheckout = ['Bull'];
            } else {
              // Schaue in 3-Dart-Datenbank
              // Nutze nur wenn es ein 1-Dart-Checkout ist (Array-Länge 1)
              const checkoutFromDB = defaultCheckouts[currentRemainingScore];
              if (checkoutFromDB && checkoutFromDB.length === 1) {
                errorStateCheckout = checkoutFromDB;
              } else {
                // Nicht mit 1 Dart checkbar
                errorStateCheckout = [];
              }
            }
          } else if (dartsLeftAfterThis === 2) {
            // 2 Darts übrig
            // SONDERFÄLLE: Diese Scores sind mit 2 Darts mathematisch UNMÖGLICH
            const impossibleWith2Darts = [99, 102, 103, 105, 106, 108, 109];
            const isOver110 = currentRemainingScore > 110;
            
            if (impossibleWith2Darts.includes(currentRemainingScore) || isOver110) {
              // Wirklich unmöglich mit 2 Darts
              errorStateCheckout = [];
            } else {
              // Versuche 2-Dart-Datenbank, sonst 3-Dart-DB (erste 2 Darts nehmen)
              if (twoDartCheckouts[currentRemainingScore]) {
                errorStateCheckout = twoDartCheckouts[currentRemainingScore];
              } else if (defaultCheckouts[currentRemainingScore]) {
                // Nutze die ersten 2 Darts aus der 3-Dart-Lösung
                errorStateCheckout = defaultCheckouts[currentRemainingScore].slice(0, 2);
              } else {
                errorStateCheckout = [];
              }
            }
          } else {
            // 3+ Darts übrig - verwende 3-Dart-Datenbank
            errorStateCheckout = defaultCheckouts[currentRemainingScore] || [];
          }
          dartsInErrorState = 0;
          
          console.log(`[DEBUG] Nach Fehlwurf: Restwert ${currentRemainingScore}, Darts übrig: ${dartsLeftAfterThis}, Checkout: ${errorStateCheckout.join(' → ')}`);
          
          // WICHTIG: Prüfe ob Checkout mit restlichen Darts wirklich möglich ist
          // Nutze canCheckoutWithDarts() statt errorStateCheckout.length === 0
          // um robuster gegen Datenbank-Probleme zu sein
          if (!canCheckoutWithDarts(currentRemainingScore, dartsLeftAfterThis)) {
            console.log('[DEBUG] Nach Fehlwurf: Kein Checkout möglich (bestätigt durch canCheckoutWithDarts) → Runde beendet!');
            
            // Score-Card rot färben (Checkout nicht mehr möglich)
            const scoreCard = document.getElementById('scoreCard');
            scoreCard.classList.remove('warning'); // Entferne warning
            scoreCard.classList.add('error');
            
            // Vibration und Dartboard-Flash
            vibrateHeavy();
            
            const outerRing = document.getElementById('dartboard-outer-ring');
            if (outerRing) {
              outerRing.classList.remove('flash-correct', 'flash-wrong', 'challenge-mode');
              void outerRing.offsetWidth;
              if (window.challengeMode) {
                outerRing.classList.add('challenge-mode');
              }
              outerRing.classList.add('flash-wrong');
            }
            
            // Dartboard neu zeichnen mit Highlight
            createDartboard();
            
            if (window.challengeMode) {
              challengeStats.wrong++;
              updateChallengeStats();
            }
            
            // Beende Error-State und warte auf Klick
            isInErrorState = false;
            feedback = 'wrong';
            
            return;
          }
          
          // KEIN showFeedback - Box ist schon da!
          // Nur Vibration und Dartboard-Flash
          vibrateHeavy();
          
          const outerRing = document.getElementById('dartboard-outer-ring');
          if (outerRing) {
            outerRing.classList.remove('flash-correct', 'flash-wrong', 'challenge-mode');
            void outerRing.offsetWidth;
            if (window.challengeMode) {
              outerRing.classList.add('challenge-mode');
            }
            outerRing.classList.add('flash-wrong');
          }
          
          // Dartboard neu zeichnen mit Highlight
          createDartboard();
          
          // WICHTIG: Prüfe ob Checkout mit restlichen Darts noch möglich ist!
          if (!canCheckoutWithDarts(currentRemainingScore, dartsLeftAfterThis)) {
            // Checkout nicht mehr möglich → Runde beendet
            // User kann durch Klick auf Container oder Dartboard weitergehen
            console.log('[DEBUG] Nach Fehlwurf: Checkout nicht mehr möglich → warte auf Klick');
            
            // Score-Card rot färben (Checkout nicht mehr möglich)
            const scoreCard2 = document.getElementById('scoreCard');
            scoreCard2.classList.remove('warning'); // Entferne orange
            scoreCard2.classList.add('error'); // Setze rot
            
            if (window.challengeMode) {
              challengeStats.wrong++;
              updateChallengeStats();
            }
            
            // WICHTIG: Beende Error-State damit keine weiteren Darts möglich sind
            isInErrorState = false;
            
            // Setze feedback = 'wrong' damit beim nächsten Klick neue Zahl generiert wird
            feedback = 'wrong';
            
            return;
          }
          
          // Checkout noch möglich - Score-Card orange färben
          const scoreCardWarning = document.getElementById('scoreCard');
          scoreCardWarning.classList.remove('error'); // Entferne rot falls vorhanden
          scoreCardWarning.classList.add('warning'); // Setze orange
          
          if (window.challengeMode) {
            challengeStats.wrong++;
            updateChallengeStats();
          }
          
          return;
        }
      }
      
      if (dartValue !== expectedDart) {
        // Fehlwurf (erster Fehlwurf oder Normal-Modus)
        if (realisticMode) {
          // Im Realistisch-Modus: Berechne Restwert und gehe in Error-State
          isInErrorState = true;
          
          // Highlighte das getroffene Feld
          highlightedFields.push(dartValue);
          
          // Berechne was wir vom ursprünglichen Score abziehen müssen
          let pointsScored = 0;
          for (let i = 0; i < userInputs.length; i++) {
            pointsScored += calculateDartValue(userInputs[i]);
          }
          
          currentRemainingScore = currentScore - pointsScored;
          
          // Aktualisiere Restwert-Anzeige nach der Berechnung
          updateUserInputs();
          
          // Hole Checkout für den Restwert aus Datenbank
          // WICHTIG: Wähle die richtige Datenbank basierend auf verbleibenden Darts!
          const dartsLeftAfterError = maxDartsForRound - dartsUsedInRound;
          
          // WICHTIG: Wenn alle Darts aufgebraucht sind, Runde beenden
          if (dartsLeftAfterError === 0) {
            console.log('[DEBUG] Alle Darts aufgebraucht nach erstem Fehlwurf! Checkout nicht geschafft → Runde beendet');
            
            // Score-Card rot färben (Checkout nicht geschafft)
            const scoreCard = document.getElementById('scoreCard');
            scoreCard.classList.remove('warning');
            scoreCard.classList.add('error');
            
            // Zeige Feedback
            showFeedback(false);
            
            // Dartboard neu zeichnen mit Highlight
            createDartboard();
            
            if (window.challengeMode) {
              challengeStats.wrong++;
              updateChallengeStats();
            } else {
              // Add to problem scores
              const actualMode = currentCheckouts === twoDartCheckouts ? '2darts' : '3darts';
              problemScores[currentScore] = { count: 0, mode: actualMode };
              localStorage.setItem('problemScores', JSON.stringify(problemScores));
              updateProblemBadge();
            }
            
            // Beende Error-State
            isInErrorState = false;
            feedback = 'wrong';
            
            return;
          }
          
          if (dartsLeftAfterError === 1) {
            // Nur 1 Dart übrig
            // SONDERFALL: Bei Restwert 50 ist Bull immer erlaubt
            if (currentRemainingScore === 50) {
              errorStateCheckout = ['Bull'];
            } else {
              // Schaue in 3-Dart-Datenbank
              // Nutze nur wenn es ein 1-Dart-Checkout ist (Array-Länge 1)
              const checkoutFromDB = defaultCheckouts[currentRemainingScore];
              if (checkoutFromDB && checkoutFromDB.length === 1) {
                errorStateCheckout = checkoutFromDB;
              } else {
                // Nicht mit 1 Dart checkbar
                errorStateCheckout = [];
              }
            }
          } else if (dartsLeftAfterError === 2) {
            // 2 Darts übrig
            // SONDERFÄLLE: Diese Scores sind mit 2 Darts mathematisch UNMÖGLICH
            const impossibleWith2Darts = [99, 102, 103, 105, 106, 108, 109];
            const isOver110 = currentRemainingScore > 110;
            
            if (impossibleWith2Darts.includes(currentRemainingScore) || isOver110) {
              // Wirklich unmöglich mit 2 Darts
              errorStateCheckout = [];
            } else {
              // Versuche 2-Dart-Datenbank, sonst 3-Dart-DB (erste 2 Darts nehmen)
              if (twoDartCheckouts[currentRemainingScore]) {
                errorStateCheckout = twoDartCheckouts[currentRemainingScore];
              } else if (defaultCheckouts[currentRemainingScore]) {
                // Nutze die ersten 2 Darts aus der 3-Dart-Lösung
                errorStateCheckout = defaultCheckouts[currentRemainingScore].slice(0, 2);
              } else {
                errorStateCheckout = [];
              }
            }
          } else {
            // 3+ Darts übrig - verwende 3-Dart-Datenbank
            errorStateCheckout = defaultCheckouts[currentRemainingScore] || [];
          }
          dartsInErrorState = 0;
          
          console.log(`Fehlwurf! Restwert: ${currentRemainingScore}, Darts übrig: ${dartsLeftAfterError}, Checkout: ${errorStateCheckout.join(' → ')}`);
          
          // WICHTIG: Prüfe ob Checkout mit restlichen Darts wirklich möglich ist
          // Nutze canCheckoutWithDarts() statt errorStateCheckout.length === 0
          // um robuster gegen Datenbank-Probleme zu sein
          if (!canCheckoutWithDarts(currentRemainingScore, dartsLeftAfterError)) {
            console.log('[DEBUG] Kein Checkout möglich mit verbleibenden Darts (bestätigt durch canCheckoutWithDarts) → Runde beendet!');
            
            // Score-Card rot färben (Checkout nicht mehr möglich)
            const scoreCard = document.getElementById('scoreCard');
            scoreCard.classList.remove('warning'); // Entferne warning falls vorhanden
            scoreCard.classList.add('error');
            
            // Zeige Feedback
            showFeedback(false);
            
            // Dartboard neu zeichnen mit Highlight
            createDartboard();
            
            if (window.challengeMode) {
              challengeStats.wrong++;
              updateChallengeStats();
            }
            
            // Beende Error-State und warte auf Klick
            isInErrorState = false;
            feedback = 'wrong';
            
            return;
          }
          
          // Score-Card orange färben (Fehlwurf, aber Checkout noch möglich)
          const scoreCard = document.getElementById('scoreCard');
          scoreCard.classList.remove('error'); // Entferne error falls vorhanden
          scoreCard.classList.add('warning');
          
          // Zeige Feedback mit Restwert
          showFeedback(false);
          
          // Dartboard neu zeichnen mit Highlight
          createDartboard();
          
          if (window.challengeMode) {
            challengeStats.wrong++;
            updateChallengeStats();
          } else {
            const actualMode = currentCheckouts === twoDartCheckouts ? '2darts' : '3darts';
            problemScores[currentScore] = { count: 0, mode: actualMode };
            localStorage.setItem('problemScores', JSON.stringify(problemScores));
            updateProblemBadge();
          }
        } else {
          // Normal Mode: Wie bisher (kein Highlight bei Fehlwurf)
          showFeedback(false);
          if (window.challengeMode) {
            challengeStats.wrong++;
            updateChallengeStats();
          } else {
            const actualMode = currentCheckouts === twoDartCheckouts ? '2darts' : '3darts';
            problemScores[currentScore] = { count: 0, mode: actualMode };
            localStorage.setItem('problemScores', JSON.stringify(problemScores));
            updateProblemBadge();
          }
        }
        return;
      }
      
      highlightedFields.push(dartValue);
      createDartboard();
      
      if (userInputs.length === currentCheckout.length) {
        showFeedback(true);
        if (window.challengeMode) {
          challengeStats.correct++;
          updateChallengeStats();
        } else {
          // Handle problem scores
          if (problemScores[currentScore] !== undefined) {
            const problem = problemScores[currentScore];
            const count = (typeof problem === 'object' ? problem.count : problem) + 1;
            console.log('Problem score for', currentScore, '- count:', count);
            
            if (count >= 3) {
              // Delete after 3 correct answers
              delete problemScores[currentScore];
              console.log('Deleted problem score. Remaining:', Object.keys(problemScores));
            } else {
              // Increment counter while preserving the ORIGINAL mode (don't overwrite with current mode)
              const originalMode = typeof problem === 'object' ? problem.mode : '3darts';
              problemScores[currentScore] = { count: count, mode: originalMode };
            }
            
            // Save to localStorage after any modification
            localStorage.setItem('problemScores', JSON.stringify(problemScores));
            
            // Always update badge after modifying problemScores
            updateProblemBadge();
            
            // Check if all problems are solved while in learn mode
            if (window.learnModeActive && Object.keys(problemScores).length === 0) {
              console.log('All problems solved! Switching to 2-170.');
              
              // Deactivate learn mode FIRST
              window.learnModeActive = false;
              
              // IMPORTANT: Re-enable Freies spielen button IMMEDIATELY
              console.log('Calling updateMenuItems IMMEDIATELY - learnModeActive:', window.learnModeActive);
              updateMenuItems();
              
              setTimeout(() => {
                // Reset to 3-Dart mode
                currentMode = '3darts';
                currentCheckouts = defaultCheckouts;
                
                // Update mode buttons
                const mode3DartsBtn = document.getElementById('mode3DartsBtn');
                const mode2DartsBtn = document.getElementById('mode2DartsBtn');
                const modeMixBtn = document.getElementById('modeMixBtn');
                
                if (mode3DartsBtn) mode3DartsBtn.classList.add('active');
                if (mode2DartsBtn) mode2DartsBtn.classList.remove('active');
                if (modeMixBtn) modeMixBtn.classList.remove('active');
                
                // Reset learn button
                const learnBtn = document.getElementById('learnBtn');
                if (learnBtn) {
                  learnBtn.classList.remove('active-range');
                  learnBtn.style.borderColor = '#b91c1c';
                }
                
                // Update range buttons for 3-Dart
                updateRangeButtonsFor3Dart();
                
                // Switch to 2-170
                currentRangeMin = 2;
                currentRangeMax = 170;
                
                // Activate 2-170 button
                const btn2_170 = document.querySelector('.range-btn.bg-blue-500');
                if (btn2_170) {
                  document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active-range'));
                  btn2_170.classList.add('active-range');
                }
                
                // Update hint text
                currentHintRange = '2-170';
                updateHintText();
                
                updateProblemBadge();
                
                generateScore(2, 170);
              }, 500);
            }
          }
        }
      }
    }
    
    // ========================================
    // REALISTIC MODE HELPER FUNCTIONS
    // ========================================
    
    function calculateDartValue(dartValue) {
      if (dartValue === 'Bull') return 50;
      if (dartValue === 'S25') return 25;
      
      const prefix = dartValue.charAt(0); // 'S', 'D', 'T'
      const number = parseInt(dartValue.substring(1));
      
      if (prefix === 'S') return number;
      if (prefix === 'D') return number * 2;
      if (prefix === 'T') return number * 3;
      
      return 0;
    }
    
    function isDartDouble(dartValue) {
      return dartValue.charAt(0) === 'D' || dartValue === 'Bull';
    }
    
    function canCheckoutWithDarts(score, dartsLeft) {
      if (dartsLeft <= 0) return false;
      if (score === 0) return true; // 0 = Checkout geschafft!
      if (score === 1) return false; // 1 nicht checkbar
      if (score > 170) return false; // Über 170 nicht mit 3 Darts checkbar
      
      // Prüfe anhand der Datenbanken
      if (dartsLeft === 1) {
        // Nur noch 1 Dart - muss ein Double sein (oder Bull für 50)
        return (score >= 2 && score <= 40 && score % 2 === 0) || score === 50;
      } else if (dartsLeft === 2) {
        // 2 Darts
        // SONDERFÄLLE: Diese Scores sind mit 2 Darts mathematisch UNMÖGLICH
        const impossibleWith2Darts = [99, 102, 103, 105, 106, 108, 109];
        if (impossibleWith2Darts.includes(score) || score > 110) {
          return false;
        }
        
        // Prüfe 2-Dart-Datenbank
        if (twoDartCheckouts[score] !== undefined) {
          return true;
        }
        
        // Prüfe 3-Dart-Datenbank - ABER nur wenn das Checkout auch wirklich mit 2 Darts machbar ist
        // (d.h. das Array hat maximal 2 Einträge)
        if (defaultCheckouts[score] !== undefined && defaultCheckouts[score].length <= 2) {
          return true;
        }
        
        return false;
      } else if (dartsLeft >= 3) {
        // 3+ Darts - checke 3-Dart-Datenbank
        return defaultCheckouts[score] !== undefined;
      }
      
      return false;
    }
    
    function updateUserInputs() {
      const container = document.getElementById('userInputs');
      
      // WICHTIG: Alte Restwert-Anzeige IMMER zuerst entfernen (auch wenn showRemainingScore=false)
      // Entferne alte Restwerte sowohl im Container (alte Version) als auch außerhalb (neue Version)
      const oldRemaining = container.querySelector('.remaining-score');
      if (oldRemaining) {
        oldRemaining.remove();
      }
      const scoreRemainingEl = document.getElementById('scoreRemaining');
      if (scoreRemainingEl) {
        scoreRemainingEl.textContent = '';
      }
      
      // Behalte Lösung
      const solution = container.querySelector('.solution-text');
      
      if (userInputs.length === 0) {
        // Entferne nur die Chips
        container.querySelectorAll('.user-input-chip').forEach(chip => chip.remove());
      } else {
        // Entferne nur die Chips
        container.querySelectorAll('.user-input-chip').forEach(chip => chip.remove());
        
        // Füge neue Chips hinzu (vor solution/remaining wenn vorhanden)
        const chipsHTML = userInputs.map(input => 
          `<div class="user-input-chip">${input}</div>`
        ).join('');
        
        // Füge am Anfang ein (vor solution)
        if (solution) {
          container.insertAdjacentHTML('afterbegin', chipsHTML);
        } else {
          container.innerHTML = chipsHTML;
        }
        
        // Wenn "Restwert anzeigen" aktiviert ist, zeige immer den aktuellen Restwert
        // ABER: Im Challenge-Modus wird der Restwert NICHT angezeigt
        if (showRemainingScore && !window.challengeMode) {
          // Bestimme den Restwert:
          // Im Realistisch-Modus und Error-State: Verwende currentRemainingScore
          // Ansonsten: Berechne aus currentScore - pointsScored
          let remainingScore;
          
          if (realisticMode && typeof currentRemainingScore !== 'undefined' && currentRemainingScore !== null) {
            // Im Realistisch-Modus: Verwende den gespeicherten Restwert
            remainingScore = currentRemainingScore;
          } else {
            // Normal-Modus: Berechne Restwert
            let pointsScored = 0;
            userInputs.forEach(dartValue => {
              pointsScored += calculateDartValue(dartValue);
            });
            remainingScore = currentScore - pointsScored;
          }
          
          // Zeige Restwert wenn sinnvoll (nicht überkauft, nicht auf 1)
          if (remainingScore >= 2) {
            const scoreRemainingEl = document.getElementById('scoreRemaining');
            if (scoreRemainingEl) {
              scoreRemainingEl.textContent = `Rest: ${remainingScore}`;
            }
          }
        }
      }
    }
    
    function showFeedback(isCorrect) {
      feedback = isCorrect ? 'correct' : 'wrong';
      
      // Haptic feedback
      if (isCorrect) {
        vibratePattern([50, 50, 50]); // Double vibration for correct
      } else {
        vibrateHeavy(); // Single long vibration for wrong
      }
      
      const userInputs = document.getElementById('userInputs');
      
      // Remove previous states
      userInputs.classList.remove('correct', 'wrong', 'active');
      
      // Remove previous solution text
      const existingSolution = userInputs.querySelector('.solution-text');
      if (existingSolution) {
        existingSolution.remove();
      }
      
      // Flash dartboard outer ring
      const outerRing = document.getElementById('dartboard-outer-ring');
      if (outerRing) {
        // Remove any existing flash classes
        outerRing.classList.remove('flash-correct', 'flash-wrong', 'challenge-mode');
        
        // Trigger reflow to restart animation
        void outerRing.offsetWidth;
        
        // Add challenge-mode class if in challenge mode
        if (window.challengeMode) {
          outerRing.classList.add('challenge-mode');
        }
        
        // Add appropriate flash class - will stay until next generateScore()
        if (isCorrect) {
          outerRing.classList.add('flash-correct');
        } else {
          outerRing.classList.add('flash-wrong');
        }
      }
      
      if (isCorrect) {
        // Bei richtig: Nur grün färben, kein Text
        userInputs.classList.remove('active');  // Entferne active
        userInputs.classList.add('correct');
        
        // Automatisch zur nächsten Zahl
        if (window.challengeMode) {
          window.autoNextTimer = setTimeout(() => {
            window.autoNextTimer = null;
            generateScore(currentRangeMin, currentRangeMax);
          }, 500);
        } else {
          window.autoNextTimer = setTimeout(() => {
            window.autoNextTimer = null;
            if (window.learnModeActive) {
              generateLearnScore();
            } else {
              generateScore(currentRangeMin, currentRangeMax);
            }
          }, 1200);
        }
      } else {
        // Bei falsch: Rot färben + Lösung anzeigen
        userInputs.classList.remove('active');  // Entferne active
        userInputs.classList.add('wrong');
        
        // Lösung unter den Eingabefeldern anzeigen
        const solutionDiv = document.createElement('div');
        solutionDiv.className = 'solution-text';
        solutionDiv.textContent = `Lösung: ${currentCheckout.join(' → ')}`;
        userInputs.appendChild(solutionDiv);
        
        // Restwert aktualisieren - damit er NACH der Lösung erscheint
        updateUserInputs();
      }
    }
    
    function handleNext() {
      if (window.autoNextTimer) {
        clearTimeout(window.autoNextTimer);
        window.autoNextTimer = null;
      }
      if (window.learnModeActive) {
        generateLearnScore();
      } else {
        generateScore(currentRangeMin, currentRangeMax);
      }
    }
    
    function updateChallengeStats() {
      document.getElementById('challengeStats').textContent = 
        `✓ ${challengeStats.correct} | ✗ ${challengeStats.wrong}`;
    }
    
    function updateProblemBadge() {
      const badge = document.getElementById('problemBadge');
      const count = Object.keys(problemScores).length;
      if (count > 0) {
        badge.classList.remove('hidden');
        badge.textContent = count;
      } else {
        badge.classList.add('hidden');
      }
    }
    
    function showCountdown(callback) {
      // Create countdown overlay
      const overlay = document.createElement('div');
      overlay.className = 'countdown-overlay';
      overlay.id = 'countdownOverlay';
      
      const numberElement = document.createElement('div');
      numberElement.className = 'countdown-number';
      overlay.appendChild(numberElement);
      
      document.body.appendChild(overlay);
      
      // Create heartbeat sound for countdown
      if (!window.heartbeatSound) {
        window.heartbeatSound = new Audio('Heartbeat.mp3');
        window.heartbeatSound.volume = 1.0; // Max volume (browser limit)
      }
      
      let count = 3;
      numberElement.textContent = count;
      
      // Play heartbeat and vibrate for first number (3)
      window.heartbeatSound.currentTime = 0;
      window.heartbeatSound.play().catch(e => console.error('Heartbeat play failed:', e));
      vibrateHeavy(); // Vibration for countdown
      
      const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
          // Play heartbeat sound
          window.heartbeatSound.currentTime = 0;
          window.heartbeatSound.play().catch(e => console.error('Heartbeat play failed:', e));
          
          // Vibrate
          vibrateHeavy();
          
          // Reset animation
          numberElement.style.animation = 'none';
          setTimeout(() => {
            numberElement.style.animation = 'countdownPulse 0.8s ease';
            numberElement.textContent = count;
          }, 10);
        } else {
          clearInterval(countdownInterval);
          // Remove overlay
          overlay.remove();
          // Start the actual challenge
          if (callback) callback();
        }
      }, 1000);
    }
    
    function startChallenge() {
      if (window.challengeMode) return;
      
      // Show countdown first, then start challenge
      showCountdown(() => {
        // Clear anti-repetition history when starting challenge mode
        clearAntiRepetitionHistory();
        
        // FORCE: Always use random mode in challenge
        generationMode = 'random';
        currentSequentialScore = null;
        currentSequentialMode = null;
        document.getElementById('generationModeBtn').textContent = '🔀';
        
        // FORCE: Set to Mix mode and 2-170 range
        currentMode = 'mixed';
        currentRangeMin = 2;
        currentRangeMax = 170;
        
        // Update mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
          if (!btn.classList.contains('mode-btn-challenge')) {
            btn.classList.remove('active');
          }
        });
        const mixBtn = document.getElementById('modeMixBtn');
        if (mixBtn) {
          mixBtn.classList.add('active');
        }
        
        // Update range buttons
        document.querySelectorAll('.range-btn').forEach(btn => {
          btn.classList.remove('active-range');
          btn.classList.remove('disabled'); // Enable all ranges for mixed mode
        });
        const btn2_170 = document.querySelector('.range-btn.bg-blue-500');
        if (btn2_170) {
          btn2_170.classList.add('active-range');
        }
        
        // Reset learn button
        const learnBtn = document.getElementById('learnBtn');
        if (learnBtn) {
          learnBtn.style.borderColor = '#b91c1c';
        }
        window.learnModeActive = false;
        
        // FORCE: Deaktiviere Realistisch-Modus im Challenge
        realisticMode = false;
        
        // Reset realistic mode state
        isInErrorState = false;
        currentRemainingScore = null;
        dartsUsedInRound = 0;
        errorStateCheckout = [];
        dartsInErrorState = 0;
        
        // Update menu items
        updateMenuItems();
        
        // Update hint range
        currentHintRange = '2-170';
        if (hintVisible) {
          updateHintText();
        }
        
        // Start challenge
        window.challengeMode = true;
        challengeStats = { correct: 0, wrong: 0 };
        let timeLeft = 60;
        
        // Start challenge music
        console.log('Attempting to play challenge music...');
        if (!window.challengeMusic) {
          window.challengeMusic = new Audio('Quiz.mp3');
          window.challengeMusic.loop = true;
          console.log('Challenge music created');
        }
        // Always set volume (in case it was changed elsewhere)
        window.challengeMusic.volume = 0.01; // 1% volume
        
        window.challengeMusic.play()
          .then(() => console.log('Challenge music playing'))
          .catch(e => console.error('Audio play failed:', e));
        
        // Hide range card during challenge
        document.getElementById('rangeCard').style.display = 'none';
        
        // Select MP4 for challenge mode - shuffle playlist (no repeats until all played)
        const currentVideo = getNextChallengeVideo();
        
        const videoElement = document.querySelector('.challenge-gif video source');
        if (videoElement) {
          videoElement.src = currentVideo;
          // Reload video to apply new source
          videoElement.parentElement.load();
        }
        
        document.getElementById('challengeCard').classList.remove('hidden');
        document.getElementById('challengeTime').textContent = `⏱️ ${timeLeft}s`;
        updateChallengeStats();
        
        // Generate first score with 2-170 range
        generateScore(2, 170);
        
        window.challengeTimer = setInterval(() => {
          timeLeft--;
          document.getElementById('challengeTime').textContent = `⏱️ ${timeLeft}s`;
          
          // Play heartbeat during last 3 seconds (timeLeft: 3, 2, 1)
          if (timeLeft <= 3 && timeLeft >= 1) {
            // Vibration during last 3 seconds
            vibrateHeavy();
            
            if (window.heartbeatSound) {
              window.heartbeatSound.currentTime = 0;
              window.heartbeatSound.play().catch(e => console.error('Heartbeat play failed:', e));
            }
          }
          
          if (timeLeft <= 0) {
            endChallenge();
          }
        }, 1000);
      });
    }
    
    function endChallenge() {
      clearInterval(window.challengeTimer);
      window.challengeMode = false;
      
      // Restore rangeCard visibility after challenge
      restoreRangeCardVisibility('after challenge mode');
      
      // Stop challenge music
      if (window.challengeMusic) {
        window.challengeMusic.pause();
        window.challengeMusic.currentTime = 0; // Reset to beginning
      }
      
      document.getElementById('challengeCard').classList.add('hidden');
      document.getElementById('rangeCard').style.display = 'block';
      
      // Add to leaderboard
      const entry = {
        correct: challengeStats.correct,
        wrong: challengeStats.wrong,
        total: challengeStats.correct + challengeStats.wrong,
        date: new Date().toLocaleString('de-DE', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit'
        })
      };
      
      leaderboard.push(entry);
      
      // 3-tier sorting logic:
      // 1. More correct answers = better
      // 2. If tied: Less wrong answers = better
      // 3. If still tied: Older entry wins (stays in position)
      leaderboard.sort((a, b) => {
        // Priority 1: More correct answers wins
        if (b.correct !== a.correct) {
          return b.correct - a.correct;
        }
        
        // Priority 2: Less wrong answers wins
        if (a.wrong !== b.wrong) {
          return a.wrong - b.wrong;
        }
        
        // Priority 3: Tie - keep original order (older entry wins)
        return 0;
      });
      
      leaderboard = leaderboard.slice(0, 3); // Keep only top 3
      
      // Save to localStorage
      try {
        localStorage.setItem('dartTrainerLeaderboard', JSON.stringify(leaderboard));
      } catch (e) {
        console.error('Could not save leaderboard:', e);
      }
      
      // Reset to 3-Dart mode after challenge
      currentMode = '3darts';
      currentCheckouts = defaultCheckouts;
      
      // Update range buttons for 3-Dart
      updateRangeButtonsFor3Dart();
      
      // Set to 2-170 range
      currentRangeMin = 2;
      currentRangeMax = 170;
      const btn2_170 = document.querySelector('.range-btn.bg-blue-500');
      if (btn2_170) {
        document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active-range'));
        btn2_170.classList.add('active-range');
      }
      
      // Reset learn button
      const learnBtn = document.getElementById('learnBtn');
      if (learnBtn) {
        learnBtn.style.borderColor = '#b91c1c';
      }
      window.learnModeActive = false;
      
      // Restore realistic mode from localStorage
      const savedRealisticMode = localStorage.getItem('dartTrainerRealisticMode');
      realisticMode = savedRealisticMode === 'true';
      
      // Update menu items
      updateMenuItems();
      
      // Update hint range
      currentHintRange = '2-170';
      if (hintVisible) {
        updateHintText();
      }
      
      // Generate new score
      generateScore(2, 170);
      
      // Update mode buttons AFTER everything else - explicitly remove active from all buttons
      const mode3DartsBtn = document.getElementById('mode3DartsBtn');
      const mode2DartsBtn = document.getElementById('mode2DartsBtn');
      const modeMixBtn = document.getElementById('modeMixBtn');
      const modeChallengeBtn = document.getElementById('modeChallengeBtn');
      
      // Remove active from all mode buttons
      if (mode3DartsBtn) mode3DartsBtn.classList.remove('active');
      if (mode2DartsBtn) mode2DartsBtn.classList.remove('active');
      if (modeMixBtn) modeMixBtn.classList.remove('active');
      if (modeChallengeBtn) modeChallengeBtn.classList.remove('active');
      
      // Add active only to 3-Darts button
      if (mode3DartsBtn) {
        mode3DartsBtn.classList.add('active');
      }
      
      // Reset generation mode to random after challenge
      generationMode = 'random';
      const genModeBtn = document.getElementById('generationModeBtn');
      if (genModeBtn) {
        genModeBtn.textContent = '🔀';
      }
      
      // Show leaderboard with current entry
      openLeaderboard(entry);
    }
    
    function cancelChallenge() {
      // Stop timer and disable challenge mode
      clearInterval(window.challengeTimer);
      window.challengeMode = false;
      
      // Restore rangeCard visibility after canceling challenge
      restoreRangeCardVisibility('after canceling challenge');
      
      // Stop challenge music
      if (window.challengeMusic) {
        window.challengeMusic.pause();
        window.challengeMusic.currentTime = 0; // Reset to beginning
      }
      
      // Hide challenge card, show range card
      document.getElementById('challengeCard').classList.add('hidden');
      document.getElementById('rangeCard').style.display = 'block';
      
      // Reset to 3-Dart mode
      currentMode = '3darts';
      currentCheckouts = defaultCheckouts;
      
      // Update range buttons for 3-Dart
      updateRangeButtonsFor3Dart();
      
      // Set to 2-170 range
      currentRangeMin = 2;
      currentRangeMax = 170;
      const btn2_170 = document.querySelector('.range-btn.bg-blue-500');
      if (btn2_170) {
        document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active-range'));
        btn2_170.classList.add('active-range');
      }
      
      // Reset learn button
      const learnBtn = document.getElementById('learnBtn');
      if (learnBtn) {
        learnBtn.style.borderColor = '#b91c1c';
      }
      window.learnModeActive = false;
      
      // Update hint range
      currentHintRange = '2-170';
      if (hintVisible) {
        updateHintText();
      }
      
      // Generate new score
      generateScore(2, 170);
      
      // Update mode buttons - explicitly remove active from all buttons
      const mode3DartsBtn = document.getElementById('mode3DartsBtn');
      const mode2DartsBtn = document.getElementById('mode2DartsBtn');
      const modeMixBtn = document.getElementById('modeMixBtn');
      const modeChallengeBtn = document.getElementById('modeChallengeBtn');
      
      // Remove active from all mode buttons
      if (mode3DartsBtn) mode3DartsBtn.classList.remove('active');
      if (mode2DartsBtn) mode2DartsBtn.classList.remove('active');
      if (modeMixBtn) modeMixBtn.classList.remove('active');
      if (modeChallengeBtn) modeChallengeBtn.classList.remove('active');
      
      // Add active only to 3-Darts button
      if (mode3DartsBtn) {
        mode3DartsBtn.classList.add('active');
      }
      
      // Reset generation mode to random after challenge
      generationMode = 'random';
      const genModeBtn = document.getElementById('generationModeBtn');
      if (genModeBtn) {
        genModeBtn.textContent = '🔀';
      }
      
      // Restore realistic mode from localStorage
      const savedRealisticMode = localStorage.getItem('dartTrainerRealisticMode');
      realisticMode = savedRealisticMode === 'true';
      
      // Update menu items
      updateMenuItems();
    }
    
    function startLearnMode() {
      const count = Object.keys(problemScores).length;
      if (count === 0) {
        return;
      }
      
      // CRITICAL: Deaktiviere Realistisch-Modus im Lernbereich
      if (realisticMode) {
        realisticMode = false;
        localStorage.setItem('dartTrainerRealisticMode', 'false');
        
        // Reset error-state variables
        isInErrorState = false;
        currentRemainingScore = null;
        dartsUsedInRound = 0;
        errorStateCheckout = [];
        dartsInErrorState = 0;
        
        // Remove error classes from score card
        const scoreCard = document.getElementById('scoreCard');
        if (scoreCard) {
          scoreCard.classList.remove('error', 'warning');
        }
        
        // Update menu items to reflect change
        updateMenuItems();
      }
      
      // Switch to Mix mode for learn mode
      currentMode = 'mixed';
      
      // Update mode buttons
      const mode3DartsBtn = document.getElementById('mode3DartsBtn');
      const mode2DartsBtn = document.getElementById('mode2DartsBtn');
      const modeMixBtn = document.getElementById('modeMixBtn');
      const modeChallengeBtn = document.getElementById('modeChallengeBtn');
      
      if (mode3DartsBtn) mode3DartsBtn.classList.remove('active');
      if (mode2DartsBtn) mode2DartsBtn.classList.remove('active');
      if (modeMixBtn) modeMixBtn.classList.add('active');
      if (modeChallengeBtn) modeChallengeBtn.classList.remove('active');
      
      // Enable all range buttons for mixed mode
      document.querySelectorAll('.range-btn').forEach(btn => {
        btn.classList.remove('disabled');
      });
      
      // Remove active-range from all range buttons
      document.querySelectorAll('.range-btn').forEach(btn => {
        btn.classList.remove('active-range');
      });
      
      // Add active-range to learn button
      const learnBtn = document.getElementById('learnBtn');
      if (learnBtn) {
        learnBtn.classList.add('active-range');
      }
      
      // Enable learn mode
      window.learnModeActive = true;
      
      // Update menu to disable Freies spielen
      updateMenuItems();
      
      // Generate a score from problem list
      generateLearnScore();
    }
    
    function generateLearnScore() {
      const scores = Object.keys(problemScores).map(Number);
      
      if (scores.length === 0) {
        // This shouldn't happen anymore since we handle it in handleDartClick
        window.learnModeActive = false;
        updateProblemBadge();
        updateMenuItems(); // Re-enable Freies spielen button
        generateScore(currentRangeMin, currentRangeMax);
        return;
      }
      
      // Try to avoid the last generated score if there are alternatives
      let availableScores = scores;
      if (scores.length > 1 && recentlyGenerated.length > 0) {
        const lastEntry = recentlyGenerated[recentlyGenerated.length - 1];
        const filtered = scores.filter(s => {
          const problem = problemScores[s];
          const storedMode = typeof problem === 'object' ? problem.mode : '3darts';
          const actualMode = (storedMode === 'mixed') ? '3darts' : storedMode;
          // Different score OR same score but different mode
          return s !== lastEntry.score || actualMode !== lastEntry.mode;
        });
        
        // Only use filtered list if it's not empty
        if (filtered.length > 0) {
          availableScores = filtered;
        }
      }
      
      const randomScore = availableScores[Math.floor(Math.random() * availableScores.length)];
      
      currentScore = randomScore;
      
      // Use the mode that was stored with the problem
      const problem = problemScores[randomScore];
      const storedMode = typeof problem === 'object' ? problem.mode : '3darts';
      
      // If stored mode is 'mixed' (shouldn't happen with new code, but handle legacy data)
      // default to 3darts
      const actualMode = (storedMode === 'mixed') ? '3darts' : storedMode;
      
      // Add to recently generated list (for consistency with regular generation)
      recentlyGenerated.push({ score: currentScore, mode: actualMode });
      if (recentlyGenerated.length > 20) {
        recentlyGenerated = recentlyGenerated.slice(-20);
      }
      
      // Get checkout from the correct database based on stored mode
      if (actualMode === '2darts') {
        currentCheckout = twoDartCheckouts[randomScore] || [];
        currentCheckouts = twoDartCheckouts; // Set the current database
        maxDartsForRound = 2;
      } else {
        currentCheckout = defaultCheckouts[randomScore] || [];
        currentCheckouts = defaultCheckouts; // Set the current database
        maxDartsForRound = 3;
      }
      
      userInputs = [];
      highlightedFields = [];
      feedback = null;
      
      // Update score card styling based on stored mode
      const scoreCard = document.querySelector('.score-card');
      scoreCard.classList.remove('twodarts', 'stell', 'error');
      
      // Reset realistic mode state
      if (realisticMode) {
        isInErrorState = false;
        currentRemainingScore = null;
        dartsUsedInRound = 0;
        errorStateCheckout = [];
        dartsInErrorState = 0;
      }
      
      if (actualMode === '2darts') {
        scoreCard.classList.add('twodarts');
      }
      if (stellZahlen.includes(randomScore)) {
        scoreCard.classList.add('stell');
      }
      
      // Update title based on stored mode
      const title = actualMode === '2darts' ? '2 Darts:' : '3 Darts:';
      document.getElementById('scoreTitle').textContent = title;
      
      document.getElementById('scoreValue').textContent = currentScore;
      
      // Reset user-inputs
      const userInputsEl = document.getElementById('userInputs');
      userInputsEl.innerHTML = '';
      userInputsEl.classList.remove('correct', 'wrong', 'active');
      
      // Remove glow from outer ring when generating new score
      const outerRing = document.getElementById('dartboard-outer-ring');
      if (outerRing) {
        outerRing.classList.remove('flash-correct', 'flash-wrong');
      }
      
      createDartboard();
    }
    
    function toggleFullscreen() {
      console.log('Fullscreen button clicked');
      
      if (!document.fullscreenElement && 
          !document.webkitFullscreenElement && 
          !document.mozFullScreenElement && 
          !document.msFullscreenElement) {
        // Enter fullscreen
        const elem = document.documentElement;
        
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { // Safari
          elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) { // Firefox
          elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) { // IE11
          elem.msRequestFullscreen();
        }
        
        console.log('Entered fullscreen mode');
        updateFullscreenButton(true);
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        
        console.log('Exited fullscreen mode');
        updateFullscreenButton(false);
      }
    }
    
    function updateFullscreenButton(isFullscreen) {
      const btn = document.getElementById('fullscreenBtn');
      if (btn) {
        btn.textContent = isFullscreen ? '⛶' : '⛶'; // Same icon for now
        btn.title = isFullscreen ? 'Vollbild beenden' : 'Vollbildmodus';
      }
    }
    
    // Listen for fullscreen changes (user can exit with ESC)
    document.addEventListener('fullscreenchange', () => {
      updateFullscreenButton(!!document.fullscreenElement);
    });
    document.addEventListener('webkitfullscreenchange', () => {
      updateFullscreenButton(!!document.webkitFullscreenElement);
    });
    document.addEventListener('mozfullscreenchange', () => {
      updateFullscreenButton(!!document.mozFullScreenElement);
    });
    document.addEventListener('MSFullscreenChange', () => {
      updateFullscreenButton(!!document.msFullscreenElement);
    });
    
    function switchDatabaseMode(mode) {
      window.databaseEditMode = mode;
      
      // Update toggle buttons
      const btn3Dart = document.getElementById('db3DartToggle');
      const btn2Dart = document.getElementById('db2DartToggle');
      
      if (mode === '3darts') {
        btn3Dart.classList.add('active');
        btn2Dart.classList.remove('active');
      } else {
        btn3Dart.classList.remove('active');
        btn2Dart.classList.add('active');
      }
      
      // Reload the checkout list
      const list = document.getElementById('checkoutList');
      let html = '';
      const allCheckouts = mode === '2darts' ? twoDartCheckouts : defaultCheckouts;
      
      // Set maximum score based on mode (2-dart max: 110, 3-dart max: 170)
      const maxScore = mode === '2darts' ? 110 : 170;
      console.log('Switching database mode to:', mode, 'Max Score:', maxScore);
      
      for (let score = 2; score <= maxScore; score++) {
        const checkout = allCheckouts[score] || [];
        
        html += `
          <div class="checkout-edit-row">
            <div class="checkout-score">${score}</div>
            <input type="text" class="checkout-input" data-score="${score}" data-dart="0" value="${checkout[0] || ''}" placeholder="">
            <input type="text" class="checkout-input" data-score="${score}" data-dart="1" value="${checkout[1] || ''}" placeholder="">
            <input type="text" class="checkout-input" data-score="${score}" data-dart="2" value="${checkout[2] || ''}" placeholder="">
          </div>
        `;
      }
      
      list.innerHTML = html;
    }
    
    function openSettings() {
      const modal = document.getElementById('settingsModal');
      const list = document.getElementById('checkoutList');
      
      // Initialize databaseEditMode if not set
      if (!window.databaseEditMode) {
        window.databaseEditMode = '3darts';
      }
      
      // Update toggle buttons
      const btn3Dart = document.getElementById('db3DartToggle');
      const btn2Dart = document.getElementById('db2DartToggle');
      if (window.databaseEditMode === '3darts') {
        btn3Dart.classList.add('active');
        btn2Dart.classList.remove('active');
      } else {
        btn3Dart.classList.remove('active');
        btn2Dart.classList.add('active');
      }
      
      // Generate editable checkout list
      let html = '';
      const allCheckouts = window.databaseEditMode === '2darts' ? twoDartCheckouts : defaultCheckouts;
      
      // Set maximum score based on mode (2-dart max: 110, 3-dart max: 170)
      const maxScore = window.databaseEditMode === '2darts' ? 110 : 170;
      
      for (let score = 2; score <= maxScore; score++) {
        const checkout = allCheckouts[score] || [];
        
        html += `
          <div class="checkout-edit-row">
            <div class="checkout-score">${score}</div>
            <input type="text" class="checkout-input" data-score="${score}" data-dart="0" value="${checkout[0] || ''}" placeholder="">
            <input type="text" class="checkout-input" data-score="${score}" data-dart="1" value="${checkout[1] || ''}" placeholder="">
            <input type="text" class="checkout-input" data-score="${score}" data-dart="2" value="${checkout[2] || ''}" placeholder="">
          </div>
        `;
      }
      
      list.innerHTML = html;
      modal.style.display = 'flex';
    }
    
    function saveSettings() {
      const inputs = document.querySelectorAll('.checkout-input');
      const newDatabase = {};
      
      inputs.forEach(input => {
        const score = input.dataset.score;
        const dartIndex = parseInt(input.dataset.dart);
        const value = input.value.trim().toUpperCase();
        
        if (!newDatabase[score]) {
          newDatabase[score] = [];
        }
        
        if (value) {
          newDatabase[score][dartIndex] = value;
        }
      });
      
      // Clean up empty arrays
      for (let score in newDatabase) {
        newDatabase[score] = newDatabase[score].filter(d => d);
        if (newDatabase[score].length === 0) {
          delete newDatabase[score];
        }
      }
      
      // VALIDATION & CLEANUP: For 2-dart database, remove all scores > 110
      if (window.databaseEditMode === '2darts') {
        // First check if there are any invalid scores with data
        const invalidScoresWithData = Object.keys(newDatabase).filter(score => parseInt(score) > 110);
        
        // Remove all scores > 110 from the database
        for (let score in newDatabase) {
          if (parseInt(score) > 110) {
            delete newDatabase[score];
          }
        }
      }
      
      // Update the appropriate database
      if (window.databaseEditMode === '2darts') {
        twoDartCheckouts = newDatabase;
        // Only update currentCheckouts if we're currently in 2dart mode
        if (currentMode === '2darts') {
          currentCheckouts = twoDartCheckouts;
        }
        // Update which range buttons are available after editing database
        updateRangeButtonsFor2Dart();
      } else {
        defaultCheckouts = newDatabase;
        // Only update currentCheckouts if we're currently in 3dart mode
        if (currentMode === '3darts' || currentMode === 'mixed') {
          currentCheckouts = defaultCheckouts;
        }
      }
      
      closeSettings();
      
      // Regenerate current score if it exists in new database
      if (newDatabase[currentScore]) {
        currentCheckout = newDatabase[currentScore];
      }
    }
    
    function closeSettings() {
      document.getElementById('settingsModal').style.display = 'none';
      
      // If we came from the database editor on start screen, go back to start
      if (window.cameFromStartScreen) {
        goToStart();
        window.cameFromStartScreen = false;
      }
    }
    
    // Navigation functions
    function enterFullscreen() {
      const elem = document.documentElement;
      
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => {
          console.log('Fullscreen request failed:', err);
        });
      } else if (elem.webkitRequestFullscreen) { // Safari
        elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) { // Firefox
        elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) { // IE11
        elem.msRequestFullscreen();
      }
    }
    
    function goToTrainer() {
      vibrateMedium();
      document.getElementById('startScreen').style.display = 'none';
      document.getElementById('mainApp').style.display = 'block';
      
      // Restore correct mode and regenerate score to prevent mode mismatch
      if (currentMode === '3darts') {
        currentCheckouts = defaultCheckouts;
      } else if (currentMode === '2darts') {
        currentCheckouts = twoDartCheckouts;
      }
      // For mixed mode, currentCheckouts will be set in generateScore
      
      // Generate new score with current range to ensure consistency
      generateScore(currentRangeMin, currentRangeMax);
      
      // Automatically enter fullscreen
      enterFullscreen();
    }
    
    function goToStart() {
      document.getElementById('mainApp').style.display = 'none';
      document.getElementById('startScreen').style.display = 'flex';
    }
    
    function toggleMenu() {
      const menu = document.getElementById('menuDropdown');
      const overlay = document.getElementById('menuOverlay');
      const menuBtn = document.getElementById('menuBtn');
      
      if (menu.style.display === 'none' || !menu.style.display) {
        // Opening menu - update toggle states
        updateNumbersToggle();
        overlay.style.display = 'block';
        menu.style.display = 'block';
        
        // Position menu above the button (top-right position)
        setTimeout(() => {
          if (menuBtn) {
            const btnRect = menuBtn.getBoundingClientRect();
            const menuRect = menu.getBoundingClientRect();
            
            // Position menu above button, shifted more to the left
            const top = btnRect.top - menuRect.height - 20;
            const left = btnRect.right - menuRect.width - 10;
            
            console.log('Menu Button Rect:', btnRect);
            console.log('Menu Rect width:', menuRect.width);
            console.log('Setting menu position - top:', top, 'left:', left);
            
            menu.style.top = top + 'px';
            menu.style.left = left + 'px';
            menu.style.right = 'auto';
            menu.style.bottom = 'auto';
          }
        }, 0);
      } else {
        overlay.style.display = 'none';
        menu.style.display = 'none';
      }
    }
    
    function toggleBlackRing() {
      numbersVisible = !numbersVisible;
      createDartboard();
      updateMenuItems();
    }
    
    function updateNumbersToggle() {
      const toggle = document.getElementById('numbersToggle');
      if (toggle) {
        toggle.textContent = numbersVisible ? '☑' : '☐';
      }
    }
    
    function closeMenu() {
      document.getElementById('menuOverlay').style.display = 'none';
      document.getElementById('menuDropdown').style.display = 'none';
    }
    
    function openDatabaseEditor() {
      vibrateMedium();
      // Mark that we came from start screen
      window.cameFromStartScreen = true;
      
      // Default to 3darts mode
      window.databaseEditMode = '3darts';
      
      // Go to trainer
      goToTrainer();
      
      // Open settings
      setTimeout(() => {
        openSettings();
      }, 100);
    }
    
    function openLeaderboard(currentEntry = null) {
      vibrateMedium();
      
      // Restore rangeCard visibility for leaderboard modal
      restoreRangeCardVisibility('leaderboard modal');
      
      const modal = document.getElementById('leaderboardModal');
      const list = document.getElementById('leaderboardList');
      
      // Always reload from localStorage to get fresh data
      try {
        const saved = localStorage.getItem('dartTrainerLeaderboard');
        if (saved) {
          leaderboard = JSON.parse(saved);
          console.log('Loaded leaderboard from localStorage:', leaderboard);
        } else {
          console.log('No leaderboard in localStorage');
        }
      } catch (e) {
        console.error('Could not load leaderboard:', e);
      }
      
      const medals = ['🥇', '🥈', '🥉'];
      const ranks = ['first', 'second', 'third'];
      
      let html = '';
      
      // Always show 3 spots (filled or placeholder)
      for (let i = 0; i < 3; i++) {
        const entry = leaderboard[i];
        
        if (entry) {
          // Filled spot
          html += `
            <div class="leaderboard-entry ${ranks[i]}">
              <div class="leaderboard-rank">${medals[i]}</div>
              <div class="leaderboard-stats">
                <span class="leaderboard-correct">✓ ${entry.correct}</span>
                <span class="leaderboard-wrong">✗ ${entry.wrong}</span>
                <span>(${entry.total})</span>
              </div>
              <div class="leaderboard-date">${entry.date}</div>
            </div>
          `;
        } else {
          // Empty placeholder
          html += `
            <div class="leaderboard-entry leaderboard-placeholder">
              <div class="leaderboard-rank">${medals[i]}</div>
              <div class="leaderboard-stats">
                <span style="color: #9ca3af;">---</span>
              </div>
              <div class="leaderboard-date" style="color: #d1d5db;">Noch kein Eintrag</div>
            </div>
          `;
        }
      }
      
      // Always show current entry as 4th field if provided
      if (currentEntry) {
        html += `
          <div style="margin-top: 16px; padding-top: 16px; border-top: 2px solid #e5e7eb;">
            <div style="font-size: 13px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">Dein Ergebnis:</div>
            <div class="leaderboard-entry" style="background: #dbeafe; border: 2px solid #3b82f6;">
              <div class="leaderboard-rank">🎯</div>
              <div class="leaderboard-stats">
                <span class="leaderboard-correct">✓ ${currentEntry.correct}</span>
                <span class="leaderboard-wrong">✗ ${currentEntry.wrong}</span>
                <span>(${currentEntry.total})</span>
              </div>
              <div class="leaderboard-date">${currentEntry.date}</div>
            </div>
          </div>
        `;
      }
      
      list.innerHTML = html;
      modal.style.display = 'flex';
      
      // Enter fullscreen
      enterFullscreen();
    }
    
    function closeLeaderboard() {
      document.getElementById('leaderboardModal').style.display = 'none';
    }
    
    window.resetLeaderboard = function() {
      console.log('resetLeaderboard called - showing custom confirm modal');
      
      // Close leaderboard modal
      document.getElementById('leaderboardModal').style.display = 'none';
      
      // Show custom confirm modal
      document.getElementById('confirmDeleteModal').style.display = 'flex';
    };
    
    window.confirmDeleteLeaderboard = function() {
      console.log('User confirmed delete');
      
      // Hide confirm modal
      document.getElementById('confirmDeleteModal').style.display = 'none';
      
      // Delete leaderboard
      leaderboard = [];
      localStorage.removeItem('dartTrainerLeaderboard');
      console.log('Leaderboard deleted');
      
      // Reopen leaderboard modal with empty list
      document.getElementById('leaderboardList').innerHTML = '<div class="leaderboard-empty">Noch keine Einträge! Starte eine Challenge, um die Bestenliste zu füllen.</div>';
      document.getElementById('leaderboardModal').style.display = 'flex';
    };
    
    window.cancelDeleteLeaderboard = function() {
      console.log('User cancelled delete');
      
      // Hide confirm modal
      document.getElementById('confirmDeleteModal').style.display = 'none';
      
      // Reopen leaderboard modal without changes
      document.getElementById('leaderboardModal').style.display = 'flex';
    };
    
    // Database Reset Functions
    window.resetDatabase = function() {
      console.log('resetDatabase called - showing custom confirm modal');
      
      // Close settings modal
      document.getElementById('settingsModal').style.display = 'none';
      
      // Show custom confirm modal
      document.getElementById('confirmResetDatabaseModal').style.display = 'flex';
    };
    
    window.confirmResetDatabase = function() {
      console.log('User confirmed database reset');
      
      // Hide confirm modal
      document.getElementById('confirmResetDatabaseModal').style.display = 'none';
      
      // Reset checkouts to original values
      defaultCheckouts = JSON.parse(JSON.stringify(originalDefaultCheckouts));
      twoDartCheckouts = JSON.parse(JSON.stringify(originalTwoDartCheckouts));
      
      // Update currentCheckouts if needed
      if (currentMode === '3darts') {
        currentCheckouts = defaultCheckouts;
      } else if (currentMode === '2darts') {
        currentCheckouts = twoDartCheckouts;
      }
      
      // Remove from localStorage
      localStorage.removeItem('dartTrainerCheckouts');
      localStorage.removeItem('dartTrainerTwoDartCheckouts');
      console.log('Database reset to defaults');
      
      // Reopen settings modal with updated values
      openSettings();
    };
    
    window.cancelResetDatabase = function() {
      console.log('User cancelled database reset');
      
      // Hide confirm modal
      document.getElementById('confirmResetDatabaseModal').style.display = 'none';
      
      // Reopen settings modal without changes
      document.getElementById('settingsModal').style.display = 'flex';
    };
    
    // Color Reset Functions
    window.resetColors = function() {
      console.log('resetColors called - showing custom confirm modal');
      
      // Close background modal
      document.getElementById('backgroundModal').style.display = 'none';
      
      // Show custom confirm modal
      document.getElementById('confirmResetColorsModal').style.display = 'flex';
    };
    
    window.confirmResetColors = function() {
      console.log('User confirmed color reset');
      
      // Hide confirm modal
      document.getElementById('confirmResetColorsModal').style.display = 'none';
      
      // Remove custom colors from localStorage
      localStorage.removeItem('dartTrainerBackgroundCustom');
      localStorage.removeItem('dartTrainerFieldCustom');
      localStorage.removeItem('dartTrainerFieldBorder');
      // Lösche auch Session-Hintergrund
      localStorage.removeItem('dartTrainerBackgroundSession');
      console.log('Colors reset to defaults');
      
      // Reload page to apply default colors
      location.reload();
    };
    
    window.cancelResetColors = function() {
      console.log('User cancelled color reset');
      
      // Hide confirm modal
      document.getElementById('confirmResetColorsModal').style.display = 'none';
      
      // Reopen background modal without changes
      document.getElementById('backgroundModal').style.display = 'flex';
    };
    
    // Long-press functionality for menu button (fullscreen toggle)
    let menuBtnPressTimer = null;
    let menuBtnLongPressTriggered = false;
    
    function startMenuBtnPress(e) {
      e.preventDefault();
      vibrateMedium(); // Haptic feedback
      
      // ACTIVATION CHECK: Don't start long-press timer if container is dimmed
      if (window.rangeCardDimming && !window.rangeCardActive) {
        console.log('[DEBUG] MenuBtn press blocked - container dimmed');
        return;
      }
      
      menuBtnLongPressTriggered = false;
      
      menuBtnPressTimer = setTimeout(() => {
        menuBtnLongPressTriggered = true;
        
        // Visual feedback - change button appearance
        const btn = document.getElementById('menuBtn');
        if (btn) {
          btn.style.transform = 'scale(1.1)';
          btn.style.background = 'rgba(5, 150, 105, 0.2)';
        }
        
        // Immediately toggle fullscreen after 700ms
        toggleFullscreen();
      }, 700);
    }
    
    function handleMenuBtnRelease(e) {
      e.preventDefault();
      
      console.log('[DEBUG MenuBtn] Release - dimming:', window.rangeCardDimming, 'active:', window.rangeCardActive);
      
      // Reset button style
      const btn = document.getElementById('menuBtn');
      if (btn) {
        btn.style.transform = '';
        btn.style.background = '';
      }
      
      if (menuBtnPressTimer) {
        clearTimeout(menuBtnPressTimer);
        menuBtnPressTimer = null;
      }
      
      // ACTIVATION CHECK: If container is dimmed, only restore visibility
      if (window.rangeCardDimming && !window.rangeCardActive) {
        console.log('[DEBUG MenuBtn] Container dimmed - blocking menu opening');
        restoreRangeCardVisibility('via menuBtn (first click - menu not opened)');
        menuBtnLongPressTriggered = false;
        return;  // Don't open menu on first click
      }
      
      console.log('[DEBUG MenuBtn] Container active - allowing menu to open');
      
      // Check if long-press was triggered
      if (menuBtnLongPressTriggered) {
        // Long press already handled in setTimeout - do nothing
      } else {
        // Short click - open menu (only if container is active)
        console.log('[DEBUG MenuBtn] Opening menu now');
        toggleMenu();
      }
      
      menuBtnLongPressTriggered = false;
    }
    
    function cancelMenuBtnPress(e) {
      if (menuBtnPressTimer) {
        clearTimeout(menuBtnPressTimer);
        menuBtnPressTimer = null;
      }
      menuBtnLongPressTriggered = false;
      
      // Reset button style
      const btn = document.getElementById('menuBtn');
      if (btn) {
        btn.style.transform = '';
        btn.style.background = '';
      }
    }
    
    // Long-press functionality for learn button
    let learnBtnPressTimer = null;
    let learnBtnLongPressTriggered = false;
    
    function clearLearningArea() {
      console.log('clearLearningArea called');
      const count = Object.keys(problemScores).length;
      console.log('Problem scores count:', count);
      
      if (count === 0) {
        console.log('Learning area is empty');
        return;
      }
      
      // Delete directly without confirmation
      console.log('Deleting learning area');
      problemScores = {};
      localStorage.setItem('problemScores', JSON.stringify(problemScores));
      updateProblemBadge();
      console.log('Learning area cleared');
      
      if (window.learnModeActive) {
        console.log('Exiting learn mode');
        window.learnModeActive = false;
        
        // Reset to 3-Dart mode
        currentMode = '3darts';
        currentCheckouts = defaultCheckouts;
        
        // Update mode buttons
        const mode3DartsBtn = document.getElementById('mode3DartsBtn');
        const mode2DartsBtn = document.getElementById('mode2DartsBtn');
        const modeMixBtn = document.getElementById('modeMixBtn');
        
        if (mode3DartsBtn) mode3DartsBtn.classList.add('active');
        if (mode2DartsBtn) mode2DartsBtn.classList.remove('active');
        if (modeMixBtn) modeMixBtn.classList.remove('active');
        
        // Update range buttons for 3-Dart
        updateRangeButtonsFor3Dart();
        
        currentRangeMin = 2;
        currentRangeMax = 170;
        
        const btn2_170 = document.querySelector('.range-btn.bg-blue-500');
        if (btn2_170) {
          document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active-range'));
          btn2_170.classList.add('active-range');
        }
        
        currentHintRange = '2-170';
        updateHintText();
        generateScore(2, 170);
      }
    }
    
    function startLearnBtnPress(e) {
      e.preventDefault();
      console.log('Long-press started');
      
      // ACTIVATION CHECK: Don't start long-press timer if container is dimmed
      if (window.rangeCardDimming && !window.rangeCardActive) {
        console.log('[DEBUG] LearnBtn press blocked - container dimmed');
        return;
      }
      
      learnBtnLongPressTriggered = false;
      
      learnBtnPressTimer = setTimeout(() => {
        console.log('Long-press detected (1.0 seconds)');
        learnBtnLongPressTriggered = true;
        
        // Visual feedback - change button color
        const btn = document.getElementById('learnBtn');
        if (btn) {
          btn.style.background = '#fca5a5'; // Light red
          btn.style.borderColor = '#991b1b'; // Dark red
        }
      }, 1000);
    }
    
    function handleLearnBtnRelease(e) {
      e.preventDefault();
      console.log('Button released, longPress:', learnBtnLongPressTriggered);
      
      // Reset button style
      const btn = document.getElementById('learnBtn');
      if (btn) {
        btn.style.background = 'white';
        btn.style.borderColor = '#b91c1c';
      }
      
      if (learnBtnPressTimer) {
        clearTimeout(learnBtnPressTimer);
        learnBtnPressTimer = null;
      }
      
      // ACTIVATION CHECK: If container is dimmed, only restore visibility
      if (window.rangeCardDimming && !window.rangeCardActive) {
        restoreRangeCardVisibility('via learnBtn (first click - function not executed)');
        learnBtnLongPressTriggered = false;
        return;  // Don't execute learn button function on first click
      }
      
      // Check if long-press was triggered
      if (learnBtnLongPressTriggered) {
        console.log('Long press - showing delete dialog');
        // Wait 500ms to ensure mouseup event is finished
        setTimeout(() => {
          clearLearningArea();
        }, 500);
      } else {
        console.log('Short click - starting learn mode');
        startLearnMode();
      }
      
      learnBtnLongPressTriggered = false;
    }
    
    function cancelLearnBtnPress(e) {
      if (learnBtnPressTimer) {
        clearTimeout(learnBtnPressTimer);
        learnBtnPressTimer = null;
      }
      learnBtnLongPressTriggered = false;
    }
    
    // Setup learn button
    const learnBtn = document.getElementById('learnBtn');
    if (learnBtn) {
      console.log('Learn button found, setting up long-press');
      // Remove any existing onclick
      learnBtn.onclick = null;
      
      // Mouse events
      learnBtn.addEventListener('mousedown', startLearnBtnPress);
      learnBtn.addEventListener('mouseup', handleLearnBtnRelease);
      learnBtn.addEventListener('mouseleave', cancelLearnBtnPress);
      
      // Touch events for mobile
      learnBtn.addEventListener('touchstart', startLearnBtnPress);
      learnBtn.addEventListener('touchend', handleLearnBtnRelease);
      learnBtn.addEventListener('touchcancel', cancelLearnBtnPress);
    } else {
      console.error('Learn button not found!');
    }
    
    // Setup menu button (short click: menu, long press: fullscreen)
    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn) {
      console.log('Menu button found, setting up long-press');
      // Remove any existing onclick
      menuBtn.onclick = null;
      
      // Mouse events
      menuBtn.addEventListener('mousedown', startMenuBtnPress);
      menuBtn.addEventListener('mouseup', handleMenuBtnRelease);
      menuBtn.addEventListener('mouseleave', cancelMenuBtnPress);
      
      // Touch events for mobile
      menuBtn.addEventListener('touchstart', startMenuBtnPress);
      menuBtn.addEventListener('touchend', handleMenuBtnRelease);
      menuBtn.addEventListener('touchcancel', cancelMenuBtnPress);
    } else {
      console.error('Menu button not found!');
    }
    
    // Setup range buttons with long-press
    // Use WeakMap to store timer and state per button (avoids multi-touch conflicts)
    const rangeBtnTimers = new WeakMap();
    const rangeBtnStates = new WeakMap();
    
    function startRangeBtnPress(e) {
      e.preventDefault();
      const btn = e.currentTarget;
      
      // Cancel any existing timer for this button
      if (rangeBtnTimers.has(btn)) {
        clearTimeout(rangeBtnTimers.get(btn));
      }
      
      // Initialize state for this button
      rangeBtnStates.set(btn, { longPressTriggered: false });
      
      // Set timer for this specific button
      const timer = setTimeout(() => {
        // After 0.7 seconds - long press detected
        const state = rangeBtnStates.get(btn);
        if (state) {
          state.longPressTriggered = true;
        }
        
        // Show hint for this range
        const hintKey = btn.dataset.hint;
        if (hintKey) {
          showRangeHint(hintKey);
        }
      }, 700); // 0.7 seconds for range buttons
      
      rangeBtnTimers.set(btn, timer);
    }
    
    function handleRangeBtnRelease(e) {
      e.preventDefault();
      const btn = e.currentTarget;
      
      // Clear timer for this button
      if (rangeBtnTimers.has(btn)) {
        clearTimeout(rangeBtnTimers.get(btn));
        rangeBtnTimers.delete(btn);
      }
      
      // Check if long-press was triggered for this button
      const state = rangeBtnStates.get(btn);
      if (state && !state.longPressTriggered) {
        // Short click - select range
        const min = parseInt(btn.dataset.min);
        const max = parseInt(btn.dataset.max);
        setRange(min, max, btn);
      }
      
      // Clean up state
      rangeBtnStates.delete(btn);
    }
    
    function cancelRangeBtnPress(e) {
      const btn = e.currentTarget;
      
      // Clear timer for this button
      if (rangeBtnTimers.has(btn)) {
        clearTimeout(rangeBtnTimers.get(btn));
        rangeBtnTimers.delete(btn);
      }
      
      // Clean up state
      rangeBtnStates.delete(btn);
    }
    
    // Attach handlers to all range buttons (except learn button)
    const rangeButtons = document.querySelectorAll('.range-btn[data-min]');
    rangeButtons.forEach(btn => {
      // Mouse events
      btn.addEventListener('mousedown', startRangeBtnPress);
      btn.addEventListener('mouseup', handleRangeBtnRelease);
      btn.addEventListener('mouseleave', cancelRangeBtnPress);
      
      // Touch events for mobile
      btn.addEventListener('touchstart', startRangeBtnPress);
      btn.addEventListener('touchend', handleRangeBtnRelease);
      btn.addEventListener('touchcancel', cancelRangeBtnPress);
    });
    
    // Setup mode buttons with mousedown/touchstart (like range buttons)
    // This ensures they're caught by the capture handler when dimmed
    
    // Mode buttons: 3DF, 2DF, Mix
    document.querySelectorAll('.mode-btn[data-mode]').forEach(btn => {
      const clickHandler = function(e) {
        if (e.type === 'touchstart') {
          e.preventDefault(); // Prevent mousedown from firing
        }
        const mode = btn.getAttribute('data-mode');
        setMode(mode, btn);
      };
      
      btn.addEventListener('mousedown', clickHandler);
      btn.addEventListener('touchstart', clickHandler, { passive: false });
    });
    
    // Generation mode button (cycles through modes)
    const genModeBtn = document.getElementById('generationModeBtn');
    if (genModeBtn) {
      const genClickHandler = function(e) {
        if (e.type === 'touchstart') {
          e.preventDefault();
        }
        cycleGenerationMode();
      };
      genModeBtn.addEventListener('mousedown', genClickHandler);
      genModeBtn.addEventListener('touchstart', genClickHandler, { passive: false });
    }
    
    // Challenge button
    const challengeBtn = document.getElementById('modeChallengeBtn');
    if (challengeBtn) {
      const challengeClickHandler = function(e) {
        if (e.type === 'touchstart') {
          e.preventDefault();
        }
        startChallenge();
      };
      challengeBtn.addEventListener('mousedown', challengeClickHandler);
      challengeBtn.addEventListener('touchstart', challengeClickHandler, { passive: false });
    }
    
    // RangeCard: First click restores visibility, second click enables buttons
    const rangeCard = document.getElementById('rangeCard');
    if (rangeCard) {
      // Function to handle activation click
      function handleActivationClick(e) {
        // EXCLUDE menuBtn and learnBtn - they have their own activation logic
        const target = e.target;
        if (target.id === 'menuBtn' || target.id === 'learnBtn' || 
            target.closest('#menuBtn') || target.closest('#learnBtn')) {
          console.log('[DEBUG] Click on menuBtn/learnBtn - skipping rangeCard handler');
          return;  // Let the button handle activation itself
        }
        
        // If container is dimmed (inactive), first click only restores visibility
        if (window.rangeCardDimming && !window.rangeCardActive) {
          // Stop event from reaching buttons
          e.stopPropagation();
          e.preventDefault();
          
          // Restore all children to full opacity
          Array.from(rangeCard.children).forEach(child => {
            child.style.transition = 'none';
            child.style.opacity = '1.0';
          });
          
          rangeCard.style.borderColor = 'white';  // Restore full border
          window.rangeCardDimming = false;
          window.rangeCardActive = true;  // Mark as active for next click
          console.log('[DEBUG] RangeCard restored to 100% (first click - buttons not active yet)');
          
          // Re-enable transition after a brief moment
          setTimeout(() => {
            Array.from(rangeCard.children).forEach(child => {
              child.style.transition = 'opacity 3s ease';
            });
          }, 50);
          
          return false;
        }
        
        // If already active, events pass through normally to buttons
        console.log('[DEBUG] RangeCard active - buttons functional');
      }
      
      // Use capture phase for all interactive events
      rangeCard.addEventListener('click', handleActivationClick, true);
      rangeCard.addEventListener('mousedown', handleActivationClick, true);
      rangeCard.addEventListener('touchstart', handleActivationClick, true);
    }
    
    // Initialize
    generateScore(2, 170);
    loadBackground();
    initColorPicker();
    setupRandomBackgroundButton();
    
    // Mark first range button (2-170) as active
    const firstRangeBtn = document.querySelector('.range-btn.bg-blue-500');
    if (firstRangeBtn) {
      firstRangeBtn.classList.add('active-range');
    }
    
    // ========================================
    // ADD VIBRATION TO ALL BUTTONS
    // ========================================
    // Add vibration to all mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => vibrateLight());
    });
    
    // Add vibration to all range buttons
    document.querySelectorAll('.range-btn').forEach(btn => {
      btn.addEventListener('mousedown', () => vibrateMedium());
      btn.addEventListener('touchstart', () => vibrateMedium());
    });
    
    // Add vibration to all modal buttons
    document.querySelectorAll('.save-modal-btn, .close-modal-btn, .close-btn').forEach(btn => {
      btn.addEventListener('click', () => vibrateLight());
    });
    
    // Add vibration to dartboard fields (SVG circles)
    setTimeout(() => {
      document.querySelectorAll('#dartboard circle').forEach(circle => {
        circle.addEventListener('click', () => vibrateMedium());
      });
    }, 500);
    
    // Load problemScores from localStorage FIRST, then update badge
    // RESET: Clear problemScores for fresh start (can be removed after first use)
    localStorage.removeItem('problemScores');
    
    try {
      const savedProblems = localStorage.getItem('problemScores');
      if (savedProblems) {
        problemScores = JSON.parse(savedProblems);
        console.log('Loaded problemScores from localStorage:', problemScores);
      }
    } catch (e) {
      console.error('Could not load problemScores:', e);
    }
    
    // Update badge AFTER loading (important!)
    updateProblemBadge();
    
    // Load leaderboard from localStorage
    try {
      const saved = localStorage.getItem('dartTrainerLeaderboard');
      if (saved) {
        leaderboard = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Could not load leaderboard:', e);
    }
    
    // Setup reset leaderboard button event listener
    const resetBtn = document.getElementById('resetLeaderboardBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        console.log('Reset button clicked');
        window.resetLeaderboard();
      });
      console.log('Reset button event listener attached');
    } else {
      console.error('Reset button not found!');
    }
    
    // Setup manual score entry on click
    const scoreValue = document.getElementById('scoreValue');
    if (scoreValue) {
      scoreValue.addEventListener('click', function() {
        console.log('Score value clicked - opening manual entry');
        if (window.autoNextTimer) {
          clearTimeout(window.autoNextTimer);
          window.autoNextTimer = null;
        }
        setManualScore();
      });
      console.log('Score value click listener attached');
    }
    
    // Setup click on user-inputs box to go to next score when feedback is shown
    const userInputsBox = document.getElementById('userInputs');
    if (userInputsBox) {
      userInputsBox.addEventListener('click', function() {
        // Only proceed if feedback is shown
        if (feedback) {
          console.log('User inputs box clicked - generating next score');
          // Cancel auto-advance timer if running
          if (window.autoNextTimer) {
            clearTimeout(window.autoNextTimer);
            window.autoNextTimer = null;
          }
          // Reset manual score flag - generate random score now
          manualScoreActive = false;
          
          if (window.challengeMode) {
            generateScore(currentRangeMin, currentRangeMax);
          } else if (window.learnModeActive) {
            generateLearnScore();
          } else {
            generateScore(currentRangeMin, currentRangeMax);
          }
        }
      });
      console.log('User inputs box click listener attached');
    }
    
    // Swipe gesture: Left to right swipe to go back to start screen
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    
    const mainApp = document.getElementById('mainApp');
    
    mainApp.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, false);
    
    mainApp.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    }, false);
    
    function handleSwipe() {
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;
      
      // Check if horizontal swipe is dominant (not vertical scroll)
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Swipe from left to right (at least 100px)
        if (diffX > 100) {
          console.log('Swipe right detected - going to start screen');
          goToStart();
        }
      }
    }

// Long-press detection for mode buttons to show tutorial
document.addEventListener('DOMContentLoaded', function() {
  const modeButtons = document.querySelectorAll('.mode-btn');
  let pressTimer;
  
  modeButtons.forEach(button => {
    // Start timer on touch/mouse down
    button.addEventListener('touchstart', function(e) {
      pressTimer = setTimeout(() => {
        // After 1 second, open tutorial step 10 (mode-selector)
        if (!tutorialActive) {
          // Switch to training screen if not already there
          const mainApp = document.getElementById('mainApp');
          const startScreen = document.getElementById('startScreen');
          if (mainApp.style.display === 'none') {
            startScreen.style.display = 'none';
            mainApp.style.display = 'block';
          }
          
          // Start tutorial at step 10
          tutorialActive = true;
          currentTutorialStep = 10;
          
          // Show tutorial overlay and step
          const overlay = document.getElementById('tutorialOverlay');
          if (overlay) {
            overlay.classList.add('active');
          }
          showTutorialStep(10);
          
          vibrateLight();
        }
      }, 1000);
    }, { passive: true });
    
    button.addEventListener('mousedown', function(e) {
      pressTimer = setTimeout(() => {
        // After 1 second, open tutorial step 10 (mode-selector)
        if (!tutorialActive) {
          // Switch to training screen if not already there
          const mainApp = document.getElementById('mainApp');
          const startScreen = document.getElementById('startScreen');
          if (mainApp.style.display === 'none') {
            startScreen.style.display = 'none';
            mainApp.style.display = 'block';
          }
          
          // Start tutorial at step 10
          tutorialActive = true;
          currentTutorialStep = 10;
          
          // Show tutorial overlay and step
          const overlay = document.getElementById('tutorialOverlay');
          if (overlay) {
            overlay.classList.add('active');
          }
          showTutorialStep(10);
          
          vibrateLight();
        }
      }, 1000);
    });
    
    // Cancel timer on touch/mouse end or leave
    button.addEventListener('touchend', function(e) {
      clearTimeout(pressTimer);
    }, { passive: true });
    
    button.addEventListener('touchcancel', function(e) {
      clearTimeout(pressTimer);
    }, { passive: true });
    
    button.addEventListener('mouseup', function(e) {
      clearTimeout(pressTimer);
    });
    
    button.addEventListener('mouseleave', function(e) {
      clearTimeout(pressTimer);
    });
  });
});

// Initialize menu items on page load
document.addEventListener('DOMContentLoaded', function() {
  updateMenuItems();
});