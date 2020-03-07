import { Arr, Fun, Option } from '@ephox/katamari';
import * as PositionArray from 'ephox/polaris/api/PositionArray';

export interface PArrayTestItem {
  start: () => number;
  finish: () => number;
  item: () => string;
}

const generator = function (item: string, start: number) {
  return Option.some<PArrayTestItem>({
    start: Fun.constant(start),
    finish: Fun.constant(start + item.length),
    item: Fun.constant(item)
  });
};

const make = (values: string[]): PArrayTestItem[] =>
  PositionArray.generate(values, generator);

const dump = function (parray: PArrayTestItem[]) {
  return Arr.map(parray, function (unit) {
    return unit.start() + '->' + unit.finish() + '@ ' + unit.item();
  });
};

export {
  make,
  dump
};
