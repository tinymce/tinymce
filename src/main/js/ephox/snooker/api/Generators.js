define(
  'ephox.snooker.api.Generators',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Attr'
  ],

  function (Fun, Option, Attr) {
    var toData = function (element) {
      var colspan = Attr.has(element, 'colspan') ? parseInt(Attr.get(element, 'colspan')) : 1;
      var rowspan = Attr.has(element, 'rowspan') ? parseInt(Attr.get(element, 'rowspan')) : 1;
      return {
        element: Fun.constant(element),
        colspan: Fun.constant(colspan),
        rowspan: Fun.constant(rowspan)
      };
    };

    var cached = function (generators) {
      var nu = function (data) {
        return generators.cell(data);
      };

      var nuFrom = function (element) {
        var data = toData(element);
        return nu(data);
      };

      var add = function (element) {
        var replacement = nuFrom(element);
        recent = Option.some({ item: element, replacement: replacement });
        return replacement;
      };

      var recent = Option.none();
      var getOrInit = function (element, comparator) {
        return recent.fold(function () {
          return add(element);
        }, function (p) {
          return comparator(element, p.item) ? p.replacement : add(element);
        });
      };

      return {
        getOrInit: getOrInit,
        nu: nu
      };
    };

    var memoized = function (generators) {

    };

    return {
      cached: cached,
      memoized: memoized
    };
  }
);