// script.js

document.addEventListener('DOMContentLoaded', () => {
    const difficultyScreen = document.getElementById('difficulty-screen');
    const mainMenuScreen = document.getElementById('main-menu-screen');
    const studyScreen = document.getElementById('study-screen');
    const gameScreen = document.getElementById('game-screen');
    const manageLearnedHanjaScreen = document.getElementById('manage-learned-hanja-screen'); // 추가된 부분

    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const backToDifficultyBtn = document.getElementById('back-to-difficulty');
    const studyBtn = document.getElementById('study-btn');
    const gameBtn = document.getElementById('game-btn');
    const manageLearnedHanjaBtn = document.getElementById('manage-learned-hanja-btn'); // 추가된 부분
    const backToMenuFromManaged = document.getElementById('back-to-menu-from-managed'); // 추가된 부분    
    const backToMenuFromStudy = document.getElementById('back-to-menu-from-study');
    const backToMenuFromGame = document.getElementById('back-to-menu-from-game');

    // 학습완료 한자 관리 요소
    const learnedHanjaList = document.getElementById('learned-hanja-list');

    // 학습하기 화면 요소
    const studyLevelSpan = document.getElementById('study-level');
    const hanjaCharacter = document.getElementById('hanja-character');
    const hanjaMeaning = document.getElementById('hanja-meaning');
    const hanjaReading = document.getElementById('hanja-reading');
    const hanjaChinese = document.getElementById('hanja-chinese'); // 추가된 부분
    const speakBtn = document.getElementById('speak-btn');
    const writingCanvas = document.getElementById('writing-canvas');
    const clearCanvasBtn = document.getElementById('clear-canvas-btn');
    const goFirstBtn = document.getElementById('go-first-btn'); // 추가된 부분
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const orderOptions = document.getElementsByName('order');
    const markCompletedCheckbox = document.getElementById('mark-completed');

    // 낱말게임 화면 요소
    const quizGameBtn = document.getElementById('quiz-game-btn');
    const matchingGameBtn = document.getElementById('matching-game-btn');
    const quizGame = document.getElementById('quiz-game');
    const matchingGame = document.getElementById('matching-game');
    const quizQuestion = document.getElementById('quiz-question');
    const quizOptions = document.getElementById('quiz-options');
    const quizFeedback = document.getElementById('quiz-feedback');
    const nextQuizBtn = document.getElementById('next-quiz-btn');
    const matchingGameBoard = document.getElementById('matching-game-board');
    const matchingFeedback = document.getElementById('matching-feedback');
    const restartMatchingBtn = document.getElementById('restart-matching-btn');

    const currentScoreSpan = document.getElementById('current-score');
    const highScoreSpan = document.getElementById('high-score');

    let currentHanja = null;
    let selectedLevel = '';
    let hanjaData = [];
    let currentIndex = 0;
    let isRandom = false;
    let shuffledIndices = [];
    let isProcessing = false; // 추가된 부분

    // 캔버스 설정
    const ctx = writingCanvas.getContext('2d');
    ctx.lineWidth = 5;
    ctx.lineCap = 'round'; // 선 끝을 둥글게
    ctx.lineJoin = 'round'; // 선이 만나는 지점을 둥글게
    let drawing = false;

    writingCanvas.addEventListener('mousedown', startDrawing);
    writingCanvas.addEventListener('mouseup', stopDrawing);
    writingCanvas.addEventListener('mousemove', draw);
    writingCanvas.addEventListener('touchstart', startDrawing, {passive: false});
    writingCanvas.addEventListener('touchend', stopDrawing);
    writingCanvas.addEventListener('touchmove', draw, {passive: false});

    function startDrawing(e) {
        e.preventDefault();
        drawing = true;
        ctx.beginPath();
        const { x, y } = getCanvasCoordinates(e);
        ctx.moveTo(x, y);
    }

    function stopDrawing(e) {
        e.preventDefault();
        drawing = false;
    }

    function draw(e) {
        if (!drawing) return;
        e.preventDefault();
        const { x, y } = getCanvasCoordinates(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    function getCanvasCoordinates(e) {
        const rect = writingCanvas.getBoundingClientRect();
        let x, y;
        if (e.touches) {
            x = (e.touches[0].clientX - rect.left) * (writingCanvas.width / rect.width);
            y = (e.touches[0].clientY - rect.top) * (writingCanvas.height / rect.height);
        } else {
            x = (e.clientX - rect.left) * (writingCanvas.width / rect.width);
            y = (e.clientY - rect.top) * (writingCanvas.height / rect.height);
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

    // 낱말게임 옵션 버튼
    quizGameBtn.addEventListener('click', () => {
        startQuizGame();
    });

    matchingGameBtn.addEventListener('click', () => {
        startMatchingGame();
    });

    // 완료 한자관리 버튼 클릭 시
    manageLearnedHanjaBtn.addEventListener('click', () => {
        showScreen(manageLearnedHanjaScreen);
    });

    // 완료 한자관리 화면에서 뒤로가기 버튼 클릭 시
    backToMenuFromManaged.addEventListener('click', () => {
        showScreen(mainMenuScreen);
    });    

    // 뒤로가기 버튼 (학습하기 화면에서 메인 메뉴로)
    backToMenuFromStudy.addEventListener('click', () => {
        showScreen(mainMenuScreen);
    });

    // 뒤로가기 버튼 (낱말게임 화면에서 메인 메뉴로)
    backToMenuFromGame.addEventListener('click', () => {
        showScreen(mainMenuScreen);
    });

    // 쓰기 초기화 버튼
    clearCanvasBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, writingCanvas.width, writingCanvas.height);
        displayHanja(); // 한자 가이드 다시 그리기
    });
    // 처음으로 버튼 추가
    goFirstBtn.addEventListener('click', () => { // 추가된 부분
        currentIndex = 0; // 첫 번째 한자로 설정
        displayHanja(); // 한자 표시 함수 호출
        saveProgress(selectedLevel, currentIndex); // 진도 저장
    });
    // 화면 전환 함수
    function showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
        if (screen === difficultyScreen) {
            // 기존 로직 (필요 시 추가)
        } else if (screen === manageLearnedHanjaScreen) { // 추가된 부분
            loadLearnedHanjaManagement();
        }
    }

    // 학습하기 초기화 함수
    function initializeStudy() {
        // 초기화
        currentIndex = getSavedIndex(selectedLevel) || 0;
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
            saveProgress(selectedLevel, currentIndex);
        }
    });

    // 다음 버튼
    nextBtn.addEventListener('click', () => {
        if (currentIndex < hanjaData.length - 1) {
            currentIndex++;
            displayHanja();
            saveProgress(selectedLevel, currentIndex);
        }
    });

    // 발음 듣기 버튼
    speakBtn.addEventListener('click', () => {
        if (!currentHanja) return; // 현재 한자가 없으면 실행 안함
    
        const koreanText = `${currentHanja.뜻}. ${currentHanja.음}`;
        const chineseText = currentHanja.중국어;
    
        // 안드로이드 환경에서 TTS 지원
        if (typeof Android !== 'undefined' && Android.speak) {
            Android.speak(koreanText, chineseText); // 두 개의 파라미터로 전달
        }
        // 웹 브라우저에서 TTS 지원
        else if ('speechSynthesis' in window) {
            const utteranceKorean = new SpeechSynthesisUtterance(koreanText);
            utteranceKorean.lang = 'ko-KR';
            window.speechSynthesis.speak(utteranceKorean);
    
            const utteranceChinese = new SpeechSynthesisUtterance(chineseText);
            utteranceChinese.lang = 'zh-CN'; // 중국어 발음 설정
            window.speechSynthesis.speak(utteranceChinese);
        }
        else {
            console.warn("이 브라우저는 음성 합성을 지원하지 않습니다.");
        }
    });

    // 학습완료 체크박스 이벤트
    markCompletedCheckbox.addEventListener('change', () => {
        const hanja = currentHanja ? currentHanja.한자 : null;
        if (hanja) {
            if (markCompletedCheckbox.checked) {
                markHanjaAsLearned(hanja);
            } else {
                unmarkHanjaAsLearned(hanja);
            }
            currentIndex += 1; // 다음 한자로 이동
            displayHanja(); // 업데이트 후 표시
        }
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

    // 한자 표시 함수 (학습 완료된 한자는 제외)
    // script.js
    
    function displayHanja() {
        if (hanjaData.length === 0) return;
        const learnedHanja = getLearnedHanja(selectedLevel);
        const availableIndices = shuffledIndices.filter(index => !learnedHanja.includes(hanjaData[index].한자));
        if (availableIndices.length === 0) {
            hanjaCharacter.innerText = '모든 한자를 학습 완료했습니다!';
            hanjaMeaning.innerText = '';
            hanjaReading.innerText = '';
            hanjaChinese.innerText = ''; // 중국어 발음 초기화
            ctx.clearRect(0, 0, writingCanvas.width, writingCanvas.height);
            markCompletedCheckbox.checked = false;
            markCompletedCheckbox.disabled = true;
            currentHanja = null; // 현재 한자 없앰
            return;
        }
        // 현재 인덱스가 범위를 벗어나지 않도록 조정
        if (currentIndex >= availableIndices.length) {
            currentIndex = availableIndices.length - 1;
        }
        currentHanja = hanjaData[availableIndices[currentIndex]]; // 현재 한자 설정
        hanjaCharacter.innerText = currentHanja.한자;
        hanjaMeaning.innerText = currentHanja.뜻;
        hanjaReading.innerText = currentHanja.음;
        hanjaChinese.innerText = currentHanja.중국어; // 중국어 발음 표시
    
        // 캔버스 초기화
        ctx.clearRect(0, 0, writingCanvas.width, writingCanvas.height);
    
        // 한자 가이드 그리기
    
        // **동적 폰트 크기 설정 시작**
        const canvasWidth = writingCanvas.width;
        const canvasHeight = writingCanvas.height;
        const hanjaText = currentHanja.한자;
        const maxFontSize = 200; // 최대 폰트 크기
        const minFontSize = 50;  // 최소 폰트 크기
        let fontSize = maxFontSize;
    
        // 폰트 크기를 조절하여 텍스트가 캔버스 내에 들어오도록 함
        while (fontSize > minFontSize) {
            ctx.font = `${fontSize}px Arial`;
            const textMetrics = ctx.measureText(hanjaText);
            const textWidth = textMetrics.width;
            const textHeight = fontSize; // 대략적인 텍스트 높이
    
            if (textWidth <= canvasWidth * 0.8 && textHeight <= canvasHeight * 0.8) {
                break;
            }
            fontSize -= 10;
        }
        // **동적 폰트 크기 설정 끝**
    
        ctx.globalAlpha = 0.3; // 반투명
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000000';
        ctx.fillText(hanjaText, canvasWidth / 2, canvasHeight / 2);
        ctx.globalAlpha = 1.0; // 다시 불투명하게
    
        // **쓰기순서 SVG 표시 시작**
        if (currentHanja.쓰기순서) {
            const writingOrderSvg = new Image();
            writingOrderSvg.src = currentHanja.쓰기순서;
            writingOrderSvg.onload = () => {
                const svgWidth = 100; // 원하는 크기로 조절
                const svgHeight = 100; // 원하는 크기로 조절
                const x = canvasWidth - svgWidth - 10; // 우측 모서리에 10px 여백
                const y = 10; // 상단 모서리에 10px 여백
                ctx.drawImage(writingOrderSvg, x, y, svgWidth, svgHeight);
            };
            writingOrderSvg.onerror = () => {
                console.error(`SVG 이미지 로드 실패: ${currentHanja.쓰기순서}`);
            };
        }
        // **쓰기순서 SVG 표시 끝**
    
        // 학습완료 체크박스 상태 설정
        markCompletedCheckbox.disabled = false;
        markCompletedCheckbox.checked = learnedHanja.includes(currentHanja.한자);
    }


    // 배열 섞기 함수
    function shuffleArray(array) {
        for (let i = array.length -1; i >0; i--) {
            const j = Math.floor(Math.random() * (i+1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // 학습 진도 저장
    function saveProgress(level, index) {
        let progress = JSON.parse(localStorage.getItem('hanjaProgress')) || {};
        if (!progress[level] || progress[level] < index) {
            progress[level] = index;
            localStorage.setItem('hanjaProgress', JSON.stringify(progress));
        }
    }

    // 학습 진도 불러오기
    function getSavedIndex(level) {
        let progress = JSON.parse(localStorage.getItem('hanjaProgress')) || {};
        return progress[level] || 0;
    }

    // 학습완료 한자 저장 함수 (레벨별)
    function markHanjaAsLearned(hanja) {
        let learned = JSON.parse(localStorage.getItem('learnedHanja')) || {};
        if (!learned[selectedLevel]) {
            learned[selectedLevel] = [];
        }
        if (!learned[selectedLevel].includes(hanja)) {
            learned[selectedLevel].push(hanja);
            localStorage.setItem('learnedHanja', JSON.stringify(learned));
            loadLearnedHanjaManagement();
        }
    }

    // 학습완료 한자 해제 함수 (레벨별)
    function unmarkHanjaAsLearned(hanja) {
        let learned = JSON.parse(localStorage.getItem('learnedHanja')) || {};
        if (learned[selectedLevel]) {
            const index = learned[selectedLevel].indexOf(hanja);
            if (index > -1) {
                learned[selectedLevel].splice(index, 1);
                localStorage.setItem('learnedHanja', JSON.stringify(learned));
                loadLearnedHanjaManagement();
            }
        }
    }

    // 학습완료 한자 불러오기 (레벨별)
    function getLearnedHanja(level) {
        let learned = JSON.parse(localStorage.getItem('learnedHanja')) || {};
        return learned[level] || [];
    }

    // 학습완료 한자 관리 로딩 함수
    function loadLearnedHanjaManagement() {
        learnedHanjaList.innerHTML = '';
        const learnedHanja = getLearnedHanja(selectedLevel);

        if (learnedHanja.length === 0) {
            learnedHanjaList.innerText = '학습완료 한자가 없습니다.';
            return;
        }

        learnedHanja.forEach(hanja => {
            const div = document.createElement('div');
            div.classList.add('learned-hanja-item');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.id = `learned-${hanja}`;

            checkbox.addEventListener('change', () => {
                if (!checkbox.checked) {
                    unmarkHanjaAsLearned(hanja);
                }
            });

            const label = document.createElement('label');
            label.htmlFor = `learned-${hanja}`;
            label.innerText = hanja;

            div.appendChild(checkbox);
            div.appendChild(label);
            learnedHanjaList.appendChild(div);
        });
    }

    // 낱말게임 기능 구현

    // 퀴즈 게임 데이터 준비
    let quizQuestions = [];

    function startQuizGame() {
        showScreen(gameScreen);
        quizGame.style.display = 'block';
        matchingGame.style.display = 'none';
        initializeQuiz();
    }

    function initializeQuiz() {
        const totalQuestions = Math.min(20, hanjaData.length); // 총 20문제 또는 가능한 최대 문제 수
        quizQuestions = shuffleArray([...Array(hanjaData.length).keys()]).slice(0, totalQuestions).map(index => hanjaData[index]);
        currentScoreSpan.innerText = '0';
        let highScore = parseInt(localStorage.getItem('highScore')) || 0;
        highScoreSpan.innerText = highScore.toString();
        loadNextQuizQuestion();
    }

    function loadNextQuizQuestion() {
        if (quizQuestions.length === 0) {
            quizQuestion.innerHTML = '<b style="color: #ff6347;">퀴즈 완료!</b>'; // 질문을 bold 및 색상 변경
            quizOptions.innerHTML = '';
            quizFeedback.innerText = '';
            nextQuizBtn.style.display = 'none';
            // Update high score if necessary
            let currentScore = parseInt(currentScoreSpan.innerText);
            let highScore = parseInt(localStorage.getItem('highScore')) || 0;
            if (currentScore > highScore) {
                highScore = currentScore;
                localStorage.setItem('highScore', highScore.toString());
                highScoreSpan.innerText = highScore.toString();
            }
            return;
        }

        const currentQuestion = quizQuestions.shift();
        quizQuestion.innerHTML = `<b style="color: #1e90ff;">뜻이 "${currentQuestion.뜻}"인 한자는?</b>`; // 질문을 bold 및 색상 변경

        // 옵션 생성 (정답 포함 총 4개)
        let options = [currentQuestion.한자];
        while (options.length < 4 && hanjaData.length > options.length) {
            const randomHanja = hanjaData[Math.floor(Math.random() * hanjaData.length)].한자;
            if (!options.includes(randomHanja)) {
                options.push(randomHanja);
            }
        }
        options = shuffleArray(options);

        // 옵션 버튼 생성
        quizOptions.innerHTML = '';
        options.forEach(option => {
            const btn = document.createElement('button');
            btn.innerText = option;
            btn.classList.add('quiz-option-btn'); // 추가된 클래스
            btn.addEventListener('click', () => {
                if (option === currentQuestion.한자) {
                    quizFeedback.style.color = '#32cd32'; // 초록색
                    quizFeedback.innerText = `정답입니다! ${currentQuestion.뜻} (${currentQuestion.음})`;
                    let currentScore = parseInt(currentScoreSpan.innerText);
                    currentScore += 10; // 점수 10점씩 증가
                    currentScoreSpan.innerText = currentScore.toString();
                } else {
                    quizFeedback.style.color = '#ff0000'; // 빨간색
                    quizFeedback.innerText = '오답입니다.';
                    let currentScore = parseInt(currentScoreSpan.innerText);
                    currentScore -= 5; // 점수 -5점
                    currentScoreSpan.innerText = currentScore.toString();
                }
                nextQuizBtn.style.display = 'block';
            });
            quizOptions.appendChild(btn);
        });

        quizFeedback.innerText = '';
        nextQuizBtn.style.display = 'none';
    }

    nextQuizBtn.addEventListener('click', () => {
        loadNextQuizQuestion();
    });

    // 매칭 게임 데이터 준비
    let matchingPairs = [];
    let selectedItems = [];
    let matchedCount = 0;

    function startMatchingGame() {
        showScreen(gameScreen);
        quizGame.style.display = 'none';
        matchingGame.style.display = 'block';
        initializeMatchingGame();
    }

    function initializeMatchingGame() {
        matchingGameBoard.innerHTML = '';
        matchingFeedback.innerText = '';
        matchedCount = 0;
        isProcessing = false; // 초기화

        // 준비할 매칭 쌍을 선택 (최대 8쌍)
        const pairCount = Math.min(8, hanjaData.length);
        matchingPairs = shuffleArray([...Array(hanjaData.length).keys()]).slice(0, pairCount).map(index => hanjaData[index]);

        // 한자와 뜻을 섞어서 배치
        let items = [];
        matchingPairs.forEach(pair => {
            items.push({ type: 'hanja', text: pair.한자 });
            items.push({ type: 'meaning', text: pair.뜻 });
        });
        items = shuffleArray(items);

        // 카드 생성
        items.forEach((item, idx) => {
            const div = document.createElement('div');
            div.classList.add('match-item');
            div.dataset.type = item.type;
            div.dataset.text = item.text;
            div.innerText = item.text;
            div.addEventListener('click', handleMatchingClick);
            matchingGameBoard.appendChild(div);
        });

        selectedItems = [];
    }

    function handleMatchingClick(e) {
        const clickedItem = e.currentTarget;

        if (isProcessing || clickedItem.classList.contains('matched')) {
            return;
        }

        const alreadySelectedIndex = selectedItems.indexOf(clickedItem);
        if (alreadySelectedIndex !== -1) {
            // 이미 선택된 카드 클릭 시 해제
            clickedItem.style.backgroundColor = '#add8e6'; // 원래 색으로 되돌리기
            selectedItems.splice(alreadySelectedIndex, 1);
            return;
        }

        clickedItem.style.backgroundColor = '#90ee90'; // 선택된 색
        selectedItems.push(clickedItem);

        if (selectedItems.length === 2) {
            isProcessing = true;
            setTimeout(checkMatching, 500);
        }
    }

    function checkMatching() {
        const [item1, item2] = selectedItems;

        if (
            (item1.dataset.type === 'hanja' && item2.dataset.type === 'meaning' && isMatchingPair(item1.dataset.text, item2.dataset.text)) ||
            (item1.dataset.type === 'meaning' && item2.dataset.type === 'hanja' && isMatchingPair(item2.dataset.text, item1.dataset.text))
        ) {
            // 매칭 성공
            item1.classList.add('matched');
            item2.classList.add('matched');
            matchingFeedback.style.color = '#32cd32';
            matchingFeedback.innerText = '매칭 성공!';
            matchedCount += 1;
            // 진도 저장
            // markHanjaAsLearned(item1.dataset.type === 'hanja' ? item1.dataset.text : item2.dataset.text);
        } else {
            // 매칭 실패
            item1.style.backgroundColor = '#add8e6';
            item2.style.backgroundColor = '#add8e6';
            matchingFeedback.style.color = '#ff0000';
            matchingFeedback.innerText = '매칭 실패!';
        }
        selectedItems = [];
        isProcessing = false;

        if (matchedCount === matchingPairs.length) {
            matchingFeedback.innerText += ' 모든 매칭을 완료했습니다!';
        }
    }

    function isMatchingPair(hanja, meaning) {
        return hanjaData.some(item => item.한자 === hanja && item.뜻 === meaning);
    }

    function markHanjaAsLearned(hanja) {
        let learned = JSON.parse(localStorage.getItem('learnedHanja')) || {};
        if (!learned[selectedLevel]) {
            learned[selectedLevel] = [];
        }
        if (!learned[selectedLevel].includes(hanja)) {
            learned[selectedLevel].push(hanja);
            localStorage.setItem('learnedHanja', JSON.stringify(learned));
            loadLearnedHanjaManagement();
        }
    }

    restartMatchingBtn.addEventListener('click', () => {
        initializeMatchingGame();
    });

    // 학습완료 한자 관리 로딩 함수
    function loadLearnedHanjaManagement() {
        learnedHanjaList.innerHTML = '';
        const learnedHanja = getLearnedHanja(selectedLevel);

        if (learnedHanja.length === 0) {
            learnedHanjaList.innerText = '학습완료 한자가 없습니다.';
            return;
        }

        learnedHanja.forEach(hanja => {
            const div = document.createElement('div');
            div.classList.add('learned-hanja-item');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.id = `learned-${hanja}`;

            checkbox.addEventListener('change', () => {
                if (!checkbox.checked) {
                    unmarkHanjaAsLearned(hanja);
                }
            });

            const label = document.createElement('label');
            label.htmlFor = `learned-${hanja}`;
            label.innerText = hanja;

            div.appendChild(checkbox);
            div.appendChild(label);
            learnedHanjaList.appendChild(div);
        });
    }

    // Cordova deviceready 이벤트 핸들링
    document.addEventListener('deviceready', () => {
        console.log('Cordova is ready');
        // Cordova 관련 초기화 작업 가능
    }, false);
});
