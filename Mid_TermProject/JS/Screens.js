/**
 * Displays the start screen for the game. This includes a welcome message
 * and instructions to click the "Start Game" button.
 */
function displayStartScreen() {
  push(); // Save current drawing style and transformations
    textAlign(CENTER, CENTER);
    fill("white");
    textSize(32);
    textStyle(BOLD);

    // Main title
    text("Welcome to Snooker!", width / 2, height / 3);

    // Instructional text
    textSize(18);
    text("Click 'Start Game' to begin.", width / 2, height / 2.5);
  pop(); // Restore previous drawing style and transformations
}

/**
 * Renders the main game screen. This function:
 * 1. Draws the snooker table and all balls.
 * 2. Handles first-turn logic if the cue ball is in hand.
 * 3. Displays player scores, turn information, and foul messages.
 * 4. Draws the cue stick if the cue ball is stationary.
 * 5. Updates the game timer display.
 */
function displayGameScreen() {
  // Draw the snooker table
  snookerTable.draw();

  // Draw all the balls
  balls.forEach((ball) => ball.draw());

  // If it's the first turn and the cue ball is in hand, allow positioning
  if (ballInHand) {
    // Temporarily disable collisions for all non-cue balls
    for (let i = 0; i < balls.length; i++) {
      if (balls[i].body.label !== 'cueBall') {
        balls[i].body.collisionFilter.mask = 0;
      }
    }

    // Show the button to confirm cue ball position
    Btn_confirmCueballPos.show();

    // If the cue ball is incorrectly positioned, display a warning message
    if (IncorrectMessageVisible) {
      push();
        fill("red");
        textAlign(CENTER, CENTER);
        textSize(24);
        textStyle(BOLD);
        text("Incorrect Position for cueBall!", width / 2, height / 3);
      pop();
    }

    // Instruction to place the cue ball in the "D"
    push();
      fill("White");
      textAlign(CENTER, CENTER);
      textSize(24);
      text("Place the white ball on desired position on 'D'", width / 2, dpHeight * 1.25);
    pop();

    // End the function here, so the rest of the UI won't draw yet
    return;
  }

  // -----------------------------------------
  // Display scoring information
  // -----------------------------------------

  // Show the score of the current player in bold yellow
  push();
    fill("Yellow");
    textAlign(LEFT);
    textSize(24);
    textStyle(BOLD);
    text(
      `Player ${currentPlayer === 1 ? "1 Score: " + player1Score : "2 Score: " + player2Score}`,
      dpHeight,
      dpHeight
    );
  pop();

  // Show the opponent's score in bold white
  push();
    fill("white");
    textAlign(LEFT);
    textSize(18);
    textStyle(BOLD);
    text(
      `Player ${currentPlayer === 1 ? "2 Score: " + player2Score : "1 Score: " + player1Score}`,
      dpHeight,
      dpHeight * 1.5
    );
  pop();

  // -----------------------------------------
  // Display turn information
  // -----------------------------------------
  push();
    fill("lightgreen");
    textAlign(CENTER);
    textSize(24);
    textStyle(BOLD);
    text(`Player ${currentPlayer === 1 ? "One" : "Two"}'s Turn`, width / 2 + 5, dpHeight);
  pop();

  // Display foul message if triggered (e.g., by a timer running out)
  if (foulMessageVisible) {
    push();
      fill("red");
      textAlign(CENTER, CENTER);
      textSize(24);
      textStyle(BOLD);
      text("Foul! Next player's turn.", width / 2, height / 2);
    pop();
  }

  // -----------------------------------------
  // Cue ball velocity and cue stick
  // -----------------------------------------

  // Calculate the current cue ball velocity
  velocityMagnitude = Math.sqrt(
    cueBall.velocity.x ** 2 + cueBall.velocity.y ** 2
  );

  // If cue ball is almost stationary, draw and update the cue stick
  if (velocityMagnitude <= 0.009) {
    cue.drawCue({ x: mouseX, y: mouseY });
    cue.update();
  }

  // -----------------------------------------
  // Draw the game timer
  // -----------------------------------------
  drawTimer();
}