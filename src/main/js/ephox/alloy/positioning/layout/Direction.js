define(
  'ephox.alloy.positioning.layout.Direction',

  [
    'ephox.katamari.api.Adt'
  ],

  function (Adt) {
    var adt = Adt.generate([
      { 'southeast': [ ] },
      { 'southwest': [ ] },
      { 'northeast': [ ] },
      { 'northwest': [ ] }
    ]);


    var cata = function (subject, southeast, southwest, northeast, northwest) {
      return subject.fold(southeast, southwest, northeast, northwest);
    };

    return {
      southeast: adt.southeast,
      southwest: adt.southwest,
      northeast: adt.northeast,
      northwest: adt.northwest,
      cata: cata
    };
  }
);