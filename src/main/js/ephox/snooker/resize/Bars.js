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
    'ephox.sugar.api.SelectorFilter'
  ],

  function (Arr, Blocks, DetailsList, Warehouse, Bar, Styles, Class, Css, Height, Insert, Location, Remove, SelectorFilter) {
    var resizeBar = Styles.resolve('resizer-bar');
    var BAR_WIDTH = 3;

    var clear = function (parent, table) {
      var previous = SelectorFilter.descendants(parent, '.' + resizeBar);
      Arr.each(previous, Remove.remove);
    };

    var refreshCols = function (parent, table, cols, direction) {
      var position = Location.absolute(table);
      var tableHeight = Height.getOuter(table);

      var colPositions = direction.positions(cols, table);
      Arr.each(colPositions, function (cp) {
        var bar = Bar(cp.col(), cp.x(), position.top(), BAR_WIDTH, tableHeight);
        Class.add(bar, resizeBar);
        Insert.append(parent, bar);
      });
    };

    var refresh = function (parent, table, direction) {
      clear(parent, table);

      var list = DetailsList.fromTable(table);
      var warehouse = Warehouse.generate(list);
      var cols = Blocks.columns(warehouse);
      if (cols.length > 0) refreshCols(parent, table, cols, direction);
    };

    var hide = function (parent) {
      var bars = SelectorFilter.descendants(parent, '.' + resizeBar);
      Arr.each(bars, function (bar) {
        Css.set(bar, 'display', 'none');
      });
    };

    var show = function (parent) {
      var bars = SelectorFilter.descendants(parent, '.' + resizeBar);
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
