const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

var canvas, engine, world;
var snookerTable, balls = [], cue, cueBall;
var velocityMagnitude;
var player1Score = 0, player2Score = 0, currentPlayer = 1, dpHeight = 50;
var timer = 60, timerInterval, foulMessageVisible = false, foulMessageTimeout;

function setup() {
  // Framerate limit and canvas
  frameRate(60);
  canvas = createCanvas(1000, 600);

  // Initialize engine
  engine = Engine.create();
  world = engine.world;

  // Gravity 0 at y axis as it is top view game
  engine.gravity.y = 0;

  // Create snooker table
  snookerTable = new SnookerTable({
    tableWidth: 800,
    tableOffsetX: 100,
    tableOffsetY: 150,
    colors: {
      tableMat: "#009A17",
      innerBorder: "#004C54",
      pocket: "black",
      line: "white",
      outerBorder: "#964e02",
    },
  });

  // Create balls
  Ball.initializeBalls(
    snookerTable.tableWidth,
    snookerTable.tableHeight,
    snookerTable.tableOffsetX,
    snookerTable.tableOffsetY,
    snookerTable.baulkLineX,
    snookerTable.dRadius
  );

  // Separate cueBall from balls
  cueBall = balls.find(ball => ball.body.label === "cueBall").body;

  // Create cue
  cue = new Cue(cueBall);

  // CueBall speed adjustment
  speedSlider = createSlider(1, 20, 5);
  speedSlider.position(20, 20);
  speedSlider.style('width', '200px');

  startTimer();

  Matter.Events.on(engine, 'collisionStart', handlePocketCollision);
  Matter.Runner.run(engine);
}

function draw() {
  // Mouse position and Bg
  const mousePos = { x: mouseX, y: mouseY };
  background("#154734");

  // Draw snookertable
  snookerTable.draw();

  // Draw balls
  balls.forEach((ball) => ball.draw());

  // Draw cue only when ball is at rest
  // Also projectile from cueBall
  velocityMagnitude = Math.sqrt(
    cueBall.velocity.x ** 2 + cueBall.velocity.y ** 2
  );

  if (velocityMagnitude <= 0.009) {
    cue.drawCue(mousePos);
    cue.update();
  }

  // Display Current Player
  push();
    fill("white");
    textAlign(CENTER);
    textSize(24);
    textStyle(BOLD);
    if (currentPlayer === 1){
      text("Player One's Turn", width / 2, dpHeight);
    } else {
      text("Player Two's Turn", width / 2, dpHeight);
    }
  pop();

  // Display foul message if active
  if (foulMessageVisible) {
    push();
      fill("red");
      textAlign(CENTER, CENTER);
      textSize(24);
      textStyle(BOLD);
      text("Foul! Next player's turn.", width / 2, height / 2);
    pop();
  }

  drawTimer();
}