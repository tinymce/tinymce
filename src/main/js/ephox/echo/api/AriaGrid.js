define(
  'ephox.echo.api.AriaGrid',

  [
    'ephox.echo.api.Styles',
    'ephox.epithet.Id',
    'ephox.scullion.Struct',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert'
  ],

  function (Styles, Id, Struct, Attr, Class, Element, Insert) {
    var help = Struct.immutable('help', 'ids');

    var base = function (element, label) {
      Attr.setAll(element, {
        'aria-label': label,
        'role': 'grid'
      });
    };

    var row = function (element) {
      Attr.set(element, 'role', 'row');
    };

    var cell = function (element, labelledby) {
      Attr.setAll(element, {
        'role': 'gridcell',
        'aria-labelledby': labelledby
      });
    };

    var createHelp = function (rows, cols, translations) {
      var gridHelp = Element.fromTag('div');
      Class.add(gridHelp, Styles.resolve('aria-help'));

      // TODO: snooker util.repeat instead of mutation
      var ids = [];
      for (var rowNum = 0; rowNum < rows; rowNum++) {
        // Temporary non-random number until we get it right
        var rowId = Id.generate('ephox-aria');
        var rowHelp = Element.fromTag('span');
        Attr.set(rowHelp, 'id', rowId);
        Class.add(rowHelp, Styles.resolve('aria-help'));
        Insert.append(rowHelp, Element.fromText(translations.row(rowNum + 1)));
        Insert.append(gridHelp, rowHelp);

        // TODO: snooker util.repeat instead of mutation
        ids[rowNum] = [];
        for (var colNum = 0; colNum < cols; colNum++) {
          // Temporary non-random number until we get it right
          var colId = Id.generate('ephox-aria');
          var cellHelp = Element.fromTag('span');
          Attr.set(cellHelp, 'id', colId);
          Class.add(cellHelp, Styles.resolve('aria-help'));
          Insert.append(cellHelp, Element.fromText(translations.col(colNum + 1)));
          Insert.append(gridHelp, cellHelp);

          ids[rowNum][colNum] = colId + ' ' + rowId;
        }
      }
      return help(gridHelp, ids);
    };

    return {
      base: base,
      row: row,
      cell: cell,
      createHelp: createHelp
    };
  }
);