define(
  'ephox.snooker.resize.Bars',

  [
    'ephox.compass.Arr',
    'ephox.snooker.lookup.Blocks',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.resize.Bar',
    'ephox.snooker.style.Styles',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Height',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Location',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.Width'
  ],

  function (Arr, Blocks, DetailsList, Warehouse, Bar, Styles, Class, Css, Height, Insert, Location, Remove, SelectorFilter, Width) {
    var resizeBar = Styles.resolve('resizer-bar');
    var BAR_WIDTH = 3;

    var clear = function (wire, table) {
      var previous = SelectorFilter.descendants(wire.parent(), '.' + resizeBar);
      Arr.each(previous, Remove.remove);
    };

    var refreshCols = function (wire, table, cols, direction) {
      var position = Location.absolute(table);
      var tableHeight = Height.getOuter(table);

      var colPositions = direction.positions(cols, table);
      Arr.each(colPositions, function (cpOption, i) {
        cpOption.each(function (cp) {
          var origin = wire.origin();
          var bar = Bar(cp.col(), cp.x() - origin.left(), position.top() - origin.top(), BAR_WIDTH, tableHeight);
          Class.add(bar, resizeBar);
          Insert.append(wire.parent(), bar);
        });
      });
    };

    var refreshRows = function (wire, table, rows, direction) {
      var position = Location.absolute(table);
      var tableWidth = Width.getOuter(table);

      var colPositions = direction.positions(rows, table);
      Arr.each(colPositions, function (cpOption, i) {
        cpOption.each(function (cp) {
          var origin = wire.origin();
          var bar = Bar(cp.row(), cp.y() - origin.left(), position.top() - origin.top(), tableWidth, BAR_WIDTH);
          Class.add(bar, resizeBar);
          Insert.append(wire.parent(), bar);
        });
      });
    };

    var refresh = function (wire, table, direction) {
      clear(wire, table);

      var list = DetailsList.fromTable(table);
      var warehouse = Warehouse.generate(list);
      var cols = Blocks.columns(warehouse);

      if (cols.length > 0) refreshCols(wire, table, cols, direction);
    };

    var rowRefresh = function (wire, table, direction) {
      clear(wire, table);

      var list = DetailsList.fromTable(table);
      var warehouse = Warehouse.generate(list);
      var rows = Blocks.rows(warehouse);

      if (rows.length > 0) refreshRows(wire, table, rows, direction);
    };

    var hide = function (wire) {
      var bars = SelectorFilter.descendants(wire.parent(), '.' + resizeBar);
      Arr.each(bars, function (bar) {
        Css.set(bar, 'display', 'none');
      });
    };

    var show = function (wire) {
      var bars = SelectorFilter.descendants(wire.parent(), '.' + resizeBar);
      Arr.each(bars, function (bar) {
        Css.set(bar, 'display', 'block');
      });
    };

    var isBar = function (element) {
      return Class.has(element, resizeBar);
    };

    return {
      refresh: refresh,
      rowRefresh: rowRefresh,
      hide: hide,
      show: show,
      isBar: isBar
    };
  }
);
