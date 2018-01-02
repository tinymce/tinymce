import Guard from './Guard';
import Step from './Step';

var sTryUntil = function (label, step, interval, amount) {
  var guard = Guard.tryUntil(label, interval, amount);
  return Step.control(step, guard);
};

var sTryUntilNot = function (label, step, interval, amount) {
  var guard = Guard.tryUntilNot(label, interval, amount);
  return Step.control(step, guard);
};

var sTimeout = function (label, step, limit) {
  var guard = Guard.timeout(label, limit);
  return Step.control(step, guard);
};

export default {
  sTryUntil,
  sTryUntilNot,
  sTimeout
};