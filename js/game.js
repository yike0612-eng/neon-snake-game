/**
 * 贪吃蛇游戏核心模块
 */
class SnakeGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.gridCount = this.canvas.width / this.gridSize;
        this.snake = [];
        this.food = null;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.highScore = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.gameLoop = null;
        this.speed = 150;
        this.minSpeed = 60;
        this.colors = {
            background: '#0f172a',
            grid: 'rgba(255, 255, 255, 0.03)',
            snakeHead: '#22d3ee',
            snakeBody: '#06b6d4',
            snakeGlow: 'rgba(6, 182, 212, 0.5)',
            food: '#d946ef',
            foodGlow: 'rgba(217, 70, 239, 0.6)'
        };
        this.onScoreUpdate = null;
        this.onGameOver = null;
        this.init();
    }

    init() { this.reset(); this.draw(); }

    reset() {
        const startX = Math.floor(this.gridCount / 2);
        const startY = Math.floor(this.gridCount / 2);
        this.snake = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY }
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.speed = 150;
        this.isRunning = false;
        this.isPaused = false;
        this.spawnFood();
        if (this.gameLoop) { clearInterval(this.gameLoop); this.gameLoop = null; }
    }

    setHighScore(score) { this.highScore = score; }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.isPaused = false;
        this.gameLoop = setInterval(() => this.update(), this.speed);
    }

    togglePause() {
        if (!this.isRunning) return;
        this.isPaused = !this.isPaused;
        if (this.isPaused) { clearInterval(this.gameLoop); this.gameLoop = null; }
        else { this.gameLoop = setInterval(() => this.update(), this.speed); }
    }

    update() {
        if (this.isPaused) return;
        this.direction = this.nextDirection;
        const head = { ...this.snake[0] };
        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        if (this.checkCollision(head)) { this.gameOver(); return; }
        this.snake.unshift(head);
        if (head.x === this.food.x && head.y === this.food.y) { this.eatFood(); }
        else { this.snake.pop(); }
        this.draw();
    }

    checkCollision(head) {
        if (head.x < 0 || head.x >= this.gridCount || head.y < 0 || head.y >= this.gridCount) return true;
        for (let i = 1; i < this.snake.length; i++) {
            if (this.snake[i].x === head.x && this.snake[i].y === head.y) return true;
        }
        return false;
    }

    eatFood() {
        this.score += 10;
        if (this.score > this.highScore) this.highScore = this.score;
        if (this.score % 50 === 0 && this.speed > this.minSpeed) {
            this.speed -= 10;
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.update(), this.speed);
        }
        this.spawnFood();
        if (this.onScoreUpdate) this.onScoreUpdate(this.score, this.highScore);
    }

    spawnFood() {
        const foodTypes = ['apple', 'mouse', 'frog'];
        let newFood, isOnSnake;
        do {
            isOnSnake = false;
            newFood = {
                x: Math.floor(Math.random() * this.gridCount),
                y: Math.floor(Math.random() * this.gridCount),
                type: foodTypes[Math.floor(Math.random() * foodTypes.length)]
            };
            for (const segment of this.snake) {
                if (segment.x === newFood.x && segment.y === newFood.y) { isOnSnake = true; break; }
            }
        } while (isOnSnake);
        this.food = newFood;
    }

    gameOver() {
        this.isRunning = false;
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        if (this.onGameOver) this.onGameOver(this.score, this.highScore);
    }

    setDirection(newDirection) {
        const opposites = { 'up': 'down', 'down': 'up', 'left': 'right', 'right': 'left' };
        if (newDirection !== opposites[this.direction]) this.nextDirection = newDirection;
    }

    drawSnakeHead(x, y, size) {
        const ctx = this.ctx;
        const cx = x + size / 2, cy = y + size / 2;
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 1.5);
        glow.addColorStop(0, this.colors.snakeGlow);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(x - size / 2, y - size / 2, size * 2, size * 2);
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.ellipse(cx, cy, size / 2 - 1, size / 2 - 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#67e8f9';
        ctx.beginPath();
        ctx.ellipse(cx - 2, cy - 2, size / 4, size / 5, -0.3, 0, Math.PI * 2);
        ctx.fill();
        let eyeOffset = { x: 0, y: 0 }, tongueAngle = 0;
        switch (this.direction) {
            case 'right': eyeOffset = { x: 3, y: -3 }; tongueAngle = 0; break;
            case 'left': eyeOffset = { x: -3, y: -3 }; tongueAngle = Math.PI; break;
            case 'up': eyeOffset = { x: 0, y: -5 }; tongueAngle = -Math.PI / 2; break;
            case 'down': eyeOffset = { x: 0, y: 3 }; tongueAngle = Math.PI / 2; break;
        }
        const eyeY = cy + eyeOffset.y;
        const eyeSpacing = 4;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - eyeSpacing + eyeOffset.x, eyeY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cx - eyeSpacing + eyeOffset.x + 0.5, eyeY, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx + eyeSpacing + eyeOffset.x, eyeY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cx + eyeSpacing + eyeOffset.x + 0.5, eyeY, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(tongueAngle);
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.moveTo(size / 2 - 2, 0);
        ctx.lineTo(size / 2 + 5, -2);
        ctx.lineTo(size / 2 + 3, 0);
        ctx.lineTo(size / 2 + 5, 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    drawApple(x, y, size) {
        const ctx = this.ctx;
        const cx = x + size / 2, cy = y + size / 2;
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size);
        glow.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(x - size / 2, y - size / 2, size * 2, size * 2);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(cx, cy + 1, size / 2 - 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(cx - 2, cy - 2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(cx + 2, cy - size / 2 + 4, 4, 2, 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy - size / 2 + 5);
        ctx.lineTo(cx, cy - size / 2 + 1);
        ctx.stroke();
    }

    drawMouse(x, y, size) {
        const ctx = this.ctx;
        const cx = x + size / 2, cy = y + size / 2;
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size);
        glow.addColorStop(0, 'rgba(156, 163, 175, 0.5)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(x - size / 2, y - size / 2, size * 2, size * 2);
        ctx.fillStyle = '#9ca3af';
        ctx.beginPath();
        ctx.ellipse(cx, cy, size / 2 - 2, size / 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fecaca';
        ctx.beginPath();
        ctx.arc(cx - 4, cy - 5, 4, 0, Math.PI * 2);
        ctx.arc(cx + 4, cy - 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cx - 2, cy - 1, 1.5, 0, Math.PI * 2);
        ctx.arc(cx + 2, cy - 1, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + size / 2 - 3, cy);
        ctx.quadraticCurveTo(cx + size / 2 + 2, cy - 3, cx + size / 2 + 4, cy + 2);
        ctx.stroke();
    }

    drawFrog(x, y, size) {
        const ctx = this.ctx;
        const cx = x + size / 2, cy = y + size / 2;
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size);
        glow.addColorStop(0, 'rgba(34, 197, 94, 0.5)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(x - size / 2, y - size / 2, size * 2, size * 2);
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(cx, cy + 1, size / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(cx - 4, cy - 5, 4, 0, Math.PI * 2);
        ctx.arc(cx + 4, cy - 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - 4, cy - 5, 3, 0, Math.PI * 2);
        ctx.arc(cx + 4, cy - 5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cx - 4, cy - 5, 1.5, 0, Math.PI * 2);
        ctx.arc(cx + 4, cy - 5, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy + 3, 3, 0, Math.PI);
        ctx.stroke();
    }

    draw() {
        const ctx = this.ctx, size = this.gridSize;
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.strokeStyle = this.colors.grid;
        for (let i = 0; i <= this.gridCount; i++) {
            ctx.beginPath(); ctx.moveTo(i * size, 0); ctx.lineTo(i * size, this.canvas.height); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i * size); ctx.lineTo(this.canvas.width, i * size); ctx.stroke();
        }
        if (this.food) {
            const fx = this.food.x * size, fy = this.food.y * size;
            switch (this.food.type) {
                case 'apple': this.drawApple(fx, fy, size); break;
                case 'mouse': this.drawMouse(fx, fy, size); break;
                case 'frog': this.drawFrog(fx, fy, size); break;
                default: this.drawApple(fx, fy, size);
            }
        }
        this.snake.forEach((seg, i) => {
            const x = seg.x * size, y = seg.y * size;
            if (i === 0) { this.drawSnakeHead(x, y, size); }
            else {
                const opacity = 1 - (i / this.snake.length) * 0.5;
                ctx.fillStyle = `rgba(6, 182, 212, ${opacity})`;
                ctx.beginPath();
                ctx.roundRect(x + 3, y + 3, size - 6, size - 6, 3);
                ctx.fill();
            }
        });
    }

    restart() { this.reset(); this.draw(); }
}
