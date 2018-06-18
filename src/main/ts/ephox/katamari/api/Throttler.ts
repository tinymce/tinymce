// Run a function fn afer rate ms. If another invocation occurs
// during the time it is waiting, update the arguments f will run
// with (but keep the current schedule)
var adaptable = function (fn: Function, rate: number) {
  var timer: number | null = null;
  var args: any[] | null = null;
  var cancel = function () {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
      args = null;
    }
  };
  var throttle = function (...newArgs) {
    args = newArgs;
    if (timer === null) {
      timer = setTimeout(function () {
        fn.apply(null, args);
        timer = null;
        args = null;
      }, rate);
    }
  };

  return {
    cancel: cancel,
    throttle: throttle
  };
};

// Run a function fn after rate ms. If another invocation occurs
// during the time it is waiting, ignore it completely.
var first = function (fn: Function, rate: number) {
  var timer: number | null = null;
  var cancel = function () {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };
  var throttle = function (...args) {
    if (timer === null) {
      timer = setTimeout(function () {
        fn.apply(null, args);
        timer = null;
      }, rate);
    }
  };

  return {
    cancel: cancel,
    throttle: throttle
  };
};

// Run a function fn after rate ms. If another invocation occurs
// during the time it is waiting, reschedule the function again
// with the new arguments.
var last = function (fn: Function, rate: number) {
  var timer: number | null = null;
  var cancel = function () {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };
  var throttle = function (...args) {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(null, args);
      timer = null;
    }, rate);
  };

  return {
    cancel: cancel,
    throttle: throttle
  };
};

export default {
  adaptable: adaptable,
  first: first,
  last: last
};