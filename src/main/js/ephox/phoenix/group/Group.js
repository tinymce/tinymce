define(
  'ephox.phoenix.group.Group',

  [
    'ephox.compass.Arr',
    'ephox.phoenix.extract.Extract',
    'ephox.phoenix.util.arr.Split'
  ],

  function (Arr, Extract, Split) {

    var group = function (elements) {
      var extractions = Arr.bind(elements, Extract.from);
      var segments = Split.split(extractions, function (x) {
        return x.isBoundary();
      });

      return Arr.filter(segments, function (x) { return x.length > 0; });
    };

    return {
      group: group
    };

  }
);
