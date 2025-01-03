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
  
function drawTimer() {
  push();
    textAlign(CENTER);
    textSize(24);
    textStyle(BOLD);
    fill(255);
    text(`${timer}`, width / 2, dpHeight*2);
  pop();
}

function resetTimer(){
  timer = 60;
}