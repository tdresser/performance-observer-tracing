(function () {
  'use strict';
  // Map from entryType to list of observers.
  const entryTypeObservers = new Map();
  const observerListeners = new WeakMap();

  const originalObserve = PerformanceObserver.prototype.observe;

  // Given a list of entry types, returns two lists, of valid and invalid entry
  // types.
  function splitValidEntryTypes(entryTypes) {
    const r = {
      valid: [],
      invalid: []
    }

    for (const entryType of entryTypes) {
      try {
        originalObserve.call(
          new PerformanceObserver(()=>{}), {entryTypes: [entryType]});
        r.valid.push(entryType);
      } catch(err) {
        r.invalid.push(entryType);
      }
    }

    return r;
  }


  // TODO - what if we observe multiple times?
  // TODO - implement disconnect.
  PerformanceObserver.prototype.observe = function(args) {
    let {valid, invalid} = splitValidEntryTypes(args.entryTypes);
    for (const type of invalid) {
      let observersForType = entryTypeObservers.get(type);

      if (!observersForType) {
        observersForType = [];
      }

      observersForType.push(this);
      entryTypeObservers.set(type, observersForType);
    }

    if (valid.length > 0) {
      args.entryTypes = valid;
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
