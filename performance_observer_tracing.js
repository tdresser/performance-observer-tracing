(function () {
  'use strict';

  function download(filename, text) {
    const blob = new Blob([text], {type: 'text/plain'});

    var element = document.createElement('a');
    element.setAttribute('href', window.URL.createObjectURL(blob));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  const currentTrace = [];

  let id = 0;
  let bind_id = 0;

  function handleEventEntry(entry, primaryTraceEvent) {
    console.log("FOO");
    const queueingTimeName = entry.name + '::event queueing time';
    const queueingTimePid = 'Input::' + entry.name + '::Queueing';
    const flowEventStart = {
      name: queueingTimeName,
      ph: 'X',
      dur: 0,
      pid: queueingTimePid,
      cat: entry.entryType,
      bind_id: '0x' + bind_id.toString(16),
      ts: entry.startTime * 1000,
      flow_out: true,
    };

    const flowEventEnd = {
      name: primaryTraceEvent.name,
      ph: 'X',
      dur: 0,
      pid: primaryTraceEvent.pid,
      cat: entry.entryType,
      bind_id: '0x' + bind_id.toString(16),
      ts: entry.eventHandlersEnd * 1000,
      flow_in: true,
    };

    bind_id++;
    currentTrace.push(flowEventStart);
    currentTrace.push(flowEventEnd);
  }

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
      case 'event':
        traceEvent.pid = 'Input::' + entry.name;
        break;
      default:
        traceEvent.pid = 'Primary';
      }

      if (entry.entryType == 'event') {
        // We display the queueing time in handleEventEntry, remove it from the
        // primary event slice.
        traceEvent.ts = entry.eventHandlersBegin * 1000;
        // Use entry name first to sort event types next to their queueing times.
        traceEvent.name = entry.name + '::' + entry.entryType;

        handleEventEntry(entry, traceEvent);
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
    'event',
    'frame',
    'styleupdate',
    'paint',
    'longtask',
    'mark',
    'measure'
  ]});

  window.downloadTrace = function() {
    download('performance_observer_trace.json', JSON.stringify(currentTrace));
  }
})();
