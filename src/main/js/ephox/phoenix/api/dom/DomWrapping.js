define(
  'ephox.phoenix.api.dom.DomWrapping',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.api.general.Wrapping'
  ],

  function (DomUniverse, Wrapping) {
    var universe = DomUniverse();

    var nu = function (element) {
      return Wrapping.nu(universe, element);
    };

    var wrapWith = function (base, baseOffset, end, endOffset, c) {
      return Wrapping.wrapWith(universe, base, baseOffset, end, endOffset, c);
    };

    var wrapper = function (wrapped, c) {
      return Wrapping.wrapper(universe, wrapped, c);
    };

    return {
      nu: nu,
      wrapWith: wrapWith,
      wrapper: wrapper
    };
  }
);
