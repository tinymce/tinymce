import { Option, Obj } from "@ephox/katamari";
import { LumberTimer } from './LumberTimer';
import { window } from "@ephox/dom-globals";
var registry = (window as any).TIMER_REGISTRY || { };
(window as any).TIMER_REGISTRY = registry;

var register = function (tag) {
  registry[tag] = LumberTimer.instance(tag);
};

var unregister = function (tag) {
  registry[tag] = undefined;
};

var instance = function (name) {
  Obj.each(registry, function (x, i) {
    x[name]();
  });
};

var log = function () {
  instance('log');
};

var logRuns = function () {
  instance('logRuns');
};

var reset = function () {
  instance('reset');
};

var run = function (tag, f) {
  if (registry[tag]) {
    return registry[tag].run(f);
  } else {
    return f();
  }
  // return f();
  // var instance = Option.from(registry[tag]);
  // return instance.fold(
  //   () => {
  //     register(tag);
  //     return registry[tag].run(f);
  //   }, function (v) {
  //   return v.run(f);
  // });
};

var wrap = function (tag, f) {
  return function () {
    var args = Array.prototype.slice.call(arguments, 0);
    return run(tag, function () {
      return f.apply(undefined, args);
    });
  };
};


export const LumberTimers = {
  register,
  unregister,
  log,
  logRuns,
  reset,
  run,
  wrap
};
