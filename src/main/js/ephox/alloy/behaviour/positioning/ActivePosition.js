define(
  'ephox.alloy.behaviour.positioning.ActivePosition',

  [
    'ephox.alloy.dom.DomModification'
  ],

  function (DomModification) {
    var exhibit = function (base, posInfo) {
      return DomModification.nu({
        classes: [ ],
        styles: posInfo.useFixed() ? { } : { position: 'relative' }
      });
    };

    return {
      exhibit: exhibit
    };
  }
);