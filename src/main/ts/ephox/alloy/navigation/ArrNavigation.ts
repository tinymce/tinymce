import { Arr } from '@ephox/katamari';

const cyclePrev = function (values, index, predicate) {
  const before = Arr.reverse(values.slice(0, index));
  const after = Arr.reverse(values.slice(index + 1));
  return Arr.find(before.concat(after), predicate);
};

const tryPrev = function (values, index, predicate) {
  const before = Arr.reverse(values.slice(0, index));
  return Arr.find(before, predicate);
};

const cycleNext = function (values, index, predicate) {
  const before = values.slice(0, index);
  const after = values.slice(index + 1);
  return Arr.find(after.concat(before), predicate);
};

const tryNext = function (values, index, predicate) {
  const after = values.slice(index + 1);
  return Arr.find(after, predicate);
};

export {
  cyclePrev,
  cycleNext,
  tryPrev,
  tryNext
};