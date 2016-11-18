// To use: element.addEventListener("styleupdate").
(function() {
  var elementObservers = new Map();
  var elementPreviousStyleStrings = new WeakMap();

  function checkStyleUpdates() {
    window.requestAnimationFrame(checkStyleUpdates);

    elementObservers.forEach(function(observer, element) {
      var newStyleString = JSON.stringify(window.getComputedStyle(element));
      var previousStyleString = elementPreviousStyleStrings.get(element);
      if (previousStyleString == newStyleString) {
        return;
      }
      elementPreviousStyleStrings.set(element, newStyleString);
      observer.call(element);
    })
  }
  window.requestAnimationFrame(checkStyleUpdates);

  // TODO - make this behave the same as addEventListener. Implement
  // removeEventListener etc.
  var originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, method, args) {
    if (type != "styleupdate") {
      originalAddEventListener.call(this, type, method, args);
      return;
    }
    elementObservers.set(this, method);
  }
})();
