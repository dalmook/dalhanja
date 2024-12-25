// script.js

document.addEventListener('DOMContentLoaded', () => {
    const difficultyScreen = document.getElementById('difficulty-screen');
    const mainMenuScreen = document.getElementById('main-menu-screen');
    const studyScreen = document.getElementById('study-screen');
    const gameScreen = document.getElementById('game-screen');

    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const backToDifficultyBtn = document.getElementById('back-to-difficulty');
    const studyBtn = document.getElementById('study-btn');
    const gameBtn = document.getElementById('game-btn');
    const backToMenuFromStudy = document.getElementById('back-to-menu-from-study');
    const backToMenuFromGame = document.getElementById('back-to-menu-from-game');

    // 학습하기 화면 요소
    const studyLevelSpan = document.getElementById('study-level');
    const hanjaCharacter = document.getElementById('hanja-character');
    const hanjaMeaning = document.getElementById('hanja-meaning');
    const hanjaReading = document.getElementById('hanja-reading');
    const speakBtn = document.getElementById('speak-btn');
    const writingCanvas = document.getElementById('writing-canvas');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const orderOptions = document.getElementsByName('order');

    let selectedLevel = '';
    let hanjaData = [];
    let currentIndex = 0;
    let isRandom = false;
    let shuffledIndices = [];

    // 캔버스 설정
    const ctx = writingCanvas.getContext('2d');
    let drawing = false;

    writingCanvas.addEventListener('mousedown', startDrawing);
    writingCanvas.addEventListener('mouseup', stopDrawing);
    writingCanvas.addEventListener('mousemove', draw);
    writingCanvas.addEventListener('touchstart', startDrawing);
    writingCanvas.addEventListener('touchend', stopDrawing);
    writingCanvas.addEventListener('touchmove', draw);

    function startDrawing(e) {
        drawing = true;
        ctx.beginPath();
        const { x, y } = getCanvasCoordinates(e);
        ctx.moveTo(x, y);
    }

    function stopDrawing() {
        drawing = false;
    }

    function draw(e) {
        if (!drawing) return;
        const { x, y } = getCanvasCoordinates(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    function getCanvasCoordinates(e) {
        const rect = writingCanvas.getBoundingClientRect();
        let x, y;
        if (e.touches) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
        return { x, y };
    }

    // 난이도 선택 시
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedLevel = button.getAttribute('data-level');
            document.getElementById('selected-level-title').innerText = `레벨: ${selectedLevel}`;
            studyLevelSpan.innerText = selectedLevel;
            loadHanjaData();
            showScreen(mainMenuScreen);
        });
    });

    // 뒤로가기 버튼 (메인 메뉴에서 난이도 선택 화면으로)
    backToDifficultyBtn.addEventListener('click', () => {
        showScreen(difficultyScreen);
    });

    // 학습하기 버튼
    studyBtn.addEventListener('click', () => {
        showScreen(studyScreen);
        initializeStudy();
    });

    // 낱말게임 버튼
    gameBtn.addEventListener('click', () => {
        showScreen(gameScreen);
    });

    // 뒤로가기 버튼 (학습하기 화면에서 메인 메뉴로)
    backToMenuFromStudy.addEventListener('click', () => {
        showScreen(mainMenuScreen);
    });

    // 뒤로가기 버튼 (낱말게임 화면에서 메인 메뉴로)
    backToMenuFromGame.addEventListener('click', () => {
        showScreen(mainMenuScreen);
    });

    // 화면 전환 함수
    function showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }

    // 학습하기 초기화 함수
    function initializeStudy() {
        // 초기화
        currentIndex = 0;
        // 순서 선택
        isRandom = Array.from(orderOptions).find(r => r.checked).value === 'random';
        // 준비
        if (isRandom) {
            shuffledIndices = shuffleArray([...Array(hanjaData.length).keys()]);
        } else {
            shuffledIndices = [...Array(hanjaData.length).keys()];
        }
        displayHanja();
    }

    // 순서 변경 시 초기화
    orderOptions.forEach(option => {
        option.addEventListener('change', () => {
            initializeStudy();
        });
    });

    // 이전 버튼
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            displayHanja();
        }
    });

    // 다음 버튼
    nextBtn.addEventListener('click', () => {
        if (currentIndex < hanjaData.length - 1) {
            currentIndex++;
            displayHanja();
        }
    });

    // 발음 듣기 버튼
    speakBtn.addEventListener('click', () => {
        if (hanjaData.length === 0) return;
        const hanja = hanjaData[shuffledIndices[currentIndex]];
        const textToSpeak = `${hanja.뜻}. ${hanja.음}`;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'ko-KR';
        window.speechSynthesis.speak(utterance);
    });

    // 한자 데이터 로드
    function loadHanjaData() {
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                hanjaData = data[selectedLevel]['학습하기'];
                initializeStudy();
            })
            .catch(error => {
                console.error('Error loading data:', error);
                hanjaData = [];
            });
    }

    // 한자 표시 함수
    function displayHanja() {
        if (hanjaData.length === 0) return;
        const hanja = hanjaData[shuffledIndices[currentIndex]];
        hanjaCharacter.innerText = hanja.한자;
        hanjaMeaning.innerText = hanja.뜻;
        hanjaReading.innerText = hanja.음;

        // 캔버스 초기화
        ctx.clearRect(0, 0, writingCanvas.width, writingCanvas.height);

        // 한자 가이드 그리기
        ctx.globalAlpha = 0.3; // 반투명
        ctx.font = '200px Arial'; // 한자 크기 조정
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000000';
        ctx.fillText(hanja.한자, writingCanvas.width / 2, writingCanvas.height / 2);
        ctx.globalAlpha = 1.0; // 다시 불투명하게
    }

    // 배열 섞기 함수
    function shuffleArray(array) {
        for (let i = array.length -1; i >0; i--) {
            const j = Math.floor(Math.random() * (i+1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});
