function displayStartScreen() {
  push();
    textAlign(CENTER, CENTER);
    fill("white");
    textSize(32);
    textStyle(BOLD);
    text("Welcome to Snooker!", width / 2, height / 3);
    textSize(18);
    text("Click 'Start Game' to begin.", width / 2, height / 2.5);
  pop();
}

function displayGameScreen() {

  // Draw snookerTable
  snookerTable.draw();

  // Draw balls
  balls.forEach((ball) => ball.draw());

  // No need for cue to create and other balls to move if it is first turn
  if (ballInHand){
    for(i = 0; i < balls.length; i++){
      if (balls[i].body.label !== 'cueBall'){
        balls[i].body.collisionFilter.mask = 0;
      }
    }
    
    Btn_confirmCueballPos.show();

    // Foul message if cue is at wrong position
    if (IncorrectMessageVisible) {
      push();
        fill("red");
        textAlign(CENTER, CENTER);
        textSize(24);
        textStyle(BOLD);
        text("Incorrect Position for cueBall!", width / 2, height / 3);
      pop();
    }
    
    push();
      fill("White");
      textAlign(CENTER, CENTER);
      textSize(24);
      text("Place the white ball on desired position on 'D'", width / 2, dpHeight*1.25);
    pop();
    return;
  }

  // Display player 1 Score
  push();
    fill("Yellow");
    textAlign(LEFT);
    textSize(24);
    textStyle(BOLD);
    text(
      `Player ${currentPlayer === 1 ? "1 Score: " + player1Score : "2 Score: " + player2Score}`,
      dpHeight,
      dpHeight);
  pop();

  push();
    fill("white");
    textAlign(LEFT);
    textSize(18);
    textStyle(BOLD);
    text(
      `Player ${currentPlayer === 1 ? "2 Score: " + player2Score : "1 Score: " + player1Score}`,
      dpHeight,
      dpHeight*1.5);
  pop();

  // Display player turn
  push();
    fill("lightgreen");
    textAlign(CENTER);
    textSize(24);
    textStyle(BOLD);
    text(`Player ${currentPlayer === 1 ? "One" : "Two"}'s Turn`, width / 2 + 5, dpHeight);
  pop();

  // Foul message when timers goes to 0
  if (foulMessageVisible) {
    push();
      fill("red");
      textAlign(CENTER, CENTER);
      textSize(24);
      textStyle(BOLD);
      text("Foul! Next player's turn.", width / 2, height / 2);
    pop();
  }

  // Calculate cue ball velocity
  velocityMagnitude = Math.sqrt(
      cueBall.velocity.x ** 2 + cueBall.velocity.y ** 2
  );

  // Draw cue only when ball is at rest
  if (velocityMagnitude <= 0.009) {
      cue.drawCue({ x: mouseX, y: mouseY });
      cue.update();
  }

  drawTimer();
}