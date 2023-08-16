let canvasSize = 800;

// Configuration for star and canvas
let clearBackground = true;
let starRadius = 50; // Initial and minimum radius
let maxRadius = 400;
let radiusGrowthRate = 4;
let minPoints = 5; // Minimum number of points on the star

// Variables for rotation control
let rotationAngle = 0;
let rotationSpeed;
let minSpeed = 0.01;
let maxSpeed = minSpeed * 3;
let rotationDirection = 1;
let rotationStartTime = 0;
let rotationDuration;

// Variables for acceleration and deceleration during rotation
let decelAccelDuration;

// Variables to manage mouse press state
let prevMouseIsPressed = false;
let firstPress = true;
let increasingRadius = true;

// Variables for echo effect
let echoes = [];
let echoCreationRate = 50; // Time (in ms) between each new echo
let lastEchoTime = 0; 

function setup() {
  createCanvas(canvasSize, canvasSize);
  background(255);
  setRandomRotationProperties();
}

function draw() {
  if (clearBackground) background(255);

  handleMousePressLogic();
  adjustStarRadius();
  handleRotationLogic();
  drawEchoes();

  push();
  translate(mouseX, mouseY);
  rotate(rotationAngle);
  drawStar(0, 0, starRadius, Math.round(starRadius / 50) + minPoints - 1);
  pop();
}

function handleMousePressLogic() {
  if (!prevMouseIsPressed && mouseIsPressed) {
    if (!firstPress) increasingRadius = !increasingRadius;
    else firstPress = false;
    prevMouseIsPressed = true;
  } else if (!mouseIsPressed) {
    prevMouseIsPressed = false;
  }
}

function adjustStarRadius() {
  if (mouseIsPressed) {
    starRadius = increasingRadius 
      ? constrain(starRadius + radiusGrowthRate, 50, maxRadius)
      : constrain(starRadius - radiusGrowthRate, 50, maxRadius);
  }
}

function handleRotationLogic() {
  let elapsedTime = millis() - rotationStartTime;
  if (elapsedTime < decelAccelDuration) {
    let progress = elapsedTime / decelAccelDuration;
    let currentSpeed = rotationSpeed * progress;
    rotationAngle += currentSpeed * rotationDirection;
  } else if (elapsedTime < rotationDuration - decelAccelDuration) {
    rotationAngle += rotationSpeed * rotationDirection;
  } else {
    let progress = (elapsedTime - (rotationDuration - decelAccelDuration)) / decelAccelDuration;
    let currentSpeed = rotationSpeed * (1 - progress);
    rotationAngle += currentSpeed * rotationDirection;
  }

  if (elapsedTime > rotationDuration) {
    rotationDirection *= -1;
    setRandomRotationProperties();
  }
}


function drawEchoes() {
  let currentTime = millis();
  if (currentTime - lastEchoTime >= echoCreationRate) {
    echoes.push({
      x: mouseX,
      y: mouseY,
      startTime: currentTime,
      initialRotation: rotationAngle,
      points: Math.round(starRadius / 50) + minPoints - 1,
      startRadius: starRadius
    });
    lastEchoTime = currentTime;
  }

  for (let i = echoes.length - 1; i >= 0; i--) {
    let echo = echoes[i];
    let lifeTime = currentTime - echo.startTime;
    let echoRadius = echo.startRadius + lifeTime / 4;

    if (echoRadius > 750) {
      echoes.splice(i, 1);
    } else {
      let grayscaleValue = map(i, 0, echoes.length-1, 255, 0);  // Invert the range to reverse the gradient
      stroke(grayscaleValue);  // Set the stroke color based on the grayscale value

      push();
      translate(echo.x, echo.y);
      rotate(echo.initialRotation);
      drawStar(0, 0, echoRadius, echo.points);
      pop();
    }
  }

  stroke(0); // Reset stroke to black for the main star
}


function setRandomRotationProperties() {
  rotationDuration = random(1000, 5000);
  rotationSpeed = random(minSpeed, maxSpeed);
  decelAccelDuration = rotationDuration * 0.25;
  rotationStartTime = millis();
}

function drawStar(x, y, radius, points) {
  let angleOffset = TWO_PI / points;
  for (let i = 0; i < points; i++) {
    let angle = angleOffset * i - HALF_PI;
    let sx = x + cos(angle) * radius;
    let sy = y + sin(angle) * radius;
    let angle2 = angleOffset * ((i + 2) % points) - HALF_PI;
    let sx2 = x + cos(angle2) * radius;
    let sy2 = y + sin(angle2) * radius;
    line(sx, sy, sx2, sy2);
  }
}
