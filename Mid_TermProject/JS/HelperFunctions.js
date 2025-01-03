/**
 * Creates and positions a "Start Game" button. On click, sets the game as started
 * and hides the button. Also prevents the first click after the game starts
 * from immediately triggering the cue ball shot.
 */
function gameStartBtn() {
  const buttonStart = createButton('Start Game');
  
  // Position the button in the center of the canvas
  buttonStart.position(canvas.width / 2 - 50, canvas.height / 2);
  
  buttonStart.mousePressed(() => {
    gameStarted = true;
    buttonStart.hide();
    
    // Ignore the next mouse click so the cue doesn’t instantly shoot
    ignoreNextClick = true;
  });
}

/**
 * Creates and positions a vertical slider (by rotating its style 90 degrees).
 * This slider is used to adjust the cue ball's speed.
 */
function slider() {
  // Calculate the slider's position relative to the table
  const sliderPosX = -135;
  const sliderPosY = snookerTable.tableOffsetY + snookerTable.tableHeight / 2;
  
  // Create a slider with a range from 1 to 20, defaulting to 10
  speedSlider = createSlider(1, 20, 10);
  speedSlider.position(sliderPosX, sliderPosY);
  
  // Style the slider and rotate it -90 degrees for a vertical orientation
  speedSlider.style('width', '400px');
  speedSlider.style('transform', 'rotate(-90deg)');
  
  // Initially hide it; only show once the cue ball position is confirmed
  speedSlider.hide();
}

/**
 * Creates a "Confirm" button to lock the cue ball's position on the first turn.
 * If the cue ball is validly placed (e.g., within the "D"), the button hides,
 * and the user can proceed to strike the cue ball.
 */
function cueBallConfirmPos() {
  Btn_confirmCueballPos = createButton('Confirm');
  
  // Position the confirm button slightly below the top edge of the canvas
  Btn_confirmCueballPos.position(canvas.width / 2 - dpHeight, dpHeight * 1.75);
  Btn_confirmCueballPos.hide();
  
  Btn_confirmCueballPos.mouseClicked(() => {
    // Check if the cue ball is placed correctly on the "D"
    if (checkIfCueBallonD()) {
      Btn_confirmCueballPos.hide();
      ballInHand = false;
      startTimer();            // Start the game timer
      
      // Now the speed slider becomes visible
      speedSlider.show();

      // Re-enable collisions for other balls
      for (let i = 0; i < balls.length; i++) {
        if (balls[i].body.label !== 'cueBall') {
          balls[i].body.collisionFilter.mask = 1;
        }
      }

      // Remove the mouse constraint to prevent further repositioning
      Matter.World.remove(world, mouseConstraint);
    }
  });
}

/**
 * Initializes mouse interaction with the table using Matter.js MouseConstraint.
 * Used to allow the player to move the cue ball on the first turn.
 */
function mouseInteraction() {
  // Create a Matter.js mouse instance from the p5 canvas
  const canvasMouse = Mouse.create(canvas.elt);
  
  // Create a constraint to manipulate bodies with the mouse
  mouseConstraint = MouseConstraint.create(engine, {
    mouse: canvasMouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false, // Hide the default mouse drag lines
      },
    },
  });

  // Add the mouse constraint to the physics world
  World.add(world, mouseConstraint);
}
