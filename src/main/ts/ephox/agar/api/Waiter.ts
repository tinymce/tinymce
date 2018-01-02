import Guard from './Guard';
import Step from './Step';

var sTryUntilPredicate = function (label, predicate, interval, amount) {
  var guard = Guard.tryUntil(label, interval, amount);
  return Step.control(Step.async((next, die) => {
    predicate() ? next() : die('predicate did not succeed');
  }), guard);
};

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

export default <any>{
  sTryUntilPredicate,
  sTryUntil,
  sTryUntilNot,
  sTimeout
};