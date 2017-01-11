(function eventPerforance() {
  var monitoredEventTypes = new Set();

  function eventHash(e) {
    // TODO - better hash function.
    return e.timeStamp + e.type;
  }

  function addEntry(e, newEntryData) {
    var hash = eventHash(e);
    var entry = currentEvents[hash];
    if (!entry) {
      currentEvents[hash] = newEntryData;
      return newEntryData;
    }
    entry.handlerEnd = newEntryData.handlerEnd;
    return entry;
  }

  var originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, f, args) {
    if (!monitoredEventTypes.has(type)) {
      monitoredEventTypes.add(type);
      document.addEventListener(type, (e) => {
        var hash = eventHash(e);
        performance.emit(currentEvents[hash]);
        delete currentEvents[hash]; // TODO - is delete okay?
      }, {passive:true})
    }
    originalAddEventListener.call(this, type, (e) => {
      var start = performance.now();
      f(e);
      var entry = {
        entryType: type,
        startTime: e.timeStamp,
        handlerStart: start,
        handlerEnd:performance.now()
      };
      entry = addEntry(e, entry);
    }, args);
  };
})();
