define(
  'ephox.robin.parent.Shared',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Compare'
  ],

  function (Arr, Fun, Option, Compare) {
    var all = function (look, elements, f) {
      return elements.length > 0 ? f(look, elements[0], elements.slice(1)) : Option.none();
    };

    var oneAll = function (look, elements) {
      return all(look, elements, unsafeOne);
    };

    var unsafeOne = function (look, head, tail) {
      var start = look(head);
      return Arr.foldr(tail, function (b, a) {
        var current = look(a);
        return commonElement(b, current);
      }, start);
    };

    var commonElement = function (start, end) {
      return start.bind(function (s) {
        return end.filter(Fun.curry(Compare.eq, s));
      });
    };

    return {
      oneAll: oneAll
    };
  }
);
