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

const winnerBanner = document.getElementById('winner-banner');
const winnerText = document.getElementById('winner-text');
const winnerCard = document.querySelector('.winner-card');

const finishLine = document.getElementById('finish-line');

const basePos = window.innerWidth * 0.28;

let pos1 = -480;
let pos2 = -480;

let totalDistance = 0.0;
let speed1 = 0;
let speed2 = 0;

let gameRunning = false;
let isStartingPhase = true;
let isFinishingPhase = false;
let animationFrameId = null;
let targetTimeoutId = null;

let bgBackX = 0;
let bgFrontX = 0;
let bgGrassX = 0;

let audioCtx = null;
let chosenWinner = null; 

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playStartEngineSound() {
  if (!audioCtx) return;
 
  function playHornBeep(delay, frequency) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'square'; // Som marcante e cartonesco
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime + delay);

    gain.gain.setValueAtTime(0.12, audioCtx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + 0.15);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(audioCtx.currentTime + delay);
    osc.stop(audioCtx.currentTime + delay + 0.15);
  }

  // Toque duplo rápido: BEEP! BEEP!
  playHornBeep(0, 420);
  playHornBeep(0.18, 420);
}

function playVictorySound() {
  if (!audioCtx) return;
  const notes = [261.63, 329.63, 392.00, 523.25];
  notes.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.12);
    
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime + idx * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.12 + 0.4);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(audioCtx.currentTime + idx * 0.12);
    osc.stop(audioCtx.currentTime + idx * 0.12 + 0.4);
  });
}

function updateTargets() {
  if (!gameRunning || isFinishingPhase) return;

  if (!isStartingPhase) {
    speed1 = Math.floor(75 + Math.random() * 50);
    speed2 = Math.floor(75 + Math.random() * 50);
  } else {
    speed1 = 85;
    speed2 = 85;
  }

  speed1El.textContent = speed1;
  speed2El.textContent = speed2;

  speedBar1El.style.width = `${Math.min((speed1 / 130) * 100, 100)}%`;
  speedBar2El.style.width = `${Math.min((speed2 / 130) * 100, 100)}%`;

  targetTimeoutId = setTimeout(updateTargets, 1400 + Math.random() * 1200);
}

function gameLoop() {
  if (!gameRunning) return;

  const layerBack = document.querySelector('.layer-back');
  const layerFront = document.querySelector('.layer-front');
  const grassLayer = document.querySelector('.grass-vector-layer');

  const avgSpeed = (speed1 + speed2) / 2;

  bgBackX -= (avgSpeed / 90) * 1.5;
  bgFrontX -= (avgSpeed / 90) * 3.5;
  bgGrassX -= (avgSpeed / 90) * 4.0;

  if (layerBack) layerBack.style.backgroundPositionX = `${bgBackX}px`;
  if (layerFront) layerFront.style.backgroundPositionX = `${bgFrontX}px`;
  if (grassLayer) grassLayer.style.backgroundPositionX = `${bgGrassX}px`;

  if (isStartingPhase) {
    pos1 += (basePos - pos1) * 0.04;
    pos2 += (basePos - pos2) * 0.04;

    if (Math.abs(basePos - pos1) < 8) {
      isStartingPhase = false;
    }
  } else if (!isFinishingPhase) {
    const targetPos1 = basePos + (speed1 - avgSpeed) * 8;
    const targetPos2 = basePos + (speed2 - avgSpeed) * 8;

    pos1 += (targetPos1 - pos1) * 0.05;
    pos2 += (targetPos2 - pos2) * 0.05;
  } else {
    if (chosenWinner === "VERDE") {
      pos1 += 6;
      pos2 += 3;
    } else {
      pos1 += 3;
      pos2 += 6;
    }
  }

  bus1.style.left = `${pos1}px`;
  bus2.style.left = `${pos2}px`;

  if (!isFinishingPhase) {
    totalDistance += (avgSpeed / 3600) * 0.45;
    if (totalDistance >= 100.0) {
      totalDistance = 100.0;
      triggerFinishSequence();
    }
    totalDistEl.textContent = totalDistance.toFixed(2);
  }

  animationFrameId = requestAnimationFrame(gameLoop);
}

function triggerFinishSequence() {
  isFinishingPhase = true;
  
 
  chosenWinner = Math.random() < 0.5 ? "VERDE" : "AMARELO";

  finishLine.classList.add('active');

  setTimeout(() => {
    const colorHex = chosenWinner === "VERDE" ? "#10b981" : "#f59e0b";

    playVictorySound();

    winnerText.textContent = `O ÔNIBUS ${chosenWinner} VENCEU A CORRIDA!`;
    winnerText.style.color = colorHex;
    winnerCard.style.borderColor = colorHex;
    winnerCard.style.boxShadow = `0 0 60px ${colorHex}aa`;

    const trophyIcon = document.querySelector('.winner-trophy-icon');
    if (trophyIcon) trophyIcon.style.color = colorHex;

    winnerBanner.classList.remove('hidden');

    setTimeout(() => {
      resetGame();
    }, 4500);
  }, 1800);
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
      playStartEngineSound();
    } else {
      clearInterval(interval);
      countdownOverlay.classList.add('hidden');
      onComplete();
    }
  }, 1000);
}

function resetGame() {
  gameRunning = false;
  isFinishingPhase = false;
  chosenWinner = null;
  
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

  finishLine.classList.remove('active');
  winnerBanner.classList.add('hidden');

  totalDistance = 0.0;
  totalDistEl.textContent = "0.00";

  speed1 = 0;
  speed2 = 0;
  speed1El.textContent = "0";
  speed2El.textContent = "0";
  speedBar1El.style.width = "0%";
  speedBar2El.style.width = "0%";

  isStartingPhase = true;

  countdownOverlay.classList.add('hidden');

  startScreen.style.opacity = '1';
  startScreen.style.visibility = 'visible';
}

startBtn.addEventListener('click', () => {
  initAudio();
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