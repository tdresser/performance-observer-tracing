(function() {
  var observedTypes = new Set();
  var observers = new Map();

  var originalObserve = PerformanceObserver.prototype.observe;
  // TODO - what if we observe multiple times?
  // TODO - implement disconnect.
  PerformanceObserver.prototype.observe = function(args) {
    for (type of args.entryTypes) {
      if (observedTypes.has(type)) {
        observers.set(this, args.entryTypes);
        console.log(observers);
      }
    }
    originalObserve.call(this, args);
  }
  performance.registerType = function(type) {
    observedTypes.add(type);
  }
  performance.emit = function(type, performanceEntry) {
    observers.forEach(function(types, observer) {
      console.log(types);
      for (observedType of types) {
        if (observedType == type) {
          console.log("FOO");
          console.log(performanceEntry);
        }
      }
    });
  }
})()


var doneObservingEvents = false;

var observer = new PerformanceObserver(function(list) {
  var perfEntries = list.getEntries();
  for (var i = 0; i < perfEntries.length; i++)
  {
    if (window.console) {
      console.log("Name: "        + perfEntries[i].name      +
                  " Entry Type: " + perfEntries[i].entryType +
                  " Start Time: " + perfEntries[i].startTime +
                  " Duration: "   + perfEntries[i].duration  + "\n");
    }
  }
  // maybe disconnect after processing the events.
  if (doneObservingEvents) {
    observer.disconnect();
  }
});

performance.registerType("foo");
// subscribe to Resource-Timing and User-Timing events
observer.observe({entryTypes: ['resource', 'mark', 'measure', 'foo']});

performance.mark("FOO");
performance.emit("foo", {name:"TestPerformanceEntry"});
