const typingText = document.querySelector('.typing-text p');
const input = document.querySelector('.wrapper .input-field');
const time = document.querySelector('.time span b');
const mistakes = document.querySelector('.mistake span b');
const wpm = document.querySelector('.wpm span b');
const cpm = document.querySelector('.cpm span b');
const btn = document.querySelector('button');
const accuracy = document.querySelector('.accuracy span b');
const bgMusic = document.getElementById('bg-music');
const toggleMusicBtn = document.getElementById('toggleMusic');

// set values
let timer;
let maxTime = 60;
let timeLeft = maxTime;
let charIndex = 0;
let mistake = 0;
let isTyping = false;
let totalTyped = 0;
let correctTyped = 0;
let isMuted = false;

// Chart setup
const ctx = document.getElementById('typingChart').getContext('2d');
let chartLabels = [];  // For X-axis (seconds)
let chartData = [];    // For Y-axis (WPM)
let accuracyChartData = [];    // Accuracy

const typingChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: chartLabels,
        datasets: [
            {
                label: 'WPM Over Time',
                data: chartData,
                borderColor: 'blue',
                fill: false,
                tension: 0.2
            },
            {
                label: 'Accuracy Over Time',
                data: [],
                borderColor: 'green',
                fill: false,
                tension: 0.2
            }
        ]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// Toggle background music
toggleMusicBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    bgMusic.muted = isMuted;
    toggleMusicBtn.textContent = isMuted ? "🔇 Unmute Music" : "🔊 Mute Music";
});

function loadParagraph() {
    const paragraph = [ "The quick brown fox jumps over the lazy dog.", "The five boxing wizards jump quickly.", "Pack my box with five dozen liquor jugs.", "How quickly daft jumping zebras vex.", "Bright vixens jump; dozy fowl quack.", "The jay, pig, fox, zebra and my wolves quack!", "Sympathizing would fix Quaker objectives.", "Jinxed wizards pluck ivy from the big quilt.", "The quick brown fox jumps over the lazy dog.", "The five boxing wizards jump quickly.", "Pack my box with five dozen liquor jugs.", "How quickly daft jumping zebras vex.", "Bright vixens jump; dozy fowl quack.", "The jay, pig, fox, zebra and my wolves quack!", "Sympathizing would fix Quaker objectives."   
    ];

    const randomIndex = Math.floor(Math.random() * paragraph.length);
    typingText.innerHTML = '';
    for (const char of paragraph[randomIndex]) {
        console.log(char);
        typingText.innerHTML += `<span>${char}</span>`;
    }

    typingText.querySelectorAll('span')[0].classList.add('active');

    document.addEventListener('keydown' , () => input.focus());
    typingText.addEventListener('click', () => input.focus());
}

document.getElementById('bestWpm').innerText = localStorage.getItem('bestWpm') || 0;
document.getElementById('bestCpm').innerText = localStorage.getItem('bestCpm') || 0;


// handle user input 
function initTyping() {
    const char = typingText.querySelectorAll('span');
    const typedChar = input.value.charAt(charIndex);
    totalTyped++;  // Count total keystrokes

    if (charIndex < char.length && timeLeft > 0) {

        if (!isTyping) {
            bgMusic.play();
            timer = setInterval(initTime, 1000);
            isTyping = true;
        }        

        if(char[charIndex].innerText === typedChar) {
            char[charIndex].classList.add('correct');
            console.log('correct');
            correctTyped++;  // Count correct characters
        }
        else {
            mistake++;
            char[charIndex].classList.add('incorrect');
            console.log('incorrect');
        }
        charIndex++;
        char[charIndex].classList.add('active');

        mistakes.innerText = mistake;
        cpm.innerText = charIndex - mistake;

        let accuracyVal = (correctTyped / totalTyped) * 100;
        if (isNaN(accuracyVal)) accuracyVal = 0;
        accuracy.innerText = accuracyVal.toFixed(2);

    }
    else{
        clearInterval(timer);
        input.value = '';

        let currentWpm = parseInt(wpm.innerText);
        let currentCpm = parseInt(cpm.innerText);

        let storedBestWpm = parseInt(localStorage.getItem('bestWpm')) || 0;
        let storedBestCpm = parseInt(localStorage.getItem('bestCpm')) || 0;

        if (currentWpm > storedBestWpm) {
            localStorage.setItem('bestWpm', currentWpm);
            document.getElementById('bestWpm').innerText = currentWpm;
        }

        if (currentCpm > storedBestCpm) {
            localStorage.setItem('bestCpm', currentCpm);
            document.getElementById('bestCpm').innerText = currentCpm;
        }
    }
}

function initTime() {
    if (timeLeft > 0) {
        timeLeft--;
        time.innerText = timeLeft;
        let wpmVal = Math.round(((charIndex - mistake) / 5) / (maxTime - timeLeft) * 60);
        wpm.innerText = wpmVal;
        chartLabels.push(maxTime - timeLeft);     // x-axis = seconds passed
        chartData.push(wpmVal);                   // y-axis = current WPM

        let accuracyVal = (correctTyped / totalTyped) * 100;
        if (isNaN(accuracyVal)) accuracyVal = 0;
        accuracyChartData.push(accuracyVal);

        // Update chart dataset
        typingChart.data.datasets[1].data = accuracyChartData;

        typingChart.update();
    }
    else{
        clearInterval(timer);
    }
}

function reset() {
    loadParagraph();
    clearInterval(timer);
    timeLeft = maxTime;
    time.innerText = timeLeft;
    input.value = '';
    charIndex = 0;
    mistake = 0;
    isTyping = false;
    wpm.innerText = 0;
    cpm.innerText = 0;
    mistakes.innerText = 0;
    accuracy.innerText = 0;
    correctTyped = 0;
    totalTyped = 0;
    chartLabels.length = 0;
    chartData.length = 0;
    accuracyChartData.length = 0;
    typingChart.data.datasets[1].data = accuracyChartData;
    typingChart.update();
    bgMusic.pause();
    bgMusic.currentTime = 0;
}
    
input.addEventListener('input', initTyping);
btn.addEventListener('click', reset);
loadParagraph();