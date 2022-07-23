import { InputHandlers, Response, SelectionAnnotation, SelectionKeys, Selections, SelectionTypes } from '@ephox/darwin';
import { Arr, Cell, Fun } from '@ephox/katamari';
import { DomParent } from '@ephox/robin';
import { OtherCells, TableFill, TableLookup } from '@ephox/snooker';
import { Class, Compare, DomEvent, EventArgs, SelectionDirection, SimSelection, SugarElement, SugarNode, Direction } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import * as Utils from '../core/TableUtils';
import { ephemera } from '../selection/Ephemera';
import { getCellsFromSelection } from '../selection/TableSelection';
import * as TableSelection from '../selection/TableSelection';
import * as Events from './Events';
import * as Options from './Options';
import { TableResizeHandler } from './TableResizeHandler';

export interface TableCellSelectionHandler {
  readonly getSelectedCells: () => HTMLTableCellElement[];
  readonly clearSelectedCells: (container: Node) => void;
}

const hasInternalTarget = (e: Event): boolean =>
  !Class.has(SugarElement.fromDom(e.target as Node), 'ephox-snooker-resizer-bar');

export const TableCellSelectionHandler = (editor: Editor, resizeHandler: TableResizeHandler): TableCellSelectionHandler => {
  const cellSelection = Selections(
    () => SugarElement.fromDom(editor.getBody()),
    () => TableSelection.getSelectionCell(Utils.getSelectionStart(editor), Utils.getIsRoot(editor)),
    ephemera.selectedSelector
  );

  const onSelection = (cells: SugarElement<HTMLTableCellElement>[], start: SugarElement<HTMLTableCellElement>, finish: SugarElement<HTMLTableCellElement>) => {
    const tableOpt = TableLookup.table(start);
    tableOpt.each((table) => {
      const cloneFormats = Options.getTableCloneElements(editor);
      const generators = TableFill.cellOperations(Fun.noop, SugarElement.fromDom(editor.getDoc()), cloneFormats);
      const selectedCells = getCellsFromSelection(editor);
      const otherCells = OtherCells.getOtherCells(table, { selection: selectedCells }, generators);
      Events.fireTableSelectionChange(editor, cells, start, finish, otherCells);
    });
  };

  const onClear = () => Events.fireTableSelectionClear(editor);

  const annotations = SelectionAnnotation.byAttr(ephemera, onSelection, onClear);

  editor.on('init', (_e) => {
    const win = editor.getWin();
    const body = Utils.getBody(editor);
    const isRoot = Utils.getIsRoot(editor);

    // When the selection changes through either the mouse or keyboard, and the selection is no longer within the table.
    // Remove the selection.
    const syncSelection = () => {
      const sel = editor.selection;
      const start = SugarElement.fromDom(sel.getStart());
      const end = SugarElement.fromDom(sel.getEnd());
      const shared = DomParent.sharedOne(TableLookup.table, [ start, end ]);
      shared.fold(() => annotations.clear(body), Fun.noop);
    };

    const mouseHandlers = InputHandlers.mouse(win, body, isRoot, annotations);
    const keyHandlers = InputHandlers.keyboard(win, body, isRoot, annotations);
    const external = InputHandlers.external(win, body, isRoot, annotations);
    const hasShiftKey = (event: EventArgs<KeyboardEvent>) => event.raw.shiftKey === true;

    editor.on('TableSelectorChange', (e) => external(e.start, e.finish));

    const handleResponse = (event: EventArgs<KeyboardEvent>, response: Response) => {
      // Only handle shift key non shiftkey cell navigation is handled by core
      if (!hasShiftKey(event)) {
        return;
      }

      if (response.kill) {
        event.kill();
      }
      response.selection.each((ns) => {
        const relative = SimSelection.relative(ns.start, ns.finish);
        const rng = SelectionDirection.asLtrRange(win, relative);
        editor.selection.setRng(rng);
      });
    };

    const keyup = (event: KeyboardEvent) => {
      const wrappedEvent = DomEvent.fromRawEvent(event);
      // Note, this is an optimisation.
      if (wrappedEvent.raw.shiftKey && SelectionKeys.isNavigation(wrappedEvent.raw.which)) {
        const rng = editor.selection.getRng();
        const start = SugarElement.fromDom(rng.startContainer);
        const end = SugarElement.fromDom(rng.endContainer);
        keyHandlers.keyup(wrappedEvent, start, rng.startOffset, end, rng.endOffset).each((response) => {
          handleResponse(wrappedEvent, response);
        });
      }
    };

    const keydown = (event: KeyboardEvent) => {
      const wrappedEvent = DomEvent.fromRawEvent(event);
      resizeHandler.hide();

      const rng = editor.selection.getRng();
      const start = SugarElement.fromDom(rng.startContainer);
      const end = SugarElement.fromDom(rng.endContainer);
      const direction = Direction.onDirection(SelectionKeys.ltr, SelectionKeys.rtl)(SugarElement.fromDom(editor.selection.getStart()));
      keyHandlers.keydown(wrappedEvent, start, rng.startOffset, end, rng.endOffset, direction).each((response) => {
        handleResponse(wrappedEvent, response);
      });

      resizeHandler.show();
    };

    const isLeftMouse = (raw: MouseEvent) => raw.button === 0;

    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
    const isLeftButtonPressed = (raw: MouseEvent) => {
      // Only added by Chrome/Firefox in June 2015.
      // This is only to fix a 1px bug (TBIO-2836) so return true if we're on an older browser
      if (raw.buttons === undefined) {
        return true;
      }

      // use bitwise & for optimal comparison
      // eslint-disable-next-line no-bitwise
      return (raw.buttons & 1) !== 0;
    };

    const dragStart = (_e: EditorEvent<DragEvent>) => {
      mouseHandlers.clearstate();
    };

    const mouseDown = (e: EditorEvent<MouseEvent>) => {
      if (isLeftMouse(e) && hasInternalTarget(e)) {
        mouseHandlers.mousedown(DomEvent.fromRawEvent(e));
      }
    };
    const mouseOver = (e: EditorEvent<MouseEvent>) => {
      if (isLeftButtonPressed(e) && hasInternalTarget(e)) {
        mouseHandlers.mouseover(DomEvent.fromRawEvent(e));
      }
    };
    const mouseUp = (e: EditorEvent<MouseEvent>) => {
      if (isLeftMouse(e) && hasInternalTarget(e)) {
        mouseHandlers.mouseup(DomEvent.fromRawEvent(e));
      }
    };

    const getDoubleTap = () => {
      const lastTarget = Cell<SugarElement>(SugarElement.fromDom(body as any));
      const lastTimeStamp = Cell<number>(0);

      const touchEnd = (t: TouchEvent) => {
        const target = SugarElement.fromDom(t.target as Node);
        if (SugarNode.isTag('td')(target) || SugarNode.isTag('th')(target)) {
          const lT = lastTarget.get();
          const lTS = lastTimeStamp.get();
          if (Compare.eq(lT, target) && (t.timeStamp - lTS) < 300) {
            t.preventDefault();
            external(target, target);
          }
        }
        lastTarget.set(target);
        lastTimeStamp.set(t.timeStamp);
      };
      return {
        touchEnd
      };
    };

    const doubleTap = getDoubleTap();

    editor.on('dragstart', dragStart);
    editor.on('mousedown', mouseDown);
    editor.on('mouseover', mouseOver);
    editor.on('mouseup', mouseUp);
    editor.on('touchend', doubleTap.touchEnd);
    editor.on('keyup', keyup);
    editor.on('keydown', keydown);
    editor.on('NodeChange', syncSelection);
  });

  editor.on('PreInit', () => {
    editor.serializer.addTempAttr(ephemera.firstSelected);
    editor.serializer.addTempAttr(ephemera.lastSelected);
  });

  const clearSelectedCells = (container: Node) =>
    annotations.clear(SugarElement.fromDom(container));

  const getSelectedCells = (): HTMLTableCellElement[] =>
    SelectionTypes.fold<HTMLTableCellElement[]>(cellSelection.get(),
      // No fake selected cells
      Fun.constant([]),
      // This path is taken whenever there is fake cell selection even for just a single selected cell
      (cells) => {
        return Arr.map(cells, (cell) => cell.dom);
      },
      // For this path, the start of the selection whether collapsed or ranged is within a table cell
      (cell) => [ cell.dom ]
    );

  return {
    getSelectedCells,
    clearSelectedCells
  };
};
