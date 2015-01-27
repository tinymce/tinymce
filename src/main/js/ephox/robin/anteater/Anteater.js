define(
  'ephox.robin.anteater.Anteater',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.robin.api.general.Parent',
    'ephox.robin.parent.Shared',
    'ephox.robin.parent.Subset',
    'ephox.scullion.ADT',
    'ephox.sugar.api.PredicateFind'
  ],

  function (Arr, Fun, Option, Parent, Shared, Subset, ADT, PredicateFind) {
    var adt = ADT.generate([
      { parent: [ 'element' ] },
      { descendant: [ 'element' ] }
    ]);

    var breaker = function (universe, parent, child) {
      console.log('initial break', parent.dom(), child.dom());
      var brk = Parent.breakAt(universe, parent, child);
      brk.each(function (b) {
        console.log('breaking here.', b.dom(), child.dom());
        // Move the child into the second part of the break.
        universe.insert().prepend(b, child);
      });
      return brk;
    };

    // Find the subsection of DIRECT children of parent from [first, last])
    var slice = function (universe, parent, first, last) {
      var children = universe.property().children(parent);

      var fi = first.fold(function () {
        console.log('left point is the parent');
        return 0;
      }, function (f) {
        console.log('left point is: ', f.dom());
        return Arr.findIndex(children, Fun.curry(universe.eq, f));
      });

      var li = last.fold(function () {
        console.log('right point is the parent');
        return children.length;
      }, function (l) {
        console.log('right point is: ', l.dom());
        var rawIndex = Arr.findIndex(children, Fun.curry(universe.eq, l));
        return rawIndex > -1 ? rawIndex + 1 : -1;
      });

      console.log('children: ', Arr.map(children, function (child) { return child.dom(); }));

      console.log('indices: ', fi, li);
          
      return fi > -1 && li > -1 ? Option.some(children.slice(fi, li)) : Option.none();
    };

    var isTop = function (universe, common, elem) {
      return universe.property().parent(elem).fold(
        Fun.constant(true),
        Fun.curry(universe.eq, common)
      );
    };

    var breakLeft = function (universe, element, common) {
      // If we are the top and we are the left, return index 0.
      if (universe.eq(common, element)) return adt.parent(element);
      else {
        // Break from the first node to the common parent AFTER the second break as the first
        // will impact the second (assuming LEFT to RIGHT) and not vice versa.
        var breakage = Parent.breakPath(universe, element, Fun.curry(isTop, universe, common), breaker);
        return adt.descendant(breakage.second().getOr(element));
      }
    };

    var breakRight = function (universe, element, common) {
      // If we are the top and we are the right, return child.length
      if (universe.eq(common, element)) return adt.parent(element);
      else {
        var breakage = Parent.breakPath(universe, element, Fun.curry(isTop, universe, common), Parent.breakAt);
        return adt.descendant(breakage.first());
      }
    };

    var fossil = function (universe, isRoot, start, finish) {
      var subset = Subset.ancestors(universe, start, finish, isRoot);
      var shared = subset.shared().fold(function () {
        return Parent.sharedOne(universe, function (_, elem) {
          return PredicateFind.closest(elem, isRoot);
        }, [ start, finish ]);
      }, function (sh) {
        return Option.some(sh);
      });


      return shared.bind(function (common) {
        console.log('A common parent', common.dom(), 'start: ', start.dom(), 'finish: ', finish.dom());
        // We have the shared parent, we now have to split from the start and finish up
        // to the shared parent.
        
        var secondBreak = breakRight(universe, finish, common);
        var firstBreak = breakLeft(universe, start, common);
        console.log('Slicing time');

        return slice(universe, common, firstBreak, secondBreak);
      });
    };

    return {
      fossil: fossil
    };
  }
);