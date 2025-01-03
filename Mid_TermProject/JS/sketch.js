// Importing required modules from Matter.js
const { 
  Engine,
  Render,
  Runner,
  World,
  Bodies,
  Body,
  Events,
  Mouse,
  MouseConstraint
} = Matter;

// Declaring variables for the game
var 
  canvas,                 // The canvas where the game will be rendered
  engine,                 // Physics engine instance
  world,                  // World instance for the physics engine
  snookerTable,           // Snooker table instance
  balls = [],             // Array to hold ball instances
  cue,                    // Cue instance
  cueBall,                // Reference to the cue ball
  velocityMagnitude,      // Magnitude of velocity for ball movement
  dpHeight = 50,          // Display panel height
  player1Score = 0,       // Score for Player 1
  player2Score = 0,       // Score for Player 2
  currentPlayer = 1,      // Indicator for the current player (1 or 2)
  timer = 60,             // Timer for the game
  timerInterval,          // Interval ID for the timer
  foulMessageVisible = false,  // Visibility flag for foul messages
  foulMessageTimeout,     // Timeout ID for foul message visibility
  IncorrectMessageVisible = false, // Visibility flag for incorrect move messages
  IncorrectMessageTimeout,// Timeout ID for incorrect move message visibility
  gameStarted = false,    // Flag to indicate if the game has started
  buttonStart,            // Start button element
  Btn_confirmCueballPos,  // Button to confirm cue ball position
  ignoreNextClick = false,// Flag to ignore unintended mouse clicks
  ballInHand = true,      // Indicates if the ball is in hand (free placement)
  mouseConstraint;        // Mouse constraint for interactions

/**
 * The setup function initializes the game and its components.
 */
function setup() {
  // Set frame rate and create canvas
  frameRate(60);
  canvas = createCanvas(1000, 600);

  // Initialize physics engine and world
  engine = Engine.create();
  world = engine.world;

  // Disable gravity in the y-axis for top-view gameplay
  engine.gravity.y = 0;

  // Create the snooker table with specified dimensions and colors
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

  // Initialize balls and position them on the table
  Ball.initializeBalls(
    snookerTable.tableWidth,
    snookerTable.tableHeight,
    snookerTable.tableOffsetX,
    snookerTable.tableOffsetY,
    snookerTable.baulkLineX,
    snookerTable.dRadius
  );

  // Separate the cue ball from the other balls
  cueBall = balls.find(ball => ball.body.label === "cueBall").body;

  // Create a cue object to interact with the cue ball
  cue = new Cue(cueBall);

  // Initialize UI elements and interactions
  gameStartBtn();          // Create the game start button
  slider();                // Initialize sliders
  mouseInteraction();      // Enable mouse interactions
  cueBallConfirmPos();     // Confirm cue ball position

  // Add collision event listener for ball-pocket interactions
  Matter.Events.on(engine, 'collisionStart', handlePocketCollision);

  // Start the physics engine runner
  Matter.Runner.run(engine);
}

/**
 * The draw function continuously renders the game screen.
 */
function draw() {
  // Set background color
  background("#154734");

  if (!gameStarted) {
    // Render the start screen if the game hasn't started
    displayStartScreen();
  } else {
    // Render the main game screen during gameplay
    displayGameScreen();
  }
}
