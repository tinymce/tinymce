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

    var reuse = function (universe, base, baseOffset, end, endOffset, predicate, nu) {
      var start = Navigation.toLeaf(universe, base, baseOffset);
      var finish = Navigation.toLeaf(universe, end, endOffset);
      var nodes = Split.range(universe, base, baseOffset, end, endOffset);
      console.log('nodes: ', Arr.map(nodes, function (n) { return n.dom(); }));

      var groups = viper(universe, nodes);

      var yeti = function (group) {
        var container = nu();
        universe.insert().before(group.children[0], container.element());
        Arr.each(group.children, container.wrap);
        return container.element();
      };

      return Arr.map(groups, function (group) {
        var children = universe.property().children(group.parent);
        if (children.length === group.children.length) {
          // return parent if it is a span, otherwise make a nu one.
          if (predicate(group.parent)) {
            return group.parent;
          } else {
            return yeti(group);
          }
        } else {
          return yeti(group);
        }
      });
    };

    var viper = function (universe, subjects) {
      var init = {
        groups: [],
        current: [],
        parent: null
      };

      var nextlist = function (rest, parent, subject) {
        return {
          groups: rest.current.length > 0 ? rest.groups.concat({ parent: rest.parent, children: rest.current }) : rest.groups,
          current: [ subject ],
          parent: parent
        };
      };

      var startlist = function (rest, parent, subject) {
        return {
          groups: rest.groups,
          current: [ subject ],
          parent: parent
        };
      };

      var accumulate = function (rest, parent, subject) {
        return {
          groups: rest.groups,
          current: rest.current.concat([ subject ]),
          parent: parent
        };
      };

      var result = Arr.foldl(subjects, function (rest, subject) {
        return universe.property().parent(subject).fold(function () {
          return rest;
        }, function (parent) {
          // Conditions: 
          // 1. There is nothing in the current list ... start a current list with subject
          // 2. The subject is the right sibling of the last thing on the current list ... accumulate into current list.
          // 3. Otherwise ... close off current, and start a new current with subject
          var modifier = rest.current.length === 0 ? startlist : universe.query().nextSibling(rest.current[rest.current.length - 1]).bind(function (next) {
            return universe.eq(next, subject) ? Option.some(accumulate) : Option.none();
          }).getOr(nextlist);

          return modifier(rest, parent, subject);
        });
      }, init);

      // console.log("result", result);
      var output =  result.current.length > 0 ? result.groups.concat({ parent: result.parent, children: result.current }) : result.groups;
      console.log('output: ', output);
      return output;
    };

    return {
      wrapWith: wrapWith,
      wrapper: wrapper,
      leaves: leaves,
      viper: viper,
      reuse: reuse
    };

  }
);
