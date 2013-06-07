define(
  'ephox.phoenix.wrap.DomWrapper',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.ghetto.wrap.GhettoWrapper'
  ],

  function (DomUniverse, GhettoWrapper) {
    var universe = DomUniverse();

    var wrap = function (base, baseOffset, end, endOffset) {
      return GhettoWrapper.wrap(universe, base, baseOffset, end, endOffset);
    };

    var wrapWith = function (base, baseOffset, end, endOffset, c) {
      return GhettoWrapper.wrapWith(universe, base, baseOffset, end, endOffset, c);
    };

    var wrapper = function (wrapped, c) {
      return GhettoWrapper.wrapper(universe, wrapped, c);
    };

    return {
      wrap: wrap,
      wrapWith: wrapWith,
      wrapper: wrapper
    };
  }
);
