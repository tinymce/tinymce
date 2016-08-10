define(
  'ephox.alloy.util.PrioritySort',

  [
    'ephox.perhaps.Result',
    'global!Error'
  ],

  function (Result, Error) {
    var sortKeys = function (label, keyName, array, order) {
      var sliced = array.slice(0);
      try {
        var sorted = sliced.sort(function (a, b) {
          var aKey = a[keyName]();
          var bKey = b[keyName]();
          var aIndex = order.indexOf(aKey);
          var bIndex = order.indexOf(bKey);
          if (aIndex === -1) throw new Error('The ordering for ' + label + ' does not have an entry for ' + aKey);
          if (bIndex === -1) throw new Error('The ordering for ' + label + ' does not have an entry for ' + bKey);
          if (aIndex < bIndex) return -1;
          else if (bIndex < aIndex) return 1;
          else return 0;
        });
        return Result.value(sorted);
      } catch (err) {
        return Result.error(err);
      }
    };

    return {
      sortKeys: sortKeys
    };
  }
);