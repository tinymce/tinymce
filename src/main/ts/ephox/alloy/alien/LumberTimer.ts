import { window, console } from "@ephox/dom-globals";

var time = function (f) {
  var start = window.performance.now()
  var result = f();
  return {
    result: result,
    time: window.performance.now() - start
  };
};

var logAndRun = function (label, f) {
  var t = time(f);
  console.log(label + ': ', t.time);
  return t.result;
};

var instance = function (label) {

  var count = 0;
  var freq = 0;

  var run = function (f) {
    var t = time(f);
    count += t.time;
    // console.log(label, t.time);
    freq++;
    return t.result;
  };

  var log = function () {
    console.log(label + ': [ runs: ' + freq + ' ] [ av: ' + count/freq + 'ms ] [ tt: ' + count + 'ms ]');
  };

  var logRuns = function () {
    if(freq > 0) log();
  };


  var reset = function () {
    count = freq = 0;
  };

  return {
    run: run,
    log: log,
    logRuns: logRuns,
    reset: reset
  };
};

export const LumberTimer = {
  instance,
  logAndRun
};
