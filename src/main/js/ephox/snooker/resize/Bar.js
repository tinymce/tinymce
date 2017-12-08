define(
  'ephox.snooker.resize.Bar',

  [
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.node.Element'
  ],

  function (Attr, Css, Element) {
    var col = function (column, x, y, w, h) {
      var blocker = Element.fromTag('div');
      Css.setAll(blocker, {
        position: 'absolute',
        left: x - w/2 + 'px',
        top: y + 'px',
        height: h + 'px',
        width: w + 'px'
      });

      Attr.setAll(blocker, { 'data-column': column, 'role': 'presentation' });
      return blocker;
    };

    var row = function (row, x, y, w, h) {
      var blocker = Element.fromTag('div');
      Css.setAll(blocker, {
        position: 'absolute',
        left: x + 'px',
        top: y - h/2 + 'px',
        height: h + 'px',
        width: w + 'px'
      });

      Attr.setAll(blocker, { 'data-row': row, 'role': 'presentation' });
      return blocker;
    };


    return {
      col: col,
      row: row
    };
  }
);
