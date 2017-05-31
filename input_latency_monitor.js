(function () {
  'use strict';

  let pendingEntries = [];

  function rAF() {
    requestAnimationFrame(rAF);
    let frameEntry;
    const nonFrameEntries = [];
    for (const entry of pendingEntries) {
      if (entry.entryType == "frame") {
        frameEntry = entry;
      } else {
        nonFrameEntries.push(entry);
      }
    }

    if (frameEntry) {
      frameEntry.withinFrameEntries = nonFrameEntries;
//      console.log(JSON.stringify(frameEntry, null, 2));
    } else if (nonFrameEntries.length > 0) {
//      console.log(JSON.stringify(nonFrameEntries, null, 2));
    }

    pendingEntries = [];
  }
  rAF();

  const inputObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      pendingEntries.push(entry);
    }
  })
  inputObserver.observe({entryTypes: ['event', 'frame', 'styleupdate']});
})();
