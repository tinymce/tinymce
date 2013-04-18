define(
  'ephox.robin.api.Zone',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.phoenix.group.Group',
    'ephox.sugar.api.Element'
  ],

  function (Arr, Fun, Group, Element) {
    var constant = function (elements) {
      return {
        elements: Fun.constant(elements)
      };
    };

    var lazy = function (parent) {
      var elements = function () {
        var groups = Group.group([parent]);
        return Arr.bind(groups, function (x) {
          return Arr.bind(x, function (y) {
            // this can change to a fake ' ' text node, but no .. find a better way.
            return y.toText().fold(Fun.constant([]), function (v) {
              return [v];
            });
          }).concat([Element.fromText(' ')]);
        });
      };

      return {
        elements: elements
      };
    };

    var empty = function () {
      return constant([]);
    };

    return {
      constant: constant,
      lazy: lazy,
      empty: empty
    };
  }
);
