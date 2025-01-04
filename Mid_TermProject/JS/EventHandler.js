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

    // 1) Check for pocket-ball collisions
    if (
      (bodyA.label === 'pocket' && bodyB.label.endsWith('Ball')) ||
      (bodyB.label === 'pocket' && bodyA.label.endsWith('Ball'))
    ) {
      // Identify which one is the ball
      const ball = bodyA.label.endsWith('Ball') ? bodyA : bodyB;

      // ----------------------------------------------------------
      // A) Cue ball in pocket -> always a foul
      // ----------------------------------------------------------
      if (ball.label === 'cueBall') {
        // Foul penalty for cue ball
        scoreDistribute(-ballValue('cueBall'));

        // Ball in hand
        ballInHand = true;
        mouseInteraction();

        // Reset cue ball to default position
        resetBallPosition(ball, coloredBallsPosition[6].x, coloredBallsPosition[6].y);
        return; // No further logic needed for cue ball
      }

      // ----------------------------------------------------------
      // B) If we're in final colors-only stage (no more reds)
      // ----------------------------------------------------------
      if (onlyColoredBalls) {
        if (checkIfColored(ball.label)) {
          // Example approach: 
          //  - In real snooker, you pot colors in ascending order (yellow->green->brown->blue->pink->black).
          //  - For demonstration, we'll simply award points and remove the color. 
          scoreDistribute(ballValue(ball.label));

          // Remove the potted color from the table entirely
          Matter.World.remove(world, ball);
          balls = balls.filter(b => b.body !== ball);

          // If you're tracking which color is next or if the frame ends when black is potted, 
          // you can implement that logic here.
        } else {
          // If it’s somehow a non-existent label or a redBall (which shouldn’t happen now),
          // handle it as a foul or ignore. Adjust as needed.
        }
        return;
      }

      // ----------------------------------------------------------
      // C) If reds are still available
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
 * mouseClicked()
 *  - Handles the cue ball shot when the table is clicked.
 *  - Prevents immediate shot if we are still placing the cue ball.
 */
function mouseClicked() {
  console.log("mouseClicked triggered!");
  // Ignore the first click right after the game starts
  if (ignoreNextClick) {
    ignoreNextClick = false;
    return;
  }

  // Skip if we're still placing the cue ball
  if (ballInHand) return;

  // Table boundaries for validating mouse clicks
  const tableLeft = snookerTable.tableOffsetX;
  const tableRight = snookerTable.tableOffsetX + snookerTable.tableWidth;
  const tableTop = snookerTable.tableOffsetY;
  const tableBottom = snookerTable.tableOffsetY + snookerTable.tableHeight;

  // Ensure click is within the table and that the cue ball is at rest
  if (
    mouseX >= tableLeft && mouseX <= tableRight &&
    mouseY >= tableTop && mouseY <= tableBottom &&
    velocityMagnitude <= 0.009
  ) {
    const forceMagnitude = speedSlider.value() / 1000;

    // Calculate the direction from the cue ball to mouse
    const forceDirection = {
      x: mouseX - cueBall.position.x,
      y: mouseY - cueBall.position.y,
    };

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
}

function keyPressed() {
  if (key === '1') {
    resetBalls();               //remove old from Matter.World + empty the array
    Ball.initializeBalls(
      1,
      snookerTable.tableWidth,
      snookerTable.tableHeight,
      snookerTable.tableOffsetX,
      snookerTable.tableOffsetY,
      snookerTable.baulkLineX,
      snookerTable.dRadius
    );

    // Identify the cue ball from the global balls array
    cueBall = balls.find(ball => ball.body.label === "cueBall").body;

    // Build an array of labels for all colored balls
    let j = 0;
    for (let i = 0; i < balls.length; i++) {
      if (balls[i].body.label !== "redBall" && balls[i].body.label !== "cueBall") {
        coloredBalls[j] = balls[i].body.label;
        j++;
      }
    }

    // Create the cue linked to the cue ball
    cue = new Cue(cueBall);
  } 
  else if (key === '2') {
    resetBalls();
    Ball.initializeBalls(
      2,
      snookerTable.tableWidth,
      snookerTable.tableHeight,
      snookerTable.tableOffsetX,
      snookerTable.tableOffsetY,
      snookerTable.baulkLineX,
      snookerTable.dRadius
    );

    // Identify the cue ball from the global balls array
    cueBall = balls.find(ball => ball.body.label === "cueBall").body;

    // Build an array of labels for all colored balls
    let j = 0;
    for (let i = 0; i < balls.length; i++) {
      if (balls[i].body.label !== "redBall" && balls[i].body.label !== "cueBall") {
        coloredBalls[j] = balls[i].body.label;
        j++;
      }
    }

    // Create the cue linked to the cue ball
    cue = new Cue(cueBall);
  } 
  else if (key === '3') {
    resetBalls();
    Ball.initializeBalls(
      3,
      snookerTable.tableWidth,
      snookerTable.tableHeight,
      snookerTable.tableOffsetX,
      snookerTable.tableOffsetY,
      snookerTable.baulkLineX,
      snookerTable.dRadius
    );

    // Identify the cue ball from the global balls array
    cueBall = balls.find(ball => ball.body.label === "cueBall").body;

    // Build an array of labels for all colored balls
    let j = 0;
    for (let i = 0; i < balls.length; i++) {
      if (balls[i].body.label !== "redBall" && balls[i].body.label !== "cueBall") {
        coloredBalls[j] = balls[i].body.label;
        j++;
      }
    }

    // Create the cue linked to the cue ball
    cue = new Cue(cueBall);
  }
}


