function checkIfCueBallonD(){
  // Compute distance from the center of the D
  let distToD = dist(
    cueBall.position.x,
    cueBall.position.y,
    snookerTable.baulkLineX,
    snookerTable.tableOffsetY + snookerTable.tableHeight / 2
  );

  // Check distance inside the full circle
  if (distToD <= snookerTable.dRadius) {
    // Check x is on the left side for the semicircle
    // Because the arc is drawn from HALF_PI to -HALF_PI
    if (cueBall.position.x <= snookerTable.baulkLineX) {
      return true;
    };
  };

  IncorrectMessageVisible = true;
  
  // Hide after 2 seconds
  IncorrectMessageTimeout = setTimeout(() => {
    IncorrectMessageVisible = false;
  }, 2000);

  return false;
}









// Snooker Foul Rules

//     Potting the Cue Ball (White Ball):
//         If the cue ball is potted into any pocket, a foul is committed.
//         Penalty: The opponent is awarded 4 points and gains control of the table.
//         Missing the Target Ball:

//         If the cue ball fails to make contact with the intended target ball, it is a foul.
//         Penalty: The opponent is awarded points equal to the value of the target ball (minimum 4 points).

//         Potting the Wrong Ball:

//     If a player pots a ball out of sequence (e.g., potting a colored ball when a red ball is required), a foul is committed.
//     Penalty: The opponent is awarded points equal to the value of the potted ball (minimum 4 points).

//     Failure to Hit the Cushion:

//     After contact with the target ball, at least one ball must hit a cushion. Failure to do so constitutes a foul.
//     Penalty: 4 points are awarded to the opponent.

//     Hitting the Wrong Ball First:

//     The cue ball must strike the correct ball as per the sequence of play (e.g., red ball when reds are active). Failure to do so is a foul.
//     Penalty: The opponent is awarded points equal to the value of the target ball (minimum 4 points).

//     Time Violation:

//     If a player exceeds the allocated time for a shot, it is a foul.
//     Penalty: The opponent gains 4 points and control of the table.

//     Sequence Violations (Red and Color):

//     Players must alternate potting red and colored balls. Failing to do so (e.g., potting multiple colors or reds consecutively) results in a foul.
//     Penalty: Points are awarded based on the value of the wrongly potted ball (minimum 4 points).