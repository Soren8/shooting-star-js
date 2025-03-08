// Game settings
let width = window.innerWidth;
let height = window.innerHeight;
const BALL_SIZE = 32;
const BALL_SPEED_X = width / 400;
const BALL_SPEED_Y = height / 200;
const GRAVITY_ACC = 1 / (height / 100);

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.canvas.width  = width;
ctx.canvas.height = height;

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
// All of these are initialized in restartGame()
let paddle_width = 0;
let paddle_height = 0;
let playerX = 0;
let playerY = 0;
let ballX = 0;
let ballY = 0;
let ballSpeedX = 0;
let ballSpeedY = 0;
let score = 0;
let sparkles = [];
let fps = 0;
let ran_once = false;
let shades_y = 0;

// Other variables
let gameState = 'MENU';

// Elements
const menu = document.getElementById('menu');
const gameOverDiv = document.getElementById('gameOver');
const playButton = document.getElementById('playButton');
const playAgainButton = document.getElementById('playAgainButton');
const winningButton = document.getElementById('winningButton');
const backgroundMusic = document.getElementById('backgroundMusic');
const zeroScoreSound = document.getElementById('zeroScoreSound');
const lowScoreSound = document.getElementById('lowScoreSound');
const midScoreSound = document.getElementById('midScoreSound');
const goodScoreSound = document.getElementById('goodScoreSound');
const winningScoreSound = document.getElementById('winningScoreSound');

// Variables to track touch state
let isTouching = false;
let touchStartX = 0;

// Restart game
function restartGame() {
    resizeCanvas();
    ballX = Math.random() * width;
    ballY = Math.random() * (height / 5) + height / 20;
    ballSpeedX = (Math.random() - 0.5) * 2 * BALL_SPEED_X;
    ballSpeedY = BALL_SPEED_Y;
    score = 0;
    sparkles = [];
    gameState = 'PLAYING';
    ran_once = false; // Reset the ran_once flag
    shades_y = -300;  // Reset shades_y
    paddle_width = 300;
    paddle_height = 25;
    fps = 120;
    backgroundMusic.volume = 0.25;
    backgroundMusic.play();
}

function playSound(sound, dummy=false) {
    sound.currentTime = 0; // Reset to start
    sound.play();
    if(dummy) { sound.pause() }
}

// Event Listeners
playButton.addEventListener('click', () => {
    menu.style.display = 'none';
    restartGame();
    // Dummy plays to activate sound on mobile browsers
    playSound(zeroScoreSound, true);
    playSound(lowScoreSound, true);
    playSound(midScoreSound, true);
    playSound(goodScoreSound, true);
    playSound(winningScoreSound, true);
});

playAgainButton.addEventListener('click', () => {
    gameOverDiv.style.display = 'none';
    restartGame();
});

winningButton.addEventListener('click', () => {
    window.open("https://www.youtube.com/watch?v=9QS0q3mGPGg");
});

// Touch event listeners
canvas.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    isTouching = true;
    e.preventDefault(); // Prevent scrolling
});

canvas.addEventListener('touchmove', (e) => {
    if (isTouching) {
        const touch = e.touches[0];
        const touchX = touch.clientX;

        // Calculate the touch movement and update paddle position
        const touchMoveX = touchX - touchStartX;
        playerX += touchMoveX;

        // Keep paddle within bounds
        playerX = Math.max(0, Math.min(playerX, width - paddle_width));

        // Update the starting point for the next move
        touchStartX = touchX;
    }
    e.preventDefault(); // Prevent scrolling
});

canvas.addEventListener('touchend', () => {
    isTouching = false;
});

// Main game loop
function gameLoop() {
    if (gameState === 'PLAYING') {
        update();
        drawPlaying();
    } else if (gameState === 'MENU') {
        drawMenu();
    } else if (gameState === 'GAME_OVER') {
        runGameOver();
    }
    setTimeout(gameLoop, 1000 / fps);
}

// Update game state
function update() {
    // Update ball position
    ballSpeedY += GRAVITY_ACC;
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Ensure ballSpeedX stays within reasonable bounds
    if (ballSpeedX < 0) {
        ballSpeedX = Math.min(ballSpeedX, -BALL_SPEED_X / 2);
        ballSpeedX = Math.max(ballSpeedX, -BALL_SPEED_X * 1.5);
    } else {
        ballSpeedX = Math.max(ballSpeedX, BALL_SPEED_X / 2);
        ballSpeedX = Math.min(ballSpeedX, BALL_SPEED_X * 1.5);
    }

    // Check for wall collisions
    if (ballX <= BALL_SIZE || ballX >= width - BALL_SIZE) {
        ballSpeedX = -ballSpeedX;
    }
    if (ballY > height - 30) {
        gameState = 'GAME_OVER';
    }

    // Player movement
    if (keys.left && playerX > 0) {
        playerX -= 10;
    }
    if (keys.right && playerX < width - paddle_width) {
        playerX += 10;
    }

    // Add sparkles
    sparkles.push({
        x: ballX - BALL_SIZE / 4 + BALL_SIZE / 2 + (Math.random() - 0.5) * 15,
        y: ballY - BALL_SIZE / 4 + BALL_SIZE / 2 + (Math.random() - 0.5) * 15,
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
        width: paddle_width,
        height: paddle_height
    };
    const ballRect = {
        x: ballX,
        y: ballY,
        width: BALL_SIZE,
        height: BALL_SIZE
    };

    if (checkCollision(paddleRect, ballRect)) {
        ballSpeedY = -ballSpeedY;       // Make the ball bounce vertically
        ballY = playerY - BALL_SIZE;    // Move ball above paddle to prevent multiple collisions
        score++;

        // Add random variation to the horizontal speed to vary the bounce angle
        ballSpeedX *= (Math.random() * 0.4 + 0.8);

        // Make the game get harder over time
        paddle_width *= 0.98;
        paddle_width = Math.max(paddle_width, 60);
        paddle_height *= 0.98;
        paddle_height = Math.max(paddle_height, 15);
        paddleImage.width = paddle_width;
        paddleImage.height = paddle_height;
        
        fps *= 1.012;
    }
}

// Draw text with outline
function drawText(text, x, y) {
    ctx.font = '20px Arial';
    ctx.lineWidth = 4;
    ctx.fillStyle = '#FFF';
    ctx.strokeStyle = '#000';

    const lineHeight = 30; // Adjust as needed for spacing between lines

    // If text is a single string, convert it to an array with one element
    if (typeof text === 'string') {
        text = [text];
    }

    text.forEach((line, index) => {
        const textWidth = ctx.measureText(line).width;
        const centeredX = x - textWidth / 2;
        const lineY = y + (index * lineHeight);

        // Draw outline
        ctx.strokeText(line, centeredX, lineY);
        // Draw white text
        ctx.fillText(line, centeredX, lineY);
    });
}

// Draw game state for PLAYING
function drawPlaying() {
    ctx.clearRect(0, 0, width, height); // Clear canvas

    // Draw ball
    ctx.drawImage(ballImage, ballX, ballY, BALL_SIZE, BALL_SIZE);

    // Draw paddle
    ctx.drawImage(paddleImage, playerX, playerY, paddle_width, paddle_height);

    // Draw sparkles
    sparkles.forEach((sparkle, index) => {
        ctx.globalAlpha = sparkle.alpha;
        ctx.drawImage(sparkleImage, sparkle.x, sparkle.y, BALL_SIZE / 2, BALL_SIZE / 2);
        sparkles[index].alpha -= 0.02;
    });
    ctx.globalAlpha = 1;

    // Draw score
    drawText('Score: ' + score, 75, height - 50);
}

// Draw game state for MENU
function drawMenu() {
    ctx.clearRect(0, 0, width, height); // Clear canvas
    menu.style.display = 'flex';

    text = [
        "Welcome to Shooting Star.",
        " ",
        "Move your wand at the bottom of the",
        "screen to stop the star from falling.",
        " ",
        "Score 40 to win!"
    ];
    drawText(text, width / 2, height * 0.20);
}

// Draw game state for GAME_OVER
function runGameOver() {
    let shades_x = width * 0.23;
    let shades_y_max = height / 6;


    if (!ran_once) {
        gameOverDiv.style.display = 'flex';
        fps = 120;
        winningButton.style.display = 'none';
    }

    let winning = false;
    let message = "";

    if (score < 5) {
        message = "Wow, you really suck ass!";
        if (!ran_once) { playSound(zeroScoreSound); }
    } else if (score < 15) {
        message = "You suck!";
        if (!ran_once) { playSound(lowScoreSound); }
    } else if (score < 25) {
        message = "Not bad.";
        if (!ran_once) { playSound(midScoreSound); }
    } else if (score < 40) {
        message = "Pretty good!";
        if (!ran_once) { playSound(goodScoreSound); }
       } else {
        if (!ran_once) { playSound(winningScoreSound); }
        message = "";
        winning = true;
        winningButton.style.display = 'inline';
    }

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw winning image if applicable
    if (winning) {
        ctx.drawImage(winningImage, 0, 0, width, height);
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }

    // Draw message
    if (message) {
        drawText(message, width / 2, height / 3);
    }

    // Handle winning scenario
    if (winning) {
        ctx.drawImage(shadesImage, shades_x, shades_y, width / 4, height / 5);
        shades_y += 1;
        shades_y = Math.min(shades_y, shades_y_max);
    }

    ran_once = true;
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
window.addEventListener('keydown', (e) => {
    if (e.code === 'Enter') {
        if (gameState === 'GAME_OVER') {
            playAgainButton.click();
        } else if (gameState == 'MENU') {
            playButton.click();
        }
    }
});

// Update canvas and element sizes on window resize
function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    ctx.canvas.width  = width;
    ctx.canvas.height = height;
    playerX = width / 2 - paddle_width / 2;
    playerY = height - 100;

    // Update ball position if necessary
    if (gameState === 'PLAYING') {
        ballY = Math.min(ballY, playerY - BALL_SIZE);
    }
}

// Call resizeCanvas initially and on window resize
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Start game loop
gameLoop();
