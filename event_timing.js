(function () {
  'use strict';

  // Maps from event hashes to pending performance entries. TODO - use a better
  // data structure, sorted on timestamp.
  const pendingEntries = new Map();

  const frameObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType == "frame") {
        for (const [hash, eventEntry] of pendingEntries.entries()) {
          if (eventEntry.handlerEnd < entry.startTime) {
            // Event was before long frame. We won't dispatch this entry.
            continue;
          } else if (entry.startTime + entry.duration < eventEntry.startTime) {
            // Event was after long frame. Wait for the next long frame.
            continue;
          }

          // Event was during long frame, dispatch it.
          performance.emit(eventEntry);
          pendingEntries.delete(hash);
        }
      }
    }
  });

  frameObserver.observe({entryTypes:['frame']});

  function eventHash(e) {
    // TODO - better hash function.
    return e.timeStamp + e.type;
  }

  function addOrCoalesceEntry(e, newEntryData) {
    const hash = eventHash(e);
    const entry = pendingEntries.get(hash);
    if (!entry) {
      pendingEntries.set(hash, newEntryData);
      return newEntryData;
    }
    entry.eventHandlersEnd = newEntryData.eventHandlersEnd;
    entry.duration = newEntryData.duration;
    return entry;
  }

  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, f, args) {
    originalAddEventListener.call(this, type, (e) => {
      const eventHandlersBegin = performance.now();
      f(e);
      const eventHandlerEnd = performance.now();
      const entry = {
        name: type,
        entryType: 'event',
        startTime: e.timeStamp,
        eventHandlersBegin: eventHandlersBegin,
        eventHandlersEnd: eventHandlerEnd,
        duration: eventHandlerEnd - e.timeStamp,
        cancelable: event.cancelable,
      };
      addOrCoalesceEntry(e, entry);
    }, args);
  };
})();
