define(
  'ephox.darwin.api.InputHandlers',

  [
    'ephox.darwin.api.Responses',
    'ephox.darwin.api.WindowBridge',
    'ephox.darwin.keyboard.KeySelection',
    'ephox.darwin.keyboard.VerticalMovement',
    'ephox.darwin.mouse.MouseSelection',
    'ephox.darwin.navigation.KeyDirection',
    'ephox.darwin.selection.CellSelection',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Responses, WindowBridge, KeySelection, VerticalMovement, MouseSelection, KeyDirection, CellSelection, Fun, Option) {
    var mouse = function (container) {
      var handlers = MouseSelection(container);

      return {
        mousedown: handlers.mousedown,
        mouseover: handlers.mouseover,
        mouseup: handlers.mouseup
      };
    };

    var keyboard = function (win, container, isRoot) {
      var bridge = WindowBridge(win);

      var clearToNavigate = function () {
        CellSelection.clear(container);
        return Option.none();
      };

      var keydown = function (event, element, offset) {
        var keycode = event.raw().which;
        var shiftKey = event.raw().shiftKey === true;

        var handler = CellSelection.retrieve(container).fold(function () {
          // Shift down should predict the movement and set the selection.
          if (keycode === 40 && shiftKey) return Fun.curry(VerticalMovement.select, bridge, container, isRoot, KeyDirection.down, element);
          // Shift up should predict the movement and set the selection.
          else if (keycode === 38 && shiftKey) return Fun.curry(VerticalMovement.select, bridge, container, isRoot, KeyDirection.up, element);
          // Down should predict the movement and set the cursor
          else if (keycode === 40) return Fun.curry(VerticalMovement.navigate, bridge, isRoot, KeyDirection.down, element);
          // Up should predict the movement and set the cursor
          else if (keycode === 38) return Fun.curry(VerticalMovement.navigate, bridge, isRoot, KeyDirection.up, element);
          else return Option.none;
        }, function (selected) {

          var update = function (rows, cols) {
            return function () {
              // Shift the selected rows and update the selection.
              KeySelection.update(rows, cols, container, selected);
              // Kill the event, even if no change to the selection is made.
              return Option.some(Responses.response(Option.none(), true));
            };
          };

          // Note, this will need to work for RTL.
          if (keycode === 40 && shiftKey) return update(+1, 0);
          else if (keycode === 38 && shiftKey) return update(-1, 0);
          else if (keycode === 37 && shiftKey) return update(0, -1);
          else if (keycode === 39 && shiftKey) return update(0, +1);
          // Clear the selection on normal arrow keys.
          else if (keycode >= 37 && keycode <= 40 && shiftKey === false) return clearToNavigate;
          else return Option.none;
        });

        return handler();
      };

      var keyup = function (event, start, soffset, finish, foffset) {
        return CellSelection.retrieve(container).fold(function () {
          var keycode = event.raw().which;
          var shiftKey = event.raw().shiftKey === true;
          if (shiftKey === false) return Option.none();
          if (keycode >= 37 && keycode <= 40) return KeySelection.sync(container, isRoot, start, soffset, finish, foffset);
          else return Option.none();
        }, Option.none);
      };

      return {
        keydown: keydown,
        keyup: keyup
      };
    };

    return {
      mouse: mouse,
      keyboard: keyboard
    };
  }
);