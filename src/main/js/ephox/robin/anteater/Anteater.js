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
    // Find the subsection of DIRECT children of parent from [first, last])
    var slice = function (universe, parent, first, last) {
      var children = universe.property().children(parent);

      var finder = function (elem) {
        var index = Arr.findIndex(children, Fun.curry(universe.eq, elem));
        return index > -1 ? Option.some(index) : Option.none();
      };

      // Default to the start of the common parent.
      var firstIndex = first.bind(finder).getOr(0);
      // Default to the end of the common parent.
      var lastIndex = last.bind(finder).getOr(children.length - 1);
      return firstIndex > -1 && lastIndex > -1 ? Option.some(children.slice(firstIndex, lastIndex + 1)) : Option.none();
    };

    var breakPath = function (universe, element, common) {
      var isTop = function (elem) {
        return universe.property().parent(elem).fold(
          Fun.constant(true),
          Fun.curry(universe.eq, common)
        );
      };

      return Parent.breakPath(universe, element, isTop, Parent.breakAt);
    };

    // Break from the first node to the common parent AFTER the second break as the first
    // will impact the second (assuming LEFT to RIGHT) and not vice versa.
    var breakLeft = function (universe, element, common) {
      // If we are the top and we are the left, use default value
      if (universe.eq(common, element)) return Option.none();
      else {
        var breakage = breakPath(universe, element, common);
        // Move the first element into the second section of the split because we want to include element in the formatting.        
        if (breakage.splits().length > 0) universe.insert().prepend(breakage.splits()[0].second(), element);
        return Option.some(breakage.second().getOr(element));
      }
    };

    var breakRight = function (universe, element, common) {
      // If we are the top and we are the right, use default value
      if (universe.eq(common, element)) return Option.none();
      else {
        var breakage = breakPath(universe, element, common);
        return Option.some(breakage.first());
      }
    };

    var fossil = function (universe, isRoot, start, finish) {
      if (universe.eq(start, finish)) {
        var children = universe.property().parent(start).fold(Fun.constant([]), function (parent) {
          return universe.property().children(parent);
        });

        var index = Arr.findIndex(children, Fun.curry(universe.eq, start));
        console.log('index: ', children.slice(index, index + 1));
        if (index > -1) return Option.some(children.slice(index, index + 1));
        else return Option.none();
      }


      var subset = Subset.ancestors(universe, start, finish, isRoot);
      var shared = subset.shared().fold(function () {
        return Parent.sharedOne(universe, function (_, elem) {
          return isRoot(elem) ? Option.some(elem) : universe.up().predicate(elem, isRoot);
        }, [ start, finish ]);
      }, function (sh) {
        return Option.some(sh);
      });


      return shared.bind(function (common) {
        // We have the shared parent, we now have to split from the start and finish up
        // to the shared parent.

        
        var secondBreak = breakRight(universe, finish, common);
        var firstBreak = breakLeft(universe, start, common);
        return slice(universe, common, firstBreak, secondBreak);
      });
    };

    return {
      fossil: fossil
    };
  }
);