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
    // var indexInfo = Struct.immutable('index', 'candidates');

    // Assumptions:
    //   - the focused element is in the group.
    //   - the focus options in the group are descendants which match the selectors.item() selector.
    // var ofFocus = function (container, grouper, selector) {
    //   return Focus.search(container).bind(function (focused) {
    //     // Identify the group of the focused item.
    //     return SelectorFind.closest(focused, grouper).bind(function (group) {
    //       var anyItems = SelectorFilter.descendants(group, selector);
    //       var items = Arr.filter(anyItems, Visibility.isVisible);
    //       var index = Arr.findIndex(items, Fun.curry(Compare.eq, focused));
    //       return index > -1 ? Option.some(itemInfo({ index: index, focused: focused, group: group, items: items })) : Option.none();
    //     });
    //   });
    // };

    // var ofSector = function (root, sectorer, group) {
    //   var sectors = SelectorFilter.descendants(root, sectorer);
    //   return SelectorFind.closest(group, sectorer).bind(function (sector) {
    //     var index = Arr.findIndex(sectors, Fun.curry(Compare.eq, sector));
    //     return index > -1 ? Option.some(sectorInfo({
    //       index:  index,
    //       sectors: sectors,
    //       sector: sector
    //     })): Option.none();
    //   });
    // };

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