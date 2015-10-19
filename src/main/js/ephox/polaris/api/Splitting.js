define(
  'ephox.polaris.api.Splitting',

  [
    'ephox.scullion.ADT'
  ],

  function (Adt) {
    var adt = Adt.generate([
      { include: [ 'item' ] },
      { excludeWith: [ 'item' ] },
      { excludeWithout: [ 'item' ] }
    ]);

    var cata = function (subject, onInclude, onExcludeWith, onExcludeWithout) {
      return subject.fold(onInclude, onExcludeWith, onExcludeWithout);
    };

    return {
      include: adt.include,
      excludeWith: adt.excludeWith,
      excludeWithout: adt.excludeWithout,
      cata: cata
    };
  }
);