/*****************************************************************************
 * Snooker Game - Ball Class
 *****************************************************************************/

class Ball {
  /**
   * Constructs a new Ball with position, diameter, color, and label.
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} diameter - Ball diameter
   * @param {Object} color - Light/medium/dark color definitions
   * @param {string} label - Unique label (e.g., "redBall")
   */
  constructor(x, y, diameter, color, label) {
    this.body = Bodies.circle(x, y, diameter / 2, {
      restitution: 1.1,
      friction: 0.01,
      label: label,
    });
    this.color = color;
    World.add(world, this.body);
  }

  /**
   * Renders the ball with a radial gradient and shadow.
   */
  draw() {
    const { position: pos, angle } = this.body;
    push();
    translate(pos.x, pos.y);
    rotate(angle);

    drawingContext.shadowOffsetX = 3;
    drawingContext.shadowOffsetY = 5;
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = 'rgba(0, 0, 0, 0.3)';
    noStroke();

    const gradient = drawingContext.createRadialGradient(
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

  /**
   * Places snooker balls in one of three modes:
   * 1) Standard layout (red + colored + cue),
   * 2) Random reds, standard colors/cue,
   * 3) Random reds and colors, standard cue.
   */
  static initializeBalls(
    mode,
    tableWidth,
    tableHeight,
    offsetX,
    offsetY,
    baulkLineX,
    dRadius
  ) {
    const ballDiameter = tableWidth / 36;
    const centerX = tableWidth / 2 + offsetX;
    const centerY = tableHeight / 2 + offsetY;

    coloredBallsPosition = [
      { x: baulkLineX,             y: centerY + dRadius,    d: ballDiameter }, // Yellow
      { x: baulkLineX,             y: centerY - dRadius,    d: ballDiameter }, // Green
      { x: baulkLineX,             y: centerY,              d: ballDiameter }, // Brown
      { x: centerX,                y: centerY,              d: ballDiameter }, // Blue
      { x: centerX * 1.25,         y: centerY,              d: ballDiameter }, // Pink
      { x: centerX * 1.6,          y: centerY,              d: ballDiameter }, // Black
      { x: baulkLineX - dRadius/2, y: centerY,              d: ballDiameter }, // Cue
    ];

    coloredBallData = [
      {
        label: 'yellowBall',
        color: {
          light: 'rgb(255, 255, 0)',
          medium: 'rgb(220, 220, 0)',
          dark: 'rgb(180, 180, 0)',
        },
      },
      {
        label: 'greenBall',
        color: {
          light: 'rgb(0, 128, 0)',
          medium: 'rgb(0, 100, 0)',
          dark: 'rgb(0, 70, 0)',
        },
      },
      {
        label: 'brownBall',
        color: {
          light: 'rgb(150, 75, 0)',
          medium: 'rgb(120, 60, 0)',
          dark: 'rgb(90, 45, 0)',
        },
      },
      {
        label: 'blueBall',
        color: {
          light: 'rgb(0, 0, 255)',
          medium: 'rgb(0, 0, 200)',
          dark: 'rgb(0, 0, 150)',
        },
      },
      {
        label: 'pinkBall',
        color: {
          light: 'rgb(255, 105, 180)',
          medium: 'rgb(255, 80, 160)',
          dark: 'rgb(200, 60, 120)',
        },
      },
      {
        label: 'blackBall',
        color: {
          light: 'rgb(50, 50, 50)',
          medium: 'rgb(30, 30, 30)',
          dark: 'rgb(0, 0, 0)',
        },
      },
      {
        label: 'cueBall',
        color: {
          light: 'rgb(255, 255, 255)',
          medium: 'rgb(200, 200, 200)',
          dark: 'rgb(150, 150, 150)',
        },
      },
    ];

    // Creates 15 reds in random positions
    const placeRedsRandomly = (count) => {
      for (let i = 0; i < count; i++) {
        const randX = random(offsetX + ballDiameter, offsetX + tableWidth - ballDiameter);
        const randY = random(offsetY + ballDiameter, offsetY + tableHeight - ballDiameter);

        balls.push(
          new Ball(
            randX,
            randY,
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
    };

    // Creates 15 reds in a standard triangle formation
    const placeRedsStandard = () => {
      const rows = 5; // 1+2+3+4+5 = 15
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
    };

    // Places the 6 colors (and optionally the cue) in standard positions
    const placeColorsStandard = (includeCue = true) => {
      coloredBallData.forEach((ballDef, index) => {
        const { x, y, d } = coloredBallsPosition[index];
        const { label, color } = ballDef;

        if (!includeCue && label === 'cueBall') return;
        balls.push(new Ball(x, y, d, color, label));
      });
    };

    // Places the 6 colored balls randomly, optionally skipping the cue
    const placeColorsRandom = (includeCue = true) => {
      coloredBallData.forEach(ballDef => {
        if (!includeCue && ballDef.label === 'cueBall') return;
        const randX = random(offsetX + ballDiameter, offsetX + tableWidth - ballDiameter);
        const randY = random(offsetY + ballDiameter, offsetY + tableHeight - ballDiameter);

        balls.push(new Ball(randX, randY, ballDiameter, ballDef.color, ballDef.label));
      });
    };

    // -----------------------------------------------------------
    // SWITCH ON THE MODE:
    // -----------------------------------------------------------
    switch (mode) {
      // =========== MODE 1 =========== 
      // Standard everything
      case 1: 
        placeRedsStandard(); 
        placeColorsStandard(true);
        break;

      // =========== MODE 2 =========== 
      // Random reds, but standard colors & cueball
      case 2:
        placeRedsRandomly(15);
        placeColorsStandard(true);
        break;

      // =========== MODE 3 =========== 
      // Random reds, random colors, but standard cueball
      case 3:
        placeRedsRandomly(15);
        placeColorsRandom(false);

        // Now place the cue ball in its standard position
        const cueIndex = 6;
        const { x, y, d } = coloredBallsPosition[cueIndex];
        const cueColor = coloredBallData[cueIndex].color;
        balls.push(new Ball(x, y, d, cueColor, 'cueBall'));
        break;

      default:
        console.warn(`Unknown mode: ${mode}. No balls initialized.`);
        break;
    }
  }
}
