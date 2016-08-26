define(
  'ephox.alloy.navigation.DomPinpoint',

  [
    'ephox.alloy.navigation.ArrPinpoint',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.SelectorFilter'
  ],

  function (ArrPinpoint, Fun, Compare, SelectorFilter) {
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


    var locate = function (container, current, selector) {
      var candidates = SelectorFilter.descendants(container, selector);
      var predicate = Fun.curry(Compare.eq, current);
      return ArrPinpoint.locate(candidates, predicate);
    };

    return {
      locate: locate
    };
  }
);