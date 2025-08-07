const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const foodCountEl = document.getElementById('food-count');
const restartBtn = document.getElementById('restartBtn');
const touchControls = document.getElementById('touch-controls');
const eatSound = document.getElementById('eatSound');
const soundToggle = document.getElementById('sound-toggle');
const nameModal = document.getElementById('name-modal');
const playerNameInput = document.getElementById('playerNameInput');
const startGameBtn = document.getElementById('startGameBtn');
const playerNameEl = document.getElementById('playerName');

const appleImg = new Image();
appleImg.src = 'apple.svg';

let gridSize = 20;
let tileCount = 20;
let snake, direction, food, score, foodCount, gameOver, speed, moveQueue, intervalId, soundOn;
let playerName = '';

function showNameModal() {
  nameModal.style.display = 'flex';
  playerNameInput.value = '';
  setTimeout(() => playerNameInput.focus(), 100);
}
function hideNameModal() {
  nameModal.style.display = 'none';
}
function setPlayerName(name) {
  playerName = name.trim().slice(0, 16) || 'Player';
  playerNameEl.textContent = playerName;
  sessionStorage.setItem('snakePlayerName', playerName);
}
function checkName() {
  let stored = sessionStorage.getItem('snakePlayerName');
  if (stored) {
    setPlayerName(stored);
    hideNameModal();
    resetGame();
  } else {
    showNameModal();
  }
}
startGameBtn.addEventListener('click', () => {
  if (playerNameInput.value.trim()) {
    setPlayerName(playerNameInput.value);
    hideNameModal();
    resetGame();
  } else {
    playerNameInput.focus();
  }
});
playerNameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    startGameBtn.click();
  }
});

function resizeCanvas() {
  const container = document.getElementById('game-container');
  const size = Math.min(container.offsetWidth, container.offsetHeight);
  canvas.width = size;
  canvas.height = size;
  gridSize = Math.floor(size / tileCount);
  draw();
}
window.addEventListener('resize', resizeCanvas);

function resetGame() {
  tileCount = 20;
  snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  moveQueue = [];
  food = randomFood();
  score = 0;
  foodCount = 0;
  speed = 150;
  gameOver = false;
  soundOn = true;
  scoreEl.textContent = score;
  foodCountEl.textContent = foodCount;
  restartBtn.classList.add('hidden');
  restartBtn.classList.remove('pop');
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(gameLoop, speed);
  resizeCanvas();
}

function randomFood() {
  let newFood;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
    if (!snake.some(seg => seg.x === newFood.x && seg.y === newFood.y)) break;
  }
  return newFood;
}

function gameLoop() {
  if (moveQueue.length) {
    direction = moveQueue.shift();
  }
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  if (
    head.x < 0 || head.x >= tileCount ||
    head.y < 0 || head.y >= tileCount ||
    snake.some(seg => seg.x === head.x && seg.y === head.y)
  ) {
    gameOver = true;
    clearInterval(intervalId);
    restartBtn.classList.remove('hidden');
    restartBtn.classList.add('pop');
    restartBtn.focus();
    return;
  }
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score++;
    foodCount++;
    scoreEl.textContent = score;
    foodCountEl.textContent = foodCount;
    food = randomFood();
    if (soundOn) {
      eatSound.currentTime = 0;
      eatSound.play();
    }
    speed = Math.max(60, speed - 7);
    clearInterval(intervalId);
    intervalId = setInterval(gameLoop, speed);
  } else {
    snake.pop();
  }
  draw();
}

function draw() {
  for (let y = 0; y < tileCount; y++) {
    for (let x = 0; x < tileCount; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#a3e635' : '#b6f36b';
      ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
    }
  }
  if (appleImg.complete) {
    ctx.drawImage(appleImg, food.x * gridSize, food.y * gridSize, gridSize, gridSize);
  } else {
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2.2, 0, 2 * Math.PI);
    ctx.fill();
  }
  snake.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? '#3498db' : '#2980b9';
    ctx.beginPath();
    ctx.roundRect(seg.x * gridSize, seg.y * gridSize, gridSize, gridSize, gridSize/3);
    ctx.fill();
    if (i === 0) {
      ctx.fillStyle = '#fff';
      let eyeOffsetX = direction.x === 0 ? gridSize/4 : direction.x > 0 ? gridSize/2.5 : -gridSize/8;
      let eyeOffsetY = direction.y === 0 ? gridSize/4 : direction.y > 0 ? gridSize/2.5 : -gridSize/8;
      ctx.beginPath();
      ctx.arc(seg.x * gridSize + gridSize/2 - eyeOffsetX, seg.y * gridSize + gridSize/2 - eyeOffsetY, gridSize/7, 0, 2 * Math.PI);
      ctx.arc(seg.x * gridSize + gridSize/2 + eyeOffsetX, seg.y * gridSize + gridSize/2 + eyeOffsetY, gridSize/7, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(seg.x * gridSize + gridSize/2 - eyeOffsetX, seg.y * gridSize + gridSize/2 - eyeOffsetY, gridSize/16, 0, 2 * Math.PI);
      ctx.arc(seg.x * gridSize + gridSize/2 + eyeOffsetX, seg.y * gridSize + gridSize/2 + eyeOffsetY, gridSize/16, 0, 2 * Math.PI);
      ctx.fill();
    }
  });
}

function setDirection(dx, dy) {
  if (snake.length > 1) {
    const next = { x: snake[0].x + dx, y: snake[0].y + dy };
    if (next.x === snake[1].x && next.y === snake[1].y) return;
  }
  moveQueue.push({ x: dx, y: dy });
}
document.addEventListener('keydown', e => {
  if (nameModal.style.display !== 'none') return;
  if (gameOver && (e.key === 'Enter' || e.key === ' ')) {
    resetGame();
    return;
  }
  switch (e.key) {
    case 'ArrowUp': setDirection(0, -1); break;
    case 'ArrowDown': setDirection(0, 1); break;
    case 'ArrowLeft': setDirection(-1, 0); break;
    case 'ArrowRight': setDirection(1, 0); break;
  }
});
restartBtn.addEventListener('click', resetGame);
restartBtn.addEventListener('animationend', () => restartBtn.classList.remove('pop'));
function showTouchControls() {
  if (window.innerWidth < 600) {
    touchControls.classList.remove('hidden');
  } else {
    touchControls.classList.add('hidden');
  }
}
window.addEventListener('resize', showTouchControls);
showTouchControls();
document.getElementById('up').addEventListener('touchstart', e => { e.preventDefault(); setDirection(0, -1); });
document.getElementById('down').addEventListener('touchstart', e => { e.preventDefault(); setDirection(0, 1); });
document.getElementById('left').addEventListener('touchstart', e => { e.preventDefault(); setDirection(-1, 0); });
document.getElementById('right').addEventListener('touchstart', e => { e.preventDefault(); setDirection(1, 0); });
['up','down','left','right'].forEach(id => {
  document.getElementById(id).addEventListener('touchmove', e => e.preventDefault());
});
soundToggle.addEventListener('click', () => {
  soundOn = !soundOn;
  soundToggle.innerHTML = soundOn
    ? '<img src="sound-on.svg" alt="Sound" class="icon-img">'
    : '<img src="sound-off.svg" alt="Muted" class="icon-img">';
  soundToggle.classList.add('sound-feedback');
  // Play sound.wav on toggle
  const toggleSound = document.getElementById('toggleSound');
  if (toggleSound) {
    toggleSound.currentTime = 0;
    toggleSound.play();
  }
  setTimeout(() => soundToggle.classList.remove('sound-feedback'), 180);
});
soundToggle.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    soundToggle.click();
  }
});
soundToggle.addEventListener('focus', () => soundToggle.classList.add('focus')); 
soundToggle.addEventListener('blur', () => soundToggle.classList.remove('focus'));

// On load, check for name and show modal if needed
window.addEventListener('DOMContentLoaded', checkName);