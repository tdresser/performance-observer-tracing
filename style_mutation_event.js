// To use: element.addEventListener("styleupdate").
(function() {
  const elementPreviousStyleStrings = new WeakMap();
  // TODO - this leaks.
  const observedElements = [];

  function checkStyleUpdates() {
    window.requestAnimationFrame(checkStyleUpdates);

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
      const event = new CustomEvent('styleupdate', {});
      element.dispatchEvent(event);
    })
  }
  window.requestAnimationFrame(checkStyleUpdates);

  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, method, args) {
    if (type == "styleupdate")
      observedElements.push(this);
    originalAddEventListener.call(this, type, method, args);
  }
})();
