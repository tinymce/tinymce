define(
  'tinymce.plugins.tablenew.queries.TableDirection',

  [
    'ephox.katamari.api.Fun',
    'ephox.snooker.api.ResizeDirection',
    'ephox.sugar.api.properties.Direction'
  ],

  function (Fun, ResizeDirection, Direction) {
    return function () {
      var ltr = {
        isRtl: Fun.constant(false)
      };

      var rtl = {
        isRtl: Fun.constant(true)
      };

      // Get the directionality from the position in the content
      var directionAt = function (element) {
        var dir = Direction.getDirection(element);
        return dir === 'rtl' ? rtl : ltr;
      };

      var auto = function (table) {
        return directionAt(table).isRtl() ? ResizeDirection.rtl : ResizeDirection.ltr;
      };

      var delta = function (amount, table) {
        return auto(table).delta(amount, table);
      };

      var positions = function (cols, table) {
        return auto(table).positions(cols, table);
      };

      var edge = function (cell) {
        return auto(cell).edge(cell);
      };

      return {
        delta: delta,
        edge: edge,
        positions: positions
      };
    };
  }
);