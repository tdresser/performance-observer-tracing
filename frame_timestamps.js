(function frameTimestamps() {
  'use strict';
  performance.registerType("longFrame");

  // TODO - don't dispatch long frames if we're in the background, as rAF will
  // be throttled.

  let lastRafTime = 0;
  function raf(time) {
    window.requestAnimationFrame(raf);
    if (lastRafTime > 0 && time - lastRafTime > 50) {
      performance.emit({
        name: "Long Frame",
        entryType: "longFrame",
        duration: time - lastRafTime,
        startTime: lastRafTime
      })
    }
    lastRafTime = time;
  }
  window.requestAnimationFrame(raf);
})();
