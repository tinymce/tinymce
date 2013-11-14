define(
  'ephox.snooker.tbio.resize.bar.Bars',

  [
    'ephox.compass.Arr',
    'ephox.snooker.style.Styles',
    'ephox.snooker.tbio.query.Lookup',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Height',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Location',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFilter'
  ],

  function (Arr, Styles, Lookup, Attr, Class, Css, Element, Height, Insert, Location, Remove, SelectorFilter) {
    var resizerBar = Styles.resolve('resizer-bar');

    var create = function (column, x, y, w, h) {
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
      Class.add(blocker, resizerBar);
      return blocker;
    };

    var refresh = function (container, table) {
      var previous = SelectorFilter.descendants(container, '.' + resizerBar);
      Arr.each(previous, Remove.remove);

      var input = Lookup.information(table);
      var widths = Lookup.widths(input);

      var position = Location.absolute(table);
      var current = position.left();
      for (var i = 0; i < widths.length; i++) {
        current += parseInt(widths[i], 10) + 3;
        var bar = create(i, current, position.top(), 10, Height.getOuter(table));
        Insert.append(container, bar);
      }
    };

    var hide = function (container) {
      var bars = SelectorFilter.descendants(container, '.' + resizerBar);
      Arr.each(bars, function (bar) {
        Css.set(bar, 'display', 'none');
      });
    };

    var show = function (container) {
      var bars = SelectorFilter.descendants(container, '.' + resizerBar);
      Arr.each(bars, function (bar) {
        Css.set(bar, 'display', 'block');
      });
    };

    var isBar = function (target) {
      return Class.has(target, resizerBar);
    };

    return {
      refresh: refresh,
      hide: hide,
      show: show,
      isBar: isBar
    };
  }
);
