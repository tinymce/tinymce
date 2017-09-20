define(
  'ephox.sugar.api.search.SelectorFind',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option'
  ],

  function (Fun, Option) {
    var ancestor = Fun.constant(Option.none());

    return {
      ancestor: ancestor
    };
  }
);
