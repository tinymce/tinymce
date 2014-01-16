define(
  'ephox.phoenix.wrap.Wrapper',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.phoenix.api.general.Split',
    'ephox.phoenix.wrap.Navigation'
  ],

  function (Arr, Option, Spot, Split, Navigation) {
    /**
     * Wrap all text nodes between two DOM positions, using the nu() wrapper
     */
    var wrapWith = function (universe, base, baseOffset, end, endOffset, nu) {
      var nodes = Split.range(universe, base, baseOffset, end, endOffset);
      return wrapper(universe, nodes, nu);
    };

    /**
     * Wrap non-empty text nodes using the nu() wrapper
     */
    var wrapper = function (universe, wrapped, nu) {
      if (wrapped.length === 0) return wrapped;

      var filtered = Arr.filter(wrapped, function (x) {
        return universe.property().isText(x) && universe.property().getText(x).length > 0;
      });

      return Arr.map(filtered, function (w) {
        var container = nu();
        universe.insert().before(w, container.element());
        container.wrap(w);
        return container.element();
      });
    };

    /**
     * Return the cursor positions at the start and end of a collection of wrapper elements
     */
    var endPoints = function (universe, wrapped) {
      return Option.from(wrapped[0]).map(function (first) {
        var last = Navigation.toLast(universe, wrapped[wrapped.length - 1]);
        return Spot.points(
          Spot.point(first, 0),
    /**
     *
     */
          Spot.point(last.element(), last.offset())
        );
      });
    };

    /**
     * Calls wrapWith() on text nodes in the range, and returns the end points
     */
    var leaves = function (universe, base, baseOffset, end, endOffset, nu) {
      var start = Navigation.toLeaf(universe, base, baseOffset);
      var finish = Navigation.toLeaf(universe, end, endOffset);

      var wrapped = wrapWith(universe, start.element(), start.offset(), finish.element(), finish.offset(), nu);
      return endPoints(universe, wrapped);
    };

    var viper = function (universe, subjects) {
      var init = {
        groups: [],
        current: [],
        parent: null
      };

      var result = Arr.foldl(subjects, function (rest, subject) {
        return universe.property().parent(subject).fold(function () {
          if (current.length > 0) {
            return { groups: rest.groups.concat({ parent: rest.parent, children: current }), current: [], parent: null };
          } else {
            return { groups: rest.groups, current: [], parent: null };
          }
        }, function (parent) {
          console.log("rest: ", rest);
          console.log('parent: ', parent);
          if (rest.parent === null || universe.eq(parent, rest.parent)) {
            return { groups: rest.groups, current: rest.current.concat( [subject] ), parent: parent };
          } else {
            return { groups: rest.groups.concat({ parent: rest.parent, children: rest.current }), current: [ subject ], parent: parent };
          }
        });
      }, init);

      console.log("result", result);
      var output =  result.current.length > 0 ? result.groups.concat({ parent: result.parent, children: result.current }) : result.groups;
      console.log('output: ', output);
      return output;
    };

    return {
      wrapWith: wrapWith,
      wrapper: wrapper,
      leaves: leaves,
      viper: viper
    };

  }
);
