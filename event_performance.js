(function eventPerformance() {
  performance.registerType("event");

  // Maps from event hashes to pending performance entries.
  const pendingEntries = new Map();
  let dispatchQueuedRequested = false;

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
    dispatchQueuedRequested = false;
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
      if (!dispatchQueuedRequested) {
        dispatchQueuedRequested = true;
        requestAnimationFrame(dispatchQueuedEvents);
      }
    }, args);
  };
})();
