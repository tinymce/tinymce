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
        'role': 'grid' // let aria find the label
      });
    };

    var row = function (element) {
      Attr.set(element, 'role', 'row');
    };

    var cell = function (element, label) {
      Attr.setAll(element, {
        'role': 'gridcell' // let aria find the label
      });
    };

    var createHelp = function (rows, cols, translations) {
      var gridHelp = Element.fromTag('div');
      Class.add(gridHelp, Styles.resolve('aria-help'));

      var colIds = [];
      // TODO: snooker util.repeat instead of mutation
      for (var colHelp = 0; colHelp < cols; colHelp++) {
        // Temporary non-random number until we get it right
        var colId = Id.generate('ephox-aria');
        var cellHelp = Element.fromTag('span');
        Attr.set(cellHelp, 'id', colId);
        Class.add(cellHelp, Styles.resolve('aria-help'));
        Insert.append(cellHelp, Element.fromText(translations.col(colHelp + 1)));
        Insert.append(gridHelp, cellHelp);

        colIds[colHelp] = colId;
      }

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

        ids[rowNum] = [];
        // TODO: snooker util.repeat instead of mutation
        for (var colNum = 0; colNum < cols; colNum++) {
          ids[rowNum][colNum] = colIds[colNum] + ' ' + rowId;
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