import { Arr, Fun, Optional } from '@ephox/katamari';
import { ContentEditable, EventArgs, PredicateFind, Situ, SugarElement, SugarNode } from '@ephox/sugar';

import * as KeySelection from '../keyboard/KeySelection';
import * as VerticalMovement from '../keyboard/VerticalMovement';
import { MouseSelection } from '../mouse/MouseSelection';
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

export type MouseHandler = MouseSelection;
export type ExternalHandler = (start: SugarElement<HTMLTableCellElement>, finish: SugarElement<HTMLTableCellElement>) => void;

export interface KeyboardHandler {
  readonly keydown: (event: EventArgs<KeyboardEvent>, start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number, direction: typeof SelectionKeys.ltr) => Optional<Response>;
  readonly keyup: (event: EventArgs<KeyboardEvent>, start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number) => Optional<Response>;
}

const rc = (rows: number, cols: number): RC => ({ rows, cols });

const mouse = (win: Window, container: SugarElement<Node>, isRoot: (e: SugarElement<Node>) => boolean, annotations: SelectionAnnotation): MouseHandler => {
  const bridge = WindowBridge(win);

  const handlers = MouseSelection(bridge, container, isRoot, annotations);

  return {
    clearstate: handlers.clearstate,
    mousedown: handlers.mousedown,
    mouseover: handlers.mouseover,
    mouseup: handlers.mouseup
  };
};

const isEditableNode = (node: SugarElement<Node>) => PredicateFind.closest(node, SugarNode.isHTMLElement).exists(ContentEditable.isEditable);
const isEditableSelection = (start: SugarElement<Node>, finish: SugarElement<Node>) => isEditableNode(start) || isEditableNode(finish);

const keyboard = (win: Window, container: SugarElement<Node>, isRoot: (e: SugarElement<Node>) => boolean, annotations: SelectionAnnotation): KeyboardHandler => {
  const bridge = WindowBridge(win);

  const clearToNavigate = () => {
    annotations.clear(container);
    return Optional.none<Response>();
  };

  const keydown = (event: EventArgs<KeyboardEvent>, start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number, direction: typeof SelectionKeys.ltr) => {
    const realEvent = event.raw;
    const keycode = realEvent.which;
    const shiftKey = realEvent.shiftKey === true;

    const handler = CellSelection.retrieve<HTMLTableCellElement>(container, annotations.selectedSelector).fold(() => {
      // Make sure any possible lingering annotations are cleared
      if (SelectionKeys.isNavigation(keycode) && !shiftKey) {
        annotations.clearBeforeUpdate(container);
      }

      // Shift down should predict the movement and set the selection.
      if (SelectionKeys.isNavigation(keycode) && shiftKey && !isEditableSelection(start, finish)) {
        return Optional.none;
      } else if (SelectionKeys.isDown(keycode) && shiftKey) {
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
    }, (selected) => {

      const update = (attempts: RC[]) => {
        return () => {
          const navigation = Arr.findMap(attempts, (delta) => {
            return KeySelection.update(delta.rows, delta.cols, container, selected, annotations);
          });

          // Shift the selected rows and update the selection.
          return navigation.fold(() => {
            // The cell selection went outside the table, so clear it and bridge from the first box to before/after
            // the table
            return CellSelection.getEdges(container, annotations.firstSelectedSelector, annotations.lastSelectedSelector).map((edges) => {
              const relative = SelectionKeys.isDown(keycode) || direction.isForward(keycode) ? Situ.after : Situ.before;
              bridge.setRelativeSelection(Situ.on(edges.first, 0), relative(edges.table));
              annotations.clear(container);
              return Response.create(Optional.none(), true);
            });
          }, (_) => {
            return Optional.some(Response.create(Optional.none(), true));
          });
        };
      };

      if (SelectionKeys.isNavigation(keycode) && shiftKey && !isEditableSelection(start, finish)) {
        return Optional.none;
      } else if (SelectionKeys.isDown(keycode) && shiftKey) {
        return update([ rc(+1, 0) ]);
      } else if (SelectionKeys.isUp(keycode) && shiftKey) {
        return update([ rc(-1, 0) ]);
      } else if (direction.isBackward(keycode) && shiftKey) { // Left and right should try up/down respectively if they fail.
        return update([ rc(0, -1), rc(-1, 0) ]);
      } else if (direction.isForward(keycode) && shiftKey) {
        return update([ rc(0, +1), rc(+1, 0) ]);
      } else if (SelectionKeys.isNavigation(keycode) && !shiftKey) { // Clear the selection on normal arrow keys.
        return clearToNavigate;
      } else {
        return Optional.none;
      }
    });

    return handler();
  };

  const keyup = (event: EventArgs<KeyboardEvent>, start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number) => {
    return CellSelection.retrieve(container, annotations.selectedSelector).fold<Optional<Response>>(() => {
      const realEvent = event.raw;
      const keycode = realEvent.which;
      const shiftKey = realEvent.shiftKey === true;
      if (!shiftKey) {
        return Optional.none<Response>();
      }
      if (SelectionKeys.isNavigation(keycode) && isEditableSelection(start, finish)) {
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

const external = (win: Window, container: SugarElement<Node>, isRoot: (e: SugarElement<Node>) => boolean, annotations: SelectionAnnotation): ExternalHandler => {
  const bridge = WindowBridge(win);

  return (start: SugarElement<HTMLTableCellElement>, finish: SugarElement<HTMLTableCellElement>) => {
    annotations.clearBeforeUpdate(container);
    CellSelection.identify(start, finish, isRoot).each((cellSel) => {
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
