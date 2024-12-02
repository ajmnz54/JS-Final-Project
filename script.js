class Button {
  constructor(label, x, y, width, height, onClick) {
    this.label = label;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.onClick = onClick;
    this.button = createButton(label);
    this.button.position(x, y);
    this.button.size(width, height);
    this.button.mousePressed(onClick);
  }

  hide() {
    this.button.hide();
  }

  show() {
    this.button.show();
  }
}

let diceValue = 1, rolling = false, angleX = 0, angleY = 0, targetAngleX = 0, targetAngleY = 0;
const diceSize = 100, pipOffset = 30;
let scores = [0, 0], currentPlayer = 0, turnScore = 0;
let diceCanvas, scoreChange = 0, scoreChangeColor, scoreChangeAlpha = 255, showScoreChange = false, showSecondChanceMessage = false;
let myFont;
let rollButton, endTurnButton;

function preload() {
  myFont = loadFont('Roboto-Black.ttf');
}

function setup() {
  createCanvas(800, 600, WEBGL);
  textFont(myFont);

  // Create buttons using the Button class
  rollButton = new Button('Roll Dice', 650, 50, 100, 40, rollDice);
  endTurnButton = new Button('End Turn', 650, 100, 100, 40, endTurn);

  // Create a separate canvas for drawing each dice face
  diceCanvas = createGraphics(200, 200);
  diceCanvas.pixelDensity(1);
}

function draw() {
  background(200);
  drawText();
  push();
  rotateX(angleX);
  rotateY(angleY);
  drawDice();
  pop();

  if (rolling) {
    angleX = lerp(angleX, targetAngleX, 0.05); 
    angleY = lerp(angleY, targetAngleY, 0.05);
    if (abs(angleX - targetAngleX) < 0.01 && abs(angleY - targetAngleY) < 0.01) rolling = false;
  }

  if (showSecondChanceMessage) {
    textSize(32);
    fill(255, 255, 0); // Yellow for second chance
    text("Player 2 gets a second chance!", -200, -150);
  }
}

function drawText() {
  resetMatrix();
  textSize(16);
  fill(0);
  textAlign(LEFT, TOP);
  text(`Player 1 Score: ${scores[0]}`, -390, -280);
  text(`Player 2 Score: ${scores[1]}`, -390, -240);
  text(`Current Turn: Player ${currentPlayer + 1}`, -390, -200);
  text(`Turn Score: ${turnScore}`, -390, -160);

  if (showScoreChange) {
    fill(scoreChangeColor.levels[0], scoreChangeColor.levels[1], scoreChangeColor.levels[2], scoreChangeAlpha);
    textSize(24);
    text(`${scoreChange > 0 ? '+' : '-'}${Math.abs(scoreChange)}`, -275, -165);
  }
}

function drawDice() {
  fill(255);
  box(diceSize);
  renderDiceFace(1, [[0, 0]]);
  renderDiceFace(2, [[-pipOffset, pipOffset], [pipOffset, -pipOffset]]);
  renderDiceFace(3, [[-pipOffset, pipOffset], [0, 0], [pipOffset, -pipOffset]]);
  renderDiceFace(4, [[-pipOffset, pipOffset], [pipOffset, pipOffset], [-pipOffset, -pipOffset], [pipOffset, -pipOffset]]);
  renderDiceFace(5, [[-pipOffset, pipOffset], [pipOffset, pipOffset], [-pipOffset, -pipOffset], [pipOffset, -pipOffset], [0, 0]]);
  renderDiceFace(6, [[-pipOffset, pipOffset], [pipOffset, pipOffset], [-pipOffset, -pipOffset], [pipOffset, -pipOffset], [-pipOffset, 0], [pipOffset, 0]]);
}

function renderDiceFace(value, pips) {
  diceCanvas.clear();
  diceCanvas.background(255);
  diceCanvas.noStroke();
  diceCanvas.fill(0);

  for (let pip of pips) {
    diceCanvas.ellipse(100 + pip[0], 100 + pip[1], 20, 20);
  }

  push();
  switch (value) {
    case 1: 
      translate(0, 0, diceSize / 2); 
      break;
    case 2: 
      translate(0, diceSize / 2, 0); 
      rotateX(HALF_PI); 
      break;
    case 3: 
      translate(-diceSize / 2, 0, 0); 
      rotateY(HALF_PI); 
      break;
    case 4: 
      translate(diceSize / 2, 0, 0); 
      rotateY(-HALF_PI); 
      break;
    case 5: 
      translate(0, -diceSize / 2, 0); 
      rotateX(-HALF_PI); 
      break;
    case 6: 
      translate(0, 0, -diceSize / 2); 
      rotateY(PI); 
      break;
  }
  texture(diceCanvas);
  plane(diceSize);
  pop();
}

function rollDice() {
  if (rolling) return;

  rolling = true;
  diceValue = int(random(1, 7));

  switch (diceValue) {
    case 1: 
      targetAngleX = 0; 
      targetAngleY = 0; 
      break;
    case 2: 
      targetAngleX = HALF_PI;
      targetAngleY = 0; 
      break;
    case 3: 
      targetAngleX = 0; 
      targetAngleY = HALF_PI; 
      break;
    case 4: 
      targetAngleX = 0; 
      targetAngleY = -HALF_PI; 
      break;
    case 5: 
      targetAngleX = -HALF_PI; 
      targetAngleY = 0; 
      break;
    case 6: 
      targetAngleX = PI; 
      targetAngleY = 0; 
      break;
  }

  if (diceValue === 1) {
    scoreChange = -turnScore;
    turnScore = 0;
    scoreChangeColor = color(255, 0, 0);
    showScoreChange = true;
    setTimeout(() => {
      showScoreChange = false;
      endTurn();  // End turn after 1 is rolled
    }, 1000);
  } else {
    turnScore += diceValue;
    scoreChange = diceValue;
    scoreChangeColor = color(0, 255, 0);
    showScoreChange = true;
    setTimeout(() => showScoreChange = false, 1000);
  }
}

function declareWinner(player, score) {
  noLoop(); // Stop game loop
  textSize(32);
  fill(0, 255, 0);
  text(`Player ${player} wins with ${score}!`, -155, -150);
}

function endTurn() {
  scores[currentPlayer] += turnScore;
  turnScore = 0; // Reset turn score

  // Handle end of game scenarios
  if (scores[0] >= 30 && currentPlayer === 0) {
    currentPlayer = 1; // Player 1 reaches threshold, give Player 2 a second chance
    showSecondChanceMessage = true;
    setTimeout(() => showSecondChanceMessage = false, 2000);
    return;
  }

  if (scores[0] >= 30 && scores[1] > scores[0]) {
    declareWinner(2, scores[1]);
    return;
  }

  if (scores[0] >= 30 && scores[1] <= scores[0]) {
    declareWinner(1, scores[0]);
    return;
  }

  if (scores[1] >= 30) {
    declareWinner(2, scores[1]);
    return;
  }

  // Switch to the next player
  currentPlayer = (currentPlayer + 1) % scores.length;
}
