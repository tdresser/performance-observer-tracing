(function eventPerformance() {
  'use strict';
  performance.registerType("event");

  // Maps from event hashes to pending performance entries. TODO - use a better
  // data structure, sorted on timestamp.
  const pendingEntries = new Map();

  const frameObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log(entry);
    }
    dispatchQueuedEvents();
  });
  frameObserver.observe({entryTypes:['longFrame']});

  function eventHash(e) {
    // TODO - better hash function.
    return e.timeStamp + e.type;
  }

  function addEntry(e, newEntryData) {
    const hash = eventHash(e);
    const entry = pendingEntries.get(hash);
    if (!entry) {
      pendingEntries.set(hash, newEntryData);
      return newEntryData;
    }
    entry.handlerEnd = newEntryData.handlerEnd;
    return entry;
  }

  function dispatchQueuedEvents() {
    for (const [hash, entry] of pendingEntries.entries()) {
      entry.duration = entry.handlerEnd - entry.startTime;
      performance.emit(entry);
    }
    pendingEntries.clear();
  }

  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, f, args) {
    originalAddEventListener.call(this, type, (e) => {
      const handlersStart = performance.now();
      f(e);
      const entry = {
        name: type,
        entryType: 'event',
        startTime: handlersStart,
        eventDispatchTime: e.timeStamp,
        handlerEnd: performance.now()
      };
      addEntry(e, entry);
    }, args);
  };
})();
