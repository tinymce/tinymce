define(
  'ephox.snooker.resize.Bars',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.scullion.Struct',
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

  function (Arr, Fun, Struct, Blocks, DetailsList, Warehouse, Bar, Styles, Class, Css, Height, Insert, Location, Remove, SelectorFilter, Width) {
    var resizeBar = Styles.resolve('resizer-bar');
    var BAR_WIDTH = 3;
    var colInfo = Struct.immutable('col', 'x');

    var clear = function (container, table) {
      var previous = SelectorFilter.descendants(container, '.' + resizeBar);
      Arr.each(previous, Remove.remove);
    };

    var refreshCols = function (container, table, cols, direction) {
      var position = Location.absolute(table);
      var tableHeight = Height.getOuter(table);

      var colPositions = direction.positions(cols);
      Arr.each(colPositions, function (cp) {
        var bar = Bar(cp.col(), cp.x(), position.top(), BAR_WIDTH, tableHeight);
        Class.add(bar, resizeBar);
        Insert.append(container, bar);
      });
    };

    var refresh = function (container, table, direction) {
      clear(container, table);

      var list = DetailsList.fromTable(table);
      var warehouse = Warehouse.generate(list);
      var cols = Blocks.columns(warehouse);
      if (cols.length > 0) refreshCols(container, table, cols, direction);
    };

    var hide = function (container) {
      var bars = SelectorFilter.descendants(container, '.' + resizeBar);
      Arr.each(bars, function (bar) {
        // Css.set(bar, 'display', 'none');
      });
    };

    var show = function (container) {
      var bars = SelectorFilter.descendants(container, '.' + resizeBar);
      Arr.each(bars, function (bar) {
        Css.set(bar, 'display', 'block');
      });
    };

    var isBar = function (element) {
      return Class.has(element, resizeBar);
    };

    return {
      refresh: refresh,
      hide: hide,
      show: show,
      isBar: isBar
    };
  }
);
