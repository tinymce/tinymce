define(
  'ephox.robin.anteater.Anteater',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.robin.api.general.Parent',
    'ephox.robin.parent.Subset'
  ],

  function (Arr, Fun, Option, Parent, Subset) {
    var breaker = function (universe, parent, child) {
      var brk = Parent.breakAt(universe, parent, child);
      brk.each(function (b) {
        // Move the child into the second part of the break.
        universe.insert().prepend(b, child);
      });
      return brk;
    };
    var fossil = function (universe, isRoot, start, finish) {
      var subset = Subset.ancestors(universe, start, finish, isRoot);
      return subset.shared().bind(function (common) {
        // We have the shared parent, we now have to split from the start and finish up
        // to the shared parent.
        var isTop = function (elem) {
          return universe.property().parent(elem).fold(
            Fun.constant(true),
            Fun.curry(universe.eq, common)
          );
        };

        // Break from the first node to the common parent AFTER the second break as the first
        // will impact the second (assuming LEFT to RIGHT) and not vice versa.
        var secondBreak = Parent.breakPath(universe, finish, isTop, Parent.breakAt);
        var firstBreak = Parent.breakPath(universe, start, isTop, breaker);

        // console.log('universe after break: ', )

        var fb = firstBreak.second().getOr(start);
        var sb = secondBreak.first();
        
        var children = universe.property().children(common);
            
        var firstIndex = Arr.findIndex(children, Fun.curry(universe.eq, fb));
        var secondIndex = Arr.findIndex(children, Fun.curry(universe.eq, sb));

        var chillin = children.slice(firstIndex, secondIndex + 1);
        return firstIndex > -1 && secondIndex > -1 ? Option.some(children.slice(firstIndex, secondIndex + 1)) : Option.none();
      });
    };

    return {
      fossil: fossil
    };
  }
);