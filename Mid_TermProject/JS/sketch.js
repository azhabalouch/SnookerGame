const { Engine, Render, Runner, World, Bodies, Body, Events, Mouse, MouseConstraint } = Matter;

var 
  canvas,
  engine,
  world,
  snookerTable,
  balls = [],
  cue,
  cueBall,
  velocityMagnitude,
  dpHeight = 50,
  player1Score = 0,
  player2Score = 0,
  currentPlayer = 1,
  timer = 60,
  timerInterval,
  foulMessageVisible = false,
  foulMessageTimeout,
  IncorrectMessageVisible = false,
  IncorrectMessageTimeout,
  gameStarted = false,
  buttonStart,
  Btn_confirmCueballPos,
  ignoreNextClick = false,
  ballInHand = true,
  mouseConstraint;

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
    tableOffsetX: 150,
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

  // Game start button
  buttonStart = createButton('Start Game');
  buttonStart.position(canvas.width / 2 - 50, canvas.height / 2);
  buttonStart.mousePressed(() => {
    gameStarted = true;
    buttonStart.hide();

    // Next click is ignored (so the cue doesn’t instantly shoot)
    ignoreNextClick = true;
  });

  var sliderPosX = -135;
  var sliderPosY = snookerTable.tableOffsetY + snookerTable.tableHeight / 2;
  
  // CueBall speed adjustment
  speedSlider = createSlider(1, 20, 10);
  speedSlider.position(sliderPosX, sliderPosY);
  speedSlider.style('width', '400px');
  speedSlider.style('transform', 'rotate(-90deg)');
  speedSlider.hide();

  // For only first turn add mouse interaction
  const canvasMouse = Mouse.create(canvas.elt);
  mouseConstraint = MouseConstraint.create(engine, {
    mouse: canvasMouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false, // Hide the mouse interaction visuals
      },
    },
  });

  World.add(world, mouseConstraint);

  // Confirm cueball position on first turn
  Btn_confirmCueballPos = createButton('Confirm')
  Btn_confirmCueballPos.position(canvas.width / 2 - dpHeight, dpHeight*1.75);
  Btn_confirmCueballPos.hide();
  Btn_confirmCueballPos.mouseClicked(() => {
    if(checkIfCueBallonD()){
      Btn_confirmCueballPos.hide();
      ballInHand = false;
      speedSlider.show();

      for(i = 0; i < balls.length; i++){
        if (balls[i].body.label !== 'cueBall'){
          balls[i].body.collisionFilter.mask = 1;
        }
      }

      Matter.World.remove(world, mouseConstraint);
    }
  });

  startTimer();
  Matter.Events.on(engine, 'collisionStart', handlePocketCollision);
  Matter.Runner.run(engine);
}

function draw() {
  background("#154734");

  if (!gameStarted) {
    // Display the start screen
    displayStartScreen();
  } else {
    // Display the game screen
    displayGameScreen();
  }
}