  define(
  'ephox.robin.clumps.Fractures',

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
      console.log('indices: ', firstIndex, lastIndex + 1);

      console.log('first: ', first.map(function (f) { return f.dom(); }).getOr('none'));
      console.log('last: ', last.map(function (l) { return l.dom(); }).getOr('none'));

      return firstIndex > -1 && lastIndex > -1 ? Option.some(children.slice(firstIndex, lastIndex + 1)) : Option.none();
    };

    var breakPath = function (universe, element, common, breaker) {
      var isTop = function (elem) {
        return universe.property().parent(elem).fold(
          Fun.constant(true),
          Fun.curry(universe.eq, common)
        );
      };

      // IGNORING breaker for the time being ... because it is breaking everything else.
      return Parent.breakPath(universe, element, isTop, Parent.breakAt);
    };

    
    var breakLeft = function (universe, element, common) {
      console.log('BREAKING LEFT');
      // If we are the top and we are the left, use default value
      if (universe.eq(common, element)) return Option.none();
      else {
        var breakage = breakPath(universe, element, common, function (universe, parent, child) {
          var bisect = function (universe, parent, child) {
            var children = universe.property().children(parent);
            var index = Arr.findIndex(children, Fun.curry(universe.eq, child));
            return index > -1 ? Option.some({
              before: Fun.constant(children.slice(0, index)),
              after: Fun.constant(children.slice(index + 1))
            }) : Option.none();
          };

          var unsafeBreakAt = function (universe, parent, parts) {
            var prior = universe.create().clone(parent);
            universe.insert().appendAll(prior, parts.before().concat([ child ]));
            // universe.insert().appendAll(parent, parts.after());
            universe.insert().before(parent, prior);
            return parent;
          };

          var parts = bisect(universe, parent, child);
          return parts.map(function (ps) {
            return unsafeBreakAt(universe, parent, ps);
          });
        });

        // console.log('post.split: ', universe.shortlog(function (item) {
        //   return universe.property().isText(item) ? '"' + item.text + '"' : item.name;
        // }));
        // Move the first element into the second section of the split because we want to include element in the section.        
        if (breakage.splits().length > 0) universe.insert().prepend(breakage.splits()[0].second(), element);
        // console.log('post.fix: ', universe.shortlog(function (item) {
        //   return universe.property().isText(item) ? '"' + item.text + '"' : item.name;
        // }));
        return Option.some(breakage.second().getOr(element));
      }
    };

    var breakRight = function (universe, element, common) {
      console.log('BREAKING RIGHT');
      // If we are the top and we are the right, use default value
      if (universe.eq(common, element)) return Option.none();
      else {
        var breakage = breakPath(universe, element, common);
        return Option.some(breakage.first());
      }
    };

    var same = function (universe, isRoot, element) {
      var children = universe.property().parent(element).fold(Fun.constant([]), function (parent) {
        return universe.property().children(parent);
      });

      var index = Arr.findIndex(children, Fun.curry(universe.eq, element));
      if (index > -1) return Option.some(children.slice(index, index + 1));
      else return Option.none();
    };

    var up = function (universe, element) {
      if (universe.property().isBoundary(element)) return Option.some(element);
      else return universe.property().parent(element).bind(function (parent) {
        return universe.property().isBoundary(parent) ? Option.some(element) : universe.up().predicate(parent, function (sh) {
          return universe.property().parent(sh).fold(Fun.constant(true), function (p) {
            return universe.property().isBoundary(p);
          });
        });
      });
    };

    var diff = function (universe, isRoot, start, finish) {
      var subset = Subset.ancestors(universe, start, finish, isRoot);
      var shared = subset.shared().fold(function () {
        return Parent.sharedOne(universe, function (_, elem) {
          return isRoot(elem) ? Option.some(elem) : universe.up().predicate(elem, isRoot);
        }, [ start, finish ]);
      }, function (sh) {
        return Option.some(sh);
      });


      return shared.map(function (sh) {
        console.log('sh: ', sh.dom(), start.dom(), finish.dom());
        return up(universe, sh).getOr(sh);
      }).bind(function (common) {
        console.log('common: ', common.dom(), common.dom().cloneNode(true), common.dom().parentNode.parentNode.innerHTML);
        // We have the shared parent, we now have to split from the start and finish up
        // to the shared parent.

        // Break from the first node to the common parent AFTER the second break as the first
        // will impact the second (assuming LEFT to RIGHT) and not vice versa.
        var secondBreak = breakRight(universe, finish, common);
        var firstBreak = breakLeft(universe, start, common);
        console.log('post-break:', common.dom().parentNode.parentNode.innerHTML);
        return slice(universe, common, firstBreak, secondBreak);
      });
    };

    var fracture = function (universe, isRoot, start, finish) {
      return universe.eq(start, finish) ? same(universe, isRoot, start) : diff(universe, isRoot, start, finish);     
    };

    return {
      fracture: fracture
    };
  }
);