define(
  'ephox.robin.parent.Shared',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Arr, Fun, Option) {
    var all = function (universe, look, elements, f) {
      return elements.length > 0 ? f(universe, look, elements[0], elements.slice(1)) : Option.none();
    };

    var oneAll = function (universe, look, elements) {
      return all(universe, look, elements, unsafeOne);
    };

    var unsafeOne = function (universe, look, head, tail) {
      var start = look(universe, head);
      return Arr.foldr(tail, function (b, a) {
        var current = look(universe, a);
        return commonElement(universe, b, current);
      }, start);
    };

    var commonElement = function (universe, start, end) {
      return start.bind(function (s) {
        return end.filter(Fun.curry(universe.eq, s));
      });
    };

    return {
      oneAll: oneAll
    };
  }
);
