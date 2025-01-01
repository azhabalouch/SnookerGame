class Ball {
  constructor(x, y, diameter, color, label) {
      this.body = Bodies.circle(x, y, diameter / 2, {
          restitution: 0.9,
          friction: 0.01,
          label: label
      });
      this.color = color;
      World.add(world, this.body);
  }

  draw() {
      const pos = this.body.position;
      const angle = this.body.angle;

      push();
      translate(pos.x, pos.y);
      rotate(angle);

      // Shadow settings
      drawingContext.shadowOffsetX = 3;
      drawingContext.shadowOffsetY = 5;
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = 'rgba(0, 0, 0, 0.3)';
      noStroke();

      let gradient = drawingContext.createRadialGradient(
          0, 0, this.body.circleRadius * 0.01,
          0, 0, this.body.circleRadius
      );
      gradient.addColorStop(0, this.color.light);
      gradient.addColorStop(0.6, this.color.medium);
      gradient.addColorStop(1, this.color.dark);
      drawingContext.fillStyle = gradient;
      circle(0, 0, this.body.circleRadius * 2);

      pop();
  }

  static initializeBalls(tableWidth, tableHeight, offsetX, offsetY, baulkLineX, dRadius) {
      const ballDiameter = tableWidth / 36;
      const centerX = tableWidth / 2 + offsetX;
      const centerY = tableHeight / 2 + offsetY;

      // Create red balls in triangle formation
      const rows = 5;
      const startX = centerX * 1.25 + ballDiameter + 5;
      const startY = centerY;

      for (let row = 0; row < rows; row++) {
          for (let col = 0; col <= row; col++) {
              balls.push(new Ball(
                  startX + row * ballDiameter * 1.1,
                  startY + col * ballDiameter * 1.1 - row * ballDiameter * 0.55,
                  ballDiameter,
                  {
                      light: "rgb(252, 82, 82)",
                      medium: "rgb(218, 1, 1)",
                      dark: "rgb(165, 0, 0)"
                  },
                  "redBall"
              ));
          }
      }

      // White cue ball
      balls.push(new Ball(
          baulkLineX - dRadius / 2,
          centerY,
          ballDiameter,
          {
              light: "rgb(255, 255, 255)",
              medium: "rgb(200, 200, 200)",
              dark: "rgb(150, 150, 150)"
          },
          "cueBall"
      ));

      // Add colored balls (yellow, green, brown, blue, pink, black)
      balls.push(new Ball(
          baulkLineX,
          centerY + (centerY / 4) - ballDiameter / 2,
          ballDiameter,
          {
              light: "rgb(255, 255, 0)",
              medium: "rgb(220, 220, 0)",
              dark: "rgb(180, 180, 0)"
          },
          "yellowBall"
      ));
      balls.push(new Ball(
          baulkLineX,
          centerY - (centerY / 4) + ballDiameter / 2,
          ballDiameter,
          {
              light: "rgb(0, 128, 0)",
              medium: "rgb(0, 100, 0)",
              dark: "rgb(0, 70, 0)"
          },
          "greenBall"
      ));
      balls.push(new Ball(
          baulkLineX,
          centerY,
          ballDiameter,
          {
              light: "rgb(150, 75, 0)",
              medium: "rgb(120, 60, 0)",
              dark: "rgb(90, 45, 0)"
          },
          "brownBall"
      ));
      balls.push(new Ball(
          centerX,
          centerY,
          ballDiameter,
          {
              light: "rgb(0, 0, 255)",
              medium: "rgb(0, 0, 200)",
              dark: "rgb(0, 0, 150)"
          },
          "blueBall"
      ));
      balls.push(new Ball(
          centerX * 1.25,
          centerY,
          ballDiameter,
          {
              light: "rgb(255, 105, 180)",
              medium: "rgb(255, 80, 160)",
              dark: "rgb(200, 60, 120)"
          },
          "pinkBall"
      ));
      balls.push(new Ball(
          centerX * 1.6,
          centerY,
          ballDiameter,
          {
              light: "rgb(50, 50, 50)",
              medium: "rgb(30, 30, 30)",
              dark: "rgb(0, 0, 0)"
          },
          "blackBall"
      ));
  }

  static addBallsToWorld(world) {
      balls.forEach(ball => World.add(world, ball.body));
  }

  static removeBall(ball) {
    World.remove(world, ball.body);
    balls = balls.filter(b => b !== ball);
    }
}