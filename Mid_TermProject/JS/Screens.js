/**
 * Displays the start screen with a welcome message and a prompt to begin the game.
 */
function displayStartScreen() {
  push(); // Save current style/transform
    textAlign(CENTER, CENTER);
    fill("white");
    textSize(32);
    textStyle(BOLD);

    // Main title
    text("Welcome to Snooker!", width / 2, height / 3);

    // Prompt
    textSize(18);
    text("Click 'Start Game' to begin.", width / 2, height / 2.5);
  pop(); // Restore style/transform
}

/**
 * Shows the main game screen, including the table, balls, scoring, turn details,
 * foul messages, cue stick (when ball is still), and the game timer.
 */
function displayGameScreen() {
  // Draw the snooker table
  snookerTable.draw();

  // Draw all balls
  balls.forEach((ball) => ball.draw());

  // Handle "againTurn" switch
  if (againTurn){
    currentPlayer = (currentPlayer === 1) ? 2 : 1;
    againTurn = false;
  }

  if(!disable){
    // Indicate whose turn it is
    push();
      fill("lightgreen");
      textAlign(CENTER);
      textSize(24);
      textStyle(BOLD);
      text(
        `Player ${currentPlayer === 1 ? "One" : "Two"}'s Turn`,
        width / 2,
        dpHeight
      );
    pop();
  }

  // Handle cue ball in hand on first turn
  if (ballInHand) {
    // Temporarily disable collisions for all non-cue balls
    for (let i = 0; i < balls.length; i++) {
      if (balls[i].body.label !== 'cueBall') {
        balls[i].body.collisionFilter.mask = 0;
      }
    }

    // Show confirm button for cue ball position
    Btn_confirmCueballPos.show();

    // Display incorrect positioning warning if needed
    if (IncorrectMessageVisible) {
      push();
        fill("red");
        textAlign(CENTER, CENTER);
        textSize(24);
        textStyle(BOLD);
        text("Incorrect Position for cueBall!", width / 2, height / 3);
      pop();
    }

    // Instruction to place the cue ball within the "D"
    push();
      fill("White");
      textAlign(CENTER, CENTER);
      textSize(24);
      text(
        "White ball in hand, move it to desired position on 'D'",
        width / 2,
        dpHeight * 1.4
      );
    pop();
    return; // Skip further UI until cue ball is confirmed
  }

  // Highlight the current player's score in yellow
  if (!disable) {
    push();
      fill("Yellow");
      textAlign(LEFT);
      textSize(24);
      textStyle(BOLD);
      text(
        `Player ${
          currentPlayer === 1
            ? "1 Score: " + player1Score
            : "2 Score: " + player2Score
        }`,
        dpHeight,
        dpHeight
      );
    pop();

    // Show the opponent’s score in white
    push();
      fill("white");
      textAlign(LEFT);
      textSize(18);
      textStyle(BOLD);
      text(
        `Player ${
          currentPlayer === 1
            ? "2 Score: " + player2Score
            : "1 Score: " + player1Score
        }`,
        dpHeight,
        dpHeight * 1.5
      );
    pop();
  } else {
    push();
      fill("Red");
      textAlign(LEFT);
      textSize(24);
      textStyle(BOLD);
      text("INTRUDER DETECTED! You are being targeted",
        30,
        dpHeight
      );
    pop();
  }

  // Show foul message if active
  if (foulMessageVisible) {
    push();
      fill("red");
      textAlign(CENTER, CENTER);
      textSize(24);
      textStyle(BOLD);
      text("Foul! Next player's turn.", width / 2, height / 2);
    pop();
  }

  // Hint to switch mode.
  push();
    fill("Yellow");
    textAlign(CENTER);
    textSize(16);
    textStyle(BOLD);
    text(
      `1, 2, 3, 4, 5 to change Game Modes\n Press Enter to Switch controls\n Current Control: ${
        isMouseControlled ? "Mouse" : "Keyboard"
      }`,
      canvas.width - snookerTable.tableOffsetX,
      dpHeight
    );
  pop();

  
  if(!disable){
    // Draw the game timer
    drawTimer();

    // Draw Cue
    drawCueWhenVelocity(0.09);
  } else {
    drawCueWhenVelocity(0.9);
  }
}