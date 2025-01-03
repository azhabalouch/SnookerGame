/**
 * Handles collisions between balls and pockets during the game.
 * @param {Object} event - The collision event object from Matter.js.
 */
function handlePocketCollision(event) {
  const pairs = event.pairs; // Get the collision pairs from the event

  pairs.forEach(pair => {
    const bodyA = pair.bodyA; // First body in the collision
    const bodyB = pair.bodyB; // Second body in the collision

    // Check if a ball collides with a pocket
    if (
      (bodyA.label === 'pocket' && bodyB.label.endsWith('Ball')) ||
      (bodyB.label === 'pocket' && bodyA.label.endsWith('Ball'))
    ) {
      // Identify which body is the ball
      const ball = bodyA.label.endsWith('Ball') ? bodyA : bodyB;

      console.log(`${ball.label} potted in pocket!`); // Log the event

      // Remove the potted ball from the Matter.js simulation
      Matter.World.remove(world, ball);

      // Remove the ball from the `balls` array
      balls = balls.filter(b => b.body !== ball);
    }
  });
}

/**
 * Handles mouse click events for shooting or positioning the cue ball.
 */
function mouseClicked() {
  // Ignore the first click after the game starts
  if (ignoreNextClick) {
    ignoreNextClick = false; // Reset the flag so subsequent clicks are processed
    return;
  }

  // If the ball is in hand (positioning phase), ignore shooting logic
  if (ballInHand) {
    return;
  }

  // Table boundary values for validation
  const tableLeft = snookerTable.tableOffsetX;
  const tableRight = snookerTable.tableOffsetX + snookerTable.tableWidth;
  const tableTop = snookerTable.tableOffsetY;
  const tableBottom = snookerTable.tableOffsetY + snookerTable.tableHeight;

  // Check if the mouse click is within table boundaries and the cue ball is stationary
  if (
    mouseX >= tableLeft && mouseX <= tableRight && // Horizontal bounds
    mouseY >= tableTop && mouseY <= tableBottom && // Vertical bounds
    velocityMagnitude <= 0.009 // Ensure the cue ball is at rest
  ) {
    const forceMagnitude = speedSlider.value() / 1000; // Force magnitude based on slider value

    // Calculate the direction vector from the cue ball to the mouse position
    const forceDirection = {
      x: mouseX - cueBall.position.x,
      y: mouseY - cueBall.position.y,
    };

    // Normalize the direction vector to get a unit vector
    const directionMagnitude = Math.sqrt(
      forceDirection.x ** 2 + forceDirection.y ** 2
    );
    const normalizedDirection = {
      x: forceDirection.x / directionMagnitude,
      y: forceDirection.y / directionMagnitude,
    };

    // Apply the calculated force to the cue ball in the specified direction
    Matter.Body.applyForce(cueBall, cueBall.position, {
      x: normalizedDirection.x * forceMagnitude,
      y: normalizedDirection.y * forceMagnitude,
    });

    // Switch the current player after the shot, with a delay to simulate ball movement time
    setTimeout(() => {
      resetTimer(); // Reset the game timer for the next player's turn
      currentPlayer = (currentPlayer === 1) ? 2 : 1; // Toggle between players
    }, 1500); // Delay time in milliseconds
  }
}
