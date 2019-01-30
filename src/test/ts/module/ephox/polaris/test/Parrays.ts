import { Arr, Fun, Option } from '@ephox/katamari';
import PositionArray from 'ephox/polaris/api/PositionArray';

const generator = function (item, start) {
  return Option.some({
    start: Fun.constant(start),
    finish: Fun.constant(start + item.length),
    item: Fun.constant(item)
  });
};

const make = function (values) {
  return PositionArray.generate(values, generator);
};

const dump = function (parray) {
  return Arr.map(parray, function (unit) {
    return unit.start() + '->' + unit.finish() + '@ ' + unit.item();
  });
};

export default <any> {
  make,
  dump
};