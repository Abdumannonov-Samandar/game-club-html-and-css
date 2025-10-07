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
