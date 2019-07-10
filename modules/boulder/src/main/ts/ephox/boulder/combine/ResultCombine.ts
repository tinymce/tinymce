import { Arr, Fun, Merger } from '@ephox/katamari';
import { SimpleResult } from '../alien/SimpleResult';

const mergeValues = (values: Array<Record<string, any>>, base: Record<string, any>): SimpleResult<any, Record<string, any>> => {
  return values.length > 0 ? SimpleResult.svalue(
    Merger.deepMerge(
      base,
      Merger.merge.apply(undefined, values)
    )
  ) : SimpleResult.svalue(base);
};

const mergeErrors = function <E>(errors: E[][]): SimpleResult<E[], any> {
  return Fun.compose<any, any, any>(SimpleResult.serror, Arr.flatten)(errors);
};

const consolidateObj = <E>(objects: Array<SimpleResult<E[], any>>, base: Record<string, any>): SimpleResult<E[], any> => {
  const partition = SimpleResult.partition(objects);
  return partition.errors.length > 0 ? mergeErrors(partition.errors) : mergeValues(partition.values, base);
};

const consolidateArr = <E>(objects: Array<SimpleResult<E[], any>>): SimpleResult<E[], any> => {
  const partitions = SimpleResult.partition(objects);
  return partitions.errors.length > 0 ? mergeErrors(partitions.errors) : SimpleResult.svalue(partitions.values);
};

export const ResultCombine = {
  consolidateObj,
  consolidateArr
};
