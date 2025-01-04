/*****************************************************************************
 * Snooker Game - Helper Functions
 * 
 * Utility functions for rule checking, scoring, UI interactions, etc.
 *****************************************************************************/

/**
 * checkIfCueBallonD()
 *  - Verifies the cue ball is placed correctly within the "D" area
 *    before confirming its position.
 * @returns {boolean} True if valid placement, otherwise false (and shows error).
 */
function checkIfCueBallonD() {
  // Distance from cue ball to the center of the D
  const distToD = dist(
    cueBall.position.x,
    cueBall.position.y,
    snookerTable.baulkLineX,
    snookerTable.tableOffsetY + snookerTable.tableHeight / 2
  );

  // Must be within the D circle and to the left of the baulk line X
  if (distToD <= snookerTable.dRadius && cueBall.position.x <= snookerTable.baulkLineX) {
    return true;
  }

  // If invalid, show incorrect placement message
  IncorrectMessageVisible = true;
  IncorrectMessageTimeout = setTimeout(() => {
    IncorrectMessageVisible = false;
  }, 2000);

  return false;
}

/**
 * checkIfColored(ballName)
 *  - Checks if the given ball label is one of the colored balls.
 * @param {string} ballName - Label of the ball.
 * @returns {boolean} True if colored ball, false otherwise.
 */
function checkIfColored(ballName) {
  return coloredBalls.includes(ballName);
}

/**
 * ballValue(ballName)
 *  - Returns the point value of a given ball label.
 * @param {string} ballName - Label of the ball.
 * @returns {number} Point value of the ball.
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

function checkFoulCollision(bodyA, bodyB) {
  // Identify which is the cue ball vs. the object ball.
  const cue = bodyA.label === 'cueBall' ? bodyA : bodyB;
  const objectBall = (cue === bodyA) ? bodyB : bodyA;

  // If we're on a "red" shot but hit a color first => foul
  if (!redBallPotted && !onlyColoredBalls) {
    if (checkIfColored(objectBall.label)) {
      scoreDistribute(-ballValue(objectBall.label));
    }
  }
  // If we just potted a red (redBallPotted=true) and must pot a color,
  // but the player hits another red first => foul
  if (redBallPotted || onlyColoredBalls) {
    if (objectBall.label === 'redBall') {
      scoreDistribute(ballValue('min'));
    }
    redBallPotted = false;
  }
  isCueShotTaken = false;
}


/**
 * resetColoredBall(ballBody)
 *  - Looks up the ball's label in coloredBallData, finds its original index,
 *    and repositions it to coloredBallsPosition[index].
 * @param {Object} ballBody - The Matter.js body of the colored ball (e.g. ball.body).
 */
function resetColoredBall(ballBody) {
  // The ball's label is stored in ballBody.label
  const label = ballBody.label;

  // Find the matching index in coloredBallData
  const index = coloredBallData.findIndex(item => item.label === label);
  if (index !== -1) {
    // Grab the standard position (x,y) from coloredBallsPosition
    const { x, y } = coloredBallsPosition[index];
    resetBallPosition(ballBody, x, y);
  } else {
    console.warn(`No matching entry in coloredBallData for label: ${label}`);
  }
}

/**
 * resetBallPosition(ballBody, posX, posY)
 *  - Sets the ball's velocity to zero and repositions the given Matter.js body.
 */
function resetBallPosition(ballBody, posX, posY) {
  Matter.Body.setVelocity(ballBody, { x: 0, y: 0 });
  Matter.Body.setPosition(ballBody, { x: posX, y: posY });
}

/**
 * gameStartBtn()
 *  - Creates a "Start Game" button. Upon click, sets the game to started,
 *    hides the button, and ignores the next click (so the cue ball isn't 
 *    accidentally shot immediately).
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
 * slider()
 *  - Creates a vertical slider by rotating it -90°. This slider controls 
 *    the force applied to the cue ball.
 */
function slider() {
  const sliderPosX = -135;
  const sliderPosY = snookerTable.tableOffsetY + snookerTable.tableHeight / 2;
  
  speedSlider = createSlider(1, 20, 10);
  speedSlider.position(sliderPosX, sliderPosY);
  speedSlider.style('width', '400px');
  speedSlider.style('transform', 'rotate(-90deg)');
  
  // Hidden by default; displayed after confirming cue ball position
  speedSlider.hide();
}

/**
 * cueBallConfirmPos()
 *  - Creates a "Confirm" button to lock the cue ball position if it's
 *    placed correctly in the "D" for the initial shot. 
 */
function cueBallConfirmPos() {
  Btn_confirmCueballPos = createButton('Confirm');
  Btn_confirmCueballPos.position(canvas.width / 2 - 10, dpHeight * 1.75);
  Btn_confirmCueballPos.hide();

  Btn_confirmCueballPos.mouseClicked(() => {
    if (checkIfCueBallonD()) {
      Btn_confirmCueballPos.hide();
      ballInHand = false;
      startTimer(); // Begin the turn timer
      speedSlider.show();

      // Re-enable collisions for all non-cue balls
      for (let i = 0; i < balls.length; i++) {
        if (balls[i].body.label !== 'cueBall') {
          balls[i].body.collisionFilter.mask = 1;
        }
      }

      // Remove mouse constraint so the cue ball can't be moved further
      Matter.World.remove(world, mouseConstraint);
    }
  });
}

/**
 * mouseInteraction()
 *  - Allows the player to move the cue ball with the mouse during "ball in hand".
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
 * scoreDistribute(value)
 *  - Adds/subtracts points to the current player's score.
 * @param {number} value - Positive or negative point value.
 */
function scoreDistribute(value) {
  if (currentPlayer === 1) {
    player1Score += value;
  } else {
    player2Score += value;
  }
}


/**
 * Function to remove existing balls and clear the array
 */
function resetBalls() {
  balls.forEach(b => Matter.World.remove(world, b.body));
  balls = [];
}