/*****************************************************************************
 * Snooker Game - Main Sketch
 *
 * Sets up the p5.js canvas, initializes the Matter.js engine, creates the
 * snooker table, balls, and cue, then manages the main draw loop. Also
 * defines UI elements (start button, sliders) and handles cue ball confirmation.
 *****************************************************************************/

// Import the required Matter.js modules
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
let coloredBallData = [];               // Color/label references for each colored ball
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
let IncorrectMessageTimeout;            // Timeout for hiding the incorrect message
let gameStarted = false;                // Flag to indicate game start
let buttonStart;                        // Start button
let Btn_confirmCueballPos;              // Button to confirm cue ball position
let ignoreNextClick = false;            // Flag to ignore the first click after game start
let ballInHand = true;                  // Indicates if cue ball is in hand (placed freely)
let isCueShotTaken;                     // Flag to check if a valid cue shot was taken
let mouseConstraint;                    // Mouse constraint for positioning the cue ball
let againTurn = false;                  // Flag indicating if the same player continues
let redBallPotted = false;              // Flag indicating a red ball was potted
let onlyColoredBalls = false;           // Flag indicating only colored balls to be potted
let redBallsRemaining = 15;             // Counter for remaining red balls
let cueAngle = 0;                       // The cue's current angle (in radians)
let angleStep = Math.PI / 90;           // How much to rotate on each up/down press
let isMouseControlled = true;           // Default control mode

/**
 * setup()
 * Initializes the Matter.js engine, creates the snooker table and balls,
 * sets up UI elements (buttons, sliders), and attaches collision handlers.
 */
function setup() {
  frameRate(60);
  canvas = createCanvas(1000, 600);

  // Creates the physics engine and world
  engine = Engine.create();
  world = engine.world;
  engine.gravity.y = 0; // Disable gravity on the y-axis (top-view game)

  // Initializes the snooker table
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

  // Initialize the balls for the given mode, adjusting their positions and settings
  initializeGame(1);

  // Sets up UI elements and interactions
  gameStartBtn();     // "Start Game" button
  slider();           // Slider for cue ball speed
  mouseInteraction(); // Enables mouse interactions for placing the cue ball
  cueBallConfirmPos();// Button to confirm cue ball position in the "D"

  // Collision events (pocket collision and foul detection)
  Events.on(engine, 'collisionStart', handlePocketCollision);
  Events.on(engine, 'collisionStart', handleFoul);

  // Runs the Matter.js engine
  Runner.run(engine);
}

/**
 * draw()
 * Called continuously by p5.js to render the game.
 * Renders the start screen if the game isn't started, otherwise the main interface.
 */
function draw() {
  background("#154734");

  if (!gameStarted) {
    // Displays the start screen if the game hasn't started
    displayStartScreen();
  } else {
    // Displays the main game interface otherwise
    displayGameScreen();
  }
}