/*****************************************************************************
 * Snooker Game - Main Sketch | Commentry
 *
Design Choices:
The snooker game application faithfully replicates traditional snooker
mechanics and aesthetics, meeting coursework requirements. Utilizing
p5.js for graphics and matter.js for physics ensures realistic
motion, collision, and interactions. Careful scaling of table dimensions,
ball sizes, and pocket diameters using specified formulas guarantees an
accurate snooker table representation.

User Interaction:
The cue ball interaction offers a dynamic and intuitive experience through
both mouse and keyboard controls. The mouse controls allow players to set
the cue's direction and strength, mimicking real-life aiming and striking
for precise power and accuracy. Keyboard controls complement this by
providing alternative input methods, enhancing accessibility.

Technical Implementation:
1. Ball Collisions: Realistic restitution and friction settings ensure
   natural bouncing and rolling behaviors.
2. Cue Ball Impact: Accurate force and direction transfer models the
   cue strike, with speed limits to maintain realistic motion.
3. Cushion Behavior: Table cushions are tuned for appropriate
   restitution, facilitating realistic ball bounces.

Graphics:
1. Table Design: The table features correct proportions, including the
   "D" zone and baulk line, enhancing authenticity.
2. Ball Rendering: Balls are rendered with gradients and shadows, adding
   visual depth and realism.

Game Modes:
Implemented three required modes and two additional ones:
1. Standard Starting Positions
2. Random Red Ball Placement
3. Random Placement of Reds and Colored Balls
4. Black Ball as Intruder
5. All Colored Balls as Intruder

Game Logic:
1. Pocket Detection: Red balls are removed when potted, while colored
   balls are re-spotted to their original positions.
2. Error Handling: Implements official snooker fouls, including cue ball
   potting, potting a colored ball before any red, and hitting a red after
   potting one.
3. Cue Ball Reset: If the cue ball is potted, it returns to the "D" zone
   for player repositioning.

Unique Extension:
Introduced AI Mimic to enhance gameplay with strategic depth:
1. Black Ball Attack Mode: AI-controlled black ball moves toward the
   cue ball, creating challenging scenarios.
2. All Color Balls Attack Mode: All colored balls (except cue and reds)
   converge toward the cue ball, increasing difficulty.

Challenges and Solutions:
- Collision Handling: Addressed overlapping and unnatural responses
  using matter.js collision events, adjusted restitution and friction, and
  added proximity checks during initialization.
- Foul Detection: Implemented snooker-specific foul rules with a
  turn-based logic system, error prompts, and cue ball resets.
- Cushion Physics: Improved unrealistic bounces by fine-tuning restitution
  and damping in matter.js.
- AI Mimic Complexity: Managed ball movements with directional force
  vectors and limited force magnitudes for smooth gameplay.
- Randomized Ball Placement: Refined using spatial algorithms and collision
  checks to ensure proper spacing and adherence to table constraints.

Future Improvements:
1. Multiplayer Support: Enable competitive play for enhanced user
   engagement.
2. Advanced AI: Develop more sophisticated AI for single-player mode to
   provide varied challenges.
3. UI Enhancements: Improve the user interface with scoring displays and
   game statistics for a better user experience.

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
let disable = false;                    // For disabling items not required in the mode
let blackBallAttackEventActive = false; // Is black ball attacking
let allColorBallsAttackEventActive = false; // Are color balls attacking
let vMlimit = 0.9;                      // Velocity Magnitude limit flag

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