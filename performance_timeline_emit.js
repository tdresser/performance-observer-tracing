(function() {
  var observedTypes = new Set();
  // Map from entryType to list of observers..
  var entryTypeObservers = new Map();
  var observerListeners = new WeakMap();

  var originalObserve = PerformanceObserver.prototype.observe;
  // TODO - what if we observe multiple times?
  // TODO - implement disconnect.
  PerformanceObserver.prototype.observe = function(args) {
    for (type of args.entryTypes) {
      if (observedTypes.has(type)) {
        var observersForType = entryTypeObservers.get(type);
        if (!observersForType)
          observersForType = [];
        observersForType.push(this);
        entryTypeObservers.set(type, observersForType);
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

  // Register a type before emitting any entries of that type.
  performance.registerType = function(type) {
    observedTypes.add(type);
  }
  performance.emit = function(performanceEntry) {
    for ([entryType, observers] of entryTypeObservers) {
      for (observer of observers) {
        if (entryType == performanceEntry.entryType) {
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
    };
  }
})()
