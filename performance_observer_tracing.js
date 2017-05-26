(function () {
  'use strict';

  // Roughly from
  // https://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server.

  function download(filename, text) {

    const blob = new Blob([text], {type: 'text/plain'});

    var element = document.createElement('a');
    element.setAttribute('href', window.URL.createObjectURL(blob));
/*    element.setAttribute('data-downloadurl', 'text/plain:Myfile.txt:' + 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));*/
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  const currentTrace = [];

  const inputObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const traceEvent = {
        name: entry.entryType + "::" + entry.name,
        cat: entry.entryType,
        ph: "X",
        pid:"Main",
        ts: entry.startTime,
        dur: entry.duration
      };

      /*
      if (entry.duration == 0) {
        traceEvent.phase = "i";
        traceEvent.s = "p";
      } else {
        traceEvent.phase = "X";
      }*/

      currentTrace.push(traceEvent);
    }
  });

  inputObserver.observe({entryTypes: ['event', 'frame', 'styleupdate']});

  window.downloadTrace = function() {
    download("performance_observer_trace.json", JSON.stringify(currentTrace));
  }
})();
