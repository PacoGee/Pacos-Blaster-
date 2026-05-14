const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const tile = 64;
const cols = 13;
const rows = 11;
const floorOffsetY = 0;
const storageKey = "pacosBlasterStats";
const profileStorageKey = "pacosBlasterProfiles";
const nameStorageKey = "pacosBlasterName";

const hud = {
  name: document.getElementById("hudName"),
  level: document.getElementById("hudLevel"),
  score: document.getElementById("hudScore"),
  lives: document.getElementById("hudLives"),
  bombs: document.getElementById("hudBombs"),
  flame: document.getElementById("hudFlame"),
};

const ui = {
  overlay: document.getElementById("overlay"),
  screenKicker: document.getElementById("screenKicker"),
  screenTitle: document.getElementById("screenTitle"),
  screenText: document.getElementById("screenText"),
  primaryBtn: document.getElementById("primaryBtn"),
  resetBtn: document.getElementById("resetBtn"),
  startBtn: document.getElementById("startBtn"),
  pauseBtn: document.getElementById("pauseBtn"),
  singleModeBtn: document.getElementById("singleModeBtn"),
  multiModeBtn: document.getElementById("multiModeBtn"),
  onlineModeBtn: document.getElementById("onlineModeBtn"),
  screenSingleBtn: document.getElementById("screenSingleBtn"),
  screenMultiBtn: document.getElementById("screenMultiBtn"),
  screenOnlineBtn: document.getElementById("screenOnlineBtn"),
  onlinePanel: document.getElementById("onlinePanel"),
  onlineStatus: document.getElementById("onlineStatus"),
  createRoomBtn: document.getElementById("createRoomBtn"),
  joinRoomBtn: document.getElementById("joinRoomBtn"),
  roomCodeInput: document.getElementById("roomCodeInput"),
  screenOnlinePanel: document.getElementById("screenOnlinePanel"),
  screenOnlineStatus: document.getElementById("screenOnlineStatus"),
  screenCreateRoomBtn: document.getElementById("screenCreateRoomBtn"),
  screenJoinRoomBtn: document.getElementById("screenJoinRoomBtn"),
  screenRoomCodeInput: document.getElementById("screenRoomCodeInput"),
  onlineNameInput: document.getElementById("onlineNameInput"),
  screenOnlineNameInput: document.getElementById("screenOnlineNameInput"),
  refreshRoomsBtn: document.getElementById("refreshRoomsBtn"),
  screenRefreshRoomsBtn: document.getElementById("screenRefreshRoomsBtn"),
  roomList: document.getElementById("roomList"),
  screenRoomList: document.getElementById("screenRoomList"),
  playerName: document.getElementById("playerName"),
  stats: {
    games: document.getElementById("statGames"),
    totalScore: document.getElementById("statTotalScore"),
    bestScore: document.getElementById("statBestScore"),
    bestLevel: document.getElementById("statBestLevel"),
    wins: document.getElementById("statWins"),
    deaths: document.getElementById("statDeaths"),
    enemies: document.getElementById("statEnemies"),
    bombs: document.getElementById("statBombs"),
  },
  allStars: document.getElementById("allStarList"),
};

const state = {
  mode: "title",
  level: 1,
  score: 0,
  lives: 3,
  maxBombs: 3,
  flame: 2,
  playerSpeed: 7.4,
  activeBombs: 0,
  board: [],
  bombs: [],
  flames: [],
  particles: [],
  powerUps: [],
  enemies: [],
  exit: null,
  theme: null,
  shake: 0,
  flash: 0,
  levelBanner: 0,
  levelCompleteLock: false,
  respawnTimer: null,
  enemyGrace: 0,
  frame: 0,
  lastTime: 0,
  audioReady: false,
  audio: null,
  savedScore: 0,
  multiplayer: false,
  online: false,
};

const net = {
  socket: null,
  role: null,
  room: null,
  lastSnapshot: 0,
  pendingConnect: null,
  guestConnected: false,
  hostRoundWins: 0,
  guestRoundWins: 0,
};

const player = {
  id: 1,
  name: "Paco",
  gx: 1,
  gy: 1,
  px: tile,
  py: tile,
  target: null,
  nextDir: null,
  dir: "down",
  moving: false,
  moveT: 0,
  alive: true,
  invuln: 0,
  deathT: 0,
  stepPhase: 0,
  color: "#43df55",
  accent: "#0d2414",
  lives: 1,
};

const player2 = {
  id: 2,
  name: "P2",
  gx: cols - 2,
  gy: rows - 2,
  px: (cols - 2) * tile,
  py: (rows - 2) * tile,
  target: null,
  nextDir: null,
  dir: "down",
  moving: false,
  moveT: 0,
  alive: true,
  invuln: 0,
  deathT: 0,
  stepPhase: 0,
  color: "#ee2b20",
  accent: "#26100e",
  lives: 1,
};

let profiles = loadProfiles();
let stats = getProfile("Paco");
syncStats();

const themes = [
  {
    name: "Grass Labyrinth",
    floorA: "#25422f",
    floorB: "#2f5138",
    accent: "#a8e063",
    accent2: "#4fc36a",
    hardTop: "#899b83",
    hardMid: "#5d7060",
    hardDark: "#35483b",
    softTop: "#7fd36c",
    softMid: "#3e9a55",
    softDark: "#21643e",
    line: "#d6f08b",
    marker: "labyrinth",
    mural: "grass",
  },
  {
    name: "Corn Maze",
    floorA: "#34402b",
    floorB: "#42512f",
    accent: "#ffd35a",
    accent2: "#6eb95b",
    hardTop: "#9e9b76",
    hardMid: "#686b4f",
    hardDark: "#3b422e",
    softTop: "#f5ca47",
    softMid: "#b98e2f",
    softDark: "#6e5a25",
    line: "#ffe486",
    marker: "labyrinth",
    mural: "corn",
  },
  {
    name: "Rye Field",
    floorA: "#3d3e29",
    floorB: "#4d4d2f",
    accent: "#e9d77b",
    accent2: "#b08a3a",
    hardTop: "#a49c7a",
    hardMid: "#756d4f",
    hardDark: "#4a442f",
    softTop: "#e6c66a",
    softMid: "#a77d36",
    softDark: "#69542a",
    line: "#fff0a0",
    marker: "labyrinth",
    mural: "rye",
  },
  {
    name: "Moon Hedge",
    floorA: "#20362f",
    floorB: "#29443a",
    accent: "#7ee0b0",
    accent2: "#b6f2ff",
    hardTop: "#81938b",
    hardMid: "#536861",
    hardDark: "#2f403b",
    softTop: "#5fb878",
    softMid: "#2d7a54",
    softDark: "#174935",
    line: "#b6f2ff",
    marker: "labyrinth",
    mural: "hedge",
  },
];

const levels = [
  { enemies: ["balloon", "patrol"], power: 4, theme: 0, scene: "grass" },
  { enemies: ["balloon", "patrol", "ghost"], power: 5, theme: 1, scene: "corn" },
  { enemies: ["balloon", "patrol", "chaser", "ghost"], power: 6, theme: 2, scene: "rye" },
  { enemies: ["patrol", "chaser", "ghost", "chaser"], power: 7, theme: 3, scene: "hedge" },
  { enemies: ["balloon", "patrol", "patrol", "chaser"], power: 7, theme: 0, scene: "grass" },
  { enemies: ["ghost", "patrol", "chaser", "balloon", "ghost"], power: 8, theme: 1, scene: "corn" },
  { enemies: ["chaser", "chaser", "patrol", "ghost", "balloon"], power: 8, theme: 2, scene: "rye" },
  { enemies: ["ghost", "ghost", "chaser", "patrol", "chaser"], power: 9, theme: 3, scene: "hedge" },
  { enemies: ["patrol", "patrol", "chaser", "chaser", "ghost", "balloon"], power: 9, theme: 1, scene: "corn" },
  { enemies: ["chaser", "chaser", "ghost", "ghost", "patrol", "patrol"], power: 10, theme: 3, scene: "hedge" },
];
const finalLevel = levels.length;

function loadStats() {
  try {
    return {
      games: 0,
      bestLevel: 1,
      wins: 0,
      deaths: 0,
      enemies: 0,
      bombs: 0,
      ...JSON.parse(localStorage.getItem(storageKey) || "{}"),
    };
  } catch {
    return { games: 0, bestLevel: 1, wins: 0, deaths: 0, enemies: 0, bombs: 0 };
  }
}

function emptyProfile(name) {
  return { name, games: 0, bestLevel: 1, wins: 0, deaths: 0, enemies: 0, bombs: 0, totalScore: 0, bestScore: 0 };
}

function cleanName(name) {
  return (name || "Player").trim().slice(0, 14) || "Player";
}

function loadProfiles() {
  try {
    const saved = JSON.parse(localStorage.getItem(profileStorageKey) || "{}");
    if (saved && typeof saved === "object" && Object.keys(saved).length) return saved;
  } catch {
    // Fall back to legacy global stats below.
  }
  const legacy = loadStats();
  return { Paco: { ...emptyProfile("Paco"), ...legacy, name: "Paco" } };
}

function saveProfiles() {
  localStorage.setItem(profileStorageKey, JSON.stringify(profiles));
}

function getProfile(name) {
  const clean = cleanName(name);
  if (!profiles[clean]) profiles[clean] = emptyProfile(clean);
  profiles[clean].name = clean;
  return profiles[clean];
}

function saveStats() {
  saveProfiles();
  syncStats();
}

function syncStats() {
  stats = getProfile(player.name || ui.playerName.value);
  ui.stats.games.textContent = stats.games;
  ui.stats.totalScore.textContent = stats.totalScore;
  ui.stats.bestScore.textContent = stats.bestScore;
  ui.stats.bestLevel.textContent = stats.bestLevel;
  ui.stats.wins.textContent = stats.wins;
  ui.stats.deaths.textContent = stats.deaths;
  ui.stats.enemies.textContent = stats.enemies;
  ui.stats.bombs.textContent = stats.bombs;
  renderAllStars();
}

function renderAllStars() {
  const entries = Object.values(profiles)
    .sort((a, b) => b.totalScore - a.totalScore || b.wins - a.wins || b.bestScore - a.bestScore)
    .slice(0, 5);
  ui.allStars.innerHTML = entries.length
    ? entries
        .map(
          (entry, index) =>
            `<li><span class="rank">${index + 1}</span><strong>${escapeHtml(entry.name)}</strong><span class="score">${entry.totalScore}</span><span></span><span>${entry.wins} wins · L${entry.bestLevel}</span><span>Best ${entry.bestScore}</span></li>`
        )
        .join("")
    : `<li><span class="rank">1</span><strong>No players yet</strong><span class="score">0</span></li>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function addScore(amount) {
  state.score += amount;
  const delta = state.score - state.savedScore;
  if (delta > 0) {
    stats.totalScore += delta;
    state.savedScore = state.score;
    stats.bestScore = Math.max(stats.bestScore, state.score);
    saveStats();
  }
  updateHud();
}

function showScreen(kicker, title, text, buttonText = "Start Game") {
  ui.screenKicker.textContent = kicker;
  ui.screenTitle.textContent = title;
  ui.screenText.textContent = text;
  ui.primaryBtn.textContent = buttonText;
  ui.overlay.classList.add("is-open");
}

function setGameMode(mode) {
  const online = mode === "online";
  const dual = mode === "dual" || online;
  if (!online && net.socket) {
    net.socket.close();
    net.socket = null;
    net.role = null;
    net.room = null;
  }
  state.online = online;
  state.multiplayer = dual;
  [ui.singleModeBtn, ui.screenSingleBtn].forEach((button) => button.classList.toggle("is-selected", mode === "single"));
  [ui.multiModeBtn, ui.screenMultiBtn].forEach((button) => button.classList.toggle("is-selected", mode === "dual"));
  [ui.onlineModeBtn, ui.screenOnlineBtn].forEach((button) => button.classList.toggle("is-selected", online));
  ui.onlinePanel.hidden = !online;
  ui.screenOnlinePanel.hidden = !online;
  ui.screenKicker.textContent = online ? "Online Session" : dual ? "Local Two Player" : "Single Player";
  ui.screenText.textContent = online
    ? "Create a room, send the code to a friend, then start when both players are connected."
    : dual
      ? "Two signal runners enter the same arena. P1 uses arrows and Space. P2 uses WASD and F."
      : "Guide the little signal man through bomb smoke, odd enemies, hidden power-ups, and the exit tile.";
  updateHud();
}

function hideScreen() {
  ui.overlay.classList.remove("is-open");
  focusGame();
}

function focusGame() {
  canvas.focus();
  if (document.activeElement && document.activeElement.blur && document.activeElement !== canvas) {
    document.activeElement.blur();
  }
  canvas.focus();
}

function startGame() {
  if (isGuest()) {
    setOnlineStatus("Waiting for host to start.");
    return;
  }
  if (state.online && net.role === "host" && !net.guestConnected) {
    setOnlineStatus("Waiting for a friend to join first.");
    return;
  }
  ui.primaryBtn.classList.remove("btn-go");
  if (state.online) {
    net.hostRoundWins = 0;
    net.guestRoundWins = 0;
    startRound();
    return;
  }
  setupAudio();
  player.name = cleanName(ui.playerName.value);
  ui.playerName.value = player.name;
  stats = getProfile(player.name);
  stats.games += 1;
  saveStats();
  state.mode = "playing";
  state.level = 1;
  state.score = 0;
  state.savedScore = 0;
  state.lives = 3;
  state.maxBombs = 3;
  state.flame = 2;
  state.playerSpeed = 7.4;
  loadLevel(1);
  hideScreen();
  sendNet({ type: "start" });
  sendSnapshot(true);
}

function activePlayers() {
  return state.multiplayer ? [player, player2] : [player];
}

function isGuest() {
  return state.online && net.role === "guest";
}

function loadLevel(level) {
  if (state.respawnTimer) {
    clearTimeout(state.respawnTimer);
    state.respawnTimer = null;
  }
  const config = levels[(level - 1) % levels.length];
  state.theme = themes[config.theme];
  state.board = [];
  state.bombs = [];
  state.flames = [];
  state.particles = [];
  state.powerUps = [];
  state.enemies = [];
  state.exit = null;
  state.activeBombs = 0;
  state.flash = 0;
  state.levelBanner = 1.6;
  state.levelCompleteLock = false;
  state.enemyGrace = level <= 3 ? 2.2 : 1.2;
  state.shake = 0;
  resetActor(player, 1, 1, "down");
  resetActor(player2, cols - 2, rows - 2, "up");

  const safe = new Set(["1,1", "2,1", "1,2", "3,1", "1,3", "11,9", "10,9", "11,8", "9,9", "11,7"]);
  const softTiles = [];
  for (let y = 0; y < rows; y++) {
    state.board[y] = [];
    for (let x = 0; x < cols; x++) {
      const fixed = x === 0 || y === 0 || x === cols - 1 || y === rows - 1 || (x % 2 === 0 && y % 2 === 0);
      if (fixed) {
        state.board[y][x] = "hard";
      } else if (!safe.has(`${x},${y}`) && !isSceneLandmark(config.scene, x, y) && shouldPlaceSceneBlock(config.scene, x, y, level)) {
        state.board[y][x] = "soft";
        softTiles.push({ x, y });
      } else {
        state.board[y][x] = "floor";
      }
    }
  }

  const exitPool = shuffle(softTiles.filter((spot) => distance(spot.x, spot.y, player.gx, player.gy) > 5));
  state.exit = exitPool.shift() || softTiles.shift() || { x: cols - 2, y: rows - 2 };
  state.board[state.exit.y][state.exit.x] = "soft";
  const remainingSoftTiles = softTiles.filter((spot) => spot.x !== state.exit.x || spot.y !== state.exit.y);
  const powerTypes = ["bomb", "flame", "speed", "score", "flame", "bomb", "life"];
  shuffle(remainingSoftTiles);
  for (let i = 0; i < config.power && remainingSoftTiles[i]; i++) {
    state.powerUps.push({ ...remainingSoftTiles[i], type: powerTypes[i % powerTypes.length], hidden: true });
  }

  const spawns = findEnemySpawns(state.exit);
  config.enemies.forEach((type, i) => {
    const spot = spawns[i];
    if (!spot) return;
    state.enemies.push(makeEnemy(type, spot.x, spot.y));
  });
  state.mode = "playing";
  updateHud();
}

function findEnemySpawns(exit) {
  const spawns = [];
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      if (state.board[y][x] !== "floor") continue;
      if (distance(x, y, player.gx, player.gy) <= 6) continue;
      if (exit && distance(x, y, exit.x, exit.y) <= 1) continue;
      if (!hasOpenNeighbor(x, y)) continue;
      spawns.push({ x, y });
    }
  }
  const cx = (cols - 1) / 2, cy = (rows - 1) / 2;
  return shuffle(spawns).sort((a, b) => distance(a.x, a.y, cx, cy) - distance(b.x, b.y, cx, cy));
}

function hasOpenNeighbor(x, y) {
  return ["left", "right", "up", "down"].some((dir) => {
    const p = offset(x, y, dir);
    return state.board[p.y]?.[p.x] === "floor";
  });
}

function isSceneLandmark(scene, x, y) {
  if (scene === "grass") return (x === 1 && y <= 4) || (y === 5 && x >= 3 && x <= 9) || (x === 11 && y >= 6);
  if (scene === "corn") return (x === 2 && y <= 5) || (x === 6 && y >= 2 && y <= 8) || (y === 8 && x >= 6);
  if (scene === "rye") return x + y === 8 || x + y === 13 || (y === 9 && x >= 7);
  return (x === 1 && y < 5) || (y === 4 && x < 10) || (x === 9 && y > 3) || (y === 8 && x > 3);
}

function shouldPlaceSceneBlock(scene, x, y, level) {
  const seeded = ((x * 19 + y * 23 + level * 7) % 13) < 2;
  if (scene === "grass") {
    const verticalHedges = (x === 3 || x === 7 || x === 9) && y % 3 !== 1;
    const horizontalHedges = (y === 3 || y === 7) && x % 4 !== 1;
    return verticalHedges || horizontalHedges || seeded;
  }
  if (scene === "corn") {
    const rows = x % 2 === 1 && y > 1 && y < 9;
    const breaks = (x === 5 && y < 5) || (x === 9 && y > 4) || (y === 5 && x > 2 && x < 10);
    return (rows && !breaks) || ((x + y) % 5 === 0 && y > 2);
  }
  if (scene === "rye") {
    const diagonalRows = (x + y) % 3 === 0 || (x - y + 12) % 5 === 0;
    const openSweep = x + y === 8 || x + y === 13 || x - y === 3;
    return (diagonalRows && !openSweep) || seeded;
  }
  const spiralWall =
    (y === 2 && x >= 3 && x <= 10) ||
    (x === 10 && y >= 2 && y <= 8) ||
    (y === 8 && x >= 3 && x <= 10) ||
    (x === 3 && y >= 4 && y <= 8) ||
    (y === 4 && x >= 3 && x <= 8) ||
    (x === 8 && y >= 4 && y <= 6);
  return spiralWall || seeded;
}

function buildPreviewBoard() {
  state.theme = themes[0];
  state.board = [];
  for (let y = 0; y < rows; y++) {
    state.board[y] = [];
    for (let x = 0; x < cols; x++) {
      const fixed = x === 0 || y === 0 || x === cols - 1 || y === rows - 1 || (x % 2 === 0 && y % 2 === 0);
      const patternSoft = !fixed && x > 2 && y > 2 && (x * 3 + y * 5) % 7 < 3;
      state.board[y][x] = fixed ? "hard" : patternSoft ? "soft" : "floor";
    }
  }
  player.gx = 1;
  player.gy = 1;
  player.px = tile;
  player.py = tile;
  resetActor(player2, cols - 2, rows - 2, "up");
  state.exit = { x: cols - 2, y: rows - 2 };
}

function resetActor(actor, gx, gy, dir = "down") {
  actor.gx = gx;
  actor.gy = gy;
  actor.px = gx * tile;
  actor.py = gy * tile;
  actor.target = null;
  actor.nextDir = null;
  actor.dir = dir;
  actor.moving = false;
  actor.moveT = 0;
  actor.alive = true;
  actor.invuln = 1.4;
  actor.deathT = 0;
}

function makeEnemy(type, x, y) {
  return {
    type,
    gx: x,
    gy: y,
    px: x * tile,
    py: y * tile,
    dir: ["left", "right", "up", "down"][Math.floor(Math.random() * 4)],
    target: null,
    moveT: 0,
    speed: type === "chaser" ? 3.1 : type === "ghost" ? 2.2 : 2.45,
    mood: Math.random() * Math.PI * 2,
    dead: false,
    deathT: 0,
  };
}

function updateHud() {
  hud.name.textContent = state.online
    ? `${net.hostRoundWins}-${net.guestRoundWins}`
    : state.multiplayer ? `${player.name} + P2` : player.name;
  hud.level.textContent = state.level;
  hud.score.textContent = state.score;
  hud.lives.textContent = state.online
    ? `${player.lives}/${player2.lives}`
    : state.lives;
  hud.bombs.textContent = state.multiplayer
    ? `${bombsRemaining(player)}/${bombsRemaining(player2)}`
    : bombsRemaining(player);
  hud.flame.textContent = state.flame;
}

function activeBombsFor(actor) {
  return state.bombs.filter((bomb) => bomb.owner === actor.id).length;
}

function bombsRemaining(actor) {
  return Math.max(0, state.maxBombs - activeBombsFor(actor));
}

function setupAudio() {
  if (state.audioReady) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  state.audio = new AudioContext();
  state.audioReady = true;
}

function beep(freq, duration, type = "sine", gain = 0.06) {
  if (!state.audioReady || !state.audio) return;
  const now = state.audio.currentTime;
  const osc = state.audio.createOscillator();
  const volume = state.audio.createGain();
  osc.frequency.setValueAtTime(freq, now);
  osc.type = type;
  volume.gain.setValueAtTime(gain, now);
  volume.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(volume);
  volume.connect(state.audio.destination);
  osc.start(now);
  osc.stop(now + duration);
}

function canEnter(x, y, ghost = false) {
  if (x < 0 || y < 0 || x >= cols || y >= rows) return false;
  const cell = state.board[y][x];
  if (cell === "hard") return false;
  if (cell === "soft" && !ghost) return false;
  return !state.bombs.some((bomb) => bomb.gx === x && bomb.gy === y);
}

function queuePlayerMove(actor, dir) {
  if (state.mode !== "playing" || !actor.alive) return;
  if (actor.target) {
    actor.nextDir = dir;
    return;
  }
  const next = offset(actor.gx, actor.gy, dir);
  if (!canEnter(next.x, next.y)) return;
  actor.dir = dir;
  actor.target = next;
  actor.moveT = 0;
  actor.moving = true;
  beep(180, 0.04, "square", 0.015);
}

function placeBomb(actor = player) {
  if (state.mode !== "playing" || !actor.alive) return;
  if (activeBombsFor(actor) >= state.maxBombs) return;
  if (state.bombs.some((bomb) => bomb.gx === actor.gx && bomb.gy === actor.gy)) return;
  state.bombs.push({ gx: actor.gx, gy: actor.gy, timer: 2.15, pulse: 0, owner: actor.id });
  state.activeBombs += 1;
  stats.bombs += 1;
  saveStats();
  updateHud();
  beep(74, 0.12, "sawtooth", 0.05);
}

function update(dt) {
  state.frame += dt;
  state.shake = Math.max(0, state.shake - dt * 18);
  state.flash = Math.max(0, state.flash - dt * 3);
  state.levelBanner = Math.max(0, state.levelBanner - dt);
  if (isGuest()) return;
  activePlayers().forEach((actor) => {
    if (actor.invuln > 0) actor.invuln -= dt;
  });
  state.enemyGrace = Math.max(0, state.enemyGrace - dt);
  if (state.mode !== "playing") return;

  activePlayers().forEach((actor) => moveActor(actor, dt, state.playerSpeed));
  updateBombs(dt);
  updateFlames(dt);
  updateParticles(dt);
  if (state.enemyGrace <= 0) updateEnemies(dt);
  checkPlayerTiles();
  if (state.online && net.role === "host") {
    net.lastSnapshot += dt;
    if (net.lastSnapshot > 0.06) {
      net.lastSnapshot = 0;
      sendSnapshot();
    }
  }
}

function moveActor(actor, dt, speed) {
  if (!actor.target) {
    actor.moving = false;
    return;
  }
  actor.moveT = Math.min(1, actor.moveT + dt * speed);
  const eased = actor.moveT < 0.5 ? 2 * actor.moveT * actor.moveT : 1 - Math.pow(-2 * actor.moveT + 2, 2) / 2;
  actor.px = lerp(actor.gx * tile, actor.target.x * tile, eased);
  actor.py = lerp(actor.gy * tile, actor.target.y * tile, eased);
  actor.stepPhase += dt * 16;
  if (actor.moveT >= 1) {
    actor.gx = actor.target.x;
    actor.gy = actor.target.y;
    actor.px = actor.gx * tile;
    actor.py = actor.gy * tile;
    actor.target = null;
    actor.moving = false;
    if ((actor === player || actor === player2) && actor.nextDir) {
      const buffered = actor.nextDir;
      actor.nextDir = null;
      queuePlayerMove(actor, buffered);
    }
  }
}

function updateBombs(dt) {
  for (const bomb of state.bombs) {
    bomb.timer -= dt;
    bomb.pulse += dt;
    if (bomb.timer < 0.45 && Math.floor(bomb.pulse * 18) % 2 === 0) state.shake = Math.max(state.shake, 1.2);
  }
  const exploding = state.bombs.filter((bomb) => bomb.timer <= 0);
  exploding.forEach(explodeBomb);
  state.bombs = state.bombs.filter((bomb) => bomb.timer > 0);
}

function explodeBomb(bomb) {
  state.activeBombs = Math.max(0, state.activeBombs - 1);
  updateHud();
  state.shake = 8;
  state.flash = 1;
  beep(58, 0.22, "sawtooth", 0.12);
  beep(116, 0.15, "triangle", 0.08);

  const pieces = [{ gx: bomb.gx, gy: bomb.gy, kind: "center", dir: "center" }];
  for (const dir of ["left", "right", "up", "down"]) {
    for (let i = 1; i <= state.flame; i++) {
      const p = offset(bomb.gx, bomb.gy, dir, i);
      const cell = state.board[p.y]?.[p.x];
      if (!cell || cell === "hard") break;
      pieces.push({ gx: p.x, gy: p.y, kind: i === state.flame ? "tip" : "mid", dir });
      if (cell === "soft") {
        breakSoft(p.x, p.y);
        break;
      }
    }
  }

  pieces.forEach((flame) => state.flames.push({ ...flame, life: 0.56, max: 0.56 }));
  state.bombs.forEach((other) => {
    if (pieces.some((flame) => flame.gx === other.gx && flame.gy === other.gy)) other.timer = Math.min(other.timer, 0.03);
  });
}

function breakSoft(x, y) {
  if (state.board[y]?.[x] !== "soft") return;
  state.board[y][x] = "floor";
  addScore(20);
  for (let i = 0; i < 10; i++) {
    state.particles.push({
      x: x * tile + 32,
      y: y * tile + 32,
      vx: (Math.random() - 0.5) * 180,
      vy: (Math.random() - 0.7) * 160,
      life: 0.55,
      color: Math.random() > 0.5 ? "#c47a3a" : "#6e4731",
    });
  }
  const power = state.powerUps.find((p) => p.x === x && p.y === y);
  if (power) power.hidden = false;
}

function updateFlames(dt) {
  state.flames.forEach((flame) => {
    flame.life -= dt;
    if (flame.life > 0) burnAt(flame.gx, flame.gy);
  });
  state.flames = state.flames.filter((flame) => flame.life > 0);
}

function updateParticles(dt) {
  state.particles.forEach((p) => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 360 * dt;
    p.life -= dt;
  });
  state.particles = state.particles.filter((p) => p.life > 0);
}

function burnAt(x, y) {
  activePlayers().forEach((actor) => {
    if (actor.alive && actor.gx === x && actor.gy === y && actor.invuln <= 0) killPlayer(actor);
  });
  state.enemies.forEach((enemy) => {
    if (!enemy.dead && enemy.gx === x && enemy.gy === y) killEnemy(enemy);
  });
}

function killEnemy(enemy) {
  enemy.dead = true;
  enemy.deathT = 0.48;
  addScore(enemy.type === "chaser" ? 250 : 120);
  stats.enemies += 1;
  saveStats();
  beep(440, 0.08, "square", 0.06);
  beep(220, 0.12, "triangle", 0.04);
}

function killPlayer(actor = player) {
  if (!actor.alive) return;
  actor.alive = false;
  actor.deathT = 1.2;
  stats.deaths += 1;
  saveStats();
  state.shake = 10;
  beep(98, 0.4, "sawtooth", 0.09);
  if (state.respawnTimer) clearTimeout(state.respawnTimer);
  if (state.online) {
    actor.lives -= 1;
    updateHud();
    state.respawnTimer = setTimeout(() => {
      state.respawnTimer = null;
      if (actor.lives <= 0) {
        if (net.role === "host") endRound(actor);
      } else if (state.mode === "playing") {
        respawnPlayer(actor);
      }
    }, 1000);
  } else {
    state.lives -= 1;
    updateHud();
    state.respawnTimer = setTimeout(() => {
      state.respawnTimer = null;
      if (state.lives <= 0) {
        state.mode = "over";
        showScreen("Game Over", "Paco Down", `Score ${state.score}. You reached level ${state.level}.`, "Try Again");
      } else if (state.mode === "playing") {
        respawnPlayer(actor);
      }
    }, 1000);
  }
}

function endRound(loser) {
  if (state.mode !== "playing") return;
  state.mode = "roundOver";
  const other = loser === player ? player2 : player;
  const draw = other.lives <= 0;
  let winner;
  if (draw) {
    winner = "draw";
  } else if (loser === player) {
    winner = "guest";
    net.guestRoundWins += 1;
  } else {
    winner = "host";
    net.hostRoundWins += 1;
  }
  const matchOver = net.hostRoundWins >= 2 || net.guestRoundWins >= 2;
  sendNet({ type: "round-over", winner, hostWins: net.hostRoundWins, guestWins: net.guestRoundWins, matchOver });
  showRoundResultScreen(winner, matchOver);
}

function showRoundResultScreen(winner, matchOver) {
  const iWon = (net.role === "host" && winner === "host") || (net.role === "guest" && winner === "guest");
  const isDraw = winner === "draw";
  const score = `${net.hostRoundWins}–${net.guestRoundWins}`;
  updateHud();
  if (matchOver) {
    const title = isDraw ? "Match Drawn" : iWon ? "Victory!" : "Defeated";
    const body = isDraw
      ? `Both players fell. Final score: ${score}.`
      : iWon ? `You win the match ${score}! Well played.`
              : `You lose the match ${score}. Better luck next time.`;
    showScreen("Online Match", title, body, net.role === "host" ? "Play Again" : "Waiting...");
    state.mode = "over";
  } else {
    const title = isDraw ? "Round Drawn" : iWon ? "Round Won!" : "Round Lost";
    const body = isDraw
      ? `Neither player survived. Score: ${score}.`
      : iWon ? `You won this round! Score: ${score}.`
             : `Opponent won this round. Score: ${score}.`;
    showScreen("Online Match", title, body, net.role === "host" ? "Next Round" : "Waiting...");
  }
  setOnlineStatus(`Score: ${score}`);
}

function startRound() {
  if (isGuest()) { setOnlineStatus("Waiting for host to start."); return; }
  player.lives = 1;
  player2.lives = 1;
  setupAudio();
  player.name = cleanName(ui.playerName.value);
  ui.playerName.value = player.name;
  stats = getProfile(player.name);
  state.mode = "playing";
  state.level = 1;
  state.score = 0;
  state.savedScore = 0;
  state.lives = 1;
  state.maxBombs = 3;
  state.flame = 2;
  state.playerSpeed = 7.4;
  loadLevel(1);
  hideScreen();
  sendNet({ type: "start" });
  sendSnapshot(true);
}

function respawnPlayer(actor = player) {
  const start = actor === player2 ? { x: cols - 2, y: rows - 2, dir: "up" } : { x: 1, y: 1, dir: "down" };
  resetActor(actor, start.x, start.y, start.dir);
  actor.invuln = 1.8;
}

function updateEnemies(dt) {
  state.enemies.forEach((enemy) => {
    if (enemy.dead) {
      enemy.deathT -= dt;
      return;
    }
    if (!enemy.target) chooseEnemyMove(enemy);
    moveActor(enemy, dt, enemy.speed);
    activePlayers().forEach((actor) => {
      if (enemy.gx === actor.gx && enemy.gy === actor.gy && actor.alive && actor.invuln <= 0) killPlayer(actor);
    });
  });
  state.enemies = state.enemies.filter((enemy) => !enemy.dead || enemy.deathT > 0);
}

function chooseEnemyMove(enemy) {
  const dirs = ["left", "right", "up", "down"];
  let choices = dirs.filter((dir) => {
    const p = offset(enemy.gx, enemy.gy, dir);
    return canEnter(p.x, p.y, enemy.type === "ghost");
  });
  if (!choices.length) return;

  if (enemy.type === "chaser" && distance(enemy.gx, enemy.gy, player.gx, player.gy) < 6) {
    choices.sort((a, b) => {
      const pa = offset(enemy.gx, enemy.gy, a);
      const pb = offset(enemy.gx, enemy.gy, b);
      return distance(pa.x, pa.y, player.gx, player.gy) - distance(pb.x, pb.y, player.gx, player.gy);
    });
  } else if (enemy.type === "patrol") {
    const p = offset(enemy.gx, enemy.gy, enemy.dir);
    if (canEnter(p.x, p.y)) choices = [enemy.dir];
  } else if (enemy.type === "ghost" && Math.random() < 0.24) {
    choices = choices.filter((dir) => {
      const p = offset(enemy.gx, enemy.gy, dir);
      return state.board[p.y][p.x] === "soft";
    }).concat(choices);
  }

  enemy.dir = choices[Math.floor(Math.random() * Math.min(choices.length, 2))];
  enemy.target = offset(enemy.gx, enemy.gy, enemy.dir);
  enemy.moveT = 0;
}

function checkPlayerTiles() {
  const power = state.powerUps.find((p) => !p.hidden && activePlayers().some((actor) => p.x === actor.gx && p.y === actor.gy));
  if (power) {
    collectPower(power);
    state.powerUps = state.powerUps.filter((p) => p !== power);
  }

  const escaped = state.exit && activePlayers().some((actor) => actor.gx === state.exit.x && actor.gy === state.exit.y);
  if (escaped) {
    finishLevel();
  }
}

function collectPower(power) {
  if (power.type === "bomb") state.maxBombs += 1;
  if (power.type === "flame") state.flame += 1;
  if (power.type === "speed") state.playerSpeed = Math.min(10.4, state.playerSpeed + 0.8);
  if (power.type === "life") state.lives += 1;
  addScore(power.type === "score" ? 500 : 150);
  beep(660, 0.08, "triangle", 0.08);
}

function finishLevel() {
  if (state.levelCompleteLock || state.mode !== "playing") return;
  state.levelCompleteLock = true;
  if (state.respawnTimer) {
    clearTimeout(state.respawnTimer);
    state.respawnTimer = null;
  }
  addScore(1000 + state.level * 250);
  state.level += 1;
  stats.bestLevel = Math.max(stats.bestLevel, state.level);
  if (state.level > finalLevel) stats.wins += 1;
  saveStats();
  updateHud();
  state.mode = "levelDone";
  showScreen(
    "Level Clear",
    `Level ${state.level - 1} Complete`,
    "The exit is behind you. Ready for the next labyrinth?",
    state.level > finalLevel ? "Victory Run" : "Next Level"
  );
}

function draw() {
  const sx = (Math.random() - 0.5) * state.shake;
  const sy = (Math.random() - 0.5) * state.shake;
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(sx, sy + floorOffsetY);
  drawBoard();
  drawExitAndPowerups();
  state.bombs.forEach(drawBomb);
  state.flames.forEach(drawFlame);
  state.enemies.forEach(drawEnemy);
  drawPlayer(player);
  if (state.multiplayer) drawPlayer(player2);
  drawParticles();
  drawLevelBanner();
  if (state.flash > 0) {
    ctx.globalAlpha = state.flash * 0.16;
    ctx.fillStyle = "#fff1a8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  requestAnimationFrame(loop);
}

function drawLevelBanner() {
  if (state.levelBanner <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, state.levelBanner);
  ctx.fillStyle = "rgba(15, 22, 17, 0.78)";
  roundRect(canvas.width / 2 - 122, 24, 244, 54, 8);
  ctx.fill();
  ctx.fillStyle = "#fff4bf";
  ctx.font = "800 24px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`Level ${state.level}`, canvas.width / 2, 51);
  ctx.fillStyle = (state.theme || themes[0]).accent;
  ctx.font = "700 11px system-ui";
  ctx.fillText((state.theme || themes[0]).name.toUpperCase(), canvas.width / 2, 69);
  ctx.restore();
}

function drawBoard() {
  const theme = state.theme || themes[0];
  ctx.fillStyle = theme.floorA;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      drawFloorTile(x, y);
    }
  }
  drawSceneDetails();
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = state.board[y][x];
      if (cell === "hard") drawHardBlock(x, y);
      if (cell === "soft") drawSoftBlock(x, y);
    }
  }
}

function drawFloorTile(x, y) {
  const theme = state.theme || themes[0];
  const px = x * tile;
  const py = y * tile;
  const alt = (x + y) % 2 === 0;
  ctx.fillStyle = alt ? theme.floorA : theme.floorB;
  ctx.fillRect(px, py, tile, tile);
  drawUnderMuralTile(x, y, theme);
  ctx.fillStyle = "rgba(255,255,255,0.045)";
  ctx.fillRect(px + 2, py + 2, tile - 4, 2);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(px + 2, py + tile - 5, tile - 4, 3);
  if ((x + y * 3) % 7 === 0) {
    ctx.fillStyle = `${theme.accent}22`;
    ctx.fillRect(px + 28, py + 28, 8, 8);
  }
}

function drawUnderMuralTile(x, y, theme) {
  const px = x * tile;
  const py = y * tile;
  const cell = state.board[y]?.[x];
  const covered = cell === "soft";
  ctx.save();
  ctx.beginPath();
  ctx.rect(px + 2, py + 2, tile - 4, tile - 4);
  ctx.clip();
  ctx.globalAlpha = covered ? 0.18 : 0.92;
  drawFullMural(theme);

  if (covered) {
    ctx.fillStyle = "rgba(8,12,10,0.58)";
    ctx.fillRect(px, py, tile, tile);
  }
  ctx.restore();
}

function drawFullMural(theme) {
  if (theme.mural === "grass") {
    drawGrassMural(theme);
  } else if (theme.mural === "corn") {
    drawCornMural(theme);
  } else if (theme.mural === "rye") {
    drawRyeMural(theme);
  } else {
    drawHedgeMural(theme);
  }
}

function drawGrassMural(theme) {
  const sky = ctx.createLinearGradient(0, tile, 0, rows * tile);
  sky.addColorStop(0, "#74b66d");
  sky.addColorStop(0.45, "#5aa85c");
  sky.addColorStop(1, "#2f6f42");
  ctx.fillStyle = sky;
  ctx.fillRect(tile, tile, (cols - 2) * tile, (rows - 2) * tile);

  ctx.strokeStyle = "rgba(222, 255, 164, 0.36)";
  ctx.lineWidth = 10;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.moveTo(tile, (2 + i * 1.2) * tile);
    ctx.bezierCurveTo(4 * tile, (1.6 + i) * tile, 8 * tile, (2.5 + i * 1.2) * tile, 12 * tile, (1.9 + i * 1.15) * tile);
    ctx.stroke();
  }
  drawFieldFlowers("#f6f0a0", "#ffffff");
}

function drawCornMural(theme) {
  const sky = ctx.createLinearGradient(0, tile, 0, rows * tile);
  sky.addColorStop(0, "#5a7937");
  sky.addColorStop(0.55, "#8e933a");
  sky.addColorStop(1, "#c69b2d");
  ctx.fillStyle = sky;
  ctx.fillRect(tile, tile, 11 * tile, 9 * tile);

  for (let x = 1; x < cols; x++) {
    const baseX = x * tile + 18;
    ctx.strokeStyle = x % 2 ? "rgba(255,218,75,0.55)" : "rgba(100,154,57,0.65)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(baseX, 10 * tile);
    ctx.quadraticCurveTo(baseX - 18, 6 * tile, baseX + 4, tile);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,225,92,0.8)";
    ctx.fillRect(baseX - 6, 4.5 * tile + (x % 3) * 20, 12, 28);
  }
  ctx.fillStyle = "rgba(255,255,180,0.18)";
  ctx.fillRect(tile, 6.8 * tile, 11 * tile, 32);
}

function drawRyeMural(theme) {
  ctx.fillStyle = "#827238";
  ctx.fillRect(tile, tile, 11 * tile, 9 * tile);
  const field = ctx.createLinearGradient(tile, tile, 12 * tile, 10 * tile);
  field.addColorStop(0, "#5d6530");
  field.addColorStop(0.4, "#c4a44a");
  field.addColorStop(1, "#e7d073");
  ctx.fillStyle = field;
  ctx.fillRect(tile, tile, 11 * tile, 9 * tile);

  ctx.strokeStyle = "rgba(255, 240, 160, 0.5)";
  ctx.lineWidth = 4;
  for (let i = -7; i < 18; i++) {
    ctx.beginPath();
    ctx.moveTo((i * 0.75 + 1) * tile, 10 * tile);
    ctx.lineTo((i * 0.75 + 5) * tile, tile);
    ctx.stroke();
  }
  drawFieldFlowers("#fff1a1", "#d9a447");
}

function drawHedgeMural(theme) {
  const bg = ctx.createLinearGradient(0, tile, 0, 10 * tile);
  bg.addColorStop(0, "#18362e");
  bg.addColorStop(0.55, "#2f604c");
  bg.addColorStop(1, "#12251f");
  ctx.fillStyle = bg;
  ctx.fillRect(tile, tile, 11 * tile, 9 * tile);
  ctx.strokeStyle = "rgba(182,242,255,0.5)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(6.5 * tile, 5.5 * tile, 180, 0, Math.PI * 2);
  ctx.arc(6.5 * tile, 5.5 * tile, 105, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(126,224,176,0.45)";
  for (let i = 0; i < 16; i++) {
    ctx.beginPath();
    ctx.arc((1.4 + (i % 6) * 1.8) * tile, (2 + Math.floor(i / 6) * 2.5) * tile, 24, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFieldFlowers(primary, secondary) {
  for (let i = 0; i < 34; i++) {
    const x = tile + ((i * 97) % (11 * tile));
    const y = tile + ((i * 53) % (9 * tile));
    ctx.fillStyle = i % 2 ? primary : secondary;
    ctx.fillRect(x, y, 5, 5);
  }
}

function drawHardBlock(x, y) {
  const theme = state.theme || themes[0];
  const px = x * tile;
  const py = y * tile;
  const body = ctx.createLinearGradient(px, py + 4, px, py + tile - 6);
  body.addColorStop(0, theme.hardTop);
  body.addColorStop(0.28, theme.hardMid);
  body.addColorStop(1, theme.hardDark);
  ctx.fillStyle = body;
  roundRect(px + 4, py + 4, tile - 8, tile - 8, 6);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(px + 10, py + 9, tile - 20, 5);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(px + 9, py + tile - 14, tile - 18, 6);

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 2;
  ctx.strokeRect(px + 13, py + 18, tile - 26, 14);
  ctx.strokeStyle = "rgba(0,0,0,0.24)";
  ctx.strokeRect(px + 14, py + 34, tile - 28, 12);

  ctx.fillStyle = theme.accent + "66";
  if ((x + y) % 4 === 0) ctx.fillRect(px + 19, py + 41, 26, 4);
  ctx.fillStyle = "rgba(10,14,12,0.42)";
  drawRivet(px + 13, py + 13);
  drawRivet(px + tile - 13, py + 13);
  drawRivet(px + 13, py + tile - 13);
  drawRivet(px + tile - 13, py + tile - 13);

  ctx.strokeStyle = "rgba(0,0,0,0.28)";
  ctx.lineWidth = 2;
  roundRect(px + 4, py + 4, tile - 8, tile - 8, 6);
  ctx.stroke();
}

function drawSoftBlock(x, y) {
  const theme = state.theme || themes[0];
  const px = x * tile;
  const py = y * tile;
  const wobble = Math.sin((x * 2 + y * 5) + state.frame * 0.8) * 1.5;
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(px + 32, py + 55, 24, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  const body = ctx.createLinearGradient(px, py + 8, px, py + tile - 5);
  body.addColorStop(0, theme.softTop);
  body.addColorStop(0.5, theme.softMid);
  body.addColorStop(1, theme.softDark);
  ctx.fillStyle = body;
  roundRect(px + 7, py + 8, tile - 14, tile - 13, 5);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.17)";
  ctx.fillRect(px + 12, py + 12, tile - 24, 6);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(px + 12, py + tile - 16, tile - 24, 7);

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px + 12, py + 28);
  ctx.lineTo(px + tile - 12, py + 28);
  ctx.moveTo(px + 12, py + 41);
  ctx.lineTo(px + tile - 12, py + 41);
  ctx.stroke();

  ctx.strokeStyle = theme.softDark;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(px + 15, py + 24 + wobble);
  ctx.lineTo(px + 49, py + 45 - wobble);
  ctx.moveTo(px + 49, py + 24 - wobble);
  ctx.lineTo(px + 15, py + 45 + wobble);
  ctx.stroke();
  ctx.fillStyle = `${theme.accent}44`;
  if ((x + y) % 3 === 0) ctx.fillRect(px + 23, py + 26, 18, 6);

  ctx.fillStyle = "rgba(0,0,0,0.28)";
  if ((x * 7 + y) % 5 === 0) {
    ctx.fillRect(px + 17, py + 20, 5, 5);
    ctx.fillRect(px + 42, py + 47, 4, 4);
  }
  if ((x + y) % 2 === 0) {
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + 17, py + 50);
    ctx.lineTo(px + 31, py + 46);
    ctx.stroke();
  }
  drawMazeMaterial(x, y, theme);
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 2;
  roundRect(px + 8, py + 9, tile - 16, tile - 15, 5);
  ctx.stroke();
  ctx.restore();
}

function drawMazeMaterial(x, y, theme) {
  const px = x * tile;
  const py = y * tile;
  if (theme.mural === "grass" || theme.mural === "hedge") {
    for (let i = 0; i < 7; i++) {
      const lx = px + 13 + ((i * 9 + x * 4) % 38);
      const ly = py + 18 + ((i * 11 + y * 3) % 30);
      ctx.fillStyle = i % 2 ? "rgba(174,238,116,0.72)" : "rgba(38,113,63,0.8)";
      ctx.beginPath();
      ctx.ellipse(lx, ly, 8, 4, (i + x) * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }
  if (theme.mural === "corn") {
    ctx.strokeStyle = "rgba(83, 124, 45, 0.75)";
    ctx.lineWidth = 4;
    for (let i = 0; i < 4; i++) {
      const sx = px + 16 + i * 10;
      ctx.beginPath();
      ctx.moveTo(sx, py + 52);
      ctx.quadraticCurveTo(sx - 6, py + 34, sx + 3, py + 14);
      ctx.stroke();
      ctx.fillStyle = "#ffe16b";
      ctx.fillRect(sx - 3, py + 27 + (i % 2) * 7, 7, 14);
    }
    return;
  }
  ctx.strokeStyle = "rgba(255, 238, 145, 0.72)";
  ctx.lineWidth = 3;
  for (let i = 0; i < 7; i++) {
    const sx = px + 10 + i * 7;
    ctx.beginPath();
    ctx.moveTo(sx, py + 52);
    ctx.lineTo(sx + 14, py + 15);
    ctx.stroke();
  }
}

function drawRivet(x, y) {
  ctx.save();
  ctx.fillStyle = "rgba(10,14,12,0.42)";
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.arc(x - 1, y - 1, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSceneDetails() {
  const theme = state.theme || themes[0];
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = `${theme.line}99`;
  ctx.lineWidth = 4;
  ctx.setLineDash([18, 14]);
  ctx.beginPath();
  ctx.moveTo(1.5 * tile, 1.5 * tile);
  ctx.bezierCurveTo(3 * tile, 2.8 * tile, 2.2 * tile, 5 * tile, 5.5 * tile, 5.2 * tile);
  ctx.bezierCurveTo(9 * tile, 5.4 * tile, 7.3 * tile, 8.4 * tile, 11 * tile, 9 * tile);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = `${theme.accent}55`;
  ctx.beginPath();
  ctx.arc(6.5 * tile, 5.5 * tile, 32 + Math.sin(state.frame * 2) * 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawSignalIcon(x, y, theme) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(8, 12, 10, 0.7)";
  roundRect(-14, -30, 28, 60, 14);
  ctx.fill();
  ["#e84a3d", theme.accent, "#4fd36e"].forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, -18 + i * 18, 6, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawExitAndPowerups() {
  if (state.exit && state.board[state.exit.y]?.[state.exit.x] === "floor") {
    const px = state.exit.x * tile;
    const py = state.exit.y * tile;
    ctx.fillStyle = "#182018";
    roundRect(px + 14, py + 16, 36, 36, 5);
    ctx.fill();
    ctx.fillStyle = "#48d177";
    ctx.globalAlpha = 0.65 + Math.sin(state.frame * 6) * 0.25;
    ctx.fillRect(px + 22, py + 22, 20, 24);
    ctx.globalAlpha = 1;
  }
  state.powerUps.forEach((p) => {
    if (p.hidden) return;
    if (state.board[p.y]?.[p.x] !== "floor") return;
    const px = p.x * tile + 32;
    const py = p.y * tile + 32 + Math.sin(state.frame * 6) * 3;
    ctx.fillStyle = p.type === "bomb" ? "#e63e33" : p.type === "flame" ? "#ffcc43" : p.type === "life" ? "#39c86a" : "#65b7ff";
    ctx.beginPath();
    ctx.arc(px, py, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111713";
    ctx.font = "bold 16px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(p.type === "bomb" ? "B" : p.type === "flame" ? "F" : p.type === "life" ? "+" : "$", px, py);
  });
}

function drawBomb(bomb) {
  const px = bomb.gx * tile + 32;
  const py = bomb.gy * tile + 38;
  const urgency = 1 - Math.max(0, bomb.timer) / 2.15;
  const pulse = 1 + Math.sin(bomb.pulse * (10 + urgency * 16)) * (0.08 + urgency * 0.08);
  ctx.save();
  ctx.translate(px, py);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath();
  ctx.ellipse(0, 14, 22, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  const grad = ctx.createRadialGradient(-8, -10, 4, 0, 0, 25);
  grad.addColorStop(0, "#ff7668");
  grad.addColorStop(0.45, "#e63e33");
  grad.addColorStop(1, "#831d1c");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, 23, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2b1715";
  ctx.fillRect(-6, -30, 12, 12);
  ctx.strokeStyle = "#ffdd69";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, -30);
  ctx.quadraticCurveTo(12, -42, 22, -35 + Math.sin(state.frame * 18) * 4);
  ctx.stroke();
  ctx.fillStyle = "#fff0a6";
  ctx.beginPath();
  ctx.arc(25, -35 + Math.sin(state.frame * 18) * 4, 5 + urgency * 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFlame(flame) {
  const px = flame.gx * tile;
  const py = flame.gy * tile;
  const t = flame.life / flame.max;
  const glow = 0.65 + Math.sin(state.frame * 30) * 0.18;
  ctx.save();
  ctx.globalAlpha = Math.min(1, t * 2);
  ctx.translate(px + 32, py + 32);
  if (flame.dir === "left" || flame.dir === "right") ctx.rotate(Math.PI / 2);

  const length = flame.kind === "center" ? 54 : flame.kind === "tip" ? 58 : 64;
  const width = flame.kind === "center" ? 54 : 34;
  ctx.fillStyle = "rgba(255, 70, 34, 0.25)";
  roundRect(-width / 2 - 6, -length / 2 - 6, width + 12, length + 12, 18);
  ctx.fill();
  const grad = ctx.createLinearGradient(0, -length / 2, 0, length / 2);
  grad.addColorStop(0, "#fff2a0");
  grad.addColorStop(0.45, "#ffb229");
  grad.addColorStop(1, "#e43c24");
  ctx.fillStyle = grad;
  roundRect(-width / 2, -length / 2, width, length, flame.kind === "tip" ? 18 : 12);
  ctx.fill();
  ctx.globalAlpha = glow;
  ctx.fillStyle = "#fff8c9";
  roundRect(-width / 4, -length / 2 + 8, width / 2, length - 16, 10);
  ctx.fill();
  ctx.restore();
}

function drawEnemy(enemy) {
  const x = enemy.px + 32;
  const y = enemy.py + 38 + Math.sin(state.frame * 5 + enemy.mood) * 2;
  ctx.save();
  ctx.globalAlpha = enemy.dead ? Math.max(0, enemy.deathT / 0.48) : 1;
  ctx.translate(x, y);
  if (enemy.dead) ctx.scale(1 + (0.48 - enemy.deathT), 1 - (0.48 - enemy.deathT) * 0.4);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 18, 21, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  const color = enemy.type === "ghost" ? "#b88cff" : enemy.type === "chaser" ? "#ff6a5f" : enemy.type === "patrol" ? "#55b7ff" : "#ff77b8";
  ctx.fillStyle = color;
  ctx.beginPath();
  if (enemy.type === "ghost") {
    ctx.arc(0, -3, 20, Math.PI, 0);
    ctx.lineTo(20, 18);
    ctx.quadraticCurveTo(10, 10, 0, 18);
    ctx.quadraticCurveTo(-10, 10, -20, 18);
    ctx.closePath();
  } else {
    ctx.ellipse(0, 0, 22, 19, 0, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.fillStyle = "#101412";
  ctx.beginPath();
  ctx.arc(-7, -4, 4, 0, Math.PI * 2);
  ctx.arc(8, -4, 4, 0, Math.PI * 2);
  ctx.fill();
  if (enemy.type === "chaser") {
    ctx.strokeStyle = "#101412";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-7, 8);
    ctx.quadraticCurveTo(0, 14, 9, 8);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPlayer(actor = player) {
  const x = actor.px + 32;
  const y = actor.py + 40;
  const moving = actor.target || actor.moving;
  const stride = moving ? Math.sin(actor.stepPhase) : 0;
  const lean = moving
    ? actor.dir === "left"
      ? -0.13
      : actor.dir === "right"
        ? 0.13
        : actor.dir === "up"
          ? -0.04
          : 0.04
    : 0;
  const fade = actor.alive ? 1 : Math.max(0, actor.deathT / 1.2);
  const blink = actor.invuln > 0 && Math.floor(state.frame * 14) % 2 === 0;
  if (blink && actor.alive) return;

  const primary = actor.color;
  const dark = actor.accent;
  const isStopFigure = actor.id === 2;

  ctx.save();
  ctx.globalAlpha = fade;
  ctx.translate(x, y);
  if (!actor.alive) {
    ctx.rotate((1.2 - actor.deathT) * 1.2);
    ctx.translate(0, (1.2 - actor.deathT) * 22);
  }
  ctx.rotate(lean);
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath();
  ctx.ellipse(0, 18, 22, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = dark;
  ctx.lineWidth = 15;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(0, 6);
  ctx.stroke();

  ctx.strokeStyle = primary;
  ctx.lineWidth = 10;
  ctx.beginPath();
  if (isStopFigure && !moving) {
    ctx.moveTo(-8, -18);
    ctx.lineTo(-31, -18);
    ctx.moveTo(8, -18);
    ctx.lineTo(31, -18);
  } else if (moving) {
    ctx.moveTo(-7, -18);
    ctx.lineTo(-28, -10 + stride * 8);
    ctx.moveTo(8, -18);
    ctx.lineTo(30, -8 - stride * 7);
  } else {
    ctx.moveTo(-8, -17);
    ctx.lineTo(-25, -6);
    ctx.moveTo(8, -17);
    ctx.lineTo(25, -6);
  }
  ctx.stroke();

  ctx.lineWidth = 12;
  ctx.beginPath();
  if (moving) {
    ctx.moveTo(-5, 4);
    ctx.lineTo(-25, 26 - stride * 9);
    ctx.moveTo(5, 4);
    ctx.lineTo(25, 26 + stride * 9);
  } else if (isStopFigure) {
    ctx.moveTo(-5, 4);
    ctx.lineTo(-12, 28);
    ctx.moveTo(5, 4);
    ctx.lineTo(12, 28);
  } else {
    ctx.moveTo(-5, 4);
    ctx.lineTo(-18, 28);
    ctx.moveTo(5, 4);
    ctx.lineTo(17, 28);
  }
  ctx.stroke();

  ctx.fillStyle = dark;
  roundRect(-8, -29, 16, 33, 9);
  ctx.fill();
  ctx.fillStyle = primary;
  roundRect(-10, -31, 20, 32, 9);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, -39, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, -48);
  if (!isStopFigure) ctx.rotate(-0.1);
  roundRect(-17, -5, 34, 9, 5);
  ctx.fill();
  roundRect(-9, -13, 18, 11, 6);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "rgba(255, 246, 135, 0.32)";
  ctx.beginPath();
  ctx.arc(-4, -41, 2.5, 0, Math.PI * 2);
  ctx.fill();

  if (!actor.alive) {
    ctx.fillStyle = primary;
    ctx.save();
    ctx.translate(18, -56 - (1.2 - actor.deathT) * 25);
    ctx.rotate((1.2 - actor.deathT) * 4);
    roundRect(-12, -4, 24, 8, 4);
    ctx.fill();
    ctx.restore();
  }
  if (state.multiplayer && actor.alive) {
    ctx.fillStyle = "rgba(8, 12, 10, 0.78)";
    roundRect(-15, -67, 30, 16, 5);
    ctx.fill();
    ctx.fillStyle = primary;
    ctx.font = "800 10px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`P${actor.id}`, 0, -59);
  }
  ctx.restore();
}

function drawParticles() {
  state.particles.forEach((p) => {
    ctx.globalAlpha = Math.max(0, p.life / 0.55);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
    ctx.globalAlpha = 1;
  });
}

function loop(time) {
  const dt = Math.min(0.033, (time - state.lastTime) / 1000 || 0);
  state.lastTime = time;
  update(dt);
  draw();
}

function offset(x, y, dir, amount = 1) {
  if (dir === "left") return { x: x - amount, y };
  if (dir === "right") return { x: x + amount, y };
  if (dir === "up") return { x, y: y - amount };
  return { x, y: y + amount };
}

function distance(ax, ay, bx, by) {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

ui.primaryBtn.addEventListener("click", () => {
  if (state.mode === "title" || state.mode === "over") startGame();
  else if (state.mode === "roundOver") startRound();
  else if (state.mode === "paused") {
    state.mode = "playing";
    hideScreen();
  } else if (state.mode === "levelDone") {
    if (state.level > finalLevel) {
      showScreen("Victory", "Paco's Blaster Cleared", `Final score ${state.score}. Start again for a cleaner run.`, "Play Again");
      state.mode = "over";
    } else {
      loadLevel(state.level);
      hideScreen();
      sendSnapshot(true);
    }
  }
});

ui.startBtn.addEventListener("click", startGame);
ui.singleModeBtn.addEventListener("click", () => setGameMode("single"));
ui.screenSingleBtn.addEventListener("click", () => setGameMode("single"));
ui.multiModeBtn.addEventListener("click", () => setGameMode("dual"));
ui.screenMultiBtn.addEventListener("click", () => setGameMode("dual"));
ui.onlineModeBtn.addEventListener("click", () => setGameMode("online"));
ui.screenOnlineBtn.addEventListener("click", () => setGameMode("online"));
ui.createRoomBtn.addEventListener("click", createOnlineRoom);
ui.joinRoomBtn.addEventListener("click", joinOnlineRoom);
ui.screenCreateRoomBtn.addEventListener("click", createOnlineRoom);
ui.screenJoinRoomBtn.addEventListener("click", joinOnlineRoom);
ui.refreshRoomsBtn.addEventListener("click", requestRoomList);
ui.screenRefreshRoomsBtn.addEventListener("click", requestRoomList);
ui.onlineModeBtn.addEventListener("click", requestRoomList);
ui.screenOnlineBtn.addEventListener("click", requestRoomList);
ui.roomCodeInput.addEventListener("input", () => {
  const clean = ui.roomCodeInput.value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  ui.roomCodeInput.value = clean;
  ui.screenRoomCodeInput.value = clean;
});
ui.screenRoomCodeInput.addEventListener("input", () => {
  const clean = ui.screenRoomCodeInput.value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  ui.screenRoomCodeInput.value = clean;
  ui.roomCodeInput.value = clean;
});
ui.pauseBtn.addEventListener("click", () => {
  if (state.mode === "playing") {
    state.mode = "paused";
    showScreen("Paused", "Take A Breath", "The board is frozen until you continue.", "Continue");
  } else if (state.mode === "paused") {
    state.mode = "playing";
    hideScreen();
  }
});

ui.resetBtn.addEventListener("click", () => {
  stats = emptyProfile(cleanName(ui.playerName.value));
  profiles[stats.name] = stats;
  saveStats();
});

function onNameInput(source) {
  const val = source.value;
  [ui.playerName, ui.onlineNameInput, ui.screenOnlineNameInput].forEach((el) => {
    if (el !== source) el.value = val;
  });
  player.name = cleanName(val);
  localStorage.setItem(nameStorageKey, player.name);
  stats = getProfile(player.name);
  updateHud();
  syncStats();
}
ui.playerName.addEventListener("input", () => onNameInput(ui.playerName));
ui.onlineNameInput.addEventListener("input", () => onNameInput(ui.onlineNameInput));
ui.screenOnlineNameInput.addEventListener("input", () => onNameInput(ui.screenOnlineNameInput));

function handleKeyDown(event) {
  if (event.target && event.target.tagName === "INPUT") return;
  if (event.pacosBlasterHandled) return;
  event.pacosBlasterHandled = true;
  const key = event.code || event.key;
  const normalized = {
    Up: "ArrowUp",
    Down: "ArrowDown",
    Left: "ArrowLeft",
    Right: "ArrowRight",
    " ": "Space",
    Spacebar: "Space",
  }[key] || key;

  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "KeyW", "KeyA", "KeyS", "KeyD", "KeyF"].includes(normalized)) {
    event.preventDefault();
  }
  if (normalized === "Enter") {
    ui.primaryBtn.click();
    focusGame();
    return;
  }
  if (normalized === "Escape") {
    ui.pauseBtn.click();
    focusGame();
    return;
  }
  if (normalized === "Space") {
    setupAudio();
    focusGame();
    if (isGuest()) {
      sendNet({ type: "input", action: "bomb" });
      return;
    }
    placeBomb();
    return;
  }
  const dirs = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
  if (dirs[normalized]) {
    setupAudio();
    focusGame();
    if (isGuest()) {
      sendNet({ type: "input", action: "move", dir: dirs[normalized] });
      return;
    }
    queuePlayerMove(player, dirs[normalized]);
    return;
  }
  if (state.multiplayer && normalized === "KeyF") {
    setupAudio();
    focusGame();
    placeBomb(player2);
    return;
  }
  const p2Dirs = { KeyW: "up", KeyS: "down", KeyA: "left", KeyD: "right", w: "up", s: "down", a: "left", d: "right", W: "up", S: "down", A: "left", D: "right" };
  if (state.multiplayer && p2Dirs[normalized]) {
    setupAudio();
    focusGame();
    queuePlayerMove(player2, p2Dirs[normalized]);
  }
}

function connectOnline(onConnect) {
  if (net.socket && net.socket.readyState === WebSocket.OPEN) {
    if (onConnect) onConnect();
    return net.socket;
  }
  net.pendingConnect = onConnect;
  if (net.socket && net.socket.readyState === WebSocket.CONNECTING) return net.socket;
  const scheme = location.protocol === "https:" ? "wss" : "ws";
  net.socket = new WebSocket(`${scheme}://${location.host}/session`);
  net.socket.addEventListener("open", () => {
    setOnlineStatus("Connected. Create or join a room.");
    const cb = net.pendingConnect;
    net.pendingConnect = null;
    if (cb) cb();
  });
  net.socket.addEventListener("message", (event) => handleNetMessage(JSON.parse(event.data)));
  net.socket.addEventListener("close", () => setOnlineStatus("Disconnected."));
  net.socket.addEventListener("error", () => setOnlineStatus("Connection error."));
  return net.socket;
}

function createOnlineRoom() {
  setGameMode("online");
  net.guestConnected = false;
  const name = cleanName(ui.onlineNameInput.value || ui.playerName.value) || "Host";
  connectOnline(() => sendNet({ type: "create", name }));
}

function requestRoomList() {
  connectOnline(() => sendNet({ type: "list" }));
}

function joinOnlineRoom() {
  setGameMode("online");
  const code = (ui.screenRoomCodeInput.value || ui.roomCodeInput.value).trim().toUpperCase();
  if (!code) {
    setOnlineStatus("Enter a room code first.");
    return;
  }
  const name = cleanName(player.name);
  connectOnline(() => sendNet({ type: "join", code, name }));
}

function sendNet(data) {
  if (!net.socket || net.socket.readyState !== WebSocket.OPEN) return;
  net.socket.send(JSON.stringify(data));
}

function handleNetMessage(message) {
  if (message.type === "created") {
    net.role = "host";
    net.room = message.code;
    net.guestConnected = false;
    ui.roomCodeInput.value = message.code;
    ui.screenRoomCodeInput.value = message.code;
    setOnlineStatus(`Room ${message.code}. Send this code to your friend, then press Start.`);
    showScreen("Online Session", "Room Created", "Share the code below with your friend. Press Start Game once they've joined.", "Start Game");
    return;
  }
  if (message.type === "joined") {
    net.role = "guest";
    net.room = message.code;
    setGameMode("online");
    setOnlineStatus(`Joined ${message.code}. Waiting for host.`);
    showScreen("Online Session", "Joined Room", "You are Player 2. Use arrows and Space; the host starts the match.", "Waiting");
    return;
  }
  if (message.type === "peer") {
    player2.name = cleanName(message.name) || "P2";
    net.guestConnected = true;
    ui.primaryBtn.classList.add("btn-go");
    setOnlineStatus(`${player2.name} joined. Press Start Game to begin!`);
    showScreen("Online Session", "Friend Connected", `${player2.name} is ready. Press Start Game to begin!`, "Start Game");
    return;
  }
  if (message.type === "peer-left") {
    net.guestConnected = false;
    ui.primaryBtn.classList.remove("btn-go");
    setOnlineStatus("Friend left the room.");
    showScreen("Online Session", "Room Created", "Friend disconnected. Share the code and wait for them to rejoin.", "Start Game");
    return;
  }
  if (message.type === "rooms") {
    renderRoomList(message.rooms);
    return;
  }
  if (message.type === "error") {
    setOnlineStatus(message.message || "Online error.");
    return;
  }
  if (message.type === "input" && net.role === "host") {
    if (message.action === "move") queuePlayerMove(player2, message.dir);
    if (message.action === "bomb") placeBomb(player2);
    return;
  }
  if (message.type === "round-over" && net.role === "guest") {
    net.hostRoundWins = message.hostWins;
    net.guestRoundWins = message.guestWins;
    state.mode = message.matchOver ? "over" : "roundOver";
    showRoundResultScreen(message.winner, message.matchOver);
    return;
  }
  if (message.type === "start" && net.role === "guest") {
    hideScreen();
    return;
  }
  if (message.type === "snapshot" && net.role === "guest") {
    applySnapshot(message.snapshot);
  }
}

function renderRoomList(rooms) {
  [ui.roomList, ui.screenRoomList].forEach(el => {
    el.textContent = "";
    if (rooms.length === 0) {
      const li = document.createElement("li");
      li.className = "room-empty";
      li.textContent = "No open rooms right now";
      el.appendChild(li);
      return;
    }
    rooms.forEach(r => {
      const li = document.createElement("li");
      li.className = "room-item";
      const name = document.createElement("span");
      name.textContent = r.host;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Join";
      btn.addEventListener("click", () => {
        ui.roomCodeInput.value = r.code;
        ui.screenRoomCodeInput.value = r.code;
        joinOnlineRoom();
      });
      li.appendChild(name);
      li.appendChild(btn);
      el.appendChild(li);
    });
  });
}

function setOnlineStatus(text) {
  ui.onlineStatus.textContent = text;
  ui.screenOnlineStatus.textContent = text;
}

function sendSnapshot(force = false) {
  if (!force && (!net.socket || net.socket.readyState !== WebSocket.OPEN)) return;
  sendNet({ type: "snapshot", snapshot: makeSnapshot() });
}

function makeSnapshot() {
  return {
    mode: state.mode,
    level: state.level,
    score: state.score,
    lives: state.lives,
    maxBombs: state.maxBombs,
    flame: state.flame,
    playerSpeed: state.playerSpeed,
    activeBombs: state.activeBombs,
    board: state.board,
    bombs: state.bombs,
    flames: state.flames,
    particles: state.particles,
    powerUps: state.powerUps,
    enemies: state.enemies,
    exit: state.exit,
    themeIndex: themes.indexOf(state.theme),
    flash: state.flash,
    levelBanner: state.levelBanner,
    savedScore: state.savedScore,
    player: stripActor(player),
    player2: stripActor(player2),
    hostRoundWins: net.hostRoundWins,
    guestRoundWins: net.guestRoundWins,
  };
}

function stripActor(actor) {
  return {
    id: actor.id,
    name: actor.name,
    gx: actor.gx,
    gy: actor.gy,
    px: actor.px,
    py: actor.py,
    target: actor.target,
    nextDir: actor.nextDir,
    dir: actor.dir,
    moving: actor.moving,
    moveT: actor.moveT,
    alive: actor.alive,
    invuln: actor.invuln,
    deathT: actor.deathT,
    stepPhase: actor.stepPhase,
    lives: actor.lives,
  };
}

function applySnapshot(snapshot) {
  if (!snapshot) return;
  Object.assign(state, {
    mode: snapshot.mode,
    level: snapshot.level,
    score: snapshot.score,
    lives: snapshot.lives,
    maxBombs: snapshot.maxBombs,
    flame: snapshot.flame,
    playerSpeed: snapshot.playerSpeed || 7.4,
    activeBombs: snapshot.activeBombs,
    board: snapshot.board,
    bombs: snapshot.bombs,
    flames: snapshot.flames,
    particles: snapshot.particles,
    powerUps: snapshot.powerUps,
    enemies: snapshot.enemies,
    exit: snapshot.exit,
    theme: themes[snapshot.themeIndex] || themes[0],
    flash: snapshot.flash,
    levelBanner: snapshot.levelBanner,
    savedScore: snapshot.savedScore,
    multiplayer: true,
    online: true,
  });
  Object.assign(player, snapshot.player);
  Object.assign(player2, snapshot.player2);
  if (snapshot.hostRoundWins !== undefined) net.hostRoundWins = snapshot.hostRoundWins;
  if (snapshot.guestRoundWins !== undefined) net.guestRoundWins = snapshot.guestRoundWins;
  updateHud();
}

window.addEventListener("keydown", handleKeyDown, true);
document.addEventListener("keydown", handleKeyDown, true);
canvas.addEventListener("keydown", handleKeyDown, true);
canvas.addEventListener("pointerdown", focusGame);

const savedName = localStorage.getItem(nameStorageKey);
if (savedName) {
  player.name = savedName;
  [ui.playerName, ui.onlineNameInput, ui.screenOnlineNameInput].forEach((el) => { el.value = savedName; });
  stats = getProfile(savedName);
  syncStats();
}

buildPreviewBoard();
setGameMode("single");
updateHud();
requestAnimationFrame(loop);
