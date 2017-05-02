define(
  'ephox.alloy.behaviour.positioning.ActivePosition',

  [
    'ephox.alloy.dom.DomModification'
  ],

  function (DomModification) {
    var exhibit = function (base, posConfig/*, posState */) {
      return DomModification.nu({
        classes: [ ],
        styles: posConfig.useFixed() ? { } : { position: 'relative' }
      });
    };

    return {
      exhibit: exhibit
    };
  }
);