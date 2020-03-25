/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { InputHandlers, SelectionAnnotation, SelectionKeys } from '@ephox/darwin';
import { Event, HTMLElement, KeyboardEvent, MouseEvent, Node as HtmlNode, TouchEvent } from '@ephox/dom-globals';
import { Cell, Fun, Option, Struct } from '@ephox/katamari';
import { DomParent } from '@ephox/robin';
import { OtherCells, TableFill, TableLookup, TableResize } from '@ephox/snooker';
import { Class, Compare, DomEvent, Element, Node, Selection, SelectionDirection } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import * as Util from '../alien/Util';
import * as Events from '../api/Events';

import { getCloneElements } from '../api/Settings';
import Direction from '../queries/Direction';
import Ephemera from './Ephemera';
import { SelectionTargets } from './SelectionTargets';

const hasInternalTarget = (e: Event) => {
  return Class.has(Element.fromDom(e.target as HTMLElement), 'ephox-snooker-resizer-bar') === false;
};

export default function (editor: Editor, lazyResize: () => Option<TableResize>, selectionTargets: SelectionTargets) {
  const handlerStruct = Struct.immutableBag(['mousedown', 'mouseover', 'mouseup', 'keyup', 'keydown'], []);
  let handlers = Option.none();

  const cloneFormats = getCloneElements(editor);

  const onSelection = (cells: Element[], start: Element, finish: Element) => {
    selectionTargets.targets().each((targets) => {
      const tableOpt = TableLookup.table(start);
      tableOpt.each((table) => {
        const doc = Element.fromDom(editor.getDoc());
        const generators = TableFill.cellOperations(Fun.noop, doc, cloneFormats);
        const otherCells = OtherCells.getOtherCells(table, targets, generators);
        Events.fireTableSelectionChange(editor, cells, start, finish, otherCells);
      });
    });
  };

  const onClear = () => {
    Events.fireTableSelectionClear(editor);
  };

  const annotations = SelectionAnnotation.byAttr(Ephemera, onSelection, onClear);

  editor.on('init', function (e) {
    const win = editor.getWin();
    const body = Util.getBody(editor);
    const isRoot = Util.getIsRoot(editor);

    // When the selection changes through either the mouse or keyboard, and the selection is no longer within the table.
    // Remove the selection.
    const syncSelection = function () {
      const sel = editor.selection;
      const start = Element.fromDom(sel.getStart());
      const end = Element.fromDom(sel.getEnd());
      const shared = DomParent.sharedOne(TableLookup.table, [start, end]);
      shared.fold(function () {
        annotations.clear(body);
      }, Fun.noop);
    };

    const mouseHandlers = InputHandlers.mouse(win, body, isRoot, annotations);
    const keyHandlers = InputHandlers.keyboard(win, body, isRoot, annotations);
    const external = InputHandlers.external(win, body, isRoot, annotations);
    const hasShiftKey = (event) => event.raw().shiftKey === true;

    editor.on('TableSelectorChange', (e) => {
      external(e.start, e.finish);
    });

    const handleResponse = function (event, response) {
      // Only handle shift key non shiftkey cell navigation is handled by core
      if (!hasShiftKey(event)) {
        return;
      }

      if (response.kill()) {
        event.kill();
      }
      response.selection().each(function (ns) {
        const relative = Selection.relative(ns.start(), ns.finish());
        const rng = SelectionDirection.asLtrRange(win, relative);
        editor.selection.setRng(rng);
      });
    };

    const keyup = function (event) {
      const wrappedEvent = DomEvent.fromRawEvent(event);
      // Note, this is an optimisation.
      if (wrappedEvent.raw().shiftKey && SelectionKeys.isNavigation(wrappedEvent.raw().which)) {
        const rng = editor.selection.getRng();
        const start = Element.fromDom(rng.startContainer);
        const end = Element.fromDom(rng.endContainer);
        keyHandlers.keyup(wrappedEvent, start, rng.startOffset, end, rng.endOffset).each(function (response) {
          handleResponse(wrappedEvent, response);
        });
      }
    };

    const keydown = function (event: KeyboardEvent) {
      const wrappedEvent = DomEvent.fromRawEvent(event);
      lazyResize().each(function (resize) {
        resize.hideBars();
      });

      const rng = editor.selection.getRng();
      const startContainer = Element.fromDom(editor.selection.getStart());
      const start = Element.fromDom(rng.startContainer);
      const end = Element.fromDom(rng.endContainer);
      const direction = Direction.directionAt(startContainer).isRtl() ? SelectionKeys.rtl : SelectionKeys.ltr;
      keyHandlers.keydown(wrappedEvent, start, rng.startOffset, end, rng.endOffset, direction).each(function (response) {
        handleResponse(wrappedEvent, response);
      });
      lazyResize().each(function (resize) {
        resize.showBars();
      });
    };

    const isLeftMouse = function (raw: MouseEvent) {
      return raw.button === 0;
    };

    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
    const isLeftButtonPressed = function (raw: MouseEvent) {
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
      return (raw.buttons & 1) !== 0;
    };

    const mouseDown = function (e: MouseEvent) {
      if (isLeftMouse(e) && hasInternalTarget(e)) {
        mouseHandlers.mousedown(DomEvent.fromRawEvent(e));
      }
    };
    const mouseOver = function (e: MouseEvent) {
      if (isLeftButtonPressed(e) && hasInternalTarget(e)) {
        mouseHandlers.mouseover(DomEvent.fromRawEvent(e));
      }
    };
    const mouseUp = function (e: MouseEvent) {
      if (isLeftMouse(e) && hasInternalTarget(e)) {
        mouseHandlers.mouseup(DomEvent.fromRawEvent(e));
      }
    };

    const getDoubleTap = () => {
      const lastTarget = Cell<Element>(Element.fromDom(body as any));
      const lastTimeStamp = Cell<number>(0);

      const touchEnd = (t: TouchEvent) => {
        const target = Element.fromDom(<HtmlNode> t.target);
        if (Node.name(target) === 'td' || Node.name(target) === 'th') {
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

    editor.on('mousedown', mouseDown);
    editor.on('mouseover', mouseOver);
    editor.on('mouseup', mouseUp);
    editor.on('touchend', doubleTap.touchEnd);
    editor.on('keyup', keyup);
    editor.on('keydown', keydown);
    editor.on('NodeChange', syncSelection);

    handlers = Option.some(handlerStruct({
      mousedown: mouseDown,
      mouseover: mouseOver,
      mouseup: mouseUp,
      keyup,
      keydown
    }));
  });

  const destroy = function () {
    handlers.each(function (handlers) {
      // editor.off('mousedown', handlers.mousedown());
      // editor.off('mouseover', handlers.mouseover());
      // editor.off('mouseup', handlers.mouseup());
      // editor.off('keyup', handlers.keyup());
      // editor.off('keydown', handlers.keydown());
    });
  };

  return {
    clear: annotations.clear,
    destroy
  };
}
