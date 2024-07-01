let score = 0;
let clothesPosition = { left: 275, top: 20 };
let basketPosition = { left: 0, top: 230 };
let basketSpeed = 2; // Initial speed
let basketDirection = 1; // 1 for right, -1 for left
let mediaRecorder;
let audioChunks = [];
let isPaused = false;
let gameInterval;
let timerInterval;
let timeLimit;
let halfwayWarningShown = false;
let selectedChore = '';
const announcerAudio = document.getElementById('announcer');

document.addEventListener('DOMContentLoaded', (event) => {
const clothes = document.getElementById('clothes');
const basket = document.getElementById('basket');
const scoreDisplay = document.getElementById('score');
const startRecordingButton = document.getElementById('start-recording');
const stopRecordingButton = document.getElementById('stop-recording');
const pauseGameButton = document.getElementById('pause-game');
const startGameButton = document.getElementById('start-game');
const timeLimitInput = document.getElementById('time-limit');
const choresModal = document.getElementById('chores-modal');
const reminderModal = document.getElementById('reminder-modal');
const reminderText = document.getElementById('reminder-text');
const closeReminderButton = document.getElementById('close-reminder');
const choreChoices = document.querySelectorAll('.chore-choice');
const selectChoreButton = document.getElementById('select-chore');
const customChoreInput = document.getElementById('custom-chore');
const customChoreSetupInput = document.getElementById('custom-chore-setup');
const choresSetupDiv = document.getElementById('chores-setup');
const gameSetupDiv = document.getElementById('game-setup');
const saveChoresButton = document.getElementById('save-chores');

function updateClothesPosition() {
    clothes.style.left = `${clothesPosition.left}px`;
    clothes.style.top = `${clothesPosition.top}px`;
}

function moveClothes(direction) {
    if (isPaused) return;
    if (direction === 'left' && clothesPosition.left > 0) {
        clothesPosition.left -= 15; // Increased speed
    }
    if (direction === 'right' && clothesPosition.left < document.querySelector('.game-container').offsetWidth - clothes.offsetWidth) { // Adjusted boundary
        clothesPosition.left += 15; // Increased speed
    }
    updateClothesPosition();
}

function shootClothes() {
    if (isPaused) return;
    const interval = setInterval(() => {
        if (isPaused) {
            clearInterval(interval);
            return;
        }
        clothesPosition.top += 5;
        updateClothesPosition();

        if (clothesPosition.top >= basketPosition.top && 
            clothesPosition.left >= basketPosition.left && 
            clothesPosition.left <= basketPosition.left + basket.offsetWidth) {
            clearInterval(interval);
            score++;
            scoreDisplay.textContent = `Score: ${score}`;
            playAnnouncer();
            resetClothes();
        } else if (clothesPosition.top >= document.querySelector('.game-container').offsetHeight - clothes.offsetHeight) {
            clearInterval(interval);
            resetClothes();
        }
    }, 30);
}

function resetClothes() {
    clothesPosition.top = 20;
    clothesPosition.left = Math.min(Math.max(clothesPosition.left, 0), document.querySelector('.game-container').offsetWidth - clothes.offsetWidth);
    updateClothesPosition();
}

function moveBasket() {
    if (isPaused) return;
    basketPosition.left += basketSpeed * basketDirection;
    if (basketPosition.left <= 0 || basketPosition.left >= document.querySelector('.game-container').offsetWidth - basket.offsetWidth) { // Adjusted boundary
        basketDirection *= -1;
    }
    basket.style.left = `${basketPosition.left}px`;
}

function setDifficulty(level) {
    basketSpeed = level;
}

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();

            mediaRecorder.ondataavailable = function(e) {
                audioChunks.push(e.data);
            };

            mediaRecorder.onstop = function() {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                announcerAudio.src = audioUrl;
                audioChunks = [];
            };

            startRecordingButton.disabled = true;
            stopRecordingButton.disabled = false;
        })
        .catch(error => {
            console.error('Error accessing microphone:', error);
            alert('Could not access your microphone. Please ensure it is connected and permissions are granted.');
        });
}

function stopRecording() {
    mediaRecorder.stop();
    startRecordingButton.disabled = false;
    stopRecordingButton.disabled = true;
}

function playAnnouncer() {
    if (announcerAudio.src) {
        announcerAudio.play();
    }
}

function togglePause() {
    isPaused = !isPaused;
    pauseGameButton.textContent = isPaused ? 'Resume Game' : 'Pause Game';
}

function showChoresModal() {
    choresModal.style.display = 'flex';
}

function hideChoresModal() {
    choresModal.style.display = 'none';
}

function handleChoreChoice(e) {
    const selectedChore = e.target.textContent === 'Write your own chore' ? customChoreInput.value : e.target.textContent;
    alert(`You need to: ${selectedChore}`);
    hideChoresModal();
    resetGame();
}

function showReminder() {
    reminderText.textContent = `Reminder to complete the chore: ${selectedChore}`;
    reminderModal.style.display = 'flex';
}

function hideReminder() {
    reminderModal.style.display = 'none';
    resetGame();
}

function startTimer() {
    let timeRemaining = timeLimit * 60; // Convert minutes to seconds
    halfwayWarningShown = false;
    timerInterval = setInterval(() => {
        if (isPaused) return;

        timeRemaining--;

        if (timeRemaining <= timeLimit * 30 && !halfwayWarningShown) { // Halfway warning
            halfwayWarningShown = true;
            alert("Halfway there! Keep going!");
        }

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            isPaused = true;
            showChoresModal();
            showReminder();
        }
    }, 1000);
}

function startGame() {
    timeLimit = parseInt(timeLimitInput.value);
    if (isNaN(timeLimit) || timeLimit <= 0) {
        alert('Please set a valid time limit.');
        return;
    }

    isPaused = false;
    pauseGameButton.textContent = 'Pause Game';
    clearInterval(timerInterval);
    startTimer();
    gameInterval = setInterval(moveBasket, 30);
}

function resetGame() {
    clearInterval(timerInterval);
    clearInterval(gameInterval);
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    clothesPosition = { left: 275, top: 20 };
    basketPosition = { left: 0, top: 230 }; // Reset to the left edge
    updateClothesPosition();
    updateBasketPosition();
}

function updateBasketPosition() {
    basket.style.left = `${basketPosition.left}px`;
}

function saveChores() {
    const selectedCheckbox = document.querySelector('input[name="chores"]:checked');
    if (!selectedCheckbox) {
        alert('Please select a chore.');
        return;
    }

    if (selectedCheckbox.value === 'Write your own chore') {
        const customChore = customChoreSetupInput.value.trim();
        if (!customChore) {
            alert('Please enter your chore.');
            return;
        }
        selectedChore = customChore;
    } else {
        selectedChore = selectedCheckbox.value;
    }

    choresSetupDiv.style.display = 'none';
    gameSetupDiv.style.display = 'block';
}

document.querySelectorAll('input[name="chores"]').forEach((checkbox) => {
    checkbox.addEventListener('change', (e) => {
        if (e.target.value === 'Write your own chore' && e.target.checked) {
            customChoreSetupInput.style.display = 'block';
        } else {
            customChoreSetupInput.style.display = 'none';
        }
    });
});

startRecordingButton.addEventListener('click', startRecording);
stopRecordingButton.addEventListener('click', stopRecording);
pauseGameButton.addEventListener('click', togglePause);
startGameButton.addEventListener('click', startGame);
saveChoresButton.addEventListener('click', saveChores);
closeReminderButton.addEventListener('click', hideReminder);

choreChoices.forEach(choice => choice.addEventListener('click', handleChoreChoice));
selectChoreButton.addEventListener('click', handleChoreChoice);

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        moveClothes('left');
    }
    if (e.key === 'ArrowRight') {
        moveClothes('right');
    }
    if (e.key === ' ') {
        shootClothes();
    }
    if (e.key >= '1' && e.key <= '9') {
        setDifficulty(parseInt(e.key));
    }
    if (e.key === '0') {
        setDifficulty(10);
    }
    if (e.key === 'p' || e.key === 'P') {
        togglePause();
    }
});

updateClothesPosition();
updateBasketPosition();
});