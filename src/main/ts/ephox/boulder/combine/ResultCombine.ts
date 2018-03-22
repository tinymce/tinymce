import { Arr, Fun, Merger, Result, Results } from '@ephox/katamari';

const mergeValues = function (values, base) {
  return Result.value(
    Merger.deepMerge.apply(undefined, [ base ].concat(values))
  );
};

const mergeErrors = function (errors) {
  return Fun.compose(Result.error, Arr.flatten)(errors);
};

const consolidateObj = function (objects, base) {
  const partitions = Results.partition(objects);
  return partitions.errors.length > 0 ? mergeErrors(partitions.errors) : mergeValues(partitions.values, base);
};

const consolidateArr = function (objects) {
  const partitions = Results.partition(objects);
  return partitions.errors.length > 0 ? mergeErrors(partitions.errors) : Result.value(partitions.values);
};

export const ResultCombine = {
  consolidateObj,
  consolidateArr
};