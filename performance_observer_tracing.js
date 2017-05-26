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

  const observer = new PerformanceObserver((list) => {
    for (let entry of list.getEntries()) {
      const traceEvent = {
        name: entry.entryType + "::" + entry.name,
        cat: entry.entryType,
        pid:"Main",
        ts: entry.startTime,
        dur: entry.duration
      };

      if (entry.duration == 0) {
        traceEvent.ph = "i";
        traceEvent.s = "t";
      } else {
        traceEvent.ph = "X";
      }

      delete entry.entryType;
      delete entry.name;

      traceEvent.args = entry;

      currentTrace.push(traceEvent);
    }
  });

  observer.observe({entryTypes: ['resource', 'navigation', 'event', 'frame', 'styleupdate']});

  window.downloadTrace = function() {
    download("performance_observer_trace.json", JSON.stringify(currentTrace));
  }
})();
