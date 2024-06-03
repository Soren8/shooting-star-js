// Game settings
const WIDTH = 1280;
const HEIGHT = 1024;
const BALL_SIZE = 32;
const PADDLE_WIDTH = 300;
const PADDLE_HEIGHT = 25;
const BALL_SPEED = 5;
const FPS = 120;
const GRAVITY_ACC = 1 / (HEIGHT / 100);

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load images
const ballImage = new Image();
ballImage.src = 'star.png';

const paddleImage = new Image();
paddleImage.src = 'wand.png';

const shadesImage = new Image();
shadesImage.src = 'sunglasses.png';

const winningImage = new Image();
winningImage.src = 'winning.png';

const sparkleImage = new Image();
sparkleImage.src = 'sparkle.png';

// Game state
let playerX = WIDTH / 2 - PADDLE_WIDTH / 2;
let playerY = HEIGHT - 50;
let ballX = Math.random() * WIDTH;
let ballY = Math.random() * (HEIGHT / 3);
let ballSpeedX = (Math.random() - 0.5) * 2 * BALL_SPEED;
let ballSpeedY = BALL_SPEED;
let score = 0;
let running = true;
let gameState = 'PLAYING'; // Default state set to PLAYING
let sparkles = [];

// Elements
const menu = document.getElementById('menu');
const gameOverDiv = document.getElementById('gameOver');
const restartButton = document.getElementById('restartButton');
const playAgainButton = document.getElementById('playAgainButton');
const finalScore = document.getElementById('finalScore');

// Event Listeners
restartButton.addEventListener('click', () => {
    menu.style.display = 'none';
    restartGame();
});

playAgainButton.addEventListener('click', () => {
    gameOverDiv.style.display = 'none';
    restartGame();
});

// Main game loop
function gameLoop() {
    if (running) {
        if (gameState === 'PLAYING') {
            update();
            drawPlaying();
        } else if (gameState === 'MENU') {
            drawMenu();
        } else if (gameState === 'GAME_OVER') {
            drawGameOver();
        }
        setTimeout(gameLoop, 1000 / FPS);
    }
}

// Update game state
function update() {
    // Update ball position
    ballSpeedY += GRAVITY_ACC;
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Check for wall collisions
    if (ballX <= BALL_SIZE || ballX >= WIDTH - BALL_SIZE) {
        ballSpeedX = -ballSpeedX;
    }
    if (ballY > HEIGHT - 30) {
        gameState = 'GAME_OVER';
        finalScore.textContent = score;
        gameOverDiv.style.display = 'flex';
    }

    // Player movement
    if (keys.left && playerX > 0) {
        playerX -= 10;
    }
    if (keys.right && playerX < WIDTH - PADDLE_WIDTH) {
        playerX += 10;
    }

    // Add sparkles
    sparkles.push({
        x: ballX + BALL_SIZE / 2 + (Math.random() - 0.5) * 10,
        y: ballY + BALL_SIZE / 2 + (Math.random() - 0.5) * 10,
        alpha: 1
    });

    // Limit sparkles
    if (sparkles.length > 20) {
        sparkles.shift();
    }

    // Paddle collision
    const paddleRect = {
        x: playerX,
        y: playerY,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT
    };
    const ballRect = {
        x: ballX,
        y: ballY,
        width: BALL_SIZE,
        height: BALL_SIZE
    };

    if (checkCollision(paddleRect, ballRect)) {
        ballSpeedY = -BALL_SPEED;
        score++;
    }
}

// Draw game state for PLAYING
function drawPlaying() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT); // Clear canvas

    // Draw ball
    ctx.drawImage(ballImage, ballX, ballY, BALL_SIZE, BALL_SIZE);

    // Draw paddle
    ctx.drawImage(paddleImage, playerX, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw sparkles
    sparkles.forEach((sparkle, index) => {
        ctx.globalAlpha = sparkle.alpha;
        ctx.drawImage(sparkleImage, sparkle.x, sparkle.y, BALL_SIZE / 2, BALL_SIZE / 2);
        sparkles[index].alpha -= 0.02;
    });
    ctx.globalAlpha = 1;

    // Draw score
    ctx.font = '24px Arial';
    ctx.fillStyle = '#FFF';
    ctx.fillText('Score: ' + score, 10, HEIGHT - 30);
}

// Draw game state for MENU
function drawMenu() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT); // Clear canvas
    menu.style.display = 'flex';
}

// Draw game state for GAME_OVER
function drawGameOver() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT); // Clear canvas
    ctx.drawImage(winningImage, 0, 0, WIDTH, HEIGHT);
}

// Check for collision
function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// Handle keyboard input
const keys = {};
window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'ArrowRight') keys.right = true;
});
window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'ArrowRight') keys.right = false;
});

// Restart game
function restartGame() {
    playerX = WIDTH / 2 - PADDLE_WIDTH / 2;
    playerY = HEIGHT - 50;
    ballX = Math.random() * WIDTH;
    ballY = Math.random() * (HEIGHT / 3);
    ballSpeedX = (Math.random() - 0.5) * 2 * BALL_SPEED;
    ballSpeedY = BALL_SPEED;
    score = 0;
    sparkles = [];
    gameState = 'PLAYING';
}

// Start game loop
gameLoop();
