// Setup the canvas and game variables
const canvas = document.getElementById("plinkoBoard");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const betInput = document.getElementById("betAmount");
const balanceDisplay = document.getElementById("balance");
const resultDisplay = document.getElementById("result");

const boardWidth = 600;
const boardHeight = 500;
const pegRadius = 5;
const numPegs = 11;
const numRows = 7; // Number of rows with pegs
const slotHeight = 50;
let balance = 1000; // Starting balance

// Plinko ball
let ball = {
    x: boardWidth / 2,
    y: 50,
    radius: 10,
    velocityX: 0,
    velocityY: 0,
    isFalling: false
};

// Pegs and slots
let pegs = [];
let slots = [];
let multipliers = [];

// Setup the canvas size
canvas.width = boardWidth;
canvas.height = boardHeight;

// Function to generate the pegs, slots, and multipliers
function generatePegsAndSlots() {
    pegs = [];
    slots = [];
    multipliers = [];
    let gap = boardWidth / numPegs;

    // Create pegs
    for (let y = 100; y < boardHeight - slotHeight; y += 60) {
        for (let x = 0; x < boardWidth; x += gap) {
            if (Math.random() < 0.5) {
                pegs.push({ x: x + gap / 2, y: y });
            }
        }
    }

    // Create slots at the bottom
    for (let i = 0; i < numPegs; i++) {
        slots.push({ x: i * (boardWidth / numPegs) + (boardWidth / numPegs) / 2, y: boardHeight - slotHeight });
        // Set multipliers based on the slot position (higher multiplier for slots at the bottom)
        multipliers.push(1 + (i % 3)); // Simple multiplier system: 1, 2, or 3
    }
}

// Draw pegs
function drawPegs() {
    pegs.forEach(peg => {
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, pegRadius, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();
    });
}

// Draw the slots
function drawSlots() {
    ctx.fillStyle = "#333";
    slots.forEach(slot => {
        ctx.beginPath();
        ctx.rect(slot.x - 20, slot.y, 40, slotHeight);
        ctx.fill();
    });
}

// Function to draw the ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "blue";
    ctx.fill();
}

// Handle the ball falling and bouncing
function updateBall() {
    if (ball.isFalling) {
        ball.velocityY += 0.2; // Gravity
        ball.y += ball.velocityY;
        ball.x += ball.velocityX;

        // Collision with pegs
        pegs.forEach(peg => {
            if (Math.abs(ball.x - peg.x) < pegRadius * 2 && Math.abs(ball.y - peg.y) < pegRadius * 2) {
                ball.velocityX = (ball.x - peg.x) * 0.2;
                ball.velocityY = -ball.velocityY * 0.7;
                ball.y = peg.y - ball.radius;
            }
        });

        // Collision with slots
        slots.forEach((slot, index) => {
            if (ball.y + ball.radius > slot.y && ball.y - ball.radius < slot.y + slotHeight) {
                if (Math.abs(ball.x - slot.x) < 20) {
                    // Stop the ball once it lands in a slot
                    ball.isFalling = false;
                    ball.velocityX = 0;
                    ball.velocityY = 0;

                    // Calculate the winnings based on the multiplier
                    let winnings = parseInt(betInput.value) * multipliers[index];
                    balance += winnings;

                    // Display the result
                    resultDisplay.textContent = `You landed in slot ${index + 1} and won $${winnings}!`;
                    balanceDisplay.textContent = balance;
                }
            }
        });

        // Keep ball within bounds
        if (ball.x < 0 || ball.x > boardWidth) {
            ball.velocityX = -ball.velocityX;
        }
    }
}

// Function to start a new ball drop
function startGame() {
    // Get the bet amount and ensure it's a valid bet
    let betAmount = parseInt(betInput.value);
    if (betAmount <= 0 || betAmount > balance) {
        alert("Invalid bet amount!");
        return;
    }

    // Deduct bet amount from balance
    balance -= betAmount;
    balanceDisplay.textContent = balance;

    ball.x = boardWidth / 2;
    ball.y = 50;
    ball.velocityY = 0;
    ball.velocityX = 0;
    ball.isFalling = true;
    resultDisplay.textContent = ""; // Clear any previous result

    generatePegsAndSlots();
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, boardWidth, boardHeight);
    drawPegs();
    drawSlots();
    drawBall();
    updateBall();
    requestAnimationFrame(gameLoop);
}

// Initialize the game
generatePegsAndSlots();
gameLoop();

// Event listener for the start button
startButton.addEventListener("click", startGame);
