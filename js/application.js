animationDelay = 0;
minSearchTime = 0;

// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
  window.manager = new GameManager(4, KeyboardInputManager, HTMLActuator);
});
