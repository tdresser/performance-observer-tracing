(function() {
  'use strict';
  const observedTypes = new Set();
  // Map from entryType to list of observers.
  const entryTypeObservers = new Map();
  const observerListeners = new WeakMap();

  const originalObserve = PerformanceObserver.prototype.observe;
  // TODO - what if we observe multiple times?
  // TODO - implement disconnect.
  PerformanceObserver.prototype.observe = function(args) {
    let nativeEntryTypes = args.entryTypes;
    for (const type of args.entryTypes) {
      if (observedTypes.has(type)) {
        let observersForType = entryTypeObservers.get(type);

        if (!observersForType) {
          observersForType = [];
        }

        observersForType.push(this);
        entryTypeObservers.set(type, observersForType);
        nativeEntryTypes = nativeEntryTypes.filter(x => x != type);
      }
    }
    if (entryTypeObservers.length > 0) {
      args.entryTypes = nativeEntryTypes;
      originalObserve.call(this, args);
    }
  }

  const originalProto = PerformanceObserver.prototype;
  PerformanceObserver = function(listener) {
    const result = new originalProto.constructor(listener);
    observerListeners.set(result, listener);
    return result;
  }
  PerformanceObserver.prototype = originalProto;

  // Register a type before emitting any entries of that type. This is used to
  // make it easy to distinguish native event types from custom
  // ones. https://github.com/w3c/performance-timeline/issues/77 would make this
  // unnecessary.
  performance.registerType = function(type) {
    observedTypes.add(type);
  }

  performance.emit = function(performanceEntry) {
    for (const [entryType, observers] of entryTypeObservers) {
      if (entryType == performanceEntry.entryType) {
        for (const observer of observers) {
          const listener = observerListeners.get(observer);
          const list = {};
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
