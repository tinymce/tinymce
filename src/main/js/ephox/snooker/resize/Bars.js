define(
  'ephox.snooker.resize.Bars',

  [
    'ephox.compass.Arr',
    'ephox.snooker.lookup.Blocks',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.resize.Bar',
    'ephox.snooker.resize.HorizontalBar',
    'ephox.snooker.style.Styles',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Classes',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Height',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Location',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.Width'
  ],

  function (Arr, Blocks, DetailsList, Warehouse, Bar, HorizontalBar, Styles, Class, Classes, Css, Height, Insert, Location, Remove, SelectorFilter, Width) {
    var resizeBar = Styles.resolve('resizer-bar');
    var BAR_THICKNESS = 3;

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
          var bar = Bar(cp.col(), cp.x() - origin.left(), position.top() - origin.top(), BAR_THICKNESS, tableHeight);
          Classes.add(bar, [ resizeBar, Styles.resolve('resizer-cols')]);

          Insert.append(wire.parent(), bar);
        });
      });
    };

    var refreshRows = function (wire, table, rows, direction) {
      var tableWidth = Width.getOuter(table);
      var position = Location.absolute(table);

      var rowPositions = direction.positions(rows, table);
      Arr.each(rowPositions, function (cpOption, _i) {
        cpOption.each(function (cp) {
          var origin = wire.origin();

          var bar = HorizontalBar(cp.row(),position.left() + origin.left(), cp.height() + cp.y() + origin.top(), tableWidth, BAR_THICKNESS);

          Classes.add(bar, [ resizeBar, Styles.resolve('resizer-rows')]);
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
