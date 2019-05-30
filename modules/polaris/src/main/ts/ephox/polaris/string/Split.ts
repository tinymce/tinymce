import { Arr } from '@ephox/katamari';

/**
 * Splits a string into multiple chunks
 */
const splits = function (value: string, indices: number[]): string[] {
  if (indices.length === 0) { return [value]; }

  const divisions = Arr.foldl(indices, function (acc, x) {
    if (x === 0) { return acc; }

    const part = value.substring(acc.prev, x);
    return {
      prev: x,
      values: acc.values.concat([part])
    };
  }, { prev: 0, values: [] as string[] });

  const lastPoint = indices[indices.length - 1];
  return lastPoint < value.length ? divisions.values.concat(value.substring(lastPoint)) : divisions.values;
};

export {
  splits
};