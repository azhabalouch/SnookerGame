function handlePocketCollision(event) {
  const pairs = event.pairs;

  pairs.forEach(pair => {
      const bodyA = pair.bodyA;
      const bodyB = pair.bodyB;

      // Check if a ball collides with a pocket
      if ((bodyA.label === 'pocket' && bodyB.label.endsWith('Ball')) ||
          (bodyB.label === 'pocket' && bodyA.label.endsWith('Ball'))) {
          
          const ball = bodyA.label.endsWith('Ball') ? bodyA : bodyB;
          
          console.log(`${ball.label} potted in pocket!`);

          // Remove the ball from the simulation
          Matter.World.remove(world, ball);

          balls = balls.filter(b => b.body !== ball);
      }
  });
}

function mouseClicked() {
    // Table boundaries
    const tableLeft = snookerTable.tableOffsetX;
    const tableRight = snookerTable.tableOffsetX + snookerTable.tableWidth;
    const tableTop = snookerTable.tableOffsetY;
    const tableBottom = snookerTable.tableOffsetY + snookerTable.tableHeight;
  
    // If the mouse is within the table boundaries
    if (mouseX >= tableLeft && mouseX <= tableRight && mouseY >= tableTop && mouseY <= tableBottom && velocityMagnitude <= 0.009) {
      const forceMagnitude = speedSlider.value() / 1000;
  
      // Direction of the force from cue ball to mouse position
      const forceDirection = {
        x: mouseX - cueBall.position.x,
        y: mouseY - cueBall.position.y,
      };
  
      // Normalize the direction vector
      const directionMagnitude = Math.sqrt(
        forceDirection.x ** 2 + forceDirection.y ** 2
      );
      const normalizedDirection = {
        x: forceDirection.x / directionMagnitude,
        y: forceDirection.y / directionMagnitude,
      };
  
      // Apply the force to the cue ball
      Matter.Body.applyForce(cueBall, cueBall.position, {
        x: normalizedDirection.x * forceMagnitude,
        y: normalizedDirection.y * forceMagnitude,
      });

      // Change player after the shot is completed
      setTimeout(() => {
        if (currentPlayer === 1) {
          currentPlayer = 2;
        } else {
          currentPlayer = 1;
        }
      }, 1500);
    }
  }