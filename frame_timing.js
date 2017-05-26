(function () {
  'use strict';
  const originalRequestAnimationFrame = requestAnimationFrame;

  let lastFrameStartTime;
  let pendingEntry;

  requestAnimationFrame = function(f, args) {
    originalRequestAnimationFrame.call(window, (queueingTime) => {
      // This runs directly after commit.
      window.setTimeout(() => {
        if (pendingEntry) {
          const frameStartTime = performance.now();
          pendingEntry.startTime = lastFrameStartTime;
          pendingEntry.duration = frameStartTime - lastFrameStartTime;

          // TODO - don't dispatch long frames if we're in the background, as rAF will
          // be throttled.
          if (pendingEntry.duration > 50) {
            performance.emit(pendingEntry);
          }
          pendingEntry = null;
        }
        lastFrameStartTime = performance.now();
      }, 0);

      const handlersStartTime = performance.now();
      f(queueingTime);

      if (!lastFrameStartTime) {
        return;
      }

      if(!pendingEntry) {
        pendingEntry = {
          name: 'frame',
          entryType: 'frame',
          url: window.location.href,
          handlersStartTime: handlersStartTime,
          frameBeginTime: queueingTime,
        };
      }

      // Update the end time each time a handler ends - the last handler wins.
      pendingEntry.handlersEndTime = performance.now();
    }, args);
  };

  // We need an empty rAF loop running at all times if there's no rAF animation
  // in the page.
  function raf() {
    window.requestAnimationFrame(raf);
  }
  window.requestAnimationFrame(raf);

})();
