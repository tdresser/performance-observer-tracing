(function() {
  var observedTypes = new Set();
  var observers = new Map();
  var observerListeners = new WeakMap();

  var originalObserve = PerformanceObserver.prototype.observe;
  // TODO - what if we observe multiple times?
  // TODO - implement disconnect.
  PerformanceObserver.prototype.observe = function(args) {
    for (type of args.entryTypes) {
      if (observedTypes.has(type)) {
        observers.set(this, args.entryTypes);
      }
    }
    originalObserve.call(this, args);
  }

  var originalProto = PerformanceObserver.prototype;
  PerformanceObserver = function(listener) {
    var result = new originalProto.constructor(listener);
    observerListeners.set(result, listener);
    return result;
  }
  PerformanceObserver.prototype = originalProto;


  performance.registerType = function(type) {
    observedTypes.add(type);
  }
  performance.emit = function(performanceEntry) {
    observers.forEach(function(types, observer) {
      for (observedType of types) {
        if (observedType == performanceEntry.entryType) {
          var listener = observerListeners.get(observer);
          var list = {};
          list.prototype = PerformanceObserverEntryList;
          // TODO - override other methods.
          list.getEntries = function() {
            return [performanceEntry];
          }
          listener.call(this, list);
        }
      }
    });
  }
})()
