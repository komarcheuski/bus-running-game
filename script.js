const bus1 = document.getElementById('bus-1');
const bus2 = document.getElementById('bus-2');

const totalDistEl = document.getElementById('total-dist');
const speed1El = document.getElementById('speed-1');
const speed2El = document.getElementById('speed-2');
const speedBar1El = document.getElementById('speed-bar-1');
const speedBar2El = document.getElementById('speed-bar-2');

const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

const countdownOverlay = document.getElementById('countdown-overlay');
const countdownNumber = document.getElementById('countdown-number');

const basePos = window.innerWidth * 0.3;

let pos1 = -480;
let pos2 = -480;

let targetOffset1 = 0;
let targetOffset2 = 0;

let totalDistance = 0.0;
let speed1 = 0;
let speed2 = 0;

let gameRunning = false;
let isStartingPhase = true;
let animationFrameId = null;
let targetTimeoutId = null;

let bgBackX = 0;
let bgFrontX = 0;
let bgGrassX = 0;

function updateTargets() {
  if (!gameRunning) return;

  if (!isStartingPhase) {
    targetOffset1 = (Math.random() * 180) - 80;
    targetOffset2 = (Math.random() * 180) - 80;

    speed1 = Math.floor(70 + Math.random() * 35);
    speed2 = Math.floor(70 + Math.random() * 35);
  } else {
    speed1 = 75;
    speed2 = 75;
  }

  speed1El.textContent = speed1;
  speed2El.textContent = speed2;

  speedBar1El.style.width = `${Math.min((speed1 / 110) * 100, 100)}%`;
  speedBar2El.style.width = `${Math.min((speed2 / 110) * 100, 100)}%`;

  targetTimeoutId = setTimeout(updateTargets, 2000 + Math.random() * 2000);
}

function gameLoop() {
  if (!gameRunning) return;

  const layerBack = document.querySelector('.layer-back');
  const layerFront = document.querySelector('.layer-front');
  const grassLayer = document.querySelector('.grass-vector-layer');

  bgBackX -= 1.2;
  bgFrontX -= 2.8;
  bgGrassX -= 5.5;

  if (layerBack) layerBack.style.backgroundPositionX = `${bgBackX}px`;
  if (layerFront) layerFront.style.backgroundPositionX = `${bgFrontX}px`;
  if (grassLayer) grassLayer.style.backgroundPositionX = `${bgGrassX}px`;

  if (isStartingPhase) {
    pos1 += (basePos - pos1) * 0.035;
    pos2 += (basePos - pos2) * 0.035;

    if (Math.abs(basePos - pos1) < 5) {
      isStartingPhase = false;
    }
  } else {
    pos1 += ((basePos + targetOffset1) - pos1) * 0.025;
    pos2 += ((basePos + targetOffset2) - pos2) * 0.025;
  }

  bus1.style.left = `${pos1}px`;
  bus2.style.left = `${pos2}px`;

  const avgSpeed = (speed1 + speed2) / 2;
  totalDistance += (avgSpeed / 3600) * 0.02;
  totalDistEl.textContent = totalDistance.toFixed(2);

  animationFrameId = requestAnimationFrame(gameLoop);
}

function startCountdown(onComplete) {
  let count = 3;
  countdownNumber.textContent = count;
  countdownOverlay.classList.remove('hidden');

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownNumber.textContent = count;
    } else if (count === 0) {
      countdownNumber.textContent = "GO!";
    } else {
      clearInterval(interval);
      countdownOverlay.classList.add('hidden');
      onComplete();
    }
  }, 1000);
}

function resetGame() {
  gameRunning = false;
  
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  if (targetTimeoutId) clearTimeout(targetTimeoutId);

  pos1 = -480;
  pos2 = -480;
  bus1.style.left = `${pos1}px`;
  bus2.style.left = `${pos2}px`;

  bgBackX = 0;
  bgFrontX = 0;
  bgGrassX = 0;

  const layerBack = document.querySelector('.layer-back');
  const layerFront = document.querySelector('.layer-front');
  const grassLayer = document.querySelector('.grass-vector-layer');

  if (layerBack) layerBack.style.backgroundPositionX = '0px';
  if (layerFront) layerFront.style.backgroundPositionX = '0px';
  if (grassLayer) grassLayer.style.backgroundPositionX = '0px';

  totalDistance = 0.0;
  totalDistEl.textContent = "0.00";

  speed1 = 0;
  speed2 = 0;
  speed1El.textContent = "0";
  speed2El.textContent = "0";
  speedBar1El.style.width = "0%";
  speedBar2El.style.width = "0%";

  isStartingPhase = true;
  targetOffset1 = 0;
  targetOffset2 = 0;

  countdownOverlay.classList.add('hidden');

  startScreen.style.opacity = '1';
  startScreen.style.visibility = 'visible';
}

startBtn.addEventListener('click', () => {
  startScreen.style.opacity = '0';
  startScreen.style.visibility = 'hidden';


  bgBackX = 0;
  bgFrontX = 0;
  bgGrassX = 0;

  const layerBack = document.querySelector('.layer-back');
  const layerFront = document.querySelector('.layer-front');
  const grassLayer = document.querySelector('.grass-vector-layer');

  if (layerBack) layerBack.style.backgroundPositionX = '0px';
  if (layerFront) layerFront.style.backgroundPositionX = '0px';
  if (grassLayer) grassLayer.style.backgroundPositionX = '0px';

  setTimeout(() => {
    startCountdown(() => {
      gameRunning = true;
      updateTargets();
      animationFrameId = requestAnimationFrame(gameLoop);
    });
  }, 300);
});

restartBtn.addEventListener('click', resetGame);