/**
 * 用户认证系统模块
 */

const Auth = {
    register(username, password, confirmPassword) {
        if (!username || username.length < 3 || username.length > 12) {
            return { success: false, message: '用户名需要3-12个字符' };
        }
        if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
            return { success: false, message: '用户名只能包含字母、数字、下划线或中文' };
        }
        if (!password || password.length < 6) {
            return { success: false, message: '密码至少需要6个字符' };
        }
        if (password !== confirmPassword) {
            return { success: false, message: '两次输入的密码不一致' };
        }
        if (Storage.getUser(username)) {
            return { success: false, message: '该用户名已被注册' };
        }
        const user = Storage.createUser(username, password);
        return { success: true, message: '注册成功', user };
    },

    login(username, password) {
        if (!username || !password) {
            return { success: false, message: '请输入用户名和密码' };
        }
        const user = Storage.getUser(username);
        if (!user) {
            return { success: false, message: '用户名不存在' };
        }
        if (user.password !== password) {
            return { success: false, message: '密码错误' };
        }
        Storage.setCurrentUser(username, false);
        return { success: true, message: '登录成功', user };
    },

    guestLogin() {
        const guestId = 'Guest_' + Math.random().toString(36).substr(2, 6);
        Storage.setCurrentUser(guestId, true);
        return {
            success: true,
            message: '游客模式已启动',
            user: { username: guestId, isGuest: true, highScore: 0, totalScore: 0, gameCount: 0 }
        };
    },

    logout() { Storage.clearCurrentUser(); },

    isLoggedIn() { return Storage.getCurrentUser() !== null; },

    getCurrentUser() {
        const session = Storage.getSession();
        if (!session) return null;
        if (session.isGuest) {
            return { username: session.username, isGuest: true, highScore: 0, totalScore: 0, gameCount: 0, loginAt: session.loginAt };
        }
        const user = Storage.getUser(session.username);
        if (user) {
            return { ...user, isGuest: false, loginAt: session.loginAt };
        }
        return null;
    },

    isGuest() {
        const session = Storage.getSession();
        return session ? session.isGuest : false;
    }
};
