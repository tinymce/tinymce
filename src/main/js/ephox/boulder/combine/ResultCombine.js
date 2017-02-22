define(
  'ephox.boulder.combine.ResultCombine',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Result',
    'ephox.katamari.api.Results'
  ],

  function (Arr, Fun, Merger, Result, Results) {
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

    return {
      consolidateObj: consolidateObj,
      consolidateArr: consolidateArr
    };
  }
);