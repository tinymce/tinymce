/**
 * CellSelection.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { InputHandlers, SelectionAnnotation, SelectionKeys } from '@ephox/darwin';
import { Fun, Option, Struct } from '@ephox/katamari';
import { TableLookup } from '@ephox/snooker';
import {
    Element, Selection, SelectionDirection, Class
} from '@ephox/sugar';

import * as Util from '../alien/Util';
import Direction from '../queries/Direction';
import Ephemera from './Ephemera';
import { DomParent } from '@ephox/robin';

const hasInternalTarget = (e: Event) => {
  return Class.has(Element.fromDom(e.target as HTMLElement), 'ephox-snooker-resizer-bar') === false;
};
import { KeyboardEvent, MouseEvent, Event, HTMLElement } from '@ephox/dom-globals';

export default function (editor, lazyResize) {
  const handlerStruct = Struct.immutableBag(['mousedown', 'mouseover', 'mouseup', 'keyup', 'keydown'], []);
  let handlers = Option.none();

  const annotations = SelectionAnnotation.byAttr(Ephemera);

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
    const hasShiftKey = (event) => event.raw().shiftKey === true;

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
      const wrappedEvent = wrapEvent(event);
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
      const wrappedEvent = wrapEvent(event);
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

    const isMouseEvent = (event: any): event is MouseEvent => event.hasOwnProperty('x') && event.hasOwnProperty('y');

    const wrapEvent = function (event: MouseEvent | KeyboardEvent) {
      // IE9 minimum
      const target = Element.fromDom(event.target as HTMLElement);

      const stop = function () {
        event.stopPropagation();
      };

      const prevent = function () {
        event.preventDefault();
      };

      const kill = Fun.compose(prevent, stop); // more of a sequence than a compose, but same effect

      // FIX: Don't just expose the raw event. Need to identify what needs standardisation.
      return {
        target:  Fun.constant(target),
        x:       Fun.constant(isMouseEvent(event) ? event.x : null),
        y:       Fun.constant(isMouseEvent(event) ? event.y : null),
        stop,
        prevent,
        kill,
        raw:     Fun.constant(event)
      };
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

      // use bitwise & for optimal comparison
      return (raw.buttons & 1) !== 0;
    };

    const mouseDown = function (e: MouseEvent) {
      if (isLeftMouse(e) && hasInternalTarget(e)) {
        mouseHandlers.mousedown(wrapEvent(e));
      }
    };
    const mouseOver = function (e: MouseEvent) {
      if (isLeftButtonPressed(e) && hasInternalTarget(e)) {
        mouseHandlers.mouseover(wrapEvent(e));
      }
    };
    const mouseUp = function (e: MouseEvent) {
      if (isLeftMouse(e) && hasInternalTarget(e)) {
        mouseHandlers.mouseup(wrapEvent(e));
      }
    };

    editor.on('mousedown', mouseDown);
    editor.on('mouseover', mouseOver);
    editor.on('mouseup', mouseUp);
    editor.on('keyup', keyup);
    editor.on('keydown', keydown);
    editor.on('nodechange', syncSelection);

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