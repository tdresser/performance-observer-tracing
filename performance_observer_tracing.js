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


  /**
   * Downloads a file using a[download].
   * @param {!string} jsonStr string of JSON to save
   */
  function saveFile(jsonStr) {
    const blob = new Blob([jsonStr], {type: 'application/json'});
    const filename = `${document.location.host}_${new Date().toISOString()}.trace.json`
        // Replace characters that are unfriendly to filenames
        .replace(/[/?<>:*|"]/g, '-');
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = filename;
    a.href = href;
    document.body.appendChild(a); // Firefox requires anchor to be in the DOM.
    a.click();

    // Cleanup
    document.body.removeChild(a);
    setTimeout(_ => URL.revokeObjectURL(href), 500);
  }

  window.getPerformanceObserverTraceEvents = function() {
    return currentTrace;
  };

  window.getPerformanceObserverTrace = function() {
    return `
{ "traceEvents": [
  ${currentTrace.map(evt => JSON.stringify(evt)).join(',\n')}
]}`;
  };

  window.downloadPerformanceObserverTrace = function() {
    saveFile(window.getPerformanceObserverTrace());
  }

})();
