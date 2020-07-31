import { Arr, Fun, Optional } from '@ephox/katamari';
import { EventArgs, Situ, SugarElement } from '@ephox/sugar';
import * as KeySelection from '../keyboard/KeySelection';
import * as VerticalMovement from '../keyboard/VerticalMovement';
import MouseSelection from '../mouse/MouseSelection';
import * as KeyDirection from '../navigation/KeyDirection';
import * as CellSelection from '../selection/CellSelection';
import { Response } from '../selection/Response';
import { SelectionAnnotation } from './SelectionAnnotation';
import * as SelectionKeys from './SelectionKeys';
import { WindowBridge } from './WindowBridge';

interface RC {
  readonly rows: number;
  readonly cols: number;
}

const rc = (rows: number, cols: number): RC => ({ rows, cols });

const mouse = function (win: Window, container: SugarElement, isRoot: (e: SugarElement) => boolean, annotations: SelectionAnnotation) {
  const bridge = WindowBridge(win);

  const handlers = MouseSelection(bridge, container, isRoot, annotations);

  return {
    clearstate: handlers.clearstate,
    mousedown: handlers.mousedown,
    mouseover: handlers.mouseover,
    mouseup: handlers.mouseup
  };
};

const keyboard = function (win: Window, container: SugarElement, isRoot: (e: SugarElement) => boolean, annotations: SelectionAnnotation) {
  const bridge = WindowBridge(win);

  const clearToNavigate = function () {
    annotations.clear(container);
    return Optional.none<Response>();
  };

  const keydown = function (event: EventArgs<KeyboardEvent>, start: SugarElement, soffset: number, finish: SugarElement, foffset: number, direction: typeof SelectionKeys.ltr) {
    const realEvent = event.raw;
    const keycode = realEvent.which;
    const shiftKey = realEvent.shiftKey === true;

    const handler = CellSelection.retrieve(container, annotations.selectedSelector).fold(function () {
      // Shift down should predict the movement and set the selection.
      if (SelectionKeys.isDown(keycode) && shiftKey) {
        return Fun.curry(VerticalMovement.select, bridge, container, isRoot, KeyDirection.down, finish, start, annotations.selectRange);
      } else if (SelectionKeys.isUp(keycode) && shiftKey) { // Shift up should predict the movement and set the selection.
        return Fun.curry(VerticalMovement.select, bridge, container, isRoot, KeyDirection.up, finish, start, annotations.selectRange);
      } else if (SelectionKeys.isDown(keycode)) { // Down should predict the movement and set the cursor
        return Fun.curry(VerticalMovement.navigate, bridge, isRoot, KeyDirection.down, finish, start, VerticalMovement.lastDownCheck);
      } else if (SelectionKeys.isUp(keycode)) { // Up should predict the movement and set the cursor
        return Fun.curry(VerticalMovement.navigate, bridge, isRoot, KeyDirection.up, finish, start, VerticalMovement.firstUpCheck);
      } else {
        return Optional.none;
      }
    }, function (selected) {

      const update = function (attempts: RC[]) {
        return function () {
          const navigation = Arr.findMap(attempts, function (delta) {
            return KeySelection.update(delta.rows, delta.cols, container, selected, annotations);
          });

          // Shift the selected rows and update the selection.
          return navigation.fold(function () {
            // The cell selection went outside the table, so clear it and bridge from the first box to before/after
            // the table
            return CellSelection.getEdges(container, annotations.firstSelectedSelector, annotations.lastSelectedSelector).map(function (edges) {
              const relative = SelectionKeys.isDown(keycode) || direction.isForward(keycode) ? Situ.after : Situ.before;
              bridge.setRelativeSelection(Situ.on(edges.first, 0), relative(edges.table));
              annotations.clear(container);
              return Response.create(Optional.none(), true);
            });
          }, function (_) {
            return Optional.some(Response.create(Optional.none(), true));
          });
        };
      };

      if (SelectionKeys.isDown(keycode) && shiftKey) {
        return update([ rc(+1, 0) ]);
      } else if (SelectionKeys.isUp(keycode) && shiftKey) {
        return update([ rc(-1, 0) ]);
      } else if (direction.isBackward(keycode) && shiftKey) { // Left and right should try up/down respectively if they fail.
        return update([ rc(0, -1), rc(-1, 0) ]);
      } else if (direction.isForward(keycode) && shiftKey) {
        return update([ rc(0, +1), rc(+1, 0) ]);
      } else if (SelectionKeys.isNavigation(keycode) && shiftKey === false) { // Clear the selection on normal arrow keys.
        return clearToNavigate;
      } else {
        return Optional.none;
      }
    });

    return handler();
  };

  const keyup = function (event: EventArgs<KeyboardEvent>, start: SugarElement, soffset: number, finish: SugarElement, foffset: number) {
    return CellSelection.retrieve(container, annotations.selectedSelector).fold<Optional<Response>>(function () {
      const realEvent = event.raw;
      const keycode = realEvent.which;
      const shiftKey = realEvent.shiftKey === true;
      if (shiftKey === false) {
        return Optional.none<Response>();
      }
      if (SelectionKeys.isNavigation(keycode)) {
        return KeySelection.sync(container, isRoot, start, soffset, finish, foffset, annotations.selectRange);
      } else {
        return Optional.none<Response>();
      }
    }, Optional.none);
  };

  return {
    keydown,
    keyup
  };
};

const external = (win: Window, container: SugarElement, isRoot: (e: SugarElement) => boolean, annotations: SelectionAnnotation) => {
  const bridge = WindowBridge(win);

  return (start: SugarElement, finish: SugarElement) => {
    annotations.clearBeforeUpdate(container);
    CellSelection.identify(start, finish, isRoot).each(function (cellSel) {
      const boxes = cellSel.boxes.getOr([]);
      annotations.selectRange(container, boxes, cellSel.start, cellSel.finish);

      // stop the browser from creating a big text selection, place the selection at the end of the cell where the cursor is
      bridge.selectContents(finish);
      bridge.collapseSelection();
    });
  };
};

export {
  mouse,
  keyboard,
  external
};
