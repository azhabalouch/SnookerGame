/**
 * Class representing a single billiard/snooker/pool Ball. It handles the creation
 * of a physics body (using Matter.js), its color gradient, and its rendering on the canvas.
 */
class Ball {
  /**
   * Creates a new Ball instance.
   * @param {number} x - The x position of the ball's center.
   * @param {number} y - The y position of the ball's center.
   * @param {number} diameter - The diameter of the ball.
   * @param {Object} color - An object containing light, medium, and dark color shades.
   * @param {string} label - A label identifying this ball (e.g., "redBall", "cueBall").
   */
  constructor(x, y, diameter, color, label) {
    // Create a circular body in Matter.js with slight bounciness and low friction
    this.body = Bodies.circle(x, y, diameter / 2, {
      restitution: 0.9,
      friction: 0.1,
      label: label,
    });
    
    // Assign color properties and add the body to the Matter.js world
    this.color = color;
    World.add(world, this.body);
  }

  /**
   * Renders the ball on the canvas using p5.js functions.
   * It applies a radial gradient to simulate shading and a shadow for depth.
   */
  draw() {
    const { position: pos, angle } = this.body;

    push();                       // Save the current drawing state
    translate(pos.x, pos.y);      // Move to the ball's position
    rotate(angle);                // Rotate according to the ball's angle

    // Configure the shadow for visual depth
    drawingContext.shadowOffsetX = 3;
    drawingContext.shadowOffsetY = 5;
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = 'rgba(0, 0, 0, 0.3)';
    
    noStroke(); // Turn off stroke to avoid an outline around the ball

    // Create a radial gradient to give a 3D-like appearance
    const gradient = drawingContext.createRadialGradient(
      0, 0, this.body.circleRadius * 0.01,
      0, 0, this.body.circleRadius
    );
    gradient.addColorStop(0, this.color.light);
    gradient.addColorStop(0.6, this.color.medium);
    gradient.addColorStop(1, this.color.dark);

    // Apply the gradient as a fill, then draw the circle
    drawingContext.fillStyle = gradient;
    circle(0, 0, this.body.circleRadius * 2);

    pop(); // Restore the original drawing state
  }

  /**
   * A static method to initialize and place all the required balls on the table.
   * This method creates multiple Ball instances (red balls in a triangle formation,
   * a cue ball, and the colored balls) and adds them to the global 'balls' array.
   *
   * @param {number} tableWidth - The width of the billiards table.
   * @param {number} tableHeight - The height of the billiards table.
   * @param {number} offsetX - An offset on the x-axis to position the balls correctly.
   * @param {number} offsetY - An offset on the y-axis to position the balls correctly.
   * @param {number} baulkLineX - The x-position of the baulk line for cue and colored balls.
   * @param {number} dRadius - The radius used to position colored balls around the baulk line.
   */
  static initializeBalls(tableWidth, tableHeight, offsetX, offsetY, baulkLineX, dRadius) {
    const ballDiameter = tableWidth / 36;
    const centerX = tableWidth / 2 + offsetX;
    const centerY = tableHeight / 2 + offsetY;

    // ----------------------------------------------------------------
    // Create red balls in a 5-row triangle formation
    // ----------------------------------------------------------------
    const rows = 5;
    const startX = centerX * 1.25 + ballDiameter + 5;
    const startY = centerY;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col <= row; col++) {
        balls.push(
          new Ball(
            startX + row * ballDiameter,
            startY + col * ballDiameter - row * ballDiameter * 0.5,
            ballDiameter,
            {
              light: 'rgb(252, 82, 82)',
              medium: 'rgb(218, 1, 1)',
              dark: 'rgb(165, 0, 0)',
            },
            'redBall'
          )
        );
      }
    }

    // ----------------------------------------------------------------
    // White cue ball
    // ----------------------------------------------------------------
    balls.push(
      new Ball(
        baulkLineX - dRadius / 2,
        centerY,
        ballDiameter,
        {
          light: 'rgb(255, 255, 255)',
          medium: 'rgb(200, 200, 200)',
          dark: 'rgb(150, 150, 150)',
        },
        'cueBall'
      )
    );

    // ----------------------------------------------------------------
    // Colored balls (yellow, green, brown, blue, pink, black)
    // ----------------------------------------------------------------
    balls.push(
      new Ball(
        baulkLineX,
        centerY + dRadius,
        ballDiameter,
        {
          light: 'rgb(255, 255, 0)',
          medium: 'rgb(220, 220, 0)',
          dark: 'rgb(180, 180, 0)',
        },
        'yellowBall'
      )
    );
    balls.push(
      new Ball(
        baulkLineX,
        centerY - dRadius,
        ballDiameter,
        {
          light: 'rgb(0, 128, 0)',
          medium: 'rgb(0, 100, 0)',
          dark: 'rgb(0, 70, 0)',
        },
        'greenBall'
      )
    );
    balls.push(
      new Ball(
        baulkLineX,
        centerY,
        ballDiameter,
        {
          light: 'rgb(150, 75, 0)',
          medium: 'rgb(120, 60, 0)',
          dark: 'rgb(90, 45, 0)',
        },
        'brownBall'
      )
    );
    balls.push(
      new Ball(
        centerX,
        centerY,
        ballDiameter,
        {
          light: 'rgb(0, 0, 255)',
          medium: 'rgb(0, 0, 200)',
          dark: 'rgb(0, 0, 150)',
        },
        'blueBall'
      )
    );
    balls.push(
      new Ball(
        centerX * 1.25,
        centerY,
        ballDiameter,
        {
          light: 'rgb(255, 105, 180)',
          medium: 'rgb(255, 80, 160)',
          dark: 'rgb(200, 60, 120)',
        },
        'pinkBall'
      )
    );
    balls.push(
      new Ball(
        centerX * 1.6,
        centerY,
        ballDiameter,
        {
          light: 'rgb(50, 50, 50)',
          medium: 'rgb(30, 30, 30)',
          dark: 'rgb(0, 0, 0)',
        },
        'blackBall'
      )
    );
  }
}
