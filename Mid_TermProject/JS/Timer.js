/**
 * Starts the game timer. Resets timer to 60 seconds and switches players 
 * when time runs out. Displays a foul message temporarily.
 */
function startTimer() {
    timer = 60;
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      timer--;
      if (timer <= 0) {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        foulMessageVisible = true;
  
        // Hide foul message after 2 seconds
        foulMessageTimeout = setTimeout(() => {
          foulMessageVisible = false;
        }, 2000);

        timer = 60; // Reset timer for next move
      }
    }, 1000);
  }


/**
 * Draws the current timer value at the center of the screen.
 */
function drawTimer() {
  push();
    textAlign(CENTER);
    textSize(24);
    textStyle(BOLD);
    fill(255);
    text(`${timer}`, width / 2, dpHeight*2);
  pop();
}

/**
 * Resets the timer to its initial value of 60 seconds.
 */
function resetTimer(){
  timer = 60;
}