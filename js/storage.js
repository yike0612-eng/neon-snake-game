/**
 * 数据存储管理模块
 * 使用 LocalStorage 进行本地数据持久化
 */

const Storage = {
    // 存储键名
    KEYS: {
        USERS: 'snake_game_users',
        CURRENT_USER: 'snake_game_current',
        GAME_RECORDS: 'snake_game_records'
    },

    getUsers() {
        const data = localStorage.getItem(this.KEYS.USERS);
        return data ? JSON.parse(data) : {};
    },

    saveUsers(users) {
        localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
    },

    getUser(username) {
        const users = this.getUsers();
        return users[username] || null;
    },

    createUser(username, password) {
        const users = this.getUsers();
        const newUser = {
            username: username,
            password: password,
            createdAt: new Date().toISOString(),
            highScore: 0,
            totalScore: 0,
            gameCount: 0,
            lastLoginAt: null
        };
        users[username] = newUser;
        this.saveUsers(users);
        return newUser;
    },

    updateUser(username, updates) {
        const users = this.getUsers();
        if (users[username]) {
            users[username] = { ...users[username], ...updates };
            this.saveUsers(users);
        }
    },

    getCurrentUser() {
        const data = localStorage.getItem(this.KEYS.CURRENT_USER);
        if (!data) return null;
        const session = JSON.parse(data);
        if (session.isGuest) return session;
        return this.getUser(session.username);
    },

    setCurrentUser(username, isGuest = false) {
        const session = {
            username: username,
            isGuest: isGuest,
            loginAt: new Date().toISOString()
        };
        localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(session));
        if (!isGuest) {
            this.updateUser(username, { lastLoginAt: session.loginAt });
        }
    },

    clearCurrentUser() {
        localStorage.removeItem(this.KEYS.CURRENT_USER);
    },

    getSession() {
        const data = localStorage.getItem(this.KEYS.CURRENT_USER);
        return data ? JSON.parse(data) : null;
    },

    saveGameRecord(username, score) {
        const session = this.getSession();
        if (session && session.isGuest) return;
        const user = this.getUser(username);
        if (user) {
            const newHighScore = Math.max(user.highScore, score);
            this.updateUser(username, {
                highScore: newHighScore,
                totalScore: user.totalScore + score,
                gameCount: user.gameCount + 1
            });
        }
    },

    getHighScore(username) {
        const user = this.getUser(username);
        return user ? user.highScore : 0;
    },

    getUserStats(username) {
        const user = this.getUser(username);
        const session = this.getSession();
        if (!user) {
            return { highScore: 0, totalScore: 0, gameCount: 0, loginAt: session ? session.loginAt : null };
        }
        return {
            highScore: user.highScore,
            totalScore: user.totalScore,
            gameCount: user.gameCount,
            loginAt: session ? session.loginAt : user.lastLoginAt
        };
    }
};
