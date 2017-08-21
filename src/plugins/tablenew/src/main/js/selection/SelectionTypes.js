define(
  'tinymce.plugins.tablenew.selection.SelectionTypes',

  [
    'ephox.katamari.api.Adt'
  ],

  function (Adt) {
    var type = Adt.generate([
      { none: [] },
      { multiple: [ 'elements' ] },
      { single: [ 'selection' ] }
    ]);

    var cata = function (subject, onNone, onMultiple, onSingle) {
      return subject.fold(onNone, onMultiple, onSingle);
    };

    return {
      cata: cata,
      none: type.none,
      multiple: type.multiple,
      single: type.single
    };
  }
);