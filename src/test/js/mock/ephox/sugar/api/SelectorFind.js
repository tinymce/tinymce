define(
  'ephox.sugar.api.SelectorFind',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Fun, Option) {
    var ancestor = Fun.constant(Option.none());

    return {
      ancestor: ancestor
    };
  }
);
