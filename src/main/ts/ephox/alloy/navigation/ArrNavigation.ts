import { Arr, Option } from '@ephox/katamari';

const cyclePrev = (values, index, predicate) => {
  const before = Arr.reverse(values.slice(0, index));
  const after = Arr.reverse(values.slice(index + 1));
  return Arr.find(before.concat(after), predicate);
};

const tryPrev = (values, index, predicate) => {
  const before = Arr.reverse(values.slice(0, index));
  return Arr.find(before, predicate);
};

const cycleNext = (values, index, predicate) => {
  const before = values.slice(0, index);
  const after = values.slice(index + 1);
  return Arr.find(after.concat(before), predicate);
};

const tryNext = (values, index, predicate) => {
  const after = values.slice(index + 1);
  return Arr.find(after, predicate);
};

export {
  cyclePrev,
  cycleNext,
  tryPrev,
  tryNext
};