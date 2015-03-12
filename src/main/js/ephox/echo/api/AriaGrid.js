define(
  'ephox.echo.api.AriaGrid',

  [
    'ephox.echo.api.Styles',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert'
  ],

  function (Styles, Attr, Class, Element, Insert) {
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

    var createHelp = function (grid, rows, cols) {
      var r = [];
      for (var rowNum = 0; rowNum < rows; rowNum++) {
        // Temporary non-random number until we get it right
        var rowId = rowNum + 'h';//Id.generate('ephox-aria');
        var rowHelp = Element.fromTag('span');
        Attr.set(rowHelp, 'id', rowId);
        Class.add(rowHelp, Styles.resolve('aria-help'));
        Insert.append(rowHelp, Element.fromText((rowNum + 1) + ' high'));
        Insert.append(grid, rowHelp);

        r[rowNum] = [];

        for (var colNum = 0; colNum < cols; colNum++) {
          // Temporary non-random number until we get it right
          var colId = colNum + 'w';//Id.generate('ephox-aria');
          var cellHelp = Element.fromTag('span');
          Attr.set(cellHelp, 'id', colId);
          Class.add(cellHelp, Styles.resolve('aria-help'));
          Insert.append(cellHelp, Element.fromText((colNum + 1) + ' wide'));
          Insert.append(grid, cellHelp);

          r[rowNum][colNum] = colId + ' ' + rowId;
        }
      }
      return r;
    };

    return {
      base: base,
      row: row,
      cell: cell,
      createHelp: createHelp
    };
  }
);