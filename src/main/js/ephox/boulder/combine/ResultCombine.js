define(
  'ephox.boulder.combine.ResultCombine',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Result'
  ],

  function (Arr, Merger, Result) {
    var consolidateObj = function (objects, base) {
      // This used to be done in a functional way with folding, but
      // I was worried about its performance (because this is called a lot)

      // Note, we should use katamari's Results.partition (or other) when this is
      // migrated.
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

      // This used to (also) be done in a functional way with folding, but
      // I was worried about its performance (because this is called a lot)
      if (unsuccessful) return Result.error(failed);
      else return Result.value(passed);
    };

    return {
      consolidateObj: consolidateObj,
      consolidateArr: consolidateArr
    };
  }
);