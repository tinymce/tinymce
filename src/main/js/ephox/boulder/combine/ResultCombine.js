define(
  'ephox.boulder.combine.ResultCombine',

  [
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.perhaps.Result'
  ],

  function (Arr, Merger, Result) {
    var consolidateObj = function (objects, base) {
      return Arr.foldl(objects, function (acc, obj) {
        return acc.fold(function (accErrs) {
          return obj.fold(function (errs) {
            return Result.error(accErrs.concat(errs));
          }, function (_) {
            return Result.error(accErrs);
          }) ; 
        }, function (accRest) {
          return obj.fold(function (errs) {
            return Result.error(errs);
          }, function (v) {
            return Result.value(Merger.deepMerge(accRest, v));
          });
        });
      }, Result.value(base));
    };

    var consolidateArr = function (objects) {
      return Arr.foldl(objects, function (acc, obj) {
        return acc.fold(function (accErrs) {
          return obj.fold(function (errs) {
            return Result.error(accErrs.concat(errs));
          }, function (_) {
            return Result.error(accErrs);
          }) ; 
        }, function (accRest) {
          return obj.fold(function (errs) {
            return Result.error(errs);
          }, function (v) {
            return Result.value(accRest.concat([ v ]));
          });
        });
      }, Result.value([ ]));
    };

    return {
      consolidateObj: consolidateObj,
      consolidateArr: consolidateArr
    };
  }
);