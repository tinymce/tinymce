define(
  'ephox.robin.test.Arbitraries',

  [
    'ephox.compass.Arr',
    'ephox.wrap.Jsc'
  ],

  function (Arr, Jsc) {
    var getIds = function (item, predicate) {
      var rest = Arr.bind(item.children || [ ], function (id) { return getIds(id, predicate); });
      var self = predicate(item) ? [ item.id ] : [ ];
      return self.concat(rest);
    };

    var textIds = function (universe) {
      return getIds(universe.get(), universe.property().isText);
    };

    var arbTextIds = function (universe) {
      var ids = textIds(universe);
      return Jsc.elements(textIds(universe)).smap(function (id) {
        return {
          startId: id,
          textIds: ids
        };
      }, function (obj) {
        return obj.startId;
      });
    };

    return {
      arbTextIds: arbTextIds
    };
  }
);