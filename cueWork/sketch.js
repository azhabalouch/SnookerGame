const { Engine, Render, Runner, World, Bodies, Body, Events, Mouse, MouseConstraint } = Matter;
var engine, world;
var canvas, cueConstraint, cue, cueBall, cueLength = 150;
var mousePos;

function setup() {
  canvas = createCanvas(800, 600);

  // Initialize Matter.js
  engine = Engine.create();
  world = engine.world;
  engine.gravity.y = 0;

  cue = Matter.Bodies.rectangle(
    400, 300, 150, 5, { isStatic: false }
  );

  cueBall = Matter.Bodies.circle(
    300, 300, 15, 
    { 
      restitution: 0.9,
      friction: 0.01,
      frictionAir: 0.02,
      isStatic: false
    }
  );

  cueConstraint = Matter.Constraint.create({
    bodyA: cueBall,
    bodyB: cue,
    pointA: { x: 0, y: 0 }, // Attach at the cue ball's center
    pointB: { x: 0, y: 0 }, // Attach at the center
    stiffness: 0.1, // Soft connection to allow movement
  });

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

  Matter.World.add(world, [cue, cueBall, mouseConstraint, cueConstraint]);
  Matter.Runner.run(engine);
}

function draw() {
  mousePos = { x: mouseX, y: mouseY };

  background(220);
  drawCueStick(cue);
  drawCueBall(cueBall);
}

function drawCueStick(body) {
  angle = atan2(mousePos.y - cueBall.position.y, mousePos.x - cueBall.position.x);

  push();
    translate(cue.position.x, cue.position.y);
    rotate(angle);
    fill("brown");
    rectMode(CENTER);
    rect(10, 0, cueLength, 5);
  pop();
}

function drawCueBall(body) {
  push();
    fill("white");
    circle(body.position.x, body.position.y, 15);
  pop();
}