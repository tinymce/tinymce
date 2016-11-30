define(
  'ephox.boulder.combine.ResultCombine',

  [
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.perhaps.Result'
  ],

  function (Arr, Merger, Result) {
    var consolidateObj = function (objects, base) {
      var passed = [ base ];
      var failed = [ ];
      var unsuccessful = false;
      Arr.each(objects, function (obj) {
        obj.fold(function (errs) {
          // errs can be empty ,but this should still fail
          unsuccessful = true;
          failed = failed.concat(errs);
        }, function (obj) {
          passed.push(obj);
        });
      });

      if (unsuccessful) return Result.error(failed);
      else if (passed.length === 0) return Result.value({ });
      else return Result.value(
        Merger.deepMerge.apply(undefined, passed)
      );

      // return Arr.foldl(objects, function (acc, obj) {
      //   return acc.fold(function (accErrs) {
      //     return obj.fold(function (errs) {
      //       return Result.error(accErrs.concat(errs));
      //     }, function (_) {
      //       return Result.error(accErrs);
      //     }) ; 
      //   }, function (accRest) {
      //     return obj.fold(function (errs) {
      //       return Result.error(errs);
      //     }, function (v) {
      //       return Result.value(Merger.deepMerge(accRest, v));
      //     });
      //   });
      // }, Result.value(base));
    };

    var consolidateArr = function (objects) {
      var passed = [ ];
      var failed = [ ];
      var unsuccessful = false;
      Arr.each(objects, function (obj) {
        obj.fold(function (errs) {
          // errs can be empty ,but this should still fail
          unsuccessful = true;
          failed = failed.concat(errs);
        }, function (arr) {
          passed.push(arr);
        });
      });

      if (unsuccessful) return Result.error(failed);
      else return Result.value(passed);
      // return Arr.foldl(objects, function (acc, obj) {
      //   return acc.fold(function (accErrs) {
      //     return obj.fold(function (errs) {
      //       return Result.error(accErrs.concat(errs));
      //     }, function (_) {
      //       return Result.error(accErrs);
      //     }) ; 
      //   }, function (accRest) {
      //     return obj.fold(function (errs) {
      //       return Result.error(errs);
      //     }, function (v) {
      //       return Result.value(accRest.concat([ v ]));
      //     });
      //   });
      // }, Result.value([ ]));
    };

    return {
      consolidateObj: consolidateObj,
      consolidateArr: consolidateArr
    };
  }
);