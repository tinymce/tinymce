define(
  'ephox.repartee.view.Reposition',

  [
    'ephox.katamari.api.Struct'
  ],

  function (Struct) {
    var decision = Struct.immutableBag(['x', 'y', 'width', 'height', 'maxHeight', 'direction', 'classes', 'label', 'candidateYforTest'], []);
    var css = Struct.immutable('position', 'left', 'top', 'right', 'bottom');

    return {
      decision: decision,
      css: css
    };
  }
);