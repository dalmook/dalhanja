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

    let selectedLevel = '';

    // 난이도 선택 시
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedLevel = button.getAttribute('data-level');
            document.getElementById('selected-level-title').innerText = `레벨: ${selectedLevel}`;
            document.getElementById('study-level').innerText = selectedLevel;
            document.getElementById('game-level').innerText = selectedLevel;
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
});
