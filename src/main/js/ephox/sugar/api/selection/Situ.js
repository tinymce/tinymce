define(
  'ephox.sugar.api.selection.Situ',

  [
    'ephox.katamari.api.Adt'
  ],

  function (Adt) {
    var adt = Adt.generate([
      { 'before': [ 'element' ] },
      { 'on': [ 'element', 'offset' ] },
      { after: [ 'element' ] }
    ]);

    // Probably don't need this given that we now have "match"
    var cata = function (subject, onBefore, onOn, onAfter) {
      return subject.fold(onBefore, onOn, onAfter);
    };

    return {
      before: adt.before,
      on: adt.on,
      after: adt.after,
      cata: cata
    };
  }
);
