define(
  'ephox.phoenix.api.dom.DomWrapping',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.api.general.Wrapping'
  ],

  /**
   * Documentation is in the actual implementations.
   */
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

    var leaves = function (base, baseOffset, end, endOffset, c) {
      return Wrapping.leaves(universe, base, baseOffset, end, endOffset, c);
    };

    var reuse = function (base, baseOffset, end, endOffset, predicate, nu) {
      return Wrapping.reuse(universe, base, baseOffset, end, endOffset, predicate, nu);
    };

    var spans = function (base, baseOffset, end, endOffset, exclusions) {
      return Wrapping.spans(universe, base, baseOffset, end, endOffset, exclusions);
    };

    return {
      nu: nu,
      wrapWith: wrapWith,
      wrapper: wrapper,
      leaves: leaves,
      reuse: reuse,
      spans: spans
    };
  }
);
