define(
  'ephox.robin.api.general.ZonePosition',

  [
    'ephox.scullion.ADT'
  ],

  function (Adt) {
    var adt = Adt.generate([
      { aboveView: [ 'item' ] },
      { inView: [ 'item' ] },
      { belowView: [ 'item' ] }
    ]);

    var cata = function (subject, onAbove, onIn, onBelow) {
      return subject.fold(onAbove, onIn, onBelow);
    };

    return {
      aboveView: adt.aboveView,
      inView: adt.inView,
      belowView: adt.belowView,
      cata: cata
    };
  }
);