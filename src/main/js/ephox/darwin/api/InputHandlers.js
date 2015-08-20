define(
  'ephox.darwin.api.InputHandlers',

  [
    'ephox.darwin.api.Responses',
    'ephox.darwin.api.SelectionKeys',
    'ephox.darwin.api.WindowBridge',
    'ephox.darwin.keyboard.KeySelection',
    'ephox.darwin.keyboard.VerticalMovement',
    'ephox.darwin.mouse.MouseSelection',
    'ephox.darwin.navigation.KeyDirection',
    'ephox.darwin.selection.CellSelection',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Responses, SelectionKeys, WindowBridge, KeySelection, VerticalMovement, MouseSelection, KeyDirection, CellSelection, Fun, Option) {
    var mouse = function (win, container) {
      var bridge = WindowBridge(win);

      var handlers = MouseSelection(bridge, container);

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

      var keydown = function (event, start, soffset, finish, foffset, direction) {
        var keycode = event.raw().which;
        var shiftKey = event.raw().shiftKey === true;

        var handler = CellSelection.retrieve(container).fold(function () {
          // Shift down should predict the movement and set the selection.
          if (SelectionKeys.isDown(keycode) && shiftKey) return Fun.curry(VerticalMovement.select, bridge, container, isRoot, KeyDirection.down, finish, start);
          // Shift up should predict the movement and set the selection.
          else if (SelectionKeys.isUp(keycode) && shiftKey) return Fun.curry(VerticalMovement.select, bridge, container, isRoot, KeyDirection.up, finish, start);
          // Down should predict the movement and set the cursor
          else if (SelectionKeys.isDown(keycode)) return Fun.curry(VerticalMovement.navigate, bridge, isRoot, KeyDirection.down, finish, start);
          // Up should predict the movement and set the cursor
          else if (SelectionKeys.isUp(keycode)) return Fun.curry(VerticalMovement.navigate, bridge, isRoot, KeyDirection.up, finish, start);
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

          if (SelectionKeys.isDown(keycode) && shiftKey) return update(+1, 0);
          else if (SelectionKeys.isUp(keycode) && shiftKey) return update(-1, 0);
          else if (direction.isBackward(keycode) && shiftKey) return update(0, -1);
          else if (direction.isForward(keycode) && shiftKey) return update(0, +1);
          // Clear the selection on normal arrow keys.
          else if (SelectionKeys.isNavigation(keycode) && shiftKey === false) return clearToNavigate;
          else return Option.none;
        });

        return handler();
      };

      var keyup = function (event, start, soffset, finish, foffset) {
        return CellSelection.retrieve(container).fold(function () {
          var keycode = event.raw().which;
          var shiftKey = event.raw().shiftKey === true;
          if (shiftKey === false) return Option.none();
          if (SelectionKeys.isNavigation(keycode)) return KeySelection.sync(container, isRoot, start, soffset, finish, foffset);
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