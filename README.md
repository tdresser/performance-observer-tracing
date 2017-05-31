# input-latency-web-perf-polyfill
An extremely rough input latency web perf polyfill, exploring the possibilities.

The associated rough proposal for an Event Timing web performance API can be found [here]((https://docs.google.com/document/d/1_jKAyTvMN2xEDmqttozWDIWGfhSwecaDrkHZ0dWkOns)).

This is not intended for production use, just to explore the API space.

The demo [here](https://tdresser.github.io/input-latency-web-perf-polyfill/) contains a box with a slow click handler, a button to fetch resources, and a button to download a trace, containing the information recorded by a PerformanceObserver.

[Here](sample_trace.json)'s a sample trace.
![Sample Trace](sample_trace.png)
