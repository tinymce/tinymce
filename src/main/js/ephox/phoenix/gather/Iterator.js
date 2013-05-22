define(
  'ephox.phoenix.gather.Iterator',

  [
    'ephox.phoenix.gather.GatherResult'
  ],

  function (GatherResult) {
    
    var process = function (info, iter, f, x, prune) {
      return info.fold(function () {
        var fx = f(iter, x, prune);
        return {
          r: fx.result(),
          pruned: fx.pruned()
        };
      }, function (v) {
        return {
          r: v,
          pruned: true
        };
      });
    };

    var rtl = function (xs, f, prune) {
      var r = [];
      for (var i = xs.length - 1; i >= 0; i--) {
        var x = xs[i];
        var info = prune.left(x);

        var result = process(info, rtl, f, x, prune);
        r = r.concat(result.r);
        if (result.pruned) return GatherResult(r, true);
      }
      
      return GatherResult(r, false);
    };

    var ltr = function (xs, f, prune) {
      var r = [];
      for (var i = 0; i < xs.length; i++) {
        var x = xs[i];
        var info = prune.right(x);

        var result = process(info, ltr, f, x, prune);
        r = r.concat(result.r);
        if (result.pruned) return GatherResult(r, true);
      }
      return GatherResult(r, false);
    };

    return {
      ltr: ltr,
      rtl: rtl
    };

  }
);
