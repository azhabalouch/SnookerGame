function startTimer() {
    timer = 60;
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      timer--;
      if (timer <= 0) {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
  
        // Show foul message
        foulMessageVisible = true;
  
        // Hide foul message after 2 seconds
        foulMessageTimeout = setTimeout(() => {
          foulMessageVisible = false;
        }, 2000);
  
        timer = 60; // Reset timer for next move
      }
    }, 1000);
  }
  
function drawTimer() {
    textAlign(CENTER);
    textSize(20);
    textStyle(BOLD);
    fill(255);
    text(`Timer: ${timer}s`, width / 2, dpHeight*2);
}