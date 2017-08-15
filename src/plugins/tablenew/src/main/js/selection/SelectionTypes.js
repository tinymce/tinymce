define(
  'tinymce.plugins.tablenew.selection.SelectionTypes',

  [
    'ephox.katamari.api.Adt',
    'ephox.katamari.api.Option'
  ],

  function (Adt, Option) {
    var type = Adt.generate([
      { none: [] },
      { multiple: [ 'elements' ] },
      { single: [ 'selection' ] }
    ]);

    var cata = function (subject, onNone, onMultiple, onSingle) {
      return subject.fold(onNone, onMultiple, onSingle);
    };

    var toSelection = function (subject) {
      return subject.fold(Option.none, function (_, envs) {
        return Option.from(envs[0]).bind(function (e) {
          return e.getSelection();
        });
      }, Option.some);
    };

    return {
      cata: cata,
      none: type.none,
      multiple: type.multiple,
      single: type.single,
      toSelection: toSelection
    };
  }
);