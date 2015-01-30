define(
  'ephox.robin.parent.Breaker',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.scullion.Struct'
  ],

  function (Arr, Fun, Option, Struct) {
    var bisect = function (universe, parent, child) {
      var children = universe.property().children(parent);
      var index = Arr.findIndex(children, Fun.curry(universe.eq, child));
      return index > -1 ? Option.some({
        before: Fun.constant(children.slice(0, index)),
        after: Fun.constant(children.slice(index + 1))
      }) : Option.none();
    };

    var unsafeBreakAt = function (universe, parent, parts) {
      var second = universe.create().clone(parent);
      universe.insert().appendAll(second, parts.after());
      universe.insert().after(parent, second);
      return second;
    };

    /**
     * Move everything after child in the parent element into a clone of the parent (placed after parent).
     */
    var breakAt = function (universe, parent, child) {
      var parts = bisect(universe, parent, child);
      return parts.map(function (ps) {
        return unsafeBreakAt(universe, parent, ps);
      });
    };

    var breakAtLeft = function (universe, parent, child) {
      console.log('breaking at left [special]');
      return bisect(universe, parent, child).map(function (parts) {
        // console.log('html before', container.dom().innerHTML);
        var prior = universe.create().clone(parent);
        
        universe.insert().appendAll(prior, parts.before().concat([ child ]));
        universe.insert().appendAll(parent, parts.after());
        universe.insert().before(parent, prior);
        // console.log('html after: ', container.dom().innerHTML);
        return parent;
      });
    };

    /*
     * Using the breaker, break from the child up to the top element defined by the predicate.
     * It returns three values:
     *   first: the top level element that completed the break
     *   second: the optional element representing second part of the top-level split if the breaking completed successfully to the top
     *   splits: a list of (Element, Element) pairs that represent the splits that have occurred on the way to the top.
     */
    var breakPath = function (universe, item, isTop, breaker) {
      var result = Struct.immutable('first', 'second', 'splits');

      var next = function (child, group, splits) {
        // console.log('log: ' + universe.shortlog(function (item) {
        //   return universe.property().isText(item) ? '"' + item.text + '"' : item.name;
        // }));

        var fallback = result(child, Option.none(), splits);
        // Found the top
        if (isTop(child)) return result(child, group, splits);
        else {
          return universe.property().parent(child).fold(function () {
            return fallback;
          }, function (parent) {
            var second = breaker(universe, parent, child);
            // Store the splits up the path break.
            var extra = second.fold(Fun.constant([]), function (sec) {
              return [{ first: Fun.constant(parent), second: Fun.constant(sec) }];
            });

            // THIS NEEDS TO BE INVESTIGATED ... second.getOr(parent) works for one of the tests, but will break others.
            // Changed this from just parent.
            var nextChild = isTop(parent) ? parent : second.bind(universe.query().prevSibling).getOr(parent);
            return next(nextChild, second, splits.concat(extra));
          });
        }
      };

      return next(item, Option.none(), []);
    };

    return {
      breakAt: breakAt,
      breakAtLeft: breakAtLeft,
      breakPath: breakPath
    };
  }
);
