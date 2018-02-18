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
    Attr, Compare, Element, Node, Selection, SelectionDirection, Text, Traverse
} from '@ephox/sugar';

import Util from '../alien/Util';
import Direction from '../queries/Direction';
import Ephemera from './Ephemera';
import { getForcedRootBlock, getForcedRootBlockAttrs } from '../api/Settings';

export default function (editor, lazyResize) {
  const handlerStruct = Struct.immutableBag(['mousedown', 'mouseover', 'mouseup', 'keyup', 'keydown'], []);
  let handlers = Option.none();

  const annotations = SelectionAnnotation.byAttr(Ephemera);

  editor.on('init', function (e) {
    const win = editor.getWin();
    const body = Util.getBody(editor);
    const isRoot = Util.getIsRoot(editor);

    const syncSelection = function () {
      const sel = editor.selection;
      const start = Element.fromDom(sel.getStart());
      const end = Element.fromDom(sel.getEnd());
      const startTable = TableLookup.table(start);
      const endTable = TableLookup.table(end);
      const sameTable = startTable.bind(function (tableStart) {
        return endTable.bind(function (tableEnd) {
          return Compare.eq(tableStart, tableEnd) ? Option.some(true) : Option.none();
        });
      });
      sameTable.fold(function () {
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

    const checkLast = function (last) {
      return !Attr.has(last, 'data-mce-bogus') && Node.name(last) !== 'br' && !(Node.isText(last) && Text.get(last).length === 0);
    };

    const getLast = function () {
      const body = Element.fromDom(editor.getBody());

      const lastChild = Traverse.lastChild(body);

      const getPrevLast = function (last) {
        return Traverse.prevSibling(last).bind(function (prevLast) {
          return checkLast(prevLast) ? Option.some(prevLast) : getPrevLast(prevLast);
        });
      };

      return lastChild.bind(function (last) {
        return checkLast(last) ? Option.some(last) : getPrevLast(last);
      });
    };

    const keydown = function (event) {
      const wrappedEvent = wrapEvent(event);
      lazyResize().each(function (resize) {
        resize.hideBars();
      });

      if (event.which === 40) {
        getLast().each(function (last) {
          if (Node.name(last) === 'table') {
            if (getForcedRootBlock(editor)) {
              editor.dom.add(
                editor.getBody(),
                getForcedRootBlock(editor),
                getForcedRootBlockAttrs(editor),
                '<br/>'
              );
            } else {
              editor.dom.add(editor.getBody(), 'br');
            }
          }
        });
      }

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

    const wrapEvent = function (event) {
      // IE9 minimum
      const target = Element.fromDom(event.target);

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
        x:       Fun.constant(event.x),
        y:       Fun.constant(event.y),
        stop,
        prevent,
        kill,
        raw:     Fun.constant(event)
      };
    };

    const isLeftMouse = function (raw) {
      return raw.button === 0;
    };

    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
    const isLeftButtonPressed = function (raw) {
      // Only added by Chrome/Firefox in June 2015.
      // This is only to fix a 1px bug (TBIO-2836) so return true if we're on an older browser
      if (raw.buttons === undefined) {
        return true;
      }

      // use bitwise & for optimal comparison
      return (raw.buttons & 1) !== 0;
    };

    const mouseDown = function (e) {
      if (isLeftMouse(e)) {
        mouseHandlers.mousedown(wrapEvent(e));
      }
    };
    const mouseOver = function (e) {
      if (isLeftButtonPressed(e)) {
        mouseHandlers.mouseover(wrapEvent(e));
      }
    };
    const mouseUp = function (e) {
      if (isLeftMouse) {
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