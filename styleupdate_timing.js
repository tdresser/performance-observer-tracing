(function () {
  'use strict';
  const elementPreviousStyleStrings = new WeakMap();
  function checkStyleUpdates(now) {
    window.requestAnimationFrame(checkStyleUpdates);

    const observedElements = document.querySelectorAll('[report-styleupdate]');

    observedElements.forEach(function(element) {
      if (element == document) {
        element = document.documentElement;
      }
      const newStyleString = JSON.stringify(window.getComputedStyle(element));
      const previousStyleString = elementPreviousStyleStrings.get(element);
      if (previousStyleString == newStyleString) {
        return;
      }
      elementPreviousStyleStrings.set(element, newStyleString);

      const entry = {
        name: element.id,
        entryType: 'styleupdate',
        startTime: now,
        duration: 0,
      };
      performance.emit(entry);
    })
  }
  window.requestAnimationFrame(checkStyleUpdates);
})();
