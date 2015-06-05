define(
  'ephox.snooker.api.Generators',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.scullion.FunctionBag',
    'ephox.sugar.api.Attr'
  ],

  function (Arr, Fun, Option, FunctionBag, Attr) {
    var elementToData = function (element) {
      var colspan = Attr.has(element, 'colspan') ? parseInt(Attr.get(element, 'colspan')) : 1;
      var rowspan = Attr.has(element, 'rowspan') ? parseInt(Attr.get(element, 'rowspan')) : 1;
      return {
        element: Fun.constant(element),
        colspan: Fun.constant(colspan),
        rowspan: Fun.constant(rowspan)
      };
    };

    var modification = function (generators, _toData) {
      contract(generators);
      console.log('generators in modification', generators);
      var toData = _toData !== undefined ? _toData : elementToData;

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

      return getOrInit;
    };

    var transform = function (scope, tag) {
      return function (generators) {
        contract(generators);
        var list = [];

        var find = function (element, comparator) {
          var raw = Arr.find(list, function (x) { return comparator(x.item, element); });
          return Option.from(raw);
        };

        var makeNew = function (element) {
          console.log('generators in transform', generators);
          var cell = generators.replace(element, tag, {
            scope: scope
          });
          console.log('done');
          list.push({ item: element, sub: cell });
          return cell;
        };
      
        var replaceOrInit = function (element, comparator) {
          console.log('here', replaceOrInit);
          return find(element, comparator).fold(function () {
            return makeNew(element);
          }, function (p) {
            return comparator(element, p.item) ? p.sub : makeNew(element);
          });
        };

        return replaceOrInit;
      };
    };

    var merging = function (generators) {
      contract(generators);
      return function (cell) {
        return function () {
          return generators.cell({
            element: Fun.constant(cell),
            colspan: Fun.constant(1),
            rowspan: Fun.constant(1)
          });
        };
      };
    };

    var contract = FunctionBag([ 'cell', 'row', 'replace', 'gap' ]);

    return {
      modification: modification,
      transform: transform,
      merging: merging
    };
  }
);