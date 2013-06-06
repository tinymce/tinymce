define(
  'ephox.phoenix.group.Group',

  [
    'ephox.compass.Arr',
    'ephox.phoenix.api.DomExtract',
    'ephox.phoenix.util.arr.Split'
  ],

  function (Arr, DomExtract, Split) {

    var group = function (elements) {
      // return [];
      var extractions = Arr.bind(elements, DomExtract.from);
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
