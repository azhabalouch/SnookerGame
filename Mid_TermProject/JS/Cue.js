/**
 * Class representing the cue stick, which allows aiming and force application on the cue ball.
 */
class Cue {
  /**
   * Creates a Cue object for the specified cue ball.
   * @param {Object} cueBall - The Matter.js body of the cue ball.
   * @param {number} [cueLength=200] - The length of the cue stick.
   */
  constructor(cueBall, cueLength = 200) {
    this.cueBall = cueBall;
    this.cueLength = cueLength;
    this.angle = 0;
    this.createCue();
  }

  /**
   * Builds the cue stick as a static Matter.js rectangle and attaches it to the cue ball via a constraint.
   */
  createCue() {
    // Main cue stick body
    this.cue = Matter.Bodies.rectangle(
      this.cueBall.position.x - 15,
      this.cueBall.position.y,
      -this.cueLength,
      5,
      {
        label: "cue",
        isStatic: true,
      }
    );

    // Disable collisions with other objects
    this.cue.collisionFilter = {
      category: -1,
      mask: 0,
    };

    // Constraint that attaches the cue to the cue ball
    this.cueConstraint = Matter.Constraint.create({
      pointA: { x: this.cueBall.position.x, y: this.cueBall.position.y },
      bodyB: this.cue,
    });

    World.add(world, [this.cue, this.cueConstraint]);
  }

  /**
   * Draws the cue stick and its aiming projection toward the mouse pointer.
   * @param {Object} mousePos - Current mouse coordinates (x, y).
   */
  drawCue(mousePos) {
    // Calculate angle between cue ball and mouse
    this.angle = Math.atan2(
      mousePos.y - this.cueBall.position.y,
      mousePos.x - this.cueBall.position.x
    );

    push();
      translate(this.cueBall.position.x, this.cueBall.position.y);
      rotate(this.angle);
      noStroke();

      // Cue stick
      fill("#b59b7c");
      rect(-15, -2.5, -150, 5);
      fill("#692704");
      rect(-165, -2.5, -50, 5);

      // Aiming projection
      push();
        fill(255, 255, 255, 127);
        const arrowWidth = 20;
        const arrowHeight = 10;
        const startX = 15;
        const startY = 0;
        const projectileLength = 500;

        for (let i = startX; i < startX + projectileLength; i += arrowWidth) {
          beginShape();
          vertex(i, startY - arrowHeight);
          vertex(i + arrowWidth / 2, startY);
          vertex(i, startY + arrowHeight);
          vertex(i + arrowWidth / 2 - 2, startY);
          endShape(CLOSE);
        }
      pop();
    pop();
  }

  /**
   * Updates the cue's constraint to match the current angle/distance from the cue ball.
   */
  update() {
    const constrainedX =
      this.cueBall.position.x + Math.cos(this.angle) * this.cueLength;
    const constrainedY =
      this.cueBall.position.y + Math.sin(this.angle) * this.cueLength;

    this.cueConstraint.pointA = { x: constrainedX, y: constrainedY };
  }
}
