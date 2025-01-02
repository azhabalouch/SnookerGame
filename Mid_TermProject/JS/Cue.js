class Cue {
  constructor(cueBall, cueLength = 200) {
    this.cueBall = cueBall;
    this.cueLength = cueLength;
    this.angle = 0;
    this.createCue();
  }

  createCue() {
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

    this.cue.collisionFilter = {
      category: -1,
      mask: 0,
    };

    this.cueConstraint = Matter.Constraint.create({
      pointA: { x: this.cueBall.position.x, y: this.cueBall.position.y },
      bodyB: this.cue,
    });

    World.add(world, [this.cue, this.cueConstraint]);
  }

  drawCue(mousePos) {
    // Calculate the angle between the cue ball and the mouse pointer
    this.angle = Math.atan2(
      mousePos.y - this.cueBall.position.y,
      mousePos.x - this.cueBall.position.x
    );

    push();
      translate(this.cueBall.position.x, this.cueBall.position.y);
      rotate(this.angle);
      noStroke();
      
      // Draw the cue stick
      fill("#b59b7c");
      rect(-15, -2.5, -150, 5);
      fill("#692704");
      rect(-165, -2.5, -50, 5);

      // Draw projectile
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

  update() {
    const constrainedX = this.cueBall.position.x + cos(this.angle) * this.cueLength;
    const constrainedY = this.cueBall.position.y + sin(this.angle) * this.cueLength;

    // Update the constraint to follow the mouse, but maintain alignment with the cue ball
    this.cueConstraint.pointA = { x: constrainedX, y: constrainedY };
  }
}