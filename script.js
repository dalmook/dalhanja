document.addEventListener('DOMContentLoaded', () => {
    // 학습하기 화면 요소
    const studyLevelSpan = document.getElementById('study-level');
    const hanjaCharacter = document.getElementById('hanja-character');
    const hanjaMeaning = document.getElementById('hanja-meaning');
    const hanjaReading = document.getElementById('hanja-reading');
    const hanjaChinese = document.getElementById('hanja-chinese'); // 중국어 발음 추가
    const speakBtn = document.getElementById('speak-btn');
    const writingCanvas = document.getElementById('writing-canvas');
    const clearCanvasBtn = document.getElementById('clear-canvas-btn');
    const goFirstBtn = document.getElementById('go-first-btn'); // 처음으로 버튼 추가
    const strokeOrderSvg = document.getElementById('stroke-order-svg'); // SVG 요소
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const orderOptions = document.getElementsByName('order');
    const markCompletedCheckbox = document.getElementById('mark-completed');

    const ctx = writingCanvas.getContext('2d');
    ctx.lineWidth = 3; // 선 두께 설정
    ctx.lineCap = 'round'; // 선 끝 모양 설정
    ctx.lineJoin = 'round'; // 선이 만나는 지점 모양 설정

    let hanjaData = [];
    let currentIndex = 0;
    let selectedLevel = 'level1'; // 예시 레벨, 필요에 따라 설정
    let isRandom = false;
    let shuffledIndices = [];

    let svgLoopTimeout = null; // SVG 애니메이션 루프 타이머

    // 학습하기 초기화 함수
    function initializeStudy() {
        currentIndex = getSavedIndex(selectedLevel) || 0;
        isRandom = Array.from(orderOptions).find(r => r.checked).value === 'random';
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
            Android.speak(`${koreanText}. ${chineseText}`);
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

    // 쓰기 초기화 버튼
    clearCanvasBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, writingCanvas.width, writingCanvas.height);
        displayHanja(); // 한자 가이드 다시 그리기
    });

    // 처음으로 버튼 추가
    if (goFirstBtn) {
        goFirstBtn.addEventListener('click', () => { // 추가된 부분
            currentIndex = 0; // 첫 번째 한자로 설정
            displayHanja(); // 한자 표시 함수 호출
            saveProgress(selectedLevel, currentIndex); // 진도 저장
        });
    } else {
        console.error('go-first-btn 요소를 찾을 수 없습니다.');
    }

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

    // 한자 데이터 로드 함수
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
        const learnedHanja = getLearnedHanja(selectedLevel);
        const availableIndices = shuffledIndices.filter(index => !learnedHanja.includes(hanjaData[index].한자));
        if (availableIndices.length === 0) {
            hanjaCharacter.innerText = '모든 한자를 학습 완료했습니다!';
            hanjaMeaning.innerText = '';
            hanjaReading.innerText = '';
            hanjaChinese.innerText = ''; // 중국어 발음 초기화
            ctx.clearRect(0, 0, writingCanvas.width, writingCanvas.height);
            strokeOrderSvg.data = ''; // SVG 초기화
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

        // **동적 폰트 크기 설정 시작**
        const canvasWidth = writingCanvas.width;
        const canvasHeight = writingCanvas.height;
        const hanjaText = currentHanja.한자;
        const maxFontSize = 200; // 최대 폰트 크기
        const minFontSize = 50;  // 최소 폰트 크기
        let fontSize = maxFontSize;

        // 원하는 글꼴로 변경 (예: 'hanchanzhengkaiti')
        while (fontSize > minFontSize) {
            ctx.font = `${fontSize}px 'hanchanzhengkaiti', sans-serif`;
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
            // SVG src 설정 (캐싱 방지)
            strokeOrderSvg.data = currentHanja.쓰기순서 + '?t=' + new Date().getTime();

            // 기존 타이머가 있다면 정리
            if (svgLoopTimeout) {
                clearTimeout(svgLoopTimeout);
            }

            // SVG 로드 완료 시 애니메이션 시간 계산
            strokeOrderSvg.addEventListener('load', () => {
                const svgDocument = strokeOrderSvg.contentDocument;
                if (!svgDocument) {
                    console.error('SVG contentDocument를 가져올 수 없습니다.');
                    return;
                }

                // 획 수 계산: ID가 'make-me-a-hanzi-animation-숫자'인 요소 수
                const strokeAnimations = svgDocument.querySelectorAll('[id^="make-me-a-hanzi-animation-"]');
                const numStrokes = strokeAnimations.length;

                // 각 애니메이션의 dur와 delay 가져오기
                let totalDuration = 0;
                strokeAnimations.forEach(animation => {
                    const style = window.getComputedStyle(animation);
                    const animationName = style.getPropertyValue('animation-name').trim();
                    const animationDuration = parseFloat(style.getPropertyValue('animation-duration')) * 1000; // 초 -> ms
                    const animationDelay = parseFloat(style.getPropertyValue('animation-delay')) * 1000; // 초 -> ms

                    const endTime = animationDelay + animationDuration;
                    if (endTime > totalDuration) {
                        totalDuration = endTime;
                    }
                });

                // 총 애니메이션 지속 시간에 여유 시간 추가 (예: 100ms)
                totalDuration += 100;

                // 애니메이션 완료 후 SVG 재로드 타이머 설정
                svgLoopTimeout = setTimeout(() => {
                    strokeOrderSvg.data = currentHanja.쓰기순서 + '?t=' + new Date().getTime();
                }, totalDuration);
            }, { once: true }); // 이벤트 리스너는 한 번만 실행
        } else {
            strokeOrderSvg.data = ''; // SVG 초기화

            // 기존 타이머가 있다면 정리
            if (svgLoopTimeout) {
                clearTimeout(svgLoopTimeout);
                svgLoopTimeout = null;
            }
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
        const learnedHanjaList = document.getElementById('learned-hanja-list');
        if (!learnedHanjaList) return; // 요소가 없으면 종료
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

    // 폰트 로드 대기
    document.fonts.ready.then(() => {
        // 폰트가 로드된 후 초기화
        loadHanjaData();
    }).catch((error) => {
        console.error('폰트 로드 오류:', error);
        loadHanjaData(); // 폰트 로드 실패 시에도 데이터 로드 시도
    });

    // Cordova deviceready 이벤트 핸들링
    document.addEventListener('deviceready', () => {
        console.log('Cordova is ready');
        // Cordova 관련 초기화 작업 가능
    }, false);
});
