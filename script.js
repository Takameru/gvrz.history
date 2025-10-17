document.querySelectorAll('.nav-link, .btn').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        window.scrollTo({
            top: targetElement.offsetTop - 70,
            behavior: 'smooth'
        });
    });
});

window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(47, 79, 79, 1)';
    } else {
        navbar.style.background = 'rgba(47, 79, 79, 0.95)';
    }
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.history-section, .timeline-item, .train-builder, .products-gallery, .facts-section').forEach(item => {
    item.style.opacity = 0;
    item.style.transform = 'translateY(20px)';
    item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(item);
});

let selectedWagonType = null;
let wagonCount = 5;
const wagonOptions = document.querySelectorAll('.wagon-option');
const addWagonBtn = document.getElementById('add-wagon-btn');
const removeWagonBtn = document.getElementById('remove-wagon-btn');
const wagonCountDisplay = document.getElementById('wagon-count');
const trainComposition = document.getElementById('train-composition');
const buildTrainBtn = document.getElementById('build-train-btn');
const resetTrainBtn = document.getElementById('reset-train-btn');
const trainResult = document.getElementById('train-result');
const finalTrain = document.getElementById('final-train');
const finalTrainName = document.getElementById('final-train-name');
const trainNameInput = document.getElementById('train-name');

const toggleSoundBtn = document.getElementById('toggle-sound');
const trainWhistleBtn = document.getElementById('train-whistle');
const clickSound = document.getElementById('click-sound');
const hoverSound = document.getElementById('hover-sound');
const trainSound = document.getElementById('train-sound');
const whistleSound = document.getElementById('whistle-sound');
const successSound = document.getElementById('success-sound');
const gameMusic = document.getElementById('game-music');

let soundEnabled = true;
let isMusicStarted = false;

toggleSoundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    toggleSoundBtn.textContent = soundEnabled ? '🔊' : '🔇';
    
    if (!soundEnabled) {
        trainSound.pause();
        gameMusic.pause();
    } else {
        if (document.querySelector('#train-builder').getBoundingClientRect().top < window.innerHeight) {
            trainSound.play().catch(e => console.log("Автовоспроизведение заблокировано"));
        }
        if (gameState.isPlaying && isMusicStarted) {
            gameMusic.play().catch(e => console.log("Автовоспроизведение музыки заблокировано"));
        }
    }
});

trainWhistleBtn.addEventListener('click', () => {
    if (soundEnabled) {
        whistleSound.currentTime = 0;
        whistleSound.play().catch(e => console.log("Ошибка воспроизведения звука"));
    }
});

function addHoverSound(element) {
    element.addEventListener('mouseenter', () => {
        if (soundEnabled) {
            hoverSound.currentTime = 0;
            hoverSound.play().catch(e => console.log("Ошибка воспроизведения звука"));
        }
    });
}

function playClickSound() {
    if (soundEnabled) {
        clickSound.currentTime = 0;
        clickSound.play().catch(e => console.log("Ошибка воспроизведения звука"));
    }
}

function saveTrainState() {
    const state = {
        wagonCount: wagonCount,
        locomotive: null,
        wagons: []
    };

    const locomotiveSlot = document.querySelector('.locomotive-slot');
    if (locomotiveSlot && locomotiveSlot.classList.contains('filled')) {
        state.locomotive = {
            type: locomotiveSlot.querySelector('.slot-type').textContent,
            image: locomotiveSlot.style.backgroundImage
        };
    }

    const wagonSlots = document.querySelectorAll('.wagon-slot');
    wagonSlots.forEach(slot => {
        if (slot.classList.contains('filled')) {
            state.wagons.push({
                type: slot.querySelector('.slot-type').textContent,
                image: slot.style.backgroundImage
            });
        } else {
            state.wagons.push(null);
        }
    });

    sessionStorage.setItem('trainState', JSON.stringify(state));
}

function loadTrainState() {
    const savedState = sessionStorage.getItem('trainState');
    if (savedState) {
        return JSON.parse(savedState);
    }
    return null;
}

function hasEnoughWagons() {
    const locomotiveSlot = document.querySelector('.locomotive-slot');
    const wagonSlots = document.querySelectorAll('.wagon-slot');
    
    if (!locomotiveSlot.classList.contains('filled')) {
        return false;
    }
    
    let filledWagonsCount = 0;
    wagonSlots.forEach(slot => {
        if (slot.classList.contains('filled')) {
            filledWagonsCount++;
        }
    });
    
    return filledWagonsCount >= 3;
}

function initializeTrainSlots() {
    trainComposition.innerHTML = '';
    
    const savedState = loadTrainState();
    
    const locomotiveSlot = document.createElement('div');
    locomotiveSlot.className = 'locomotive-slot';
    locomotiveSlot.dataset.index = 'locomotive';
    locomotiveSlot.dataset.type = 'locomotive';
    
    const locomotiveNumber = document.createElement('div');
    locomotiveNumber.className = 'slot-number';
    locomotiveNumber.textContent = 'Л';
    
    const locomotiveType = document.createElement('div');
    locomotiveType.className = 'slot-type';
    locomotiveType.textContent = 'Локомотив';
    
    locomotiveSlot.appendChild(locomotiveNumber);
    locomotiveSlot.appendChild(locomotiveType);
    trainComposition.appendChild(locomotiveSlot);
    
    if (savedState && savedState.locomotive) {
        locomotiveSlot.style.backgroundImage = savedState.locomotive.image;
        locomotiveSlot.style.backgroundSize = 'contain';
        locomotiveSlot.style.backgroundRepeat = 'no-repeat';
        locomotiveSlot.style.backgroundPosition = 'center';
        locomotiveSlot.classList.add('filled');
        locomotiveSlot.querySelector('.slot-type').textContent = savedState.locomotive.type;
    }
    
    locomotiveSlot.addEventListener('click', () => {
        playClickSound();
        if (selectedWagonType && selectedWagonType.dataset.type === 'Локомотив') {
            locomotiveSlot.style.backgroundImage = `url(${selectedWagonType.dataset.image})`;
            locomotiveSlot.style.backgroundSize = 'contain';
            locomotiveSlot.style.backgroundRepeat = 'no-repeat';
            locomotiveSlot.style.backgroundPosition = 'center';
            locomotiveSlot.classList.add('filled');
            locomotiveSlot.querySelector('.slot-type').textContent = selectedWagonType.dataset.type;
            checkBuildButtonState();
            saveTrainState();
        } else if (selectedWagonType) {
            alert('Этот слот предназначен только для локомотива!');
        } else {
            alert('Сначала выберите локомотив из палитры выше!');
        }
    });

    addHoverSound(locomotiveSlot);
    
    for (let i = 0; i < wagonCount; i++) {
        const slot = document.createElement('div');
        slot.className = 'wagon-slot';
        slot.dataset.index = i;
        slot.dataset.type = 'wagon';
        
        const number = document.createElement('div');
        number.className = 'slot-number';
        number.textContent = i + 1;
        
        const type = document.createElement('div');
        type.className = 'slot-type';
        type.textContent = 'Вагон';
        
        slot.appendChild(number);
        slot.appendChild(type);
        trainComposition.appendChild(slot);
        
        if (savedState && savedState.wagons && savedState.wagons[i]) {
            slot.style.backgroundImage = savedState.wagons[i].image;
            slot.style.backgroundSize = 'contain';
            slot.style.backgroundRepeat = 'no-repeat';
            slot.style.backgroundPosition = 'center';
            slot.classList.add('filled');
            slot.querySelector('.slot-type').textContent = savedState.wagons[i].type;
        }
        
        slot.addEventListener('click', () => {
            playClickSound();
            if (selectedWagonType && selectedWagonType.dataset.type !== 'Локомотив') {
                slot.style.backgroundImage = `url(${selectedWagonType.dataset.image})`;
                slot.style.backgroundSize = 'contain';
                slot.style.backgroundRepeat = 'no-repeat';
                slot.style.backgroundPosition = 'center';
                slot.classList.add('filled');
                slot.querySelector('.slot-type').textContent = selectedWagonType.dataset.type;
                checkBuildButtonState();
                saveTrainState();
            } else if (selectedWagonType && selectedWagonType.dataset.type === 'Локомотив') {
                alert('Локомотив можно добавить только в первый слот!');
            } else {
                alert('Сначала выберите тип вагона из палитры выше!');
            }
        });

        addHoverSound(slot);
    }
    
    checkBuildButtonState();
}

function checkBuildButtonState() {
    const locomotiveSlot = document.querySelector('.locomotive-slot');
    const wagonSlots = document.querySelectorAll('.wagon-slot');
    
    const isLocomotiveFilled = locomotiveSlot.classList.contains('filled');
    
    let allWagonsFilled = true;
    wagonSlots.forEach(slot => {
        if (!slot.classList.contains('filled')) {
            allWagonsFilled = false;
        }
    });
    
    buildTrainBtn.disabled = !(isLocomotiveFilled && allWagonsFilled);
}

wagonOptions.forEach(option => {
    const imageDiv = option.querySelector('.wagon-image');
    imageDiv.style.backgroundImage = `url(${option.dataset.image})`;
    imageDiv.style.backgroundSize = 'contain';
    imageDiv.style.backgroundRepeat = 'no-repeat';
    imageDiv.style.backgroundPosition = 'center';

    option.addEventListener('click', () => {
        playClickSound();
        wagonOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedWagonType = option;
    });

    addHoverSound(option);
});

addWagonBtn.addEventListener('click', () => {
    playClickSound();
    if (wagonCount < 12) {
        saveTrainState();
        wagonCount++;
        wagonCountDisplay.textContent = `Количество вагонов: ${wagonCount}`;
        gameState.maxLevel = wagonCount;
        initializeTrainSlots();
    } else {
        alert('Максимальное количество вагонов: 12');
    }
});

removeWagonBtn.addEventListener('click', () => {
    playClickSound();
    if (wagonCount > 3) {
        saveTrainState();
        wagonCount--;
        wagonCountDisplay.textContent = `Количество вагонов: ${wagonCount}`;
        gameState.maxLevel = wagonCount;
        initializeTrainSlots();
    } else {
        alert('Минимальное количество вагонов: 3');
    }
});

buildTrainBtn.addEventListener('click', function() {
    if (!hasEnoughWagons()) {
        alert('Недостаточно вагонов! Для сборки поезда необходимо заполнить все слоты вагонов.');
        return;
    }
    
    const gameCompleted = sessionStorage.getItem('gameCompleted');
    const trainState = sessionStorage.getItem('trainState');
    
    if (gameCompleted === 'true' && trainState) {
        showTrainResult();
    } else {
        gameModal.style.display = "block";
        resetGameState();
        initGame();
    }
});

resetTrainBtn.addEventListener('click', () => {
    playClickSound();
    wagonCount = 5;
    wagonCountDisplay.textContent = `Количество вагонов: ${wagonCount}`;
    
    sessionStorage.removeItem('trainState');
    sessionStorage.removeItem('gameCompleted');
    
    gameState.maxLevel = wagonCount;
    
    resetGameState();
    
    initializeTrainSlots();
    
    trainNameInput.value = '';
    trainResult.style.display = 'none';
    selectedWagonType = null;
    
    wagonOptions.forEach(opt => opt.classList.remove('selected'));
});

function handleScroll() {
    const trainBuilderSection = document.getElementById('train-builder');
    const rect = trainBuilderSection.getBoundingClientRect();
    
    if (rect.top < window.innerHeight && rect.bottom > 0 && soundEnabled) {
        trainSound.play().catch(e => console.log("Автовоспроизведение заблокировано"));
    } else {
        trainSound.pause();
    }
}

initializeTrainSlots();

window.addEventListener('scroll', handleScroll);

document.querySelectorAll('.btn, .count-btn').forEach(btn => {
    addHoverSound(btn);
    btn.addEventListener('click', playClickSound);
});

const modal = document.getElementById("myModal");
const modalDate = document.getElementById("modal-date");
const modalDesc = document.getElementById("modal-desc");
const span = document.getElementsByClassName("close")[0];

document.querySelectorAll('.timeline-item').forEach(item => {
    item.addEventListener('click', function() {
        const date = this.querySelector('.timeline-date').textContent;
        const desc = this.querySelector('span').textContent;
        modalDate.textContent = date;
        modalDesc.textContent = desc;
        modal.style.display = "block";
    });
});

span.addEventListener('click', function() {
    playClickSound();
    modal.style.display = "none";
});

window.addEventListener('click', function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
});

const MenuM = document.getElementsByClassName("m-container")[0]

function myFunction() {
    this.classList.toggle("change"); 
}
MenuM.addEventListener("click", myFunction);

const modal1 = document.getElementById("myModal1");

document.querySelectorAll('.m-container').forEach(item => {
    item.addEventListener('click', function() {
        playClickSound();
        modal1.style.display = "block";
    });
});

window.addEventListener('click', function(event) {
    if (event.target == modal1) {
        modal1.style.display = "none";
        MenuM.classList.remove("change")
    }
});

document.querySelectorAll("#a-mod").forEach(item => {
    item.addEventListener('click', function() {
        playClickSound();
        modal1.style.display = "none";
        MenuM.classList.remove("change")
    });
});

const gameModal = document.getElementById("game-modal");
const closeGameBtn = document.querySelector(".close-game");

let gameState = {
    level: 1,
    maxLevel: 5,
    connectedWires: 0,
    totalWires: 4,
    timeLeft: 30,
    timer: null,
    isPlaying: false,
    colors: ['#8B0000', '#DAA520', '#2F4F4F', '#4a6741', '#6a5acd', '#8B4513'],
    currentColors: [],
    selectedWire: null,
    connections: [],
    icons: ['⚡', '🔌', '💡', '🔋', '📡', '🛰️', '🔦', '💎', '⭐', '🔆']
};

const leftColumn = document.getElementById('left-column-shitok');
const rightColumn = document.getElementById('right-column-shitok');
const canvas = document.getElementById('drawing-area-shitok');
const ctx = canvas.getContext('2d');
const levelDisplay = document.getElementById('level-shitok');
const connectedDisplay = document.getElementById('connected-shitok');
const timerDisplay = document.getElementById('timer-shitok');
const startBtn = document.getElementById('start-btn-shitok');
const resetBtn = document.getElementById('reset-btn-shitok');
const winMessage = document.getElementById('win-message-shitok');
const loseMessage = document.getElementById('lose-message-shitok');
const completeMessage = document.getElementById('complete-message-shitok');
const nextLevelBtn = document.getElementById('next-level-shitok');
const retryBtn = document.getElementById('retry-shitok');
const restartBtn = document.getElementById('restart-shitok');

closeGameBtn.addEventListener('click', function() {
    playClickSound();
    gameModal.style.display = "none";
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
    gameState.isPlaying = false;
    gameMusic.pause();
    isMusicStarted = false;
});

window.addEventListener('click', function(event) {
    if (event.target == gameModal) {
        gameModal.style.display = "none";
        if (gameState.timer) {
            clearInterval(gameState.timer);
        }
        gameState.isPlaying = false;
        gameMusic.pause();
        isMusicStarted = false;
    }
});

function resetGameState() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
    
    gameState = {
        level: 1,
        maxLevel: wagonCount,
        connectedWires: 0,
        totalWires: 4,
        timeLeft: 30,
        timer: null,
        isPlaying: false,
        colors: ['#8B0000', '#DAA520', '#2F4F4F', '#4a6741', '#6a5acd', '#8B4513'],
        currentColors: [],
        selectedWire: null,
        connections: [],
        icons: ['⚡', '🔌', '💡', '🔋', '📡', '🛰️', '🔦', '💎', '⭐', '🔆']
    };
    
    hideGameMessages();
}

function hideGameMessages() {
    const winMessage = document.getElementById('win-message-shitok');
    const loseMessage = document.getElementById('lose-message-shitok');
    const completeMessage = document.getElementById('complete-message-shitok');
    
    if (winMessage) winMessage.style.display = 'none';
    if (loseMessage) loseMessage.style.display = 'none';
    if (completeMessage) completeMessage.style.display = 'none';
}

function initGame() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    leftColumn.innerHTML = '';
    rightColumn.innerHTML = '';
    
    gameState.totalWires = 4 + Math.floor(gameState.level / 2);
    if (gameState.totalWires > 6) gameState.totalWires = 6;
    
    gameState.currentColors = [];
    const availableColors = [...gameState.colors];
    for (let i = 0; i < gameState.totalWires; i++) {
        const randomIndex = Math.floor(Math.random() * availableColors.length);
        gameState.currentColors.push(availableColors[randomIndex]);
        availableColors.splice(randomIndex, 1);
    }
    
    const availableIcons = [...gameState.icons];
    const selectedIcons = [];
    for (let i = 0; i < gameState.totalWires; i++) {
        const randomIndex = Math.floor(Math.random() * availableIcons.length);
        selectedIcons.push(availableIcons[randomIndex]);
        availableIcons.splice(randomIndex, 1);
    }
    
    gameState.currentColors.forEach((color, index) => {
        const wire = document.createElement('div');
        wire.className = 'wire-end-shitok';
        wire.style.backgroundColor = color;
        wire.dataset.color = color;
        wire.dataset.side = 'left';
        wire.dataset.index = index;
        wire.dataset.icon = selectedIcons[index];
        
        const icon = document.createElement('span');
        icon.className = 'wire-icon-shitok';
        icon.textContent = selectedIcons[index];
        wire.appendChild(icon);
        
        const textColor = getContrastColor(color);
        wire.style.color = textColor;
        
        wire.addEventListener('click', handleWireClick);
        leftColumn.appendChild(wire);
    });
    
    const shuffledIcons = [...selectedIcons].sort(() => Math.random() - 0.5);
    
    gameState.currentColors.forEach((color, index) => {
        const wire = document.createElement('div');
        wire.className = 'wire-end-shitok';
        wire.style.backgroundColor = color;
        wire.dataset.color = color;
        wire.dataset.side = 'right';
        wire.dataset.index = index;
        wire.dataset.icon = shuffledIcons[index];
        
        const icon = document.createElement('span');
        icon.className = 'wire-icon-shitok';
        icon.textContent = shuffledIcons[index];
        wire.appendChild(icon);
        
        const textColor = getContrastColor(color);
        wire.style.color = textColor;
        
        wire.addEventListener('click', handleWireClick);
        rightColumn.appendChild(wire);
    });
    
    gameState.connectedWires = 0;
    gameState.selectedWire = null;
    gameState.connections = [];
    updateDisplay();
    clearCanvas();
}

function getContrastColor(hexColor) {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    return brightness > 128 ? '#333' : '#F5F5F5';
}

function handleWireClick(event) {
    playClickSound();
    if (!gameState.isPlaying) return;
    
    const wire = event.currentTarget;
    const color = wire.dataset.color;
    const side = wire.dataset.side;
    const icon = wire.dataset.icon;
    
    if (wire.classList.contains('connected-shitok')) return;
    
    if (!gameState.selectedWire) {
        gameState.selectedWire = { element: wire, color, side, icon };
        wire.classList.add('selected-shitok');
    } 
    else if (
        gameState.selectedWire.side !== side && 
        gameState.selectedWire.icon === icon
    ) {
        connectWires(gameState.selectedWire.element, wire);
        gameState.selectedWire.element.classList.remove('selected-shitok');
        gameState.selectedWire = null;
        
        if (gameState.connectedWires === gameState.totalWires) {
            winGame();
        }
    } 
    else if (gameState.selectedWire.side !== side) {
        gameState.selectedWire.element.classList.remove('selected-shitok');
        gameState.selectedWire = null;
    }
}

function connectWires(leftWire, rightWire) {
    leftWire.classList.add('connected-shitok');
    rightWire.classList.add('connected-shitok');
    
    const leftRect = leftWire.getBoundingClientRect();
    const rightRect = rightWire.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    
    const startX = leftRect.left + leftRect.width / 2 - canvasRect.left;
    const startY = leftRect.top + leftRect.height / 2 - canvasRect.top;
    const endX = rightRect.left + rightRect.width / 2 - canvasRect.left;
    const endY = rightRect.top + rightRect.height / 2 - canvasRect.top;
    
    gameState.connections.push({
        startX, startY, endX, endY, color: leftWire.dataset.color
    });
    
    gameState.connectedWires++;
    updateDisplay();
    
    drawConnections();
}

function drawConnections() {
    clearCanvas();
    
    gameState.connections.forEach(conn => {
        ctx.beginPath();
        ctx.moveTo(conn.startX, conn.startY);
        ctx.lineTo(conn.endX, conn.endY);
        ctx.strokeStyle = conn.color;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.shadowColor = conn.color;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
    });
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updateDisplay() {
    levelDisplay.textContent = `${gameState.level} / ${gameState.maxLevel}`;
    connectedDisplay.textContent = `${gameState.connectedWires} / ${gameState.totalWires}`;
    timerDisplay.textContent = gameState.timeLeft;
}

function startGame() {
    playClickSound();
    if (gameState.isPlaying) return;
    
    gameState.isPlaying = true;
    startBtn.disabled = true;
    gameState.timeLeft = 30 - (gameState.level - 1) * 2;
    if (gameState.timeLeft < 15) gameState.timeLeft = 15;
    
    updateDisplay();
    
    if (soundEnabled && !isMusicStarted) {
        gameMusic.currentTime = 0;
        gameMusic.play().catch(e => console.log("Автовоспроизведение музыки заблокировано"));
        isMusicStarted = true;
    }
    
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        timerDisplay.textContent = gameState.timeLeft;
        
        if (gameState.timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

function resetGame() {
    playClickSound();
    clearInterval(gameState.timer);
    gameState.isPlaying = false;
    startBtn.disabled = false;
    initGame();
    hideMessages();
}

function winGame() {
    clearInterval(gameState.timer);
    gameState.isPlaying = false;
    startBtn.disabled = false;
    
    if (gameState.level === gameState.maxLevel) {
        completeMessage.style.display = 'block';
        gameMusic.pause();
        isMusicStarted = false;
    } else {
        winMessage.style.display = 'block';
    }
}

function endGame(isWin) {
    clearInterval(gameState.timer);
    gameState.isPlaying = false;
    startBtn.disabled = false;
    
    if (!isWin) {
        loseMessage.style.display = 'block';
        gameMusic.pause();
        isMusicStarted = false;
    }
}

function hideMessages() {
    winMessage.style.display = 'none';
    loseMessage.style.display = 'none';
    completeMessage.style.display = 'none';
}

function nextLevel() {
    gameState.level++;
    hideMessages();
    initGame();
    startGame();
}

function showTrainResult() {
    const name = trainNameInput.value.trim();
    if (!name) {
        alert('Пожалуйста, дайте имя вашему поезду!');
        return;
    }
    
    if (soundEnabled) {
        successSound.currentTime = 0;
        successSound.play().catch(e => console.log("Ошибка воспроизведения звука"));
    }
    
    finalTrain.innerHTML = '';
    
    const locomotiveSlot = document.querySelector('.locomotive-slot');
    const locomotive = document.createElement('div');
    locomotive.className = 'final-locomotive';
    locomotive.style.backgroundImage = locomotiveSlot.style.backgroundImage;
    locomotive.style.backgroundSize = 'contain';
    locomotive.style.backgroundRepeat = 'no-repeat';
    locomotive.style.backgroundPosition = 'center';
    
    const locomotiveType = document.createElement('div');
    locomotiveType.className = 'slot-type';
    locomotiveType.textContent = locomotiveSlot.querySelector('.slot-type').textContent;
    
    locomotive.appendChild(locomotiveType);
    finalTrain.appendChild(locomotive);
    
    const wagonSlots = document.querySelectorAll('.wagon-slot');
    wagonSlots.forEach((slot, index) => {
        setTimeout(() => {
            const wagon = document.createElement('div');
            wagon.className = 'final-wagon';
            wagon.style.backgroundImage = slot.style.backgroundImage;
            wagon.style.backgroundSize = 'contain';
            wagon.style.backgroundRepeat = 'no-repeat';
            wagon.style.backgroundPosition = 'center';
            
            const type = document.createElement('div');
            type.className = 'slot-type';
            type.textContent = slot.querySelector('.slot-type').textContent;
            
            wagon.appendChild(type);
            finalTrain.appendChild(wagon);
        }, 300 * (index + 1));
    });
    
    finalTrainName.textContent = name;
    trainResult.style.display = 'block';
    
    setTimeout(() => {
        buildTrainBtn.scrollIntoView({ behavior: 'smooth' });
    }, 500);
}

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);
nextLevelBtn.addEventListener('click', nextLevel);
retryBtn.addEventListener('click', () => {
    playClickSound();
    hideMessages();
    initGame();
    startGame();
});
restartBtn.addEventListener('click', () => {
    playClickSound();
    sessionStorage.setItem('gameCompleted', 'true');
    gameModal.style.display = 'none';
    gameMusic.pause();
    isMusicStarted = false;
    resetGameState();
    showTrainResult();
});

window.addEventListener('load', () => {
    initializeTrainSlots();
    
    window.addEventListener('resize', () => {
        if (canvas) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            drawConnections();
        }
    });
});

document.querySelectorAll('#start-btn-shitok,#reset-btn-shitok,.wire-end-shitok').forEach(btn => {
    addHoverSound(btn);
    btn.addEventListener('click', playClickSound);
});