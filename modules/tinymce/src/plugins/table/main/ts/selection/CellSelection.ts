/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { InputHandlers, Response, SelectionAnnotation, SelectionKeys } from '@ephox/darwin';
import { Cell, Fun, Optional } from '@ephox/katamari';
import { DomParent } from '@ephox/robin';
import { OtherCells, TableFill, TableLookup, TableResize } from '@ephox/snooker';
import { Class, Compare, DomEvent, EventArgs, SelectionDirection, SimSelection, SugarElement, SugarNode, Direction } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import * as Events from '../api/Events';
import { getCloneElements } from '../api/Settings';
import * as Util from '../core/Util';
import { ephemera } from './Ephemera';
import { SelectionTargets } from './SelectionTargets';

const hasInternalTarget = (e: Event) => Class.has(SugarElement.fromDom(e.target as HTMLElement), 'ephox-snooker-resizer-bar') === false;

export interface CellSelectionApi {
  clear: (container: SugarElement) => void;
}

export default function (editor: Editor, lazyResize: () => Optional<TableResize>, selectionTargets: SelectionTargets): CellSelectionApi {
  const onSelection = (cells: SugarElement[], start: SugarElement, finish: SugarElement) => {
    selectionTargets.targets().each((targets) => {
      const tableOpt = TableLookup.table(start);
      tableOpt.each((table) => {
        const cloneFormats = getCloneElements(editor);
        const generators = TableFill.cellOperations(Fun.noop, SugarElement.fromDom(editor.getDoc()), cloneFormats);
        const otherCells = OtherCells.getOtherCells(table, targets, generators);
        Events.fireTableSelectionChange(editor, cells, start, finish, otherCells);
      });
    });
  };

  const onClear = () => Events.fireTableSelectionClear(editor);

  const annotations = SelectionAnnotation.byAttr(ephemera, onSelection, onClear);

  editor.on('init', (_e) => {
    const win = editor.getWin();
    const body = Util.getBody(editor);
    const isRoot = Util.getIsRoot(editor);

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
    const hasShiftKey = (event) => event.raw.shiftKey === true;

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
      lazyResize().each((resize) => resize.hideBars());

      const rng = editor.selection.getRng();
      const start = SugarElement.fromDom(rng.startContainer);
      const end = SugarElement.fromDom(rng.endContainer);
      const direction = Direction.onDirection(SelectionKeys.ltr, SelectionKeys.rtl)(SugarElement.fromDom(editor.selection.getStart()));
      keyHandlers.keydown(wrappedEvent, start, rng.startOffset, end, rng.endOffset, direction).each((response) => {
        handleResponse(wrappedEvent, response);
      });
      lazyResize().each((resize) => resize.showBars());
    };

    const isLeftMouse = (raw: MouseEvent) => raw.button === 0;

    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
    const isLeftButtonPressed = (raw: MouseEvent) => {
      // Only added by Chrome/Firefox in June 2015.
      // This is only to fix a 1px bug (TBIO-2836) so return true if we're on an older browser
      if (raw.buttons === undefined) {
        return true;
      }

      // Edge 44+ broke the "buttons" property so that it now returns 0 always on mouseover
      // so we can't detect if the left mouse button is down. The deprecated "which" property
      // also can't be used as it returns 1 at all times, as such just return true.
      if (Env.browser.isEdge() && raw.buttons === 0) {
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
        if (SugarNode.name(target) === 'td' || SugarNode.name(target) === 'th') {
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

  return {
    clear: annotations.clear
  };
}
