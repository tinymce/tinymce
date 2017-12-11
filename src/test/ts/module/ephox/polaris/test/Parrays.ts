import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import PositionArray from 'ephox/polaris/api/PositionArray';

var generator = function (item, start) {
  return Option.some({
    start: Fun.constant(start),
    finish: Fun.constant(start + item.length),
    item: Fun.constant(item)
  });
};

var make = function (values) {
  return PositionArray.generate(values, generator);
};

var dump = function (parray) {
  return Arr.map(parray, function (unit) {
    return unit.start() + '->' + unit.finish() + '@ ' + unit.item();
  });
};

export default <any> {
  make: make,
  dump: dump
};