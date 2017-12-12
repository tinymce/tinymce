import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Result } from '@ephox/katamari';
import { Results } from '@ephox/katamari';

var mergeValues = function (values, base) {
  return Result.value(
    Merger.deepMerge.apply(undefined, [ base ].concat(values))
  );
};

var mergeErrors = function (errors) {
  return Fun.compose(Result.error, Arr.flatten)(errors);
};

var consolidateObj = function (objects, base) {
  var partitions = Results.partition(objects);
  return partitions.errors.length > 0 ? mergeErrors(partitions.errors) : mergeValues(partitions.values, base);
};

var consolidateArr = function (objects) {
  var partitions = Results.partition(objects);
  return partitions.errors.length > 0 ? mergeErrors(partitions.errors) : Result.value(partitions.values);
};

export default <any> {
  consolidateObj: consolidateObj,
  consolidateArr: consolidateArr
};