(function eventPerformance() {
  var monitoredEventTypes = new Set();
  // Maps from event hashes to pending performance entries.
  var pendingEntries = new Map();

  function eventHash(e) {
    // TODO - better hash function.
    return e.timeStamp + e.type;
  }

  function addEntry(e, newEntryData) {
    var hash = eventHash(e);
    var entry = pendingEntries.get(hash);
    if (!entry) {
      pendingEntries.set(hash, newEntryData);
      return newEntryData;
    }
    entry.handlerEnd = newEntryData.handlerEnd;
    return entry;
  }

  function dispatchQueuedEvents() {
    for (let [hash, entry] of pendingEntries.entries()) {
      entry.duration = entry.handlerEnd - entry.handlerStart;
      performance.emit(entry);
    }
    pendingEntries.clear();
  }

  var originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, f, args) {
    // Handle the document case separately, since we need to make sure our
    // clean up logic runs after any other document level handlers.
    if (!monitoredEventTypes.has(type))
      monitoredEventTypes.add(type);
    originalAddEventListener.call(this, type, (e) => {
      var start = performance.now();
      f(e);
      var entry = {
        name: type,
        entryType: 'event',
        startTime: e.timeStamp,
        handlerStart: start,
        handlerEnd: performance.now()
      };
      addEntry(e, entry);
      // TODO - only rAF if we don't already have a frame requested.
      requestAnimationFrame(dispatchQueuedEvents);
    }, args);
  };
})();
