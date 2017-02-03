(function frameTimestamps() {
  var lastRafTime = 0;
  function raf(time) {
    window.requestAnimationFrame(raf);
    if (time - lastRafTime > 50) {
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
