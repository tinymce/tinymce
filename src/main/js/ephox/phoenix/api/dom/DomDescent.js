define(
  'ephox.phoenix.api.dom.DomDescent',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.api.general.Descent'
  ],

  function (DomUniverse, Descent) {
    var universe = DomUniverse();
    var toLeaf = function (element, offset) {
      return Descent.toLeaf(universe, element, offset);
    };

    /* The purpose of freefall is that they will land on an element that is not whitespace text. This
     * can be very useful inside beautified content
     */
    var freefallLtr = function (element) {
      return Descent.freefallLtr(universe, element);
    };

    var freefallRtl = function (element) {
      return Descent.freefallRtl(universe, element);
    };

    return {
      toLeaf: toLeaf,
      freefallLtr: freefallLtr,
      freefallRtl: freefallRtl
    };
  }
);