(function () {
  'use strict';
  function handleEventEntry(entry) {
    console.log("Name: "          + entry.name      +
                " \nEntry Type: " + entry.entryType +
                " \nStart Time: " + entry.startTime +
                " \nEvent Dispatch Time: " + entry.eventDispatchTime +
                " \nHandler End: " + entry.handlerEnd +
                " \nDuration: "   + entry.duration  + "\n");
  }

  function handleLongFrameEntry(entry) {
    console.log("Name: "          + entry.name      +
                " \nEntry Type: " + entry.entryType +
                " \nStart Time: " + entry.startTime +
                " \nDuration: "   + entry.duration  + "\n");
  }

  const inputObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      switch(entry.entryType) {
      case "event":
        handleEventEntry(entry);
        break;
      case "longFrame":
        handleLongFrameEntry(entry);
        break;
      default:
        throw new Error("unhandled entry type " + entry.entryType);
      }
    }
  })
  inputObserver.observe({entryTypes: ['event', 'longFrame']});
})();
