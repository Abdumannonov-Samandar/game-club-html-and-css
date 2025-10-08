// --- Pong Game ---
const pongCanvas = document.getElementById('pongCanvas')
const pongCtx = pongCanvas.getContext('2d')
const PONG_WIDTH = pongCanvas.width
const PONG_HEIGHT = pongCanvas.height

const PADDLE_WIDTH = 15
const PADDLE_HEIGHT = 80
const PADDLE_GAP = 10
const BALL_SIZE = 14
const BALL_SPEED = 5

let playerPaddle = { x: PADDLE_GAP, y: PONG_HEIGHT / 2 - PADDLE_HEIGHT / 2 }
let aiPaddle = {
	x: PONG_WIDTH - PADDLE_GAP - PADDLE_WIDTH,
	y: PONG_HEIGHT / 2 - PADDLE_HEIGHT / 2,
}
let ball = {
	x: PONG_WIDTH / 2 - BALL_SIZE / 2,
	y: PONG_HEIGHT / 2 - BALL_SIZE / 2,
	vx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
	vy: BALL_SPEED * (Math.random() * 2 - 1),
}
let playerScore = 0
let aiScore = 0

// Mouse control for Pong left paddle
pongCanvas.addEventListener('mousemove', e => {
	const rect = pongCanvas.getBoundingClientRect()
	let mouseY = e.clientY - rect.top
	playerPaddle.y = mouseY - PADDLE_HEIGHT / 2
	playerPaddle.y = Math.max(
		0,
		Math.min(PONG_HEIGHT - PADDLE_HEIGHT, playerPaddle.y)
	)
})

function drawPong() {
	pongCtx.clearRect(0, 0, PONG_WIDTH, PONG_HEIGHT)

	pongCtx.fillStyle = '#fff'
	pongCtx.fillRect(playerPaddle.x, playerPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT)
	pongCtx.fillRect(aiPaddle.x, aiPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT)

	pongCtx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE)

	pongCtx.strokeStyle = '#888'
	pongCtx.setLineDash([8, 8])
	pongCtx.beginPath()
	pongCtx.moveTo(PONG_WIDTH / 2, 0)
	pongCtx.lineTo(PONG_WIDTH / 2, PONG_HEIGHT)
	pongCtx.stroke()
	pongCtx.setLineDash([])
}

function updateBall() {
	ball.x += ball.vx
	ball.y += ball.vy

	if (ball.y < 0) {
		ball.y = 0
		ball.vy *= -1
	}
	if (ball.y + BALL_SIZE > PONG_HEIGHT) {
		ball.y = PONG_HEIGHT - BALL_SIZE
		ball.vy *= -1
	}

	if (
		ball.x < playerPaddle.x + PADDLE_WIDTH &&
		ball.x + BALL_SIZE > playerPaddle.x &&
		ball.y + BALL_SIZE > playerPaddle.y &&
		ball.y < playerPaddle.y + PADDLE_HEIGHT
	) {
		ball.x = playerPaddle.x + PADDLE_WIDTH
		ball.vx *= -1
		let impact = ball.y + BALL_SIZE / 2 - (playerPaddle.y + PADDLE_HEIGHT / 2)
		ball.vy += impact * 0.15
	}

	if (
		ball.x + BALL_SIZE > aiPaddle.x &&
		ball.x < aiPaddle.x + PADDLE_WIDTH &&
		ball.y + BALL_SIZE > aiPaddle.y &&
		ball.y < aiPaddle.y + PADDLE_HEIGHT
	) {
		ball.x = aiPaddle.x - BALL_SIZE
		ball.vx *= -1
		let impact = ball.y + BALL_SIZE / 2 - (aiPaddle.y + PADDLE_HEIGHT / 2)
		ball.vy += impact * 0.15
	}

	if (ball.x < 0) {
		aiScore++
		resetBall(-1)
	}
	if (ball.x + BALL_SIZE > PONG_WIDTH) {
		playerScore++
		resetBall(1)
	}

	document.getElementById('playerScore').textContent = playerScore
	document.getElementById('aiScore').textContent = aiScore
}

function updateAI() {
	let target = ball.y + BALL_SIZE / 2 - PADDLE_HEIGHT / 2
	let speed = 4
	if (aiPaddle.y < target) {
		aiPaddle.y += speed
	} else if (aiPaddle.y > target) {
		aiPaddle.y -= speed
	}
	aiPaddle.y = Math.max(0, Math.min(PONG_HEIGHT - PADDLE_HEIGHT, aiPaddle.y))
}

function resetBall(direction) {
	ball.x = PONG_WIDTH / 2 - BALL_SIZE / 2
	ball.y = PONG_HEIGHT / 2 - BALL_SIZE / 2
	ball.vx = BALL_SPEED * direction
	ball.vy = BALL_SPEED * (Math.random() * 2 - 1)
}

function pongLoop() {
	updateBall()
	updateAI()
	drawPong()
	requestAnimationFrame(pongLoop)
}
pongLoop()

// --- Catch the Ball Game ---
const catchCanvas = document.getElementById('catchCanvas')
const catchCtx = catchCanvas.getContext('2d')
const CATCH_WIDTH = catchCanvas.width
const CATCH_HEIGHT = catchCanvas.height

const PANEL_WIDTH = 90
const PANEL_HEIGHT = 15
const BALL_RADIUS = 15
const BALL_FALL_SPEED = 5

let panelX = CATCH_WIDTH / 2 - PANEL_WIDTH / 2
const panelY = CATCH_HEIGHT - PANEL_HEIGHT - 10

let fallingBall = {
	x: Math.random() * (CATCH_WIDTH - BALL_RADIUS * 2) + BALL_RADIUS,
	y: -BALL_RADIUS,
	vy: BALL_FALL_SPEED,
}
let catchScore = 0

// Mouse control for catch panel
catchCanvas.addEventListener('mousemove', e => {
	const rect = catchCanvas.getBoundingClientRect()
	let mouseX = e.clientX - rect.left
	panelX = mouseX - PANEL_WIDTH / 2
	panelX = Math.max(0, Math.min(CATCH_WIDTH - PANEL_WIDTH, panelX))
})

function drawCatchGame() {
	catchCtx.clearRect(0, 0, CATCH_WIDTH, CATCH_HEIGHT)

	// Draw panel
	catchCtx.fillStyle = '#0f0'
	catchCtx.fillRect(panelX, panelY, PANEL_WIDTH, PANEL_HEIGHT)

	// Draw ball
	catchCtx.beginPath()
	catchCtx.arc(fallingBall.x, fallingBall.y, BALL_RADIUS, 0, Math.PI * 2)
	catchCtx.fillStyle = '#ff0'
	catchCtx.fill()
}

function updateCatchGame() {
	fallingBall.y += fallingBall.vy

	// Panel and ball collision
	if (
		fallingBall.y + BALL_RADIUS >= panelY &&
		fallingBall.x >= panelX &&
		fallingBall.x <= panelX + PANEL_WIDTH
	) {
		catchScore++
		resetFallingBall()
	}

	// Ball missed
	if (fallingBall.y - BALL_RADIUS > CATCH_HEIGHT) {
		resetFallingBall()
	}

	document.getElementById('catchScoreValue').textContent = catchScore
}

function resetFallingBall() {
	fallingBall.x = Math.random() * (CATCH_WIDTH - BALL_RADIUS * 2) + BALL_RADIUS
	fallingBall.y = -BALL_RADIUS
	fallingBall.vy = BALL_FALL_SPEED
}

function catchLoop() {
	updateCatchGame()
	drawCatchGame()
	requestAnimationFrame(catchLoop)
}
catchLoop()


// --- Breakout Game ---
const breakoutCanvas = document.getElementById('breakoutCanvas')
const breakoutCtx = breakoutCanvas.getContext('2d')
const BREAKOUT_WIDTH = breakoutCanvas.width
const BREAKOUT_HEIGHT = breakoutCanvas.height

const PADDLE_WIDTH_BREAKOUT = 80
const PADDLE_HEIGHT_BREAKOUT = 10
const BALL_RADIUS_BREAKOUT = 8
const BALL_SPEED_BREAKOUT = 4
const BRICK_ROWS = 5
const BRICK_COLS = 8
const BRICK_WIDTH = BREAKOUT_WIDTH / BRICK_COLS - 6
const BRICK_HEIGHT = 20
const BRICK_GAP = 2

let breakoutPaddle = {
	x: BREAKOUT_WIDTH / 2 - PADDLE_WIDTH_BREAKOUT / 2,
	y: BREAKOUT_HEIGHT - PADDLE_HEIGHT_BREAKOUT - 10,
}

let breakoutBall = {
	x: BREAKOUT_WIDTH / 2,
	y: BREAKOUT_HEIGHT / 2,
	vx: BALL_SPEED_BREAKOUT,
	vy: -BALL_SPEED_BREAKOUT,
}

let breakoutScore = 0
let breakoutLives = 3
let breakoutBricks = []

// Breakout bricks initialization
function initBricks() {
	breakoutBricks = []
	for (let row = 0; row < BRICK_ROWS; row++) {
		breakoutBricks[row] = []
		for (let col = 0; col < BRICK_COLS; col++) {
			breakoutBricks[row][col] = {
				x: col * (BRICK_WIDTH + BRICK_GAP) + BRICK_GAP,
				y: row * (BRICK_HEIGHT + BRICK_GAP) + BRICK_GAP + 30,
				status: 1,
			}
		}
	}
}

// Mouse control for breakout paddle
breakoutCanvas.addEventListener('mousemove', e => {
	const rect = breakoutCanvas.getBoundingClientRect()
	let mouseX = e.clientX - rect.left
	breakoutPaddle.x = mouseX - PADDLE_WIDTH_BREAKOUT / 2
	breakoutPaddle.x = Math.max(
		0,
		Math.min(BREAKOUT_WIDTH - PADDLE_WIDTH_BREAKOUT, breakoutPaddle.x)
	)
})

function drawBreakoutGame() {
	breakoutCtx.clearRect(0, 0, BREAKOUT_WIDTH, BREAKOUT_HEIGHT)

	// Draw paddle
	breakoutCtx.fillStyle = 'rgba(161, 216, 216, 1)'
	breakoutCtx.fillRect(
		breakoutPaddle.x,
		breakoutPaddle.y,
		PADDLE_WIDTH_BREAKOUT,
		PADDLE_HEIGHT_BREAKOUT
	)

	// Draw ball
	breakoutCtx.beginPath()
	breakoutCtx.arc(
		breakoutBall.x,
		breakoutBall.y,
		BALL_RADIUS_BREAKOUT,
		0,
		Math.PI * 2
	)
	breakoutCtx.fillStyle = 'rgba(30, 0, 255, 1)'
	breakoutCtx.fill()

	// Draw bricks
	for (let row = 0; row < BRICK_ROWS; row++) {
		for (let col = 0; col < BRICK_COLS; col++) {
			if (breakoutBricks[row][col].status === 1) {
				let brick = breakoutBricks[row][col]
				breakoutCtx.fillStyle = `hsl(${row * 40}, 100%, 50%)`
				breakoutCtx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT)
			}
		}
	}
}

function updateBreakoutGame() {
	breakoutBall.x += breakoutBall.vx
	breakoutBall.y += breakoutBall.vy

	// Wall collisions
	if (
		breakoutBall.x - BALL_RADIUS_BREAKOUT < 0 ||
		breakoutBall.x + BALL_RADIUS_BREAKOUT > BREAKOUT_WIDTH
	) {
		breakoutBall.vx *= -1
	}

	if (breakoutBall.y - BALL_RADIUS_BREAKOUT < 0) {
		breakoutBall.vy *= -1
	}

	// Paddle collision
	if (
		breakoutBall.y + BALL_RADIUS_BREAKOUT > breakoutPaddle.y &&
		breakoutBall.x > breakoutPaddle.x &&
		breakoutBall.x < breakoutPaddle.x + PADDLE_WIDTH_BREAKOUT
	) {
		breakoutBall.vy = -Math.abs(breakoutBall.vy)
		// Add some horizontal movement based on where the ball hits the paddle
		let hitPos = (breakoutBall.x - breakoutPaddle.x) / PADDLE_WIDTH_BREAKOUT
		breakoutBall.vx = (hitPos - 0.5) * 8
	}

	// Brick collisions
	for (let row = 0; row < BRICK_ROWS; row++) {
		for (let col = 0; col < BRICK_COLS; col++) {
			let brick = breakoutBricks[row][col]
			if (brick.status === 1) {
				if (
					breakoutBall.x + BALL_RADIUS_BREAKOUT > brick.x &&
					breakoutBall.x - BALL_RADIUS_BREAKOUT < brick.x + BRICK_WIDTH &&
					breakoutBall.y + BALL_RADIUS_BREAKOUT > brick.y &&
					breakoutBall.y - BALL_RADIUS_BREAKOUT < brick.y + BRICK_HEIGHT
				) {
					breakoutBall.vy *= -1
					brick.status = 0
					breakoutScore += 10

					// Check if all bricks are destroyed
					let allDestroyed = true
					for (let r = 0; r < BRICK_ROWS; r++) {
						for (let c = 0; c < BRICK_COLS; c++) {
							if (breakoutBricks[r][c].status === 1) {
								allDestroyed = false
								break
							}
						}
						if (!allDestroyed) break
					}

					if (allDestroyed) {
						initBricks()
						breakoutBall.x = BREAKOUT_WIDTH / 2
						breakoutBall.y = BREAKOUT_HEIGHT / 2
						breakoutBall.vx = BALL_SPEED_BREAKOUT
						breakoutBall.vy = -BALL_SPEED_BREAKOUT
					}
				}
			}
		}
	}

	// Ball missed
	if (breakoutBall.y - BALL_RADIUS_BREAKOUT > BREAKOUT_HEIGHT) {
		breakoutLives--
		if (breakoutLives <= 0) {
			breakoutScore = 0
			breakoutLives = 1
			initBricks()
		}
		breakoutBall.x = BREAKOUT_WIDTH / 2
		breakoutBall.y = BREAKOUT_HEIGHT / 2
		breakoutBall.vx = BALL_SPEED_BREAKOUT
		breakoutBall.vy = -BALL_SPEED_BREAKOUT
	}

	document.getElementById('breakoutScoreValue').textContent = breakoutScore
	document.getElementById('breakoutLives').textContent = breakoutLives
}

function breakoutLoop() {
	updateBreakoutGame()
	drawBreakoutGame()
	requestAnimationFrame(breakoutLoop)
}

// Initialize and start the breakout game
initBricks()
breakoutLoop()

