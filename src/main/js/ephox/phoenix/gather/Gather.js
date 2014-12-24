define(
  'ephox.phoenix.gather.Gather',

  [
    'ephox.peanut.Fun',
    'ephox.phoenix.api.data.Focus'
  ],

  function (Fun, Focus) {
    var curry = Fun.curry;

    var traverse = function(universe, traversal, element, prune, f) {
      var siblings = across(universe, traversal, element, prune, f);
      return chain(siblings, curry(up, universe, traversal, element, prune, f));
    };

    var gather = function (universe, element, prune, f) {
      return Focus([], element, []);
    };


    return {
      gather: gather
    };

  }
);
