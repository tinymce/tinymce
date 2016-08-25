define(
  'ephox.alloy.ephemera.AlloyTags',

  [
    'ephox.peanut.Fun'
  ],

  function (Fun) {
    var prefix = 'alloy-id-';
    var idAttr = 'data-alloy-id';

    return {
      prefix: Fun.constant(prefix),
      idAttr: Fun.constant(idAttr)
    };
  }
);