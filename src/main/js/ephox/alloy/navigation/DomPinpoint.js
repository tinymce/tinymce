define(
  'ephox.alloy.navigation.DomPinpoint',

  [
    'ephox.alloy.navigation.ArrPinpoint',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.Visibility'
  ],

  function (ArrPinpoint, Arr, Fun, Option, Compare, SelectorFilter, Visibility) {
    var locateVisible = function (container, current, selector) {
      var filter = Visibility.isVisible;
      return locateIn(container, current, selector, filter);
    };

    var locateIn = function (container, current, selector, filter) {
      var predicate = Fun.curry(Compare.eq, current);
      var candidates = SelectorFilter.descendants(container, selector);
      var visible = Arr.filter(candidates, Visibility.isVisible);
      return ArrPinpoint.locate(visible, predicate);
    };

    var findIndex = function (elements, target) {
      var index = Arr.findIndex(elements, function (elem) {
        return Compare.eq(target, elem);
      });

      return index > -1 ? Option.some(index) : Option.none();
    };

    return {
      locateVisible: locateVisible,
      locateIn: locateIn,
      findIndex: findIndex
    };
  }
);