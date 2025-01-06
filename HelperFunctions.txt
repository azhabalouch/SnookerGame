/*****************************************************************************
 * Snooker Game - Helper Functions
 *
 * Provides utility methods for rules, scoring, UI, etc.
 *****************************************************************************/

/**
 * Checks if the cue ball is within the "D" area before confirming its position.
 * @returns {boolean} True if valid, otherwise sets an error message.
 */
function checkIfCueBallonD() {
  const distToD = dist(
    cueBall.position.x,
    cueBall.position.y,
    snookerTable.baulkLineX,
    snookerTable.tableOffsetY + snookerTable.tableHeight / 2
  );

  if (distToD <= snookerTable.dRadius && cueBall.position.x <= snookerTable.baulkLineX) {
    return true;
  }

  // Show an incorrect placement warning
  IncorrectMessageVisible = true;
  IncorrectMessageTimeout = setTimeout(() => {
    IncorrectMessageVisible = false;
  }, 2000);

  return false;
}

/**
 * Checks if the given ball label corresponds to one of the colored balls.
 * @param {string} ballName
 * @returns {boolean}
 */
function checkIfColored(ballName) {
  return coloredBalls.includes(ballName);
}

/**
 * Returns the point value for a given ball label.
 * @param {string} ballName
 * @returns {number}
 */
function ballValue(ballName) {
  switch (ballName) {
    case "redBall":     return 1;
    case "yellowBall":  return 2;
    case "greenBall":   return 3;
    case "brownBall":   return 4;
    case "blueBall":    return 5;
    case "pinkBall":    return 6;
    case "blackBall":   return 7;
    case "cueBall":     return 4;  // Foul penalty for cue ball
    case "min":         return -4;
    default:            return 0;
  }
}

/**
 * Checks for a foul if the cue ball hits the wrong ball first.
 */
function checkFoulCollision(bodyA, bodyB) {
  const cue = bodyA.label === 'cueBall' ? bodyA : bodyB;
  const objectBall = (cue === bodyA) ? bodyB : bodyA;

  // If the correct shot is a red but a color is hit first => foul
  if (!redBallPotted && !onlyColoredBalls) {
    if (checkIfColored(objectBall.label)) {
      scoreDistribute(-ballValue(objectBall.label));
    }
  }
  // If a red was just potted or it's colors-only, but a red is hit => foul
  if (redBallPotted || onlyColoredBalls) {
    if (objectBall.label === 'redBall') {
      scoreDistribute(ballValue('min'));
    }
    redBallPotted = false;
  }
  isCueShotTaken = false;
}

/**
 * Resets a potted colored ball to its original position on the table.
 */
function resetColoredBall(ballBody) {
  const label = ballBody.label;
  const index = coloredBallData.findIndex(item => item.label === label);
  if (index !== -1) {
    const { x, y } = coloredBallsPosition[index];
    resetBallPosition(ballBody, x, y);
  } else {
    console.warn(`No matching entry in coloredBallData for label: ${label}`);
  }
}

/**
 * Sets the ball's velocity to zero and repositions it.
 */
function resetBallPosition(ballBody, posX, posY) {
  Matter.Body.setVelocity(ballBody, { x: 0, y: 0 });
  Matter.Body.setPosition(ballBody, { x: posX, y: posY });
}

/**
 * Creates the "Start Game" button and sets its behavior.
 */
function gameStartBtn() {
  const buttonStart = createButton('Start Game');
  buttonStart.position(canvas.width / 2 - 50, canvas.height / 2);

  buttonStart.mousePressed(() => {
    gameStarted = true;
    buttonStart.hide();
    ignoreNextClick = true;
  });
}

/**
 * Creates a vertical slider (rotated -90°) for controlling cue ball force.
 */
function slider() {
  const sliderPosX = -135;
  const sliderPosY = snookerTable.tableOffsetY + snookerTable.tableHeight / 2;
  
  speedSlider = createSlider(1, 20, 10);
  speedSlider.position(sliderPosX, sliderPosY);
  speedSlider.style('width', '400px');
  speedSlider.style('transform', 'rotate(-90deg)');
  speedSlider.hide(); // Initially hidden
}

/**
 * Adds a "Confirm" button for cue ball placement inside the "D."
 */
function cueBallConfirmPos() {
  Btn_confirmCueballPos = createButton('Confirm');
  Btn_confirmCueballPos.position(canvas.width / 2 - 10, dpHeight * 1.75);
  Btn_confirmCueballPos.hide();

  Btn_confirmCueballPos.mouseClicked(() => {
    if (checkIfCueBallonD()) {
      Btn_confirmCueballPos.hide();
      ballInHand = false;
      startTimer();
      speedSlider.show();

      // Re-enable collisions for non-cue balls
      for (let i = 0; i < balls.length; i++) {
        if (balls[i].body.label !== 'cueBall') {
          balls[i].body.collisionFilter.mask = 1;
        }
      }

      // Remove mouse constraint to finalize cue ball placement
      Matter.World.remove(world, mouseConstraint);
    }
  });
}

/**
 * Allows the cue ball to be moved with the mouse while it's 'in hand.'
 */
function mouseInteraction() {
  const canvasMouse = Mouse.create(canvas.elt);

  mouseConstraint = MouseConstraint.create(engine, {
    mouse: canvasMouse,
    constraint: {
      stiffness: 0.2,
      render: { visible: false },
    },
  });
  World.add(world, mouseConstraint);
}

/**
 * Updates the current player's score by the specified value (positive or negative).
 */
function scoreDistribute(value) {
  if (currentPlayer === 1) {
    player1Score += value;
  } else {
    player2Score += value;
  }
}

/**
 * Removes existing balls from the Matter.js world and clears the global array.
 */
function resetBalls() {
  balls.forEach(b => Matter.World.remove(world, b.body));
  balls = [];
}

/**
 * Starts the 60-second timer, switches players when time runs out, and shows a foul message briefly.
 */
function startTimer() {
  timer = 60;
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    timer--;
    if (timer <= 0) {
      currentPlayer = (currentPlayer === 1) ? 2 : 1;
      foulMessageVisible = true;

      // Hide foul message after 2s
      foulMessageTimeout = setTimeout(() => {
        foulMessageVisible = false;
      }, 2000);

      timer = 60;
    }
  }, 1000);
}

/**
 * Draws the current timer value on screen.
 */
function drawTimer() {
  push();
    textAlign(CENTER);
    textSize(24);
    textStyle(BOLD);
    fill(255);
    text(`${timer}`, width / 2, dpHeight*2);
  pop();
}

/**
 * Resets the timer to 60 seconds (e.g., on a successful shot).
 */
function resetTimer() {
  timer = 60;
}

/**
 * Helper function to initialize the game for a specific mode
 */
function initializeGame(mode) {
  Ball.initializeBalls(
    mode,                               // Game mode (1, 2, or 3)
    snookerTable.tableWidth,            // Width of the snooker table
    snookerTable.tableHeight,           // Height of the snooker table
    snookerTable.tableOffsetX,          // X offset for positioning the table
    snookerTable.tableOffsetY,          // Y offset for positioning the table
    snookerTable.baulkLineX,            // Position of the baulk line on the table
    snookerTable.dRadius                // Radius of the "D" zone
  );

  // Identify the cue ball from the array of balls
  cueBall = balls.find(ball => ball.body.label === "cueBall").body;

  // Build an array of labels for all colored balls (excluding red and cue balls)
  coloredBalls = balls
    .filter(ball => ball.body.label !== "redBall" && ball.body.label !== "cueBall")
    .map(ball => ball.body.label);

  // Create a new cue object linked to the cue ball
  cue = new Cue(cueBall);
}

/* 
- Handles the cue ball shot when the table is clicked.
- Prevents immediate shot if we are still placing the cue ball.
*/
function shootCueBallByAngle() {
  const forceMagnitude = speedSlider.value() / 1000;

  let forceDirection;

  // Calculate the direction from the cue ball to mouse
  if (isMouseControlled) {
    // Mouse-controlled: calculate direction from cue ball to mouse
    forceDirection = {
      x: mouseX - cueBall.position.x,
      y: mouseY - cueBall.position.y,
    };
  } else {
    // Arrow key-controlled: use the cueAngle for force direction
    forceDirection = {
      x: Math.cos(cueAngle),
      y: Math.sin(cueAngle),
    };
  }

  // Normalize the direction vector
  const directionMagnitude = Math.sqrt(
    forceDirection.x ** 2 + forceDirection.y ** 2
  );
  const normalizedDirection = {
    x: forceDirection.x / directionMagnitude,
    y: forceDirection.y / directionMagnitude,
  };

  // Apply force to the cue ball
  Matter.Body.applyForce(cueBall, cueBall.position, {
    x: normalizedDirection.x * forceMagnitude,
    y: normalizedDirection.y * forceMagnitude,
  });

  isCueShotTaken = true;

  // Switch player turn after a short delay
  setTimeout(() => {
    resetTimer();
    currentPlayer = (currentPlayer === 1) ? 2 : 1;
  }, 1500);
}