const { Engine, Render, Runner, World, Bodies, Body, Events, Mouse, MouseConstraint } = Matter;

var canvas, engine, world;
var snookerTable, balls = [];

function setup() {
  canvas = createCanvas(1000, 600);

  // Initialize Matter.js
  engine = Engine.create();
  world = engine.world;

  // Gravity to zero - the game is top view
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

  // Add mouse interaction
  const canvasMouse = Mouse.create(canvas.elt);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse: canvasMouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false, // Hide the mouse interaction visuals
      },
    },
  });

  World.add(world, mouseConstraint);

  // On collision
  Matter.Events.on(engine, 'collisionStart', handlePocketCollision);

  Matter.Runner.run(engine);
}

function draw() {
  // Framerate limit - default
  frameRate(60);

  // For scoreboard
  background("#154734");

  // Draw snooker table
  snookerTable.draw();

  // Draw balls
  balls.forEach((ball) => ball.draw());
}


/*
  Sources for Topics

  https://en.wikipedia.org/wiki/Snooker
  https://www.snookergames.co.uk/
  https://p5js.org/reference/#group-Shape
  https://p5js.org/reference/#/p5/drawingContext
  https://brm.io/matter-js/docs/classes/Bodies.html
  https://brm.io/matter-js/docs/classes/World.html
  https://brm.io/matter-js/demo/#sensors
  https://wpbsa.com/rules/
  
*/