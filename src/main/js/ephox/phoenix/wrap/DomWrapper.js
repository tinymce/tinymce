define(
  'ephox.phoenix.wrap.DomWrapper',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.ghetto.wrap.GhettoWrapper'
  ],

  function (DomUniverse, GhettoWrapper) {
    var universe = DomUniverse();

    var wrapWith = function (base, baseOffset, end, endOffset, c) {
      return GhettoWrapper.wrapWith(universe, base, baseOffset, end, endOffset, c);
    };

    var wrapper = function (wrapped, c) {
      return GhettoWrapper.wrapper(universe, wrapped, c);
    };

    return {
      wrapWith: wrapWith,
      wrapper: wrapper
    };
  }
);
