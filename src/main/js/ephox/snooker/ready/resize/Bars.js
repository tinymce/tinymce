define(
  'ephox.snooker.ready.resize.Bars',

  [
    'ephox.compass.Arr',
    'ephox.snooker.ready.lookup.Blocks',
    'ephox.snooker.ready.model.DetailsList',
    'ephox.snooker.ready.model.Warehouse',
    'ephox.snooker.ready.resize.Bar',
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

    var clear = function (container, table) {
      var previous = SelectorFilter.descendants(container, '.' + resizeBar);
      Arr.each(previous, Remove.remove);
    };

    var refresh = function (container, table) {
      clear(container, table);

      var list = DetailsList.fromTable(table);
      var warehouse = Warehouse.generate(list);
      var cols = Blocks.columns(warehouse);

      var position = Location.absolute(table);
     
      Arr.each(cols.slice(1), function (cell, col) {
        var pos = Location.absolute(cell);
        var bar = Bar(col, pos.left(), pos.top(), 3, Height.getOuter(table));
        Class.add(bar, resizeBar);
        Insert.append(container, bar);
      });

      var lastLeft = Location.absolute(cols[cols.length - 1]).left() + Width.getOuter(cols[cols.length - 1]);
      var lastTop = position.top();
      var bar = createVert(cols.length - 1, lastLeft, lastTop, 3, Height.getOuter(table));
      Insert.append(container, bar);
    };

    var hide = function (container) {
      var bars = SelectorFilter.descendants(container, '.' + resizeBar);
      Arr.each(bars, function (bar) {
        Css.set(bar, 'display', 'none');
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
