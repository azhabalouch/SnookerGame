/**
 * Class representing a Snooker Table.
 */
class SnookerTable {
  /**
   * Initializes the snooker table with configuration details.
   * @param {Object} config - Configuration object containing table properties.
   */
  constructor(config) {
    // Set table dimensions based on configuration
    this.tableWidth = config.tableWidth; // Table width
    this.tableHeight = this.tableWidth / 2; // Table height (half of width for standard proportions)

    // Set offset values for positioning the table within the canvas
    this.tableOffsetX = config.tableOffsetX; // Horizontal offset
    this.tableOffsetY = config.tableOffsetY; // Vertical offset

    // Set dimensions and properties of the table's pockets
    this.pocketDiameter = (this.tableWidth / 36) * 1.5; // Pocket diameter based on table size

    // Calculate baulk line and "D" zone dimensions
    this.baulkLineX = this.tableOffsetX + this.tableWidth / 4; // X-coordinate for the baulk line
    this.dRadius = this.tableWidth * 0.1; // Radius for the "D" zone

    // Assign colors for different components of the table
    this.colors = config.colors;

    // Define inner border properties
    this.edgeCut = 10; // Edge cut for border corners
    this.borderRectWidth = this.tableWidth / 2 - 2 * this.pocketDiameter; // Width of border rectangles
    this.borderRectHeight = this.tableHeight - this.pocketDiameter * 2; // Height of border rectangles
    this.tableBorderSize = 10; // Border size
    this.borderAdjustment = 10; // Adjustment for border dimensions

    // Define pocket properties
    this.pocketRadius = this.pocketDiameter / 2; // Radius of each pocket
    this.pushBackPocket = 10; // Offset for pocket placement

    // Arrays to store table components
    this.borders = []; // Border positions
    this.matterBorders = []; // Matter.js border bodies
    this.pockets = []; // Pocket sensors
    this.pocketPositions = []; // Pocket positions

    // Initialize the table's borders and pockets
    this.initializeInnerBorders();
    this.initializePockets();
  }

  /**
   * Initializes the inner borders of the table as Matter.js static bodies.
   */
  initializeInnerBorders() {
    // Define the border positions and dimensions
    this.borders = [
      { x: this.tableOffsetX + this.pocketDiameter, y: this.tableOffsetY, width: this.borderRectWidth + this.borderAdjustment, height: this.tableBorderSize },
      { x: this.tableOffsetX + this.pocketDiameter * 3 + this.borderRectWidth - this.borderAdjustment, y: this.tableOffsetY, width: this.borderRectWidth + this.borderAdjustment, height: this.tableBorderSize },
      { x: this.tableOffsetX + this.pocketDiameter, y: this.tableOffsetY + this.tableHeight - this.tableBorderSize, width: this.borderRectWidth + this.borderAdjustment, height: this.tableBorderSize },
      { x: this.tableOffsetX + this.pocketDiameter * 3 + this.borderRectWidth - this.borderAdjustment, y: this.tableOffsetY + this.tableHeight - this.tableBorderSize, width: this.borderRectWidth + this.borderAdjustment, height: this.tableBorderSize },
      { x: this.tableOffsetX, y: this.tableOffsetY + this.pocketDiameter, width: this.tableBorderSize, height: this.borderRectHeight },
      { x: this.tableOffsetX + this.tableWidth - this.tableBorderSize, y: this.tableOffsetY + this.pocketDiameter, width: this.tableBorderSize, height: this.borderRectHeight },
    ];

    // Create static Matter.js bodies for each border
    this.matterBorders = this.borders.map((b) =>
      Matter.Bodies.rectangle(
        b.x + b.width / 2, // Center x-coordinate
        b.y + b.height / 2, // Center y-coordinate
        b.width, // Width of the body
        b.height, // Height of the body
        { isStatic: true } // Make the body static
      )
    );

    // Add the borders to the Matter.js world
    Matter.World.add(world, this.matterBorders);
  }

  /**
   * Initializes the pocket sensors for the table using Matter.js.
   */
  initializePockets() {
    // Define the positions of the pockets
    this.pocketPositions = [
      { x: this.tableOffsetX + this.pocketRadius - this.pushBackPocket, y: this.tableOffsetY + this.pocketRadius - this.pushBackPocket },
      { x: this.tableOffsetX + this.tableWidth - this.pocketRadius + this.pushBackPocket, y: this.tableOffsetY + this.pocketRadius - this.pushBackPocket },
      { x: this.tableOffsetX + this.pocketRadius - this.pushBackPocket, y: this.tableOffsetY + this.tableHeight - this.pocketRadius + this.pushBackPocket },
      { x: this.tableOffsetX + this.tableWidth - this.pocketRadius + this.pushBackPocket, y: this.tableOffsetY + this.tableHeight - this.pocketRadius + this.pushBackPocket },
      { x: this.tableOffsetX + this.tableWidth / 2, y: this.tableOffsetY + this.pocketRadius - this.pushBackPocket * 2 },
      { x: this.tableOffsetX + this.tableWidth / 2, y: this.tableOffsetY + this.tableHeight - this.pocketRadius + this.pushBackPocket * 2 },
    ];

    // Define the radius for pocket sensors
    const sensorRadius = 5;

    // Create static sensor bodies for each pocket
    this.pockets = this.pocketPositions.map((p) =>
      Matter.Bodies.circle(p.x, p.y, sensorRadius, {
        isStatic: true, // Static pocket sensors
        isSensor: true, // Sensors to detect ball collisions
        label: "pocket" // Label for identification
      })
    );

    // Add the pockets to the Matter.js world
    Matter.World.add(world, this.pockets);
  }

  /**
   * Draws the green mat of the snooker table.
   */
  drawMat() {
    push();
    fill(this.colors.tableMat); // Set mat color
    noStroke(); // No border for the mat
    rect(this.tableOffsetX, this.tableOffsetY, this.tableWidth, this.tableHeight); // Draw the mat
    pop();
  }

  /**
   * Draws the "D" zone and baulk line.
   */
  drawD() {
    push();
    noFill(); // No fill for the "D" zone
    stroke(this.colors.line); // Set line color
    strokeWeight(2); // Line thickness

    // Draw the baulk line
    line(
      this.baulkLineX,
      this.tableOffsetY,
      this.baulkLineX,
      this.tableOffsetY + this.tableHeight
    );

    // Draw the semi-circle for the "D"
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

  /**
   * Draws the inner borders of the table, including shadow effects and corner details.
   */
  drawInnerBorders() {
    push();
    fill(this.colors.innerBorder); // Set border color
    noStroke(); // No outline for borders

    // Apply shadow effects for depth
    drawingContext.shadowOffsetX = 5;
    drawingContext.shadowOffsetY = 5;
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = "rgba(0, 0, 0, 0.2)";

    // Draw each border
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

  /**
   * Draws the outer wooden border of the table.
   */
  drawOuterBorder() {
    push();
    stroke(this.colors.outerBorder); // Set border color
    strokeWeight(30); // Outer border thickness
    noFill(); // No fill for outer border
    rect(
      this.tableOffsetX - 15, // Adjusted position for outer border
      this.tableOffsetY - 15,
      this.tableWidth + 30,
      this.tableHeight + 30,
      30 // Rounded corners
    );
    pop();
  }

  /**
   * Draws the pockets on the table visually.
   */
  drawPockets() {
    push();
    fill(this.colors.pocket); // Set pocket color
    noStroke(); // No border for pockets
    this.pocketPositions.forEach((p) => circle(p.x, p.y, this.pocketDiameter)); // Draw each pocket
    pop();
  }

  /**
   * Master draw function to render all components of the table.
   */
  draw() {
    this.drawMat();
    this.drawD();
    this.drawInnerBorders();
    this.drawOuterBorder();
    this.drawPockets();
  }
}
