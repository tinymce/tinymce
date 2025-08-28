import { Arr, Optional } from '@ephox/katamari';

import * as PositionArray from 'ephox/polaris/api/PositionArray';

export interface PArrayTestItem {
  start: number;
  finish: number;
  item: string;
}

const generator = (item: string, start: number): Optional<PArrayTestItem> => {
  return Optional.some({
    start,
    finish: start + item.length,
    item
  });
};

const make = (values: string[]): PArrayTestItem[] =>
  PositionArray.generate(values, generator);

const dump = (parray: PArrayTestItem[]): string[] => {
  return Arr.map(parray, (unit) => {
    return unit.start + '->' + unit.finish + '@ ' + unit.item;
  });
};

export {
  make,
  dump
};
