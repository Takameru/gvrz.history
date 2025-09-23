document.querySelectorAll('.nav-link, .btn').forEach(link => {
    // if (link.getAttribute('href') !== '#train-builder') {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
        });
    // }
});

/* Код был написан Иванишко Савелием! GitHub: Takameru */

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

let soundEnabled = true;

toggleSoundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    toggleSoundBtn.textContent = soundEnabled ? '🔊' : '🔇';
    
    if (!soundEnabled) {
        trainSound.pause();
    } else if (document.querySelector('#train-builder').getBoundingClientRect().top < window.innerHeight) {
        trainSound.play().catch(e => console.log("Автовоспроизведение заблокировано"));
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

/* Код был написан Иванишко Савелием! GitHub: Takameru */

function loadTrainState() {
    const savedState = sessionStorage.getItem('trainState');
    if (savedState) {
        return JSON.parse(savedState);
    }
    return null;
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

/* Код был написан Иванишко Савелием! GitHub: Takameru */

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
        initializeTrainSlots();
    } else {
        alert('Минимальное количество вагонов: 3');
    }
});

buildTrainBtn.addEventListener('click', () => {
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
        trainResult.scrollIntoView({ behavior: 'smooth' });
    }, 500);
});


/* Код был написан Иванишко Савелием! GitHub: Takameru */

resetTrainBtn.addEventListener('click', () => {
    playClickSound();
    wagonCount = 5;
    wagonCountDisplay.textContent = `Количество вагонов: ${wagonCount}`;
    
    sessionStorage.removeItem('trainState');
    
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


/* Код был написан Иванишко Савелием! GitHub: Takameru */