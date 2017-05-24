(function frameTimestamps() {
  'use strict';
  performance.registerType("longFrame");

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
