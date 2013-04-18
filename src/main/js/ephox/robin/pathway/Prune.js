define(
  'ephox.robin.pathway.Prune',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Compare'
  ],

  function (Fun, Option, Compare) {
    var range = function (start, finish) {
      var abort = Fun.constant(Option.some([]));
      var scour = function (element) {
        return Compare.eq(element, end) ? Option.some([element]) : Option.none();
      };

      var direction = start.dom().compareDocumentPosition(end.dom());
      return {
        left: direction & 2 ? scour : abort,
        right: direction & 4 ? scour : abort,
        stop: Fun.constant(false)
      };
    };

    return {
      range: range
    };
  }
);
