define(
  'ephox.alloy.navigation.DomNavigation',

  [
    'ephox.alloy.alien.Cycles',
    'ephox.alloy.navigation.DomPinpoint',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Cycles, DomPinpoint, Fun, Option) {
    var horizontal = function (container, selector, current, delta) {
      // I wonder if this will be a problem when the focused element is invisible (shouldn't happen)
      return DomPinpoint.locateVisible(container, current, selector, Fun.constant(true)).bind(function (identified) {
        var index = identified.index();
        var candidates = identified.candidates();
        var newIndex = Cycles.cycleBy(index, delta, 0, candidates.length - 1);
        return Option.from(candidates[newIndex]);
      });
    };

    return {
      horizontal: horizontal
    };
  }
);