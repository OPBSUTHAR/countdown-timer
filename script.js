const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const restartBtn = document.getElementById('restartBtn');
const alarm = document.getElementById('alarm');
const alertControls = document.getElementById('alertControls');
const countdownContainer = document.getElementById('countdownContainer');
const messageBox = document.getElementById('message');

let activeIntervals = [];
let snoozeTimeout = null;
let lastTimerConfig = null;
let isAlarmLooping = false;

// Unlock audio on first click
startBtn.addEventListener('click', () => {
  alarm.play().then(() => {
    alarm.pause();
    alarm.currentTime = 0;
  }).catch(() => {
    console.warn("Audio play blocked until user interaction.");
  });
}, { once: true });

function createTimer(duration, label) {
  const timerBox = document.createElement('div');
  timerBox.className = 'timer-box';
  countdownContainer.appendChild(timerBox);

  const interval = setInterval(() => {
    if (duration <= 0) {
      clearInterval(interval);
      timerBox.textContent = `${label} Timer: EXPIRED`;
      triggerAlarm();
      return;
    }

    const hrs = Math.floor(duration / 3600);
    const mins = Math.floor((duration % 3600) / 60);
    const secs = duration % 60;

    timerBox.textContent = `${label} Timer: ${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    duration--;
  }, 1000);

  activeIntervals.push(interval);
}

function triggerAlarm() {
  stopAlert();

  isAlarmLooping = true;
  alarm.play();
  messageBox.textContent = "⏰ Timer expired! Playing alarm...";
  alertControls.style.display = 'block';

  // Restart audio when it ends
  alarm.onended = () => {
    if (isAlarmLooping) {
      alarm.currentTime = 0;
      alarm.play();
    }
  };
}

function stopAlert() {
  isAlarmLooping = false;
  alarm.pause();
  alarm.currentTime = 0;
  alarm.onended = null;
  clearTimeout(snoozeTimeout);
  alertControls.style.display = 'none';
}

function snoozeAlert() {
  stopAlert();
  messageBox.textContent = "😴 Snoozed! Will play again in 15 seconds.";
  snoozeTimeout = setTimeout(() => {
    messageBox.textContent = "🔔 Snooze ended. Playing alarm again!";
    triggerAlarm();
  }, 15000);
}

function stopTimers() {
  activeIntervals.forEach(interval => clearInterval(interval));
  activeIntervals = [];
  stopAlert();
}

function resetTimers() {
  stopTimers();
  countdownContainer.innerHTML = '';
  document.getElementById('inputHours').value = '';
  document.getElementById('inputMinutes').value = '';
  document.getElementById('inputSeconds').value = '';
  document.getElementById('inputDate').value = '';
  messageBox.textContent = '';
}

function startTimers(config) {
  const { hours, minutes, seconds, date } = config;

  messageBox.textContent = '';
  countdownContainer.innerHTML = '';
  alertControls.style.display = 'none';

  if (hours > 0) createTimer(hours * 3600, 'Hours');
  if (minutes > 0) createTimer(minutes * 60, 'Minutes');
  if (seconds > 0) createTimer(seconds, 'Seconds');

  if (date) {
    const target = new Date(date);
    const now = new Date();
    const diff = Math.floor((target - now) / 1000);
    if (diff > 0) {
      createTimer(diff, 'Date');
    } else {
      messageBox.textContent = '⚠️ Please enter a valid future date.';
    }
  } else if (hours === 0 && minutes === 0 && seconds === 0) {
    messageBox.textContent = '⚠️ Please enter a time.';
  }
}

startBtn.addEventListener('click', () => {
  const hours = parseInt(document.getElementById('inputHours').value) || 0;
  const minutes = parseInt(document.getElementById('inputMinutes').value) || 0;
  const seconds = parseInt(document.getElementById('inputSeconds').value) || 0;
  const date = document.getElementById('inputDate').value;

  lastTimerConfig = { hours, minutes, seconds, date };
  stopTimers();
  startTimers(lastTimerConfig);
});

stopBtn.addEventListener('click', stopTimers);
resetBtn.addEventListener('click', resetTimers);
restartBtn.addEventListener('click', () => {
  if (lastTimerConfig) {
    stopTimers();
    startTimers(lastTimerConfig);
  } else {
    messageBox.textContent = "⚠️ No previous timer found.";
  }
});
