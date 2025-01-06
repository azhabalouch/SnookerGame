/*****************************************************************************
 * Snooker Game - Event Handlers
 * 
 * This file handles collisions between balls and pockets (scoring/potting),
 * as well as foul detection logic such as hitting/potting the wrong ball,
 * or pocketing the cue ball.
 *****************************************************************************/

/**
 * handlePocketCollision(event)
 *  - Triggered when any collision starts in Matter.js.
 *  - Detects if a ball has collided with a pocket, handles potting logic,
 *    scoring, and repositioning potted colored balls or the cue ball.
 */
function handlePocketCollision(event) {
  const pairs = event.pairs;

  pairs.forEach(pair => {
    const bodyA = pair.bodyA;
    const bodyB = pair.bodyB;

    // Check for pocket-ball collisions
    if (
      (bodyA.label === 'pocket' && bodyB.label.endsWith('Ball')) ||
      (bodyB.label === 'pocket' && bodyA.label.endsWith('Ball'))
    ) {
      // Identify which one is the ball
      const ball = bodyA.label.endsWith('Ball') ? bodyA : bodyB;

      // ----------------------------------------------------------
      // Cue ball in pocket -> always a foul
      // ----------------------------------------------------------
      if (ball.label === 'cueBall') {
        // Foul penalty for cue ball
        scoreDistribute(-ballValue('cueBall'));

        // Ball in hand
        ballInHand = true;
        mouseInteraction();

        // Reset cue ball to default position
        resetBallPosition(ball, coloredBallsPosition[6].x, coloredBallsPosition[6].y);
        return;
      }

      // ----------------------------------------------------------
      // If we're in final colors-only stage (no more reds)
      // ----------------------------------------------------------
      if (onlyColoredBalls) {
        if (checkIfColored(ball.label)) {
          //  - In real snooker, you pot colors in ascending order (yellow->green->brown->blue->pink->black).
          //  - For demonstration, we'll simply award points and remove the color. 
          scoreDistribute(ballValue(ball.label));

          // Remove the potted color from the table entirely
          Matter.World.remove(world, ball);
          balls = balls.filter(b => b.body !== ball);
        }
        return;
      }

      // ----------------------------------------------------------
      // If reds are still available
      // ----------------------------------------------------------
      if (redBallsRemaining > 0) {
        // Potting a red
        if (ball.label === 'redBall') {
          scoreDistribute(ballValue('redBall'));
          redBallsRemaining--;

          // Remove red ball from the table
          Matter.World.remove(world, ball);
          balls = balls.filter(b => b.body !== ball);

          // If that was the last red, switch to colors-only
          if (redBallsRemaining === 0) {
            onlyColoredBalls = true;
          } else {
            // Indicate the player must now pot a color
            redBallPotted = true;  
          }
          // Allow the same player to continue
          againTurn = true;
          return;
        }

        // Potting a color
        if (checkIfColored(ball.label)) {
          // If we *just* potted a red, potting a color next is correct
          if (!redBallPotted) {
            scoreDistribute(ballValue(ball.label));
            // In standard snooker, color goes back to its spot if reds remain
            resetColoredBall(ball);

            // Now the next shot is back to a red
            redBallPotted = false;
            againTurn = true;
          } else {
            // Foul if the player potted a color while "on a red"
            scoreDistribute(-ballValue(ball.label));
            resetColoredBall(ball);
            // Typically you'd also switch players here
          }
          return;
        }
      }
    }
  });
}


/**
 * handleFoul(event)
 *  - Checks for potential fouls during collisions:
 *    • Cue ball hitting a cushion first is allowed (not a foul).
 *    • Cue ball hitting the wrong ball first (red vs. color) is a foul.
 *  - Only processes if a valid cue shot was taken (`isCueShotTaken === true`).
 */
function handleFoul(event) {
  // If the cue shot hasn't been taken yet, there's nothing to check.
  if (!isCueShotTaken) return;

  const pairs = event.pairs;
  pairs.forEach(pair => {
    const bodyA = pair.bodyA;
    const bodyB = pair.bodyB;

    console.log(bodyA, bodyB);

    // ------------------------------------------------------------------------------------
    // If the collision is with a cushion, it's not a foul, so ignore.
    // ------------------------------------------------------------------------------------
    if (bodyA.label === "cushion" || bodyB.label === "cushion") {
      return;
    }

    // ------------------------------------------------------------------------------------
    // If a collision involves the cue ball and another ball, check for foul logic.
    //   - For standard snooker:
    //     a) If you must pot a red but you hit a color first => foul.
    //     b) If you must pot a color but you hit a red first => foul.
    //     c) If you are in the final color sequence, hitting the wrong color first => foul.
    // ------------------------------------------------------------------------------------
    if (bodyA.label === "cueBall" || bodyB.label === "cueBall") {
      // Pass the pair to a function that checks whether it's a foul 
      // based on the current state (e.g., redBallPotted, onlyColoredBalls, etc.).
      checkFoulCollision(bodyA, bodyB);
    }
  });
}

/**
 * cueBall shot on click
 */
function mouseClicked() {
  if (ignoreNextClick) {
    ignoreNextClick = false;
    return;
  }

  // Table boundaries for validating mouse clicks
  const tableLeft = snookerTable.tableOffsetX;
  const tableRight = snookerTable.tableOffsetX + snookerTable.tableWidth;
  const tableTop = snookerTable.tableOffsetY;
  const tableBottom = snookerTable.tableOffsetY + snookerTable.tableHeight;

  // If Click is within the table and that the cue ball is at rest
  if (
    mouseX >= tableLeft && mouseX <= tableRight &&
    mouseY >= tableTop && mouseY <= tableBottom &&
    velocityMagnitude <= 0.009
  ) {
    shootCueBallByAngle();
  }
}

// Function triggered on a key press event
function keyPressed() {
  // Check if the pressed key corresponds to one of the game modes (1, 2, or 3)
  if (key === '1' || key === '2' || key === '3') {
    // Reset the balls on the table and clear any existing data
    resetBalls();

    // Initialize the game for the specified mode 
    initializeGame(parseInt(key));
  }

  // If spacebar is pressed
  if (key === ' ') {  
    shootCueBallByAngle();
  }
  // If up arrow is pressed
  else if (keyCode === UP_ARROW) {
    cueAngle -= angleStep;
  }
  // If down arrow is pressed
  else if (keyCode === DOWN_ARROW) {
    cueAngle += angleStep;
  }

  if (speedSlider) {
    let currentValue = speedSlider.value();
    
    if (keyCode === RIGHT_ARROW) {
      // Increase slider value
      speedSlider.value(Math.min(currentValue + 1, 20));
    } else if (keyCode === LEFT_ARROW) {
      // Decrease slider value
      speedSlider.value(Math.max(currentValue - 1, 1));
    }
  }

  if (keyCode === ENTER) {
    isMouseControlled = !isMouseControlled; // Toggle control mode
  } 
  if (!isMouseControlled) {
    if (key === UP_ARROW) {
      cueAngle -= angleStep; // Rotate counterclockwise
    } else if (key === DOWN_ARROW) {
      cueAngle += angleStep; // Rotate clockwise
    }
  }
}