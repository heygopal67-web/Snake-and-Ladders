const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');
const touchControls = document.getElementById('touch-controls');
const eatSound = document.getElementById('eatSound');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake, direction, food, score, gameOver, speed, moveQueue, intervalId;

function resetGame() {
  snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  moveQueue = [];
  food = randomFood();
  score = 0;
  speed = 150;
  gameOver = false;
  scoreEl.textContent = 'Score: ' + score;
  restartBtn.classList.add('hidden');
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(gameLoop, speed);
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
  // Move
  if (moveQueue.length) {
    direction = moveQueue.shift();
  }
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // Wall or self collision
  if (
    head.x < 0 || head.x >= tileCount ||
    head.y < 0 || head.y >= tileCount ||
    snake.some(seg => seg.x === head.x && seg.y === head.y)
  ) {
    gameOver = true;
    clearInterval(intervalId);
    restartBtn.classList.remove('hidden');
    return;
  }

  snake.unshift(head);

  // Eat food
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = 'Score: ' + score;
    food = randomFood();
    eatSound.currentTime = 0;
    eatSound.play();
    // Speed up
    speed = Math.max(60, speed - 7);
    clearInterval(intervalId);
    intervalId = setInterval(gameLoop, speed);
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw food
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

  // Draw snake
  ctx.fillStyle = '#2ecc40';
  snake.forEach((seg, i) => {
    ctx.fillRect(seg.x * gridSize, seg.y * gridSize, gridSize, gridSize);
  });
}

function setDirection(dx, dy) {
  // Prevent reverse
  if (snake.length > 1) {
    const next = { x: snake[0].x + dx, y: snake[0].y + dy };
    if (next.x === snake[1].x && next.y === snake[1].y) return;
  }
  moveQueue.push({ x: dx, y: dy });
}

document.addEventListener('keydown', e => {
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

// Touch controls for mobile
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

// Prevent scrolling on touch controls
['up','down','left','right'].forEach(id => {
  document.getElementById(id).addEventListener('touchmove', e => e.preventDefault());
});

resetGame();
