define(
  'ephox.snooker.picker.Redimension',

  [
    'ephox.snooker.api.Structs',
    'ephox.snooker.picker.Sizing',
    'ephox.sugar.api.Height',
    'ephox.sugar.api.Location',
    'ephox.sugar.api.Width',
    'global!Math'
  ],

  function (Structs, Sizing, Height, Location, Width, Math) {
    return function (direction, settings) {
      var active = false;

      var on = function () {
        active = true;
      };

      var off = function () {
        active = false;
      };

      var getDimensions = function (table) {
        var width = Width.get(table.element());
        var height = Height.get(table.element());
        return Structs.dimensions(width, height);
      };

      var getPosition = function (table) {
        var position = Location.absolute(table.element());
        return Structs.coords(position.left(), position.top());
      };

      var updateSelection = function (table, grid, changes) {
        var full = changes.full();
        if (full.row() !== grid.rows() || full.column() !== grid.columns()) table.setSize(full.row(), full.column());
        table.setSelection(changes.selection().row(), changes.selection().column());
      };

      /*
       * Based on the mouse position (x, y), identify whether the picker table needs to be resized
       * and update its selection
       */
      var mousemove = function (table, grid, x, y) {
        if (active) {
          var dimensions = getDimensions(table);
          var position = getPosition(table);
          var mouse = Structs.coords(x, y);
          var address = direction.pickerCell(position, dimensions, grid, mouse);
          var changes = Sizing.resize(address, settings);
          updateSelection(table, grid, changes);
        }
      };

      var manual = function (table, selected, xDelta, yDelta) {
        if (active) {
          console.log('selected:', selected.rows(), selected.columns());
          var changes = Sizing.grow(selected, xDelta, yDelta, settings);
          updateSelection(table, selected, changes);
        }
      };

      return {
        on: on,
        off: off,
        mousemove: mousemove,
        manual: manual
      };
    };
  }
);