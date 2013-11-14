define(
  'ephox.snooker.tbio.resize.bar.Bars',

  [
    'ephox.compass.Arr',
    'ephox.snooker.style.Styles',
    'ephox.snooker.tbio.query.Lookup',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Classes',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Height',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Location',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.Width'
  ],

  function (Arr, Styles, Lookup, Attr, Class, Classes, Css, Element, Height, Insert, Location, Remove, SelectorFilter, Width) {
    var vertResize = Styles.resolve('vertical-resizer-bar');
    var horizResize = Styles.resolve('horizontal-resizer-bar');
    var resizeBar = Styles.resolve('resizer-bar');

    var createVert = function (column, x, y, w, h) {
      var blocker = Element.fromTag('div');
      Css.setAll(blocker, {
        position: 'absolute',
        left: x - w/2,
        top: y,
        height: h,
        width: w,
        'background-color': '#555',
        opacity: '0.05',
        cursor: 'w-resize'
      });

      Attr.set(blocker, 'data-column', column);
      Classes.add(blocker, [ resizeBar, vertResize ]);
      return blocker;
    };

    var createHoriz = function (row, x, y, w, h) {
      var blocker = Element.fromTag('div');
      Css.setAll(blocker, {
        position: 'absolute',
        left: x,
        top: y-h/2,
        height: h,
        width: w,
        'background-color': '#555',
        opacity: '0.05',
        cursor: 's-resize'
      });

      Attr.set(blocker, 'data-row', row);
      Classes.add(blocker, [ resizeBar, horizResize ]);
      return blocker;
    };

    var refresh = function (container, table) {
      var previous = SelectorFilter.descendants(container, '.' + resizeBar);
      Arr.each(previous, Remove.remove);

      var input = Lookup.information(table);
      var widths = Lookup.widths(input);
      var heights = Lookup.heights(input);
      console.log('heights: ', heights);

      var position = Location.absolute(table);
      var current = position.left();
      for (var i = 0; i < widths.length; i++) {
        current += parseInt(widths[i], 10) + 3;
        var bar = createVert(i, current, position.top(), 10, Height.getOuter(table));
        Insert.append(container, bar);
      }

      var hCurrent = position.top();
      for (var j = 0; j < heights.length; j++) {
        hCurrent += parseInt(heights[j], 10) + 3;
        var barH = createHoriz(j, position.left(), hCurrent, Width.getOuter(table), 10);
        Insert.append(container, barH);
      }
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

    var isVBar = function (target) {
      return Class.has(target, vertResize);
    };

    var isHBar = function (target) {
      return Class.has(target, horizResize);
    };

    return {
      refresh: refresh,
      hide: hide,
      show: show,
      isVBar: isVBar,
      isHBar: isHBar
    };
  }
);
