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
    var resizeRowBar = Styles.resolve('resizer-rows');
    var resizeColBar = Styles.resolve('resizer-cols');
    var BAR_THICKNESS = 7;

    var clear = function (wire, table) {
      var previous = SelectorFilter.descendants(wire.parent(), '.' + resizeBar);
      Arr.each(previous, Remove.remove);
    };


    var refreshGrid = function (wire, table, rows, cols, hdirection, vdirection) {
      var tableWidth = Width.getOuter(table);
      var position = Location.absolute(table);
      var tableHeight = Height.getOuter(table);
      var rowPositions = hdirection.positions(rows, table);

      Arr.each(rowPositions, function (cpOption, _i) {
        cpOption.each(function (cp) {
          var origin = wire.origin();
          var horizontalBar = HorizontalBar(cp.row(), position.left() + origin.left(), cp.y() + origin.top(), tableWidth, BAR_THICKNESS);
          Classes.add(horizontalBar, [ resizeBar, resizeRowBar ]);
          Insert.append(wire.parent(), horizontalBar);
        });
      });



      var colPositions = vdirection.positions(cols, table);
      Arr.each(colPositions, function (cpOption, i) {
        cpOption.each(function (cp) {
          var origin = wire.origin();
          var bar = Bar(cp.col(), cp.x() - origin.left(), position.top() - origin.top(), BAR_THICKNESS, tableHeight);
          Classes.add(bar, [ resizeBar, resizeColBar ]);

          Insert.append(wire.parent(), bar);
        });
      });


    };

    var refresh = function (wire, table, hdirection, vdirection) {
      clear(wire, table);

      var list = DetailsList.fromTable(table);
      var warehouse = Warehouse.generate(list);
      var rows = Blocks.rows(warehouse);
      var cols = Blocks.columns(warehouse);

      if (rows.length > 0) refreshGrid(wire, table, rows, cols, hdirection, vdirection);

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

    var isRowBar = function (element) {
      return Class.has(element, resizeRowBar);
    };

    var isColBar = function (element) {
      return Class.has(element, resizeColBar);
    };

    return {
      refresh: refresh,
      hide: hide,
      show: show,
      isRowBar: isRowBar,
      isColBar: isColBar
    };
  }
);
