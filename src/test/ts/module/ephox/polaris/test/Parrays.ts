import { Arr, Fun, Option } from '@ephox/katamari';
import PositionArray from 'ephox/polaris/api/PositionArray';

export interface PArrayTestItem {
  start: () => number;
  finish: () => number;
  item: () => string;
}

const generator = function (item: string, start: number) {
  return Option.some<PArrayTestItem>({
    start: () => start,
    finish: () => start + item.length,
    item: () => item
  });
};

const make = function (values: string[]) {
  return PositionArray.generate(values, generator);
};

const dump = function (parray: PArrayTestItem[]) {
  return Arr.map(parray, function (unit) {
    return unit.start() + '->' + unit.finish() + '@ ' + unit.item();
  });
};

export default {
  make,
  dump
};