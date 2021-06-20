import { Arr, Fun, Merger } from '@ephox/katamari';

import { SimpleResult } from '../alien/SimpleResult';

const mergeValues = <E, T>(values: T[], base: Record<string, T>): SimpleResult<E[], T> => values.length > 0 ? SimpleResult.svalue(
  Merger.deepMerge(
    base,
    Merger.merge.apply(undefined, values)
  )
) : SimpleResult.svalue(base);

const mergeErrors = <E, T>(errors: E[][]): SimpleResult<E[], T> =>
  Fun.compose<any, any, any>(SimpleResult.serror, Arr.flatten)(errors);

const consolidateObj = <E, T>(objects: Array<SimpleResult<E[], T>>, base: Record<string, T>): SimpleResult<E[], T> => {
  const partition = SimpleResult.partition(objects);
  return partition.errors.length > 0 ? mergeErrors(partition.errors) : mergeValues(partition.values, base);
};

const consolidateArr = <E, T>(objects: Array<SimpleResult<E[], T>>): SimpleResult<E[], T[]> => {
  const partitions = SimpleResult.partition(objects);
  return partitions.errors.length > 0 ? mergeErrors(partitions.errors) : SimpleResult.svalue(partitions.values);
};

export const ResultCombine = {
  consolidateObj,
  consolidateArr
};
