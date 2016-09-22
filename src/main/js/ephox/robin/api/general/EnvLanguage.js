define(
  'ephox.robin.api.general.EnvLanguage',

  [
    'ephox.scullion.ADT'
  ],

  function (Adt) {
    var adt = Adt.generate([
      { fallback: [ 'lang' ] },
      { enforced: [ 'lang' ] }
    ]);

    var cata = function (subject, onFallback, onEnforced) {
      return subject.fold(onFallback, onEnforced);
    };

    return {
      fallback: adt.fallback,
      enforced: adt.enforced,
      cata: cata
    };
  }
);