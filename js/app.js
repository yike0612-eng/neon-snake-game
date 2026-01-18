/**
 * 应用主控制模块
 */
const App = {
    game: null,
    currentPage: 'login',

    init() {
        if (Auth.isLoggedIn()) { this.showGamePage(); }
        else { this.showPage('login'); }
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('login-form').addEventListener('submit', (e) => { e.preventDefault(); this.handleLogin(); });
        document.getElementById('register-form').addEventListener('submit', (e) => { e.preventDefault(); this.handleRegister(); });
        document.getElementById('goto-register').addEventListener('click', (e) => { e.preventDefault(); this.showPage('register'); });
        document.getElementById('goto-login').addEventListener('click', (e) => { e.preventDefault(); this.showPage('login'); });
        document.getElementById('btn-guest').addEventListener('click', () => { this.handleGuestLogin(); });
        document.getElementById('btn-logout').addEventListener('click', () => { this.handleLogout(); });
        document.getElementById('btn-start').addEventListener('click', () => { this.startGame(); });
        document.getElementById('btn-pause').addEventListener('click', () => { this.togglePause(); });
        document.getElementById('btn-restart').addEventListener('click', () => { this.restartGame(); });
        document.addEventListener('keydown', (e) => { this.handleKeydown(e); });
    },

    showPage(pageName) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(`${pageName}-page`).classList.add('active');
        this.currentPage = pageName;
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    },

    handleLogin() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        const result = Auth.login(username, password);
        if (result.success) { this.showGamePage(); }
        else { document.getElementById('login-error').textContent = result.message; }
    },

    handleRegister() {
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm').value;
        const result = Auth.register(username, password, confirm);
        if (result.success) { Auth.login(username, password); this.showGamePage(); }
        else { document.getElementById('register-error').textContent = result.message; }
    },

    handleGuestLogin() { Auth.guestLogin(); this.showGamePage(); },

    handleLogout() {
        Auth.logout();
        if (this.game) { this.game.restart(); }
        this.showPage('login');
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
    },

    showGamePage() {
        this.showPage('game');
        const user = Auth.getCurrentUser();
        document.getElementById('display-username').textContent = user.username;
        document.getElementById('guest-badge').style.display = user.isGuest ? 'inline' : 'none';
        document.getElementById('user-stats').style.display = user.isGuest ? 'none' : 'block';
        if (!this.game) {
            this.game = new SnakeGame('game-canvas');
            this.game.onScoreUpdate = (score, high) => this.updateScore(score, high);
            this.game.onGameOver = (score, high) => this.handleGameOver(score, high);
        }
        const highScore = user.isGuest ? 0 : Storage.getHighScore(user.username);
        this.game.setHighScore(highScore);
        document.getElementById('high-score').textContent = highScore;
        document.getElementById('current-score').textContent = '0';
        if (!user.isGuest) {
            const stats = Storage.getUserStats(user.username);
            document.getElementById('login-time').textContent = this.formatTime(stats.loginAt);
            document.getElementById('game-count').textContent = stats.gameCount;
            document.getElementById('total-score').textContent = stats.totalScore;
        }
        this.showOverlay('准备开始', '按下空格键或点击开始按钮');
    },

    startGame() {
        this.hideOverlay();
        this.game.start();
        document.getElementById('btn-pause').disabled = false;
        document.getElementById('btn-restart').disabled = false;
    },

    togglePause() {
        if (!this.game || !this.game.isRunning) return;
        this.game.togglePause();
        document.getElementById('btn-pause').textContent = this.game.isPaused ? '继续' : '暂停';
        if (this.game.isPaused) { this.showOverlay('游戏暂停', '按空格键继续'); }
        else { this.hideOverlay(); }
    },

    restartGame() {
        this.game.restart();
        document.getElementById('current-score').textContent = '0';
        document.getElementById('btn-pause').textContent = '暂停';
        this.showOverlay('准备开始', '按下空格键或点击开始按钮');
    },

    updateScore(score, highScore) {
        document.getElementById('current-score').textContent = score;
        document.getElementById('high-score').textContent = highScore;
    },

    handleGameOver(score, highScore) {
        const user = Auth.getCurrentUser();
        if (user && !user.isGuest) {
            Storage.saveGameRecord(user.username, score);
            const stats = Storage.getUserStats(user.username);
            document.getElementById('game-count').textContent = stats.gameCount;
            document.getElementById('total-score').textContent = stats.totalScore;
        }
        document.getElementById('btn-pause').disabled = true;
        document.getElementById('btn-pause').textContent = '暂停';
        this.showOverlay('游戏结束', `得分: ${score} | 最高分: ${highScore}`);
    },

    showOverlay(title, message) {
        document.getElementById('overlay-title').textContent = title;
        document.getElementById('overlay-message').textContent = message;
        document.getElementById('game-overlay').classList.remove('hidden');
    },

    hideOverlay() { document.getElementById('game-overlay').classList.add('hidden'); },

    handleKeydown(e) {
        if (this.currentPage !== 'game') return;
        const keyMap = { 'ArrowUp': 'up', 'KeyW': 'up', 'ArrowDown': 'down', 'KeyS': 'down', 'ArrowLeft': 'left', 'KeyA': 'left', 'ArrowRight': 'right', 'KeyD': 'right' };
        if (keyMap[e.code]) {
            e.preventDefault();
            if (this.game && this.game.isRunning && !this.game.isPaused) { this.game.setDirection(keyMap[e.code]); }
        }
        if (e.code === 'Space') {
            e.preventDefault();
            if (!this.game.isRunning) { this.startGame(); }
            else { this.togglePause(); }
        }
    },

    formatTime(isoString) {
        if (!isoString) return '--';
        const date = new Date(isoString);
        return date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
