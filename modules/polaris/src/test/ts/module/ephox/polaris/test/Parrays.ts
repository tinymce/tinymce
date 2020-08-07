import { Arr, Optional } from '@ephox/katamari';
import * as PositionArray from 'ephox/polaris/api/PositionArray';

export interface PArrayTestItem {
  start: number;
  finish: number;
  item: string;
}

const generator = function (item: string, start: number) {
  return Optional.some<PArrayTestItem>({
    start,
    finish: start + item.length,
    item
  });
};

const make = (values: string[]): PArrayTestItem[] =>
  PositionArray.generate(values, generator);

const dump = function (parray: PArrayTestItem[]) {
  return Arr.map(parray, function (unit) {
    return unit.start + '->' + unit.finish + '@ ' + unit.item;
  });
};

export {
  make,
  dump
};
