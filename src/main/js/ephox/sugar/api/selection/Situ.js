define(
  'ephox.sugar.api.selection.Situ',

  [
    'ephox.katamari.api.Adt',
    'ephox.katamari.api.Fun'
  ],

  function (Adt, Fun) {
    var adt = Adt.generate([
      { 'before': [ 'element' ] },
      { 'on': [ 'element', 'offset' ] },
      { after: [ 'element' ] }
    ]);

    // Probably don't need this given that we now have "match"
    var cata = function (subject, onBefore, onOn, onAfter) {
      return subject.fold(onBefore, onOn, onAfter);
    };

    var getStart = function (situ) {
      return situ.fold(Fun.identity, Fun.identity, Fun.identity)
    };

    return {
      before: adt.before,
      on: adt.on,
      after: adt.after,
      cata: cata,
      getStart: getStart
    };
  }
);
