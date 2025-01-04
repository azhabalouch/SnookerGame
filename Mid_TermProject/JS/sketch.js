/*****************************************************************************
 * Snooker Game - Main Sketch
 * 
 * This file sets up the p5.js canvas, initializes the Matter.js engine,
 * creates the snooker table, balls, cues, and handles the main game loop
 * (draw function). It also defines various UI elements like start button,
 * sliders, and confirms the cue ball position.
 *****************************************************************************/

// Importing the required modules from Matter.js
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

// Global variables for the game
let canvas;                             // p5.js canvas
let engine;                             // Matter.js engine instance
let world;                              // Matter.js world
let snookerTable;                       // SnookerTable instance
let balls = [];                         // Array of Ball instances
let coloredBalls = [];                  // Array containing labels of colored balls
let coloredBallsPosition = [];          // Position references for each colored ball
let coloredBallData = [];               // Colors and label reference for each colored ball
let cue;                                // Cue instance
let cueBall;                            // Reference to the cue ball (white ball)
let velocityMagnitude;                  // Magnitude of velocity for the cue ball
let dpHeight = 50;                      // Display panel height
let player1Score = 0;                   // Score for Player 1
let player2Score = 0;                   // Score for Player 2
let currentPlayer = 1;                  // Tracks the current player (1 or 2)
let timer = 60;                         // Countdown timer (seconds)
let timerInterval;                      // Interval ID for the timer
let foulMessageVisible = false;         // Foul message visibility flag
let foulMessageTimeout;                 // Timeout for hiding the foul message
let IncorrectMessageVisible = false;    // Incorrect move message visibility flag
let IncorrectMessageTimeout;            // Timeout for hiding the incorrect move message
let gameStarted = false;                // Flag to indicate game start
let buttonStart;                        // Start button
let Btn_confirmCueballPos;              // Button to confirm the cue ball position
let ignoreNextClick = false;            // Flag to ignore the first click after game start
let ballInHand = true;                  // Indicates if cue ball is in hand (placed freely)
let isCueShotTaken;                     // Flag to check if a valid cue shot was taken
let mouseConstraint;                    // Mouse constraint for positioning the cue ball
let againTurn = false;                  // Flag indicating if the same player continues
let redBallPotted = false;              // Flag indicating a red ball was potted
let onlyColoredBalls = false;           // Flag indicating only colored balls to be potted
let redBallsRemaining = 15;             // Counter for remaining red balls

/**
 * setup()
 *  - Initializes the Matter.js engine, creates the snooker table and balls.
 *  - Sets up all UI elements (buttons, sliders).
 *  - Attaches collision handlers.
 */
function setup() {
  frameRate(60);
  canvas = createCanvas(1000, 600);

  // Create physics engine and world
  engine = Engine.create();
  world = engine.world;
  engine.gravity.y = 0; // Disable gravity on the y-axis (top-view game)

  // Initialize snooker table
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

  // Create and place all balls on the table
  Ball.initializeBalls(
    1,          // <-- pass mode=1 to create standard set including cue ball
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

  // Set up UI elements and interactions
  gameStartBtn();     // "Start Game" button
  slider();           // Slider for cue ball speed
  mouseInteraction(); // Enable mouse interactions for placing the cue ball
  cueBallConfirmPos();// Button to confirm cue ball position in the "D"

  // Collision events (pocket collision and foul detection)
  Events.on(engine, 'collisionStart', handlePocketCollision);
  Events.on(engine, 'collisionStart', handleFoul);

  // Run the Matter.js engine
  Runner.run(engine);
}

/**
 * draw()
 *  - Continuously called by p5.js to render the game.
 *  - Renders either the start screen or the main game screen depending on 
 *    whether the game has started.
 */
function draw() {
  background("#154734");

  if (!gameStarted) {
    // If game hasn't started, display the start screen
    displayStartScreen();
  } else {
    // Otherwise, display the main game interface
    displayGameScreen();
  }
}