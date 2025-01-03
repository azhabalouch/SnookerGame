/**
 * Class representing a cue stick in the snooker game.
 * The cue interacts with the cue ball and allows the player to aim and apply force.
 */
class Cue {
  /**
   * Creates a cue stick object.
   * @param {Object} cueBall - The Matter.js body representing the cue ball.
   * @param {number} [cueLength=200] - The length of the cue stick (default is 200).
   */
  constructor(cueBall, cueLength = 200) {
    this.cueBall = cueBall; // Reference to the cue ball
    this.cueLength = cueLength; // Length of the cue stick
    this.angle = 0; // Initial angle of the cue stick
    this.createCue(); // Initialize the cue and its constraints
  }

  /**
   * Initializes the cue stick and its physical properties.
   */
  createCue() {
    // Create a Matter.js rectangle body to represent the cue stick
    this.cue = Matter.Bodies.rectangle(
      this.cueBall.position.x - 15, // Initial x-position relative to the cue ball
      this.cueBall.position.y, // Initial y-position aligned with the cue ball
      -this.cueLength, // Negative length for correct orientation
      5, // Width of the cue stick
      {
        label: "cue", // Label for identification
        isStatic: true, // The cue stick is stationary
      }
    );

    // Set collision properties to avoid interaction with other objects
    this.cue.collisionFilter = {
      category: -1, // No collision category
      mask: 0, // No collision mask
    };

    // Create a constraint to keep the cue attached to the cue ball
    this.cueConstraint = Matter.Constraint.create({
      pointA: { x: this.cueBall.position.x, y: this.cueBall.position.y }, // Attach point on the cue ball
      bodyB: this.cue, // Attach the constraint to the cue stick
    });

    // Add the cue stick and constraint to the Matter.js world
    World.add(world, [this.cue, this.cueConstraint]);
  }

  /**
   * Draws the cue stick and its aiming projection.
   * @param {Object} mousePos - The current position of the mouse (x, y).
   */
  drawCue(mousePos) {
    // Calculate the angle between the cue ball and the mouse pointer
    this.angle = Math.atan2(
      mousePos.y - this.cueBall.position.y,
      mousePos.x - this.cueBall.position.x
    );

    push();
    translate(this.cueBall.position.x, this.cueBall.position.y); // Center on the cue ball
    rotate(this.angle); // Rotate to align with the mouse position
    noStroke();

    // Draw the cue stick
    fill("#b59b7c"); // Cue stick main color
    rect(-15, -2.5, -150, 5); // Foreground of the cue
    fill("#692704"); // Cue stick handle color
    rect(-165, -2.5, -50, 5); // Background/handle of the cue

    // Draw the aiming projection
    push();
    fill(255, 255, 255, 127); // Semi-transparent white for the aiming guide

    const arrowWidth = 20; // Width of each arrow segment
    const arrowHeight = 10; // Height of each arrow segment
    const startX = 15; // Start position for the projection
    const startY = 0; // Y-coordinate for the projection
    const projectileLength = 500; // Length of the projection

    // Draw arrow segments along the projection path
    for (let i = startX; i < startX + projectileLength; i += arrowWidth) {
      beginShape();
      vertex(i, startY - arrowHeight); // Top of the arrow
      vertex(i + arrowWidth / 2, startY); // Arrow tip
      vertex(i, startY + arrowHeight); // Bottom of the arrow
      vertex(i + arrowWidth / 2 - 2, startY); // Return to the tip
      endShape(CLOSE); // Close the arrow shape
    }
    pop();
    pop();
  }

  /**
   * Updates the cue's constraint to follow the aiming direction.
   */
  update() {
    // Calculate the constrained position for the cue tip based on the angle and cue length
    const constrainedX = this.cueBall.position.x + Math.cos(this.angle) * this.cueLength;
    const constrainedY = this.cueBall.position.y + Math.sin(this.angle) * this.cueLength;

    // Update the constraint point to align with the calculated position
    this.cueConstraint.pointA = { x: constrainedX, y: constrainedY };
  }
}
