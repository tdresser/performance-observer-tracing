(function () {
  'use strict';

  const currentTrace = [];

  let id = 0;

  const observer = new PerformanceObserver((list) => {
    for (let entry of list.getEntries()) {
      const traceEvent = {
        name: entry.entryType + '::' + entry.name,
        cat: entry.entryType,
        ts: entry.startTime * 1000,
      };

      switch(entry.entryType) {
      case 'mark':
        traceEvent.pid = 'Marks';
        break;
      case 'measure':
        traceEvent.pid = 'Measures';
        break;
      default:
        traceEvent.pid = 'Primary';
      }

      if (entry.entryType == 'resource') {
        entry.url = traceEvent.name;
        traceEvent.name = 'resource';
      }

      if (entry.duration == 0) {
        traceEvent.ph = 'n';
        traceEvent.s = 't';
      } else {
        traceEvent.ph = 'b';
      }

      traceEvent.id = '0x' + id.toString(16);
      id++;

      let args = {};
      for (let key in entry) {
        let value = entry[key];
        if (key == 'entryType' || key == 'name' || key == 'toJSON') {
          continue;
        }
        args[key] = value;
      }
      traceEvent.args = args;

      currentTrace.push(traceEvent);

      if (entry.duration != 0) {
        let traceEventEnd = {};
        for (let key in traceEvent) {
          traceEventEnd[key] = traceEvent[key];
        }
        traceEventEnd.ph = 'e';
        traceEventEnd.ts = traceEvent.ts + entry.duration * 1000;
        currentTrace.push(traceEventEnd);
      }
    }
  });

  observer.observe({entryTypes: [
    'resource',
    'navigation',
    'paint',
    'longtask',
    'mark',
    'measure'
  ]});

  window.getPerformanceObserverTrace = function() {
    return currentTrace;
  }
})();
