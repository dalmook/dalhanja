// script.js

document.addEventListener('DOMContentLoaded', () => {

    // ---------------------------
    // 1. 변수 선언
    // ---------------------------

    // 화면 요소
    const difficultyScreen = document.getElementById('difficulty-screen');
    const mainMenuScreen = document.getElementById('main-menu-screen');
    const studyScreen = document.getElementById('study-screen');
    const gameScreen = document.getElementById('game-screen');
    const manageLearnedHanjaScreen = document.getElementById('manage-learned-hanja-screen');

    // 난이도 선택 버튼
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');

    // 메인 메뉴 버튼
    const studyBtn = document.getElementById('study-btn');
    const gameBtn = document.getElementById('game-btn');
    const manageLearnedHanjaBtn = document.getElementById('manage-learned-hanja-btn');
    const backToDifficultyBtn = document.getElementById('back-to-difficulty');

    // 관리 화면 버튼
    const backToMenuFromManagedBtn = document.getElementById('back-to-menu-from-managed');

    // 학습하기 화면 요소
    const studyLevelSpan = document.getElementById('study-level');
    const hanjaCharacter = document.getElementById('hanja-character');
    const hanjaMeaning = document.getElementById('hanja-meaning');
    const hanjaReading = document.getElementById('hanja-reading');
    const hanjaChinese = document.getElementById('hanja-chinese');
    const speakBtn = document.getElementById('speak-btn');
    const writingCanvas = document.getElementById('writing-canvas');
    const clearCanvasBtn = document.getElementById('clear-canvas-btn');
    const goFirstBtn = document.getElementById('go-first-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const orderOptions = document.getElementsByName('order');
    const markCompletedCheckbox = document.getElementById('mark-completed');

    // 낱말게임 화면 요소
    const quizMeaningReadingBtn = document.getElementById('quiz-meaning-reading-btn');
    const quizHanjaBtn = document.getElementById('quiz-hanja-btn');
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
    const backToMenuFromGameBtn = document.getElementById('back-to-menu-from-game');

    const currentScoreSpan = document.getElementById('current-score');
    const highScoreSpan = document.getElementById('high-score');

    // 학습완료 한자 관리 요소
    const learnedHanjaList = document.getElementById('learned-hanja-list');

    // 퀴즈 유형 버튼 요소
    const backToMenuFromStudyBtn = document.getElementById('back-to-menu-from-study'); // 수정된 변수명

    // ---------------------------
    // 2. 전역 변수 선언
    // ---------------------------

    let selectedLevel = '1'; // 현재 선택된 난이도 (예: '1', '2', 등)
    let selectedQuizType = ''; // 현재 선택된 퀴즈 유형 ('meaningReading' 또는 'hanja')
    let quizQuestions = []; // 퀴즈 질문 배열
    let hanjaData = []; // 한자 데이터 배열 (필요에 따라 초기화 또는 로드)
    let currentIndex = 0;
    let isRandom = false;
    let shuffledIndices = [];
    let isProcessing = false; // 매칭 게임 처리 중 여부
    let svgLoopInterval = null; // SVG 애니메이션 루프 타이머
    let currentUtterances = [];

    // ---------------------------
    // 3. 헬퍼 함수
    // ---------------------------

    // 배열 섞기 함수
    function shuffleArray(array) {
        for (let i = array.length -1; i >0; i--) {
            const j = Math.floor(Math.random() * (i+1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // 최고 점수 관련 함수들

    // 최고 점수 가져오기 함수
    function getHighScores() {
        return JSON.parse(localStorage.getItem('highScores')) || {};
    }

    // 특정 난이도의 최고 점수 가져오기 함수
    function getHighScore(level) {
        const highScores = getHighScores();
        return highScores[level] || 0;
    }

    // 특정 난이도의 최고 점수 저장하기 함수
    function setHighScore(level, score) {
        const highScores = getHighScores();
        if (!highScores[level] || score > highScores[level]) {
            highScores[level] = score;
            localStorage.setItem('highScores', JSON.stringify(highScores));
            updateHighScoreUI(level, score);
        }
    }

    // 최고 점수 UI 업데이트 함수
    function updateHighScoreUI(level, score) {
        const highScoreElement = document.getElementById(`high-score-${level}`);
        if (highScoreElement) {
            highScoreElement.innerText = `${level} 최고 점수: ${score}점`;
        }
        // 현재 퀴즈 화면의 최고 점수 업데이트
        if (selectedLevel === level) {
            highScoreSpan.innerText = score.toString();
        }
    }

    // 초기 로드 시 모든 최고 점수 UI 업데이트
    function initializeHighScoresUI() {
        const highScores = getHighScores();
        for (const level in highScores) {
            if (highScores.hasOwnProperty(level)) {
                updateHighScoreUI(level, highScores[level]);
            }
        }
    }

    // 학습완료 한자 관리 함수

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
    function getLearnedHanja() {
        return JSON.parse(localStorage.getItem('learnedHanja')) || {};
    }

    // 학습완료 한자 관리 화면 로딩 함수
    function loadLearnedHanjaManagement() {
        if (!learnedHanjaList) return;

        learnedHanjaList.innerHTML = '';
        const learnedHanja = getLearnedHanja()[selectedLevel] || [];

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

    // 화면 전환 함수
    function showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
        if (screen === manageLearnedHanjaScreen) {
            loadLearnedHanjaManagement();
        }
    }

    // ---------------------------
    // 4. 이벤트 핸들러 설정
    // ---------------------------

    // 난이도 선택 버튼 클릭 이벤트
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const levelNumber = btn.getAttribute('data-level');
            selectedLevel = levelNumber; // 레벨은 "1", "2", 등으로 설정
            const selectedLevelTitle = document.getElementById('selected-level-title');
            if (selectedLevelTitle) {
                selectedLevelTitle.innerText = `급수: ${selectedLevel}`;
            }
            studyLevelSpan.innerText = levelNumber; // 학습하기 화면에 표시
            loadHanjaData();
            showScreen(mainMenuScreen);
        });
    });

    // 메인 메뉴 버튼 클릭 이벤트
    studyBtn.addEventListener('click', () => {
        showScreen(studyScreen);
        initializeStudy(); // 학습하기 초기화
    });

    gameBtn.addEventListener('click', () => {
        showScreen(gameScreen);
        quizGame.style.display = 'block';
        matchingGame.style.display = 'none';
        initializeQuiz('meaningReading');
        // 기존 quizGame 초기화 호출 제거
    });

    manageLearnedHanjaBtn.addEventListener('click', () => {
        showScreen(manageLearnedHanjaScreen);
    });

    backToDifficultyBtn.addEventListener('click', () => {
        showScreen(difficultyScreen);
    });

    backToMenuFromManagedBtn.addEventListener('click', () => {
        showScreen(mainMenuScreen);
    });

    backToMenuFromStudyBtn.addEventListener('click', () => { // 수정된 변수명
        showScreen(mainMenuScreen);
    });

    backToMenuFromGameBtn.addEventListener('click', () => {
        showScreen(mainMenuScreen);
    });

    // 퀴즈 유형 버튼 클릭 이벤트
    if (quizMeaningReadingBtn) {
        quizMeaningReadingBtn.addEventListener('click', () => {
            showScreen(gameScreen);
            quizGame.style.display = 'block';
            matchingGame.style.display = 'none';
            initializeQuiz('meaningReading'); // 퀴즈(뜻음) 초기화
        });
    }

    if (quizHanjaBtn) {
        quizHanjaBtn.addEventListener('click', () => {
            showScreen(gameScreen);
            quizGame.style.display = 'block';
            matchingGame.style.display = 'none';
            initializeQuiz('hanja'); // 퀴즈(한자) 초기화
        });
    }

    // 낱말게임 옵션 버튼 클릭 이벤트
    /*
    quizGameBtn.addEventListener('click', () => {
        initializeQuiz();
        startQuizGame();
    });
    */

    matchingGameBtn.addEventListener('click', () => {
        startMatchingGame();
    });

    // ---------------------------
    // 5. 학습하기 초기화 함수
    // ---------------------------

    function initializeStudy() {
        // 학습하기 초기화 로직을 여기에 추가
        // 예: 학습할 한자 로드, 쓰기 순서 SVG 표시 등
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

    // ---------------------------
    // 6. TTS (텍스트 투 스피치) 기능
    // ---------------------------

    function playHanjaTTS() {
        if (!currentHanja) return;

        // 웹 브라우저의 SpeechSynthesis 사용 시 기존 음성 중지
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        // 기존 utterances 배열 초기화
        currentUtterances = [];

        const koreanText = `${currentHanja.뜻}. ${currentHanja.음}`;
        const chineseText = currentHanja.한자; // 발음을 중국어로 변경

        // 안드로이드 환경에서 TTS 지원 시
        if (typeof Android !== 'undefined' && Android.speak) {      
            Android.speak(koreanText, chineseText); // 두 개의 파라미터로 전달
        }
        // 웹 브라우저에서 TTS 지원 시
        else if ('speechSynthesis' in window) {
            const utteranceKorean = new SpeechSynthesisUtterance(koreanText);
            utteranceKorean.lang = 'ko-KR';
            window.speechSynthesis.speak(utteranceKorean);
            currentUtterances.push(utteranceKorean);

            const utteranceChinese = new SpeechSynthesisUtterance(chineseText);
            utteranceChinese.lang = 'zh-CN';
            window.speechSynthesis.speak(utteranceChinese);
            currentUtterances.push(utteranceChinese);
        }
        else {
            console.warn("이 브라우저는 음성 합성을 지원하지 않습니다.");
        }
    }

    // ---------------------------
    // 7. 퀴즈 게임 함수
    // ---------------------------

    // 퀴즈 초기화 함수
    function initializeQuiz(quizType) {
        selectedQuizType = quizType; // 현재 퀴즈 유형 설정

        // 한자 데이터가 로드되지 않았다면 로드 대기
        if (hanjaData.length === 0) {
            console.warn('한자 데이터가 로드되지 않았습니다.');
            return;
        }

        // 낱말게임 데이터 로드
        let quizData = [];
        if (selectedQuizType === 'meaningReading') {
            quizData = hanjaData.filter(item => item.뜻 && item.음); // 뜻과 음이 있는 한자 필터링
        } else if (selectedQuizType === 'hanja') {
            quizData = hanjaData.filter(item => item.뜻 && item.음); // 뜻과 음이 있는 한자 필터링
        }

        const totalQuestions = Math.min(20, quizData.length); // 총 20문제 또는 가능한 최대 문제 수
        quizQuestions = shuffleArray([...Array(quizData.length).keys()])
                            .slice(0, totalQuestions)
                            .map(index => quizData[index]);
        currentScoreSpan.innerText = '0';

        // 선택된 난이도에 따른 최고 점수 불러오기
        let highScore = getHighScore(selectedLevel);
        highScoreSpan.innerText = highScore.toString();

        loadNextQuizQuestion();
    }

    // 다음 퀴즈 질문 로드 함수
    function loadNextQuizQuestion() {
        if (quizQuestions.length === 0) {
            quizQuestion.innerHTML = '<b style="color: #ff6347;">퀴즈 완료!</b>'; // 질문을 bold 및 색상 변경
            quizOptions.innerHTML = '';
            quizFeedback.innerText = '';
            nextQuizBtn.style.display = 'none';

            // 현재 점수와 최고 점수 비교 및 업데이트
            let currentScore = parseInt(currentScoreSpan.innerText);
            let highScore = getHighScore(selectedLevel);
            if (currentScore > highScore) {
                setHighScore(selectedLevel, currentScore);
                alert(`축하합니다! 새로운 최고 점수: ${currentScore}점`);
            } else {
                alert(`현재 점수: ${currentScore}점. 최고 점수: ${highScore}점`);
            }
            return;
        }

        const currentQuestion = quizQuestions.shift();

        if (selectedQuizType === 'meaningReading') {
            // 퀴즈(뜻음): 뜻과 음을 보여주고 한자를 맞추는 퀴즈
            quizQuestion.innerHTML = `"<span style="color: #1e90ff; font-weight: bold;">${currentQuestion.뜻} (${currentQuestion.음})</span>" 인 한자는?`;

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
                btn.classList.add('quiz-option-btn');
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
                        if (currentScore < 0) currentScore = 0; // 음수 방지
                        currentScoreSpan.innerText = currentScore.toString();
                    }
                    nextQuizBtn.style.display = 'block';
                });
                quizOptions.appendChild(btn);
            });

        } else if (selectedQuizType === 'hanja') {
            // 퀴즈(한자): 한자를 보여주고 뜻과 음을 맞추는 퀴즈
            quizQuestion.innerHTML = `<span style="color: #1e90ff;"> "${currentQuestion.한자}"</span> 의 뜻과 음은 무엇인가요?`;

            // 정답 조합
            let correctAnswer = `${currentQuestion.뜻} (${currentQuestion.음})`;

            // 옵션 생성 (정답 포함 총 4개)
            let options = [correctAnswer];
            while (options.length < 4 && hanjaData.length > options.length) {
                const randomHanja = hanjaData[Math.floor(Math.random() * hanjaData.length)];
                const randomAnswer = `${randomHanja.뜻} (${randomHanja.음})`;
                if (!options.includes(randomAnswer)) {
                    options.push(randomAnswer);
                }
            }
            options = shuffleArray(options);

            // 옵션 버튼 생성
            quizOptions.innerHTML = '';
            options.forEach(option => {
                const btn = document.createElement('button');
                btn.innerText = option;
                btn.classList.add('quiz-option-btn');
                btn.addEventListener('click', () => {
                    if (option === correctAnswer) {
                        quizFeedback.style.color = '#32cd32'; // 초록색
                        quizFeedback.innerText = `정답입니다! ${currentQuestion.한자} (${currentQuestion.음})`;
                        let currentScore = parseInt(currentScoreSpan.innerText);
                        currentScore += 10; // 점수 10점씩 증가
                        currentScoreSpan.innerText = currentScore.toString();
                    } else {
                        quizFeedback.style.color = '#ff0000'; // 빨간색
                        quizFeedback.innerText = '오답입니다.';
                        let currentScore = parseInt(currentScoreSpan.innerText);
                        currentScore -= 5; // 점수 -5점
                        if (currentScore < 0) currentScore = 0; // 음수 방지
                        currentScoreSpan.innerText = currentScore.toString();
                    }
                    nextQuizBtn.style.display = 'block';
                });
                quizOptions.appendChild(btn);
            });
        }

        // Reset quizFeedback and hide nextQuizBtn
        quizFeedback.innerText = '';
        nextQuizBtn.style.display = 'none';
    }

    // 다음 퀴즈 로드 버튼 이벤트
    nextQuizBtn.addEventListener('click', () => {
        loadNextQuizQuestion();
    });

    // ---------------------------
    // 8. 한자 데이터 로드
    // ---------------------------

    // 한자 데이터를 로드하는 함수 (예시: JSON 파일에서 가져오기)
    function loadHanjaData() {
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                // JSON 구조에 맞게 "학습하기" 섹션 로드
                hanjaData = data[selectedLevel] && data[selectedLevel]["학습하기"] ? data[selectedLevel]["학습하기"] : [];
                
                // 낱말게임 데이터 로드 (추후 필요 시)
                // 예: quizData = data[selectedLevel] && data[selectedLevel]["낱말게임"] ? data[selectedLevel]["낱말게임"] : [];

                // 퀴즈 유형이 선택되어 있다면, 해당 유형으로 초기화
                if (selectedQuizType) {
                    initializeQuiz(selectedQuizType);
                }

                // 학습하기 초기화 (필요 시)
                initializeStudy();
            })
            .catch(error => {
                console.error('Error loading Hanja data:', error);
                hanjaData = [];
            });
    }

    // ---------------------------
    // 9. 낱말게임 시작 함수
    // ---------------------------

    // 기존 퀴즈 시작 함수 제거
    /*
    function startQuizGame() {
        showScreen(gameScreen);
        quizGame.style.display = 'block';
        matchingGame.style.display = 'none';
        initializeQuiz();
    }
    */

    // ---------------------------
    // 10. 매칭 게임 함수
    // ---------------------------

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

            // 매칭 성공한 한자 학습 완료로 표시
            // const hanja = item1.dataset.type === 'hanja' ? item1.dataset.text : item2.dataset.text;
            // markHanjaAsLearned(hanja);

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

    if (restartMatchingBtn) {
        restartMatchingBtn.addEventListener('click', () => {
            initializeMatchingGame();
        });
    }

    // ---------------------------
    // 11. 한자 표시 함수 (학습하기 화면)
    // ---------------------------

    function displayHanja() {
        if (hanjaData.length === 0) return;
        const learnedHanja = getLearnedHanja()[selectedLevel] || [];
        const availableIndices = shuffledIndices.filter(index => !learnedHanja.includes(hanjaData[index].한자));
        if (availableIndices.length === 0) {
            hanjaCharacter.innerText = '모든 한자를 학습 완료했습니다!';
            hanjaMeaning.innerText = '';
            hanjaReading.innerText = '';
            hanjaChinese.innerText = '';
            writingCanvas.getContext('2d').clearRect(0, 0, writingCanvas.width, writingCanvas.height);
            document.getElementById('stroke-order-svg').src = ''; // SVG 초기화
            markCompletedCheckbox.checked = false;
            markCompletedCheckbox.disabled = true;
            currentHanja = null;
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
        const ctxCanvas = writingCanvas.getContext('2d');
        ctxCanvas.clearRect(0, 0, writingCanvas.width, writingCanvas.height);

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
            ctxCanvas.font = `${fontSize}px 'hanchanzhengkaiti', sans-serif`;
            const textMetrics = ctxCanvas.measureText(hanjaText);
            const textWidth = textMetrics.width;
            const textHeight = fontSize; // 대략적인 텍스트 높이

            if (textWidth <= canvasWidth * 0.8 && textHeight <= canvasHeight * 0.8) {
                break;
            }
            fontSize -= 10;
        }
        // **동적 폰트 크기 설정 끝**

        ctxCanvas.globalAlpha = 0.3; // 반투명
        ctxCanvas.textAlign = 'center';
        ctxCanvas.textBaseline = 'middle';
        ctxCanvas.fillStyle = '#000000';
        ctxCanvas.fillText(hanjaText, canvasWidth / 2, canvasHeight / 2);
        ctxCanvas.globalAlpha = 1.0; // 다시 불투명하게

        // **쓰기순서 SVG 표시 시작**
        const strokeOrderSvg = document.getElementById('stroke-order-svg');
        if (currentHanja.쓰기순서) {
            // 기존 타이머가 있다면 정리
            if (svgLoopInterval) {
                clearInterval(svgLoopInterval);
            }

            // 현재 한자의 duration 값 가져오기 (밀리초 단위)
            const animationDuration = currentHanja.duration ? currentHanja.duration + 2000 : 5000; // 기본값 5000ms

            // SVG 로드 시 캐싱 방지를 위해 타임스탬프 추가
            strokeOrderSvg.src = `${currentHanja.쓰기순서}?t=${new Date().getTime()}`;

            // 애니메이션이 끝난 후 SVG를 다시 로드하여 애니메이션 재시작
            svgLoopInterval = setInterval(() => {
                strokeOrderSvg.src = `${currentHanja.쓰기순서}?t=${new Date().getTime()}`;
            }, animationDuration);
        } else {
            strokeOrderSvg.src = ''; // SVG 초기화

            // 기존 타이머가 있다면 정리
            if (svgLoopInterval) {
                clearInterval(svgLoopInterval);
                svgLoopInterval = null;
            }
        }
        // **쓰기순서 SVG 표시 끝**

        // 학습완료 체크박스 상태 설정
        markCompletedCheckbox.disabled = false;
        markCompletedCheckbox.checked = learnedHanja.includes(currentHanja.한자);
    }

    // ---------------------------
    // 12. Cordova deviceready 이벤트 핸들링
    // ---------------------------

    document.addEventListener('deviceready', () => {
        console.log('Cordova is ready');
        // Cordova 관련 초기화 작업 가능
    }, false);

    // ---------------------------
    // 13. 한자 데이터 로드
    // ---------------------------

    // 한자 데이터를 로드하는 함수 (예시: JSON 파일에서 가져오기)
    function loadHanjaData() {
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                // JSON 구조에 맞게 "학습하기" 섹션 로드
                hanjaData = data[selectedLevel] && data[selectedLevel]["학습하기"] ? data[selectedLevel]["학습하기"] : [];
                
                // 낱말게임 데이터 로드 (추후 필요 시)
                // 예: quizData = data[selectedLevel] && data[selectedLevel]["낱말게임"] ? data[selectedLevel]["낱말게임"] : [];

                // 퀴즈 유형이 선택되어 있다면, 해당 유형으로 초기화
                if (selectedQuizType) {
                    initializeQuiz(selectedQuizType);
                }

                // 학습하기 초기화 (필요 시)
                initializeStudy();
            })
            .catch(error => {
                console.error('Error loading Hanja data:', error);
                hanjaData = [];
            });
    }

    // ---------------------------
    // 14. 낱말게임 기능 구현
    // ---------------------------

    // 퀴즈 점수 업데이트 함수
    function updateScore(currentLevel, currentScore) {
        const highScore = getHighScore(currentLevel);
        if (currentScore > highScore) {
            setHighScore(currentLevel, currentScore);
            alert(`축하합니다! 새로운 최고 점수: ${currentScore}점`);
        } else {
            alert(`현재 점수: ${currentScore}점. 최고 점수: ${highScore}점`);
        }
    }

    // ---------------------------
    // 15. 학습하기 초기화 및 진도 관리
    // ---------------------------

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

    // ---------------------------
    // 16. 퀴즈 게임 시작 시 호출되는 함수
    // ---------------------------

    function startQuizGame() {
        showScreen(gameScreen);
        quizGame.style.display = 'block';
        matchingGame.style.display = 'none';
        // 퀴즈 유형에 따라 초기화 함수가 이미 호출됨
    }

    // ---------------------------
    // 17. 초기화 및 최고 점수 UI 초기화
    // ---------------------------

    // 초기화 및 최고 점수 UI 초기화
    initializeHighScoresUI();

    // ---------------------------
    // 18. TextToSpeech 기능 구현
    // ---------------------------

    if (speakBtn) {
        speakBtn.addEventListener('click', () => {
            playHanjaTTS();
        });
    }

    // ---------------------------
    // 19. 캔버스 쓰기 기능 구현
    // ---------------------------

    // 캔버스 설정
    const ctxCanvas = writingCanvas.getContext('2d');
    ctxCanvas.lineWidth = 5;
    ctxCanvas.lineCap = 'round'; // 선 끝을 둥글게
    ctxCanvas.lineJoin = 'round'; // 선이 만나는 지점을 둥글게
    let drawing = false;

    writingCanvas.addEventListener('mousedown', startDrawing);
    writingCanvas.addEventListener('mouseup', stopDrawing);
    writingCanvas.addEventListener('mousemove', drawCanvas);
    writingCanvas.addEventListener('touchstart', startDrawing, {passive: false});
    writingCanvas.addEventListener('touchend', stopDrawing);
    writingCanvas.addEventListener('touchmove', drawCanvas, {passive: false});

    function startDrawing(e) {
        e.preventDefault();
        drawing = true;
        ctxCanvas.beginPath();
        const { x, y } = getCanvasCoordinates(e);
        ctxCanvas.moveTo(x, y);
    }

    function stopDrawing(e) {
        e.preventDefault();
        drawing = false;
    }

    function drawCanvas(e) {
        if (!drawing) return;
        e.preventDefault();
        const { x, y } = getCanvasCoordinates(e);
        ctxCanvas.lineTo(x, y);
        ctxCanvas.stroke();
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

    // 쓰기 초기화 버튼
    if (clearCanvasBtn) {
        clearCanvasBtn.addEventListener('click', () => {
            ctxCanvas.clearRect(0, 0, writingCanvas.width, writingCanvas.height);
            displayHanja(); // 한자 가이드 다시 그리기
        });
    }

    // 처음으로 버튼
    if (goFirstBtn) {
        goFirstBtn.addEventListener('click', () => {
            currentIndex = 0; // 첫 번째 한자로 설정
            displayHanja(); // 한자 표시 함수 호출
            saveProgress(selectedLevel, currentIndex); // 진도 저장
            playHanjaTTS(); // TTS 재생
        });
    }

    // 이전 버튼
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                displayHanja();
                saveProgress(selectedLevel, currentIndex);
                playHanjaTTS();
            }
        });
    }

    // 다음 버튼
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentIndex < hanjaData.length - 1) {
                currentIndex++;
                displayHanja();
                saveProgress(selectedLevel, currentIndex);
                playHanjaTTS();
            }
        });
    }

    // 순서 변경 시 초기화
    orderOptions.forEach(option => {
        option.addEventListener('change', () => {
            initializeStudy();
        });
    });

    // 학습완료 체크박스 이벤트
    if (markCompletedCheckbox) {
        markCompletedCheckbox.addEventListener('change', () => {
            const hanja = currentHanja ? currentHanja.한자 : null;
            if (hanja) {
                if (markCompletedCheckbox.checked) {
                    markHanjaAsLearned(hanja);
                } else {
                    unmarkHanjaAsLearned(hanja);
                }
                displayHanja(); // 업데이트 후 표시
                playHanjaTTS();
            }
        });
    }

    // ---------------------------
    // 20. 매칭 게임 함수
    // ---------------------------

    // 매칭 게임 데이터 준비
    // (이미 위에서 정의되었으므로 중복 제거)

    // ---------------------------
    // 21. 한자 표시 함수 (학습하기 화면)
    // ---------------------------

    function displayHanja() {
        if (hanjaData.length === 0) return;
        const learnedHanja = getLearnedHanja()[selectedLevel] || [];
        const availableIndices = shuffledIndices.filter(index => !learnedHanja.includes(hanjaData[index].한자));
        if (availableIndices.length === 0) {
            hanjaCharacter.innerText = '모든 한자를 학습 완료했습니다!';
            hanjaMeaning.innerText = '';
            hanjaReading.innerText = '';
            hanjaChinese.innerText = '';
            writingCanvas.getContext('2d').clearRect(0, 0, writingCanvas.width, writingCanvas.height);
            document.getElementById('stroke-order-svg').src = ''; // SVG 초기화
            markCompletedCheckbox.checked = false;
            markCompletedCheckbox.disabled = true;
            currentHanja = null;
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
        const ctxCanvas = writingCanvas.getContext('2d');
        ctxCanvas.clearRect(0, 0, writingCanvas.width, writingCanvas.height);

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
            ctxCanvas.font = `${fontSize}px 'hanchanzhengkaiti', sans-serif`;
            const textMetrics = ctxCanvas.measureText(hanjaText);
            const textWidth = textMetrics.width;
            const textHeight = fontSize; // 대략적인 텍스트 높이

            if (textWidth <= canvasWidth * 0.8 && textHeight <= canvasHeight * 0.8) {
                break;
            }
            fontSize -= 10;
        }
        // **동적 폰트 크기 설정 끝**

        ctxCanvas.globalAlpha = 0.3; // 반투명
        ctxCanvas.textAlign = 'center';
        ctxCanvas.textBaseline = 'middle';
        ctxCanvas.fillStyle = '#000000';
        ctxCanvas.fillText(hanjaText, canvasWidth / 2, canvasHeight / 2);
        ctxCanvas.globalAlpha = 1.0; // 다시 불투명하게

        // **쓰기순서 SVG 표시 시작**
        const strokeOrderSvg = document.getElementById('stroke-order-svg');
        if (currentHanja.쓰기순서) {
            // 기존 타이머가 있다면 정리
            if (svgLoopInterval) {
                clearInterval(svgLoopInterval);
            }

            // 현재 한자의 duration 값 가져오기 (밀리초 단위)
            const animationDuration = currentHanja.duration ? currentHanja.duration + 2000 : 5000; // 기본값 5000ms

            // SVG 로드 시 캐싱 방지를 위해 타임스탬프 추가
            strokeOrderSvg.src = `${currentHanja.쓰기순서}?t=${new Date().getTime()}`;

            // 애니메이션이 끝난 후 SVG를 다시 로드하여 애니메이션 재시작
            svgLoopInterval = setInterval(() => {
                strokeOrderSvg.src = `${currentHanja.쓰기순서}?t=${new Date().getTime()}`;
            }, animationDuration);
        } else {
            strokeOrderSvg.src = ''; // SVG 초기화

            // 기존 타이머가 있다면 정리
            if (svgLoopInterval) {
                clearInterval(svgLoopInterval);
                svgLoopInterval = null;
            }
        }
        // **쓰기순서 SVG 표시 끝**

        // 학습완료 체크박스 상태 설정
        markCompletedCheckbox.disabled = false;
        markCompletedCheckbox.checked = learnedHanja.includes(currentHanja.한자);
    }

    // ---------------------------
    // 22. 초기화 및 최고 점수 UI 초기화
    // ---------------------------

    // 초기화 및 최고 점수 UI 초기화
    // 이미 초기화 함수가 호출되었습니다.

});
