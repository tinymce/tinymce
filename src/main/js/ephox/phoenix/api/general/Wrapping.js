define(
  'ephox.phoenix.api.general.Wrapping',

  [
    'ephox.phoenix.wrap.Wrapper',
    'ephox.phoenix.wrap.Wraps'
  ],

  function (Wrapper, Wraps) {
    var nu = function (universe, element) {
      return Wraps(universe, element);
    };

    var wrapWith = function (universe, base, baseOffset, end, endOffset, c) {
      return Wrapper.wrapWith(universe, base, baseOffset, end, endOffset, c);
    };

    var wrapper = function (universe, wrapped, c) {
      return Wrapper.wrapper(universe, wrapped, c);
    };

    return {
      nu: nu,
      wrapWith: wrapWith,
      wrapper: wrapper
    };
  }
);
