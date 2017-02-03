// To use: element.addEventListener("styleupdate").
(function() {
  var elementPreviousStyleStrings = new WeakMap();
  // TODO - this leaks.
  var observedElements = [];

  function checkStyleUpdates() {
    window.requestAnimationFrame(checkStyleUpdates);

    observedElements.forEach(function(element) {
      if (element == document) {
        element = document.documentElement;
      }
      var newStyleString = JSON.stringify(window.getComputedStyle(element));
      var previousStyleString = elementPreviousStyleStrings.get(element);
      if (previousStyleString == newStyleString) {
        return;
      }
      elementPreviousStyleStrings.set(element, newStyleString);
      var event = new CustomEvent('styleupdate', {});
      element.dispatchEvent(event);
    })
  }
  window.requestAnimationFrame(checkStyleUpdates);

  var originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, method, args) {
    if (type == "styleupdate")
      observedElements.push(this);
    originalAddEventListener.call(this, type, method, args);
  }
})();
