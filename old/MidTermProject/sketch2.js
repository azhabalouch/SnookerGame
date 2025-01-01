var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies;

var tableWidth,
    tableHeight,
    tableOffsetX,
    tableOffsetY,
    ballDiameter,
    pocketDiameter,
    timerInterval,
    engine,
    world,
    balls = [],
    gameStarted = false,
    foul = false,
    score = 0,
    cueBall;

function setup() {
  createCanvas(1000, 600);

  // Button for starting the game
  startButton = createButton("Start Game");
  startButton.position(width / 2 - 40, height / 2 - 20);
  startButton.style("font-size", "20px");
  startButton.style("padding", "10px");
  startButton.mousePressed(() => {
    gameStarted = true;
    startButton.hide(); // Hide the button after starting
  });

  engine = Engine.create();
  world = engine.world;

  // Disable gravity for top-down view
  engine.world.gravity.y = 0; // No vertical gravity
  engine.world.gravity.x = 0; // No horizontal gravity (if accidentally enabled)

  //Table ratio
  tableWidth = 800;
  tableHeight = tableWidth / 2;
  pocketDiameter = tableWidth / 36 * 1.5;

  tableOffsetX = (width - tableWidth) / 2; // Horizontal offset to center table
  tableOffsetY = (height - tableHeight) / 2; // Vertical offset to center table

  // Table boundaries (invisible walls)
  let tableBoundaryOptions = {
    isStatic: true,
    restitution: 1, // Perfect reflection for cushions
    friction: 0 // No friction to simulate ideal physics
  };

  // Create boundaries for the table
  let leftWall = Matter.Bodies.rectangle(tableOffsetX, tableOffsetY + tableHeight / 2, 10, tableHeight, tableBoundaryOptions);
  let rightWall = Matter.Bodies.rectangle(tableOffsetX + tableWidth, tableOffsetY + tableHeight / 2, 10, tableHeight, tableBoundaryOptions);
  let topWall = Matter.Bodies.rectangle(tableOffsetX + tableWidth / 2, tableOffsetY, tableWidth, 10, tableBoundaryOptions);
  let bottomWall = Matter.Bodies.rectangle(tableOffsetX + tableWidth / 2, tableOffsetY + tableHeight, tableWidth, 10, tableBoundaryOptions);

  // Add boundaries to the world
  Matter.World.add(world, [leftWall, rightWall, topWall, bottomWall]);

  setupBalls();

  // Start Timer
  startTimer();

  Engine.run(engine);
}

function draw() {
  frameRate(60); // Set framerate limit

  background("green");

  // Display game title
  textAlign(CENTER);
  fill(255);
  textSize(32);
  text("Snooker Game", width / 2 + 20, 50);

  // Start game mechanics if the game has started
  // if (gameStarted) {
  //   drawGame();
  // }

  drawGame();

  // Show foul alert if needed
  if (foul) {
    fill(255, 0, 0); // Red text for foul
    textSize(24);
    textAlign(CENTER);
    text("FOUL!", width / 2, height / 2 + 50);
  }

  // Start game mechanics if the game has started
  if (gameStarted) {
    drawGame();
  }
}

function setupBalls() {
  let ballDiameter = tableWidth / 36;

  // Ball position setup
  let blackX = tableOffsetX + tableWidth * 7 / 8; // 7/8th along the width
  let blackY = tableOffsetY + tableHeight / 2;   // Centerline

  let pinkX = tableOffsetX + tableWidth * 3 / 4; // 3/4th along the width
  let pinkY = tableOffsetY + tableHeight / 2;   // Centerline

  let blueX = tableOffsetX + tableWidth / 2;    // Center of the table
  let blueY = tableOffsetY + tableHeight / 2;  // Centerline

  let brownX = tableOffsetX + tableWidth / 4;  // 1/4th along the width
  let brownY = tableOffsetY + tableHeight / 2; // Centerline

  let greenX = tableOffsetX + tableWidth / 4;      // Same X as brown ball
  let greenY = tableOffsetY + tableHeight / 2 - ballDiameter * 2; // Above brown

  let yellowX = tableOffsetX + tableWidth / 4;       // Same X as brown ball
  let yellowY = tableOffsetY + tableHeight / 2 + ballDiameter * 2; // Below brown

  // Colored balls
  balls.push(new Ball(blackX, blackY, ballDiameter / 2, "black"));
  balls.push(new Ball(pinkX, pinkY, ballDiameter / 2, "pink"));
  balls.push(new Ball(blueX, blueY, ballDiameter / 2, "blue"));
  balls.push(new Ball(brownX, brownY, ballDiameter / 2, "brown"));
  balls.push(new Ball(greenX, greenY, ballDiameter / 2, "green"));
  balls.push(new Ball(yellowX, yellowY, ballDiameter / 2, "yellow"));

  // Add red balls in a triangle near pink ball
  setupRedTriangle(pinkX - ballDiameter * 3, pinkY, ballDiameter);

  // Cue ball in D zone
  cueBall = new Ball(tableWidth / 4, tableHeight / 2, ballDiameter / 2, "white");
  balls.push(cueBall);
}

function setupRedTriangle(baseX, baseY, ballDiameter) {
    let rows = 5; // Standard red triangle has 5 rows
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j <= i; j++) {
            let x = baseX + j * ballDiameter * 1.1; // Slight spacing
            let y = baseY - i * ballDiameter * 1.1;
            balls.push(new Ball(x, y, ballDiameter / 2, "red"));
        }
    }
}


function handlePocket(ball) {
  if (ball.isRed) {
    score += 1; // Red ball score
  } else if (ball.color === "yellow") {
    score += 2;
  } else if (ball.color === "green") {
    score += 3;
  } else if (ball.color === "brown") {
    score += 4;
  } else if (ball.color === "blue") {
    score += 5;
  } else if (ball.color === "pink") {
    score += 6;
  } else if (ball.color === "black") {
    score += 7;
  } else {
    foul = true;
    score -= 4; // Deduct for foul
    setTimeout(() => (foul = false), 2000); // Reset foul alert after 2 seconds
  }

  // Remove ball from world and array
  World.remove(world, ball.body);
  balls = balls.filter(b => b !== ball);
}

function checkPocketCollision() {
  balls.forEach((ball) => {
    var pos = ball.body.position;

    // Check if ball falls in any pocket
    if (
      // Top-left pocket
      (pos.x < tableOffsetX + pocketDiameter / 2 && pos.y < tableOffsetY + pocketDiameter / 2) || 

      // Top-right pocket
      (pos.x > tableOffsetX + tableWidth - pocketDiameter / 2 && pos.y < tableOffsetY + pocketDiameter / 2) || 

      // Bottom-left pocket
      (pos.x < tableOffsetX + pocketDiameter / 2 && pos.y > tableOffsetY + tableHeight - pocketDiameter / 2) || 

      // Bottom-right pocket
      (pos.x > tableOffsetX + tableWidth - pocketDiameter / 2 && pos.y > tableOffsetY + tableHeight - pocketDiameter / 2) || 

      // Top-middle pocket
      (pos.x > tableOffsetX + tableWidth / 2 - pocketDiameter / 2 &&
      pos.x < tableOffsetX + tableWidth / 2 + pocketDiameter / 2 &&
      pos.y < tableOffsetY + pocketDiameter / 2) || 

      // Bottom-middle pocket
      (pos.x > tableOffsetX + tableWidth / 2 - pocketDiameter / 2 &&
      pos.x < tableOffsetX + tableWidth / 2 + pocketDiameter / 2 &&
      pos.y > tableOffsetY + tableHeight - pocketDiameter / 2)
    ) {
      handlePocket(ball); // Call function to handle ball pocketing
    }
  });
}

function drawGame() {
  // Table border
  var tableBorderWidth = 30;

  push();
    fill("brown");
    rect(
        tableOffsetX - tableBorderWidth,
        tableOffsetY - tableBorderWidth,
        tableWidth + tableBorderWidth*2, // To fill bottom and right border
        tableHeight + tableBorderWidth*2,
        20
    );
  pop();

  // Table border inner outline
  push();
    fill(34, 139, 34); // Table surface
    stroke('Green');
    strokeWeight(7);
    rect(tableOffsetX, tableOffsetY, tableWidth, tableHeight, 20);
  pop();

  // Check for collisions with pockets
  checkPocketCollision();
    
  // Balls
  balls.forEach(ball => ball.show());

  // Pockets
  fill(0); // Black
  circle(tableOffsetX, tableOffsetY, pocketDiameter); // Top-left
  circle(tableOffsetX + tableWidth, tableOffsetY, pocketDiameter); // Top-right
  circle(tableOffsetX, tableOffsetY + tableHeight, pocketDiameter); // Bottom-left
  circle(tableOffsetX + tableWidth, tableOffsetY + tableHeight, pocketDiameter); // Bottom-right
  circle(tableOffsetX + tableWidth / 2, tableOffsetY, pocketDiameter); // Middle-top
  circle(tableOffsetX + tableWidth / 2, tableOffsetY + tableHeight, pocketDiameter); // Middle-bottom

  // Cue
  push();
    stroke(200);
    strokeWeight(4);
    line(mouseX, mouseY, cueBall.body.position.x, cueBall.body.position.y);
  pop();

  // Show score
  fill(255);
  textSize(20);
  textAlign(LEFT);
  text(`Score: ${score}`, 20, 30);

  // Draw timer
  drawTimer();

  // Exit button
  exitButton = createButton("Exit Game");
  exitButton.position(width - 100, 10);
  exitButton.style("font-size", "16px");
  exitButton.mousePressed(() => {
    var confirmExit = confirm("Are you sure you want to exit the game?");
    if (confirmExit) {
      window.location.reload(); // Reload the page to exit
    }
  });
}

function startTimer() {
  timer = 60; // Reset the timer to 60 seconds
  clearInterval(timerInterval); // Clear any existing timer
  timerInterval = setInterval(() => {
    timer--;
    if (timer <= 0) {
      handleFoul(); // Trigger foul when time runs out
      timer = 60; // Reset timer for next move
    }
  }, 1000); // Decrease timer every second
}

function drawTimer() {
  textAlign(RIGHT);
  textSize(20);
  fill(255);
  text(`Timer: ${timer}s`, width - 120, 30);
}

function handleFoul() {
  foul = true;
  score -= 4; // Deduct points for a foul
  setTimeout(() => (foul = false), 2000); // Clear foul message after 2 seconds
}


class Ball {
  constructor(x, y, radius, color) {
      this.body = Matter.Bodies.circle(x, y, radius, {
          restitution: 0.9, // Elastic collisions
          friction: 0,      // No rolling friction
          frictionAir: 0.01 // Slight air resistance for realism
      });
      this.radius = radius;
      this.color = color;
      Matter.World.add(world, this.body);
  }

  show() {
      let pos = this.body.position;
      fill(this.color);
      circle(pos.x, pos.y, this.radius * 2);
  }
}

