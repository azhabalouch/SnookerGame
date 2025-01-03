class SnookerTable {
  constructor(config) {
    // Dimensions of the snooker table
    this.tableWidth = config.tableWidth;
    this.tableHeight = this.tableWidth / 2;

    // Offset values for positioning the table within the canvas
    this.tableOffsetX = config.tableOffsetX;
    this.tableOffsetY = config.tableOffsetY;

    // Dimensions and properties of the table's pockets
    this.pocketDiameter = (this.tableWidth / 36) * 1.5;

    // Baulk line and "D" zone calculations
    this.baulkLineX = this.tableOffsetX + this.tableWidth / 4;
    this.dRadius = this.tableWidth * 0.1;

    // Colors for table components (e.g., mat, borders, pockets)
    this.colors = config.colors;

    // Inner border properties
    this.edgeCut = 10;
    this.borderRectWidth = this.tableWidth / 2 - 2 * this.pocketDiameter;
    this.borderRectHeight = this.tableHeight - this.pocketDiameter * 2;
    this.tableBorderSize = 10;
    this.borderAdjustment = 10;

    // Pocket properties
    this.pocketRadius = this.pocketDiameter / 2;
    this.pushBackPocket = 10;

    // Arrays for storing borders, Matter.js objects, and pocket positions
    this.borders = [];
    this.matterBorders = [];
    this.pockets = [];
    this.pocketPositions = [];

    // Initialize inner borders and pockets
    this.initializeInnerBorders();
    this.initializePockets();
}

  // Set up borders for the table
  initializeInnerBorders() {
    this.borders = [
      { x: this.tableOffsetX + this.pocketDiameter, y: this.tableOffsetY, width: this.borderRectWidth + this.borderAdjustment, height: this.tableBorderSize },
      { x: this.tableOffsetX + this.pocketDiameter * 3 + this.borderRectWidth - this.borderAdjustment, y: this.tableOffsetY, width: this.borderRectWidth + this.borderAdjustment, height: this.tableBorderSize },
      { x: this.tableOffsetX + this.pocketDiameter, y: this.tableOffsetY + this.tableHeight - this.tableBorderSize, width: this.borderRectWidth + this.borderAdjustment, height: this.tableBorderSize },
      { x: this.tableOffsetX + this.pocketDiameter * 3 + this.borderRectWidth - this.borderAdjustment, y: this.tableOffsetY + this.tableHeight - this.tableBorderSize, width: this.borderRectWidth + this.borderAdjustment, height: this.tableBorderSize },
      { x: this.tableOffsetX, y: this.tableOffsetY + this.pocketDiameter, width: this.tableBorderSize, height: this.borderRectHeight },
      { x: this.tableOffsetX + this.tableWidth - this.tableBorderSize, y: this.tableOffsetY + this.pocketDiameter, width: this.tableBorderSize, height: this.borderRectHeight },
    ];

    this.matterBorders = this.borders.map((b) =>
      Matter.Bodies.rectangle(
        b.x + b.width / 2,
        b.y + b.height / 2,
        b.width,
        b.height,
        { isStatic: true }
      )
    );

    Matter.World.add(world, this.matterBorders);
  }

  // Set up pockets sensors
  initializePockets() {
    this.pocketPositions = [
      { x: this.tableOffsetX + this.pocketRadius - this.pushBackPocket, y: this.tableOffsetY + this.pocketRadius - this.pushBackPocket },
      { x: this.tableOffsetX + this.tableWidth - this.pocketRadius + this.pushBackPocket, y: this.tableOffsetY + this.pocketRadius - this.pushBackPocket },
      { x: this.tableOffsetX + this.pocketRadius - this.pushBackPocket, y: this.tableOffsetY + this.tableHeight - this.pocketRadius + this.pushBackPocket },
      { x: this.tableOffsetX + this.tableWidth - this.pocketRadius + this.pushBackPocket, y: this.tableOffsetY + this.tableHeight - this.pocketRadius + this.pushBackPocket },
      { x: this.tableOffsetX + this.tableWidth / 2, y: this.tableOffsetY + this.pocketRadius - this.pushBackPocket * 2 },
      { x: this.tableOffsetX + this.tableWidth / 2, y: this.tableOffsetY + this.tableHeight - this.pocketRadius + this.pushBackPocket * 2 },
    ];

    const sensorRadius = 5;

    this.pockets = this.pocketPositions.map((p) =>
      Matter.Bodies.circle(p.x, p.y, sensorRadius, {
        isStatic: true,
        isSensor: true,
        label: "pocket"
      })
    );

    Matter.World.add(world, this.pockets);
  }

  // Draw the green mat of the table
  drawMat() {
    push();
      fill(this.colors.tableMat);
      noStroke();
      rect(this.tableOffsetX, this.tableOffsetY, this.tableWidth, this.tableHeight);
    pop();
  }

  // Draw the "D" zone and baulk line
  drawD() {
    push();
      noFill();
      stroke(this.colors.line);
      strokeWeight(2);

      // Baulk line
      line(
        this.baulkLineX,
        this.tableOffsetY,
        this.baulkLineX,
        this.tableOffsetY + this.tableHeight
      );

      // Semi-circle for the "D"
      arc(
        this.baulkLineX,
        this.tableOffsetY + this.tableHeight / 2,
        this.dRadius * 2,
        this.dRadius * 2,
        HALF_PI,
        -HALF_PI
      );
    pop();
  }

  // Render inner borders and their visual details
  drawInnerBorders() {
    push();
      fill(this.colors.innerBorder);
      noStroke();

      // Shadow settings -> https://p5js.org/reference/p5/drawingContext/
      drawingContext.shadowOffsetX = 5;
      drawingContext.shadowOffsetY = 5;
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = "rgba(0, 0, 0, 0.2)";

      this.borders.forEach((b) => rect(b.x, b.y, b.width, b.height));

      // Left corner - top left bar
      triangle(
        this.pocketDiameter + this.tableOffsetX,
        this.tableOffsetY,
        this.pocketDiameter + this.tableOffsetX,
        this.tableOffsetY + this.tableBorderSize,
        this.pocketDiameter + this.tableOffsetX - this.edgeCut,
        this.tableOffsetY
      );

      // Right corner - top left bar
      triangle(
        this.pocketDiameter + this.tableOffsetX + this.borderRectWidth + this.borderAdjustment,
        this.tableOffsetY,
        this.pocketDiameter + this.tableOffsetX + this.borderRectWidth + this.borderAdjustment,
        this.tableOffsetY + this.tableBorderSize,
        this.pocketDiameter + this.tableOffsetX + this.borderRectWidth + this.edgeCut / 2 + this.borderAdjustment,
        this.tableOffsetY
      );

      // Left corner - top right bar
      triangle(
        3 * this.pocketDiameter + this.tableOffsetX + this.borderRectWidth - this.borderAdjustment,
        this.tableOffsetY,
        3 * this.pocketDiameter + this.tableOffsetX + this.borderRectWidth - this.borderAdjustment,
        this.tableOffsetY + this.tableBorderSize,
        3 * this.pocketDiameter + this.tableOffsetX + this.borderRectWidth - this.edgeCut / 2 - this.borderAdjustment,
        this.tableOffsetY
      );

      // Right corner - top right bar
      triangle(
        3 * this.pocketDiameter + this.tableOffsetX + this.borderRectWidth * 2,
        this.tableOffsetY,
        3 * this.pocketDiameter + this.tableOffsetX + this.borderRectWidth * 2,
        this.tableOffsetY + this.tableBorderSize,
        3 * this.pocketDiameter + this.tableOffsetX + this.borderRectWidth * 2 + this.edgeCut,
        this.tableOffsetY
      );

      // Bottom left bar - left corner
      triangle(
        this.pocketDiameter + this.tableOffsetX,
        this.tableOffsetY + this.tableHeight,
        this.pocketDiameter + this.tableOffsetX,
        this.tableOffsetY + this.tableHeight - this.tableBorderSize,
        this.pocketDiameter + this.tableOffsetX - this.edgeCut,
        this.tableOffsetY + this.tableHeight
      );

      // Bottom left bar - right corner
      triangle(
        this.pocketDiameter + this.tableOffsetX + this.borderRectWidth + this.borderAdjustment,
        this.tableOffsetY + this.tableHeight,
        this.pocketDiameter + this.tableOffsetX + this.borderRectWidth + this.borderAdjustment,
        this.tableOffsetY + this.tableHeight - this.tableBorderSize,
        this.pocketDiameter + this.tableOffsetX + this.borderRectWidth + this.edgeCut / 2 + this.borderAdjustment,
        this.tableOffsetY + this.tableHeight
      );

      // Bottom Right Bar - left corner
      triangle(
        3 * this.pocketDiameter + this.tableOffsetX + this.borderRectWidth - this.borderAdjustment,
        this.tableOffsetY + this.tableHeight,
        3 * this.pocketDiameter + this.tableOffsetX + this.borderRectWidth - this.borderAdjustment,
        this.tableOffsetY + this.tableHeight - this.tableBorderSize,
        3 * this.pocketDiameter + this.tableOffsetX + this.borderRectWidth - this.edgeCut / 2 - this.borderAdjustment,
        this.tableOffsetY + this.tableHeight
      );

      // Bottom Right Bar - right corner
      triangle(
        3 * this.pocketDiameter + this.tableOffsetX + this.borderRectWidth * 2,
        this.tableOffsetY + this.tableHeight,
        3 * this.pocketDiameter + this.tableOffsetX + this.borderRectWidth * 2,
        this.tableOffsetY + this.tableHeight - this.tableBorderSize,
        3 * this.pocketDiameter + this.tableOffsetX + this.borderRectWidth * 2 + this.edgeCut,
        this.tableOffsetY + this.tableHeight
      );

      // Left Vertical Bar - top edge
      triangle(
        this.tableOffsetX,
        this.tableOffsetY + this.pocketDiameter,
        this.tableOffsetX + this.tableBorderSize,
        this.tableOffsetY + this.pocketDiameter,
        this.tableOffsetX,
        this.tableOffsetY + this.pocketDiameter - this.edgeCut
      );

      // Left Vertical Bar - bottom edge
      triangle(
        this.tableOffsetX,
        this.tableOffsetY + this.pocketDiameter + this.borderRectHeight,
        this.tableOffsetX + this.tableBorderSize,
        this.tableOffsetY + this.pocketDiameter + this.borderRectHeight,
        this.tableOffsetX,
        this.tableOffsetY + this.pocketDiameter + this.borderRectHeight + this.edgeCut
      );

      // Right Vertical Bar - top edge
      triangle(
        this.tableOffsetX + this.tableWidth,
        this.tableOffsetY + this.pocketDiameter,
        this.tableOffsetX + this.tableWidth - this.tableBorderSize,
        this.tableOffsetY + this.pocketDiameter,
        this.tableOffsetX + this.tableWidth,
        this.tableOffsetY + this.pocketDiameter - this.edgeCut
      );

      // Right Vertical Bar - bottom edge
      triangle(
        this.tableOffsetX + this.tableWidth,
        this.tableOffsetY + this.pocketDiameter + this.borderRectHeight,
        this.tableOffsetX + this.tableWidth - this.tableBorderSize,
        this.tableOffsetY + this.pocketDiameter + this.borderRectHeight,
        this.tableOffsetX + this.tableWidth,
        this.tableOffsetY + this.pocketDiameter + this.borderRectHeight + this.edgeCut
      );
    pop();
  }

  // Render the outer wooden border
  drawOuterBorder() {
    push();
      stroke(this.colors.outerBorder);
      strokeWeight(30);
      noFill();
      rect(
        this.tableOffsetX - 15,
        this.tableOffsetY - 15,
        this.tableWidth + 30,
        this.tableHeight + 30,
        30
      );
    pop();
  }

  // Render pocket visuals
  drawPockets() {
    push();
      fill(this.colors.pocket);
      noStroke();
      this.pocketPositions.forEach((p) => circle(p.x, p.y, this.pocketDiameter));
    pop();
  }

  // Master draw function for the table
  draw() {
    this.drawMat();
    this.drawD();
    this.drawInnerBorders();
    this.drawOuterBorder();
    this.drawPockets();
  }
}