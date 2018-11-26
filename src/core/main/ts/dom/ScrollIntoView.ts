/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import NodeType from './NodeType';
import { Editor } from 'tinymce/core/api/Editor';
import { getOverflow } from 'tinymce/core/geom/ClientRect';
import { CaretPosition } from 'tinymce/core/caret/CaretPosition';
import { Arr } from '@ephox/katamari';
import { HTMLElement, Element, Range } from '@ephox/dom-globals';

const getPos = function (elm: HTMLElement) {
  let x = 0, y = 0;

  let offsetParent = elm;
  while (offsetParent && offsetParent.nodeType) {
    x += offsetParent.offsetLeft || 0;
    y += offsetParent.offsetTop || 0;
    offsetParent = offsetParent.offsetParent as HTMLElement;
  }

  return { x, y };
};

const fireScrollIntoViewEvent = function (editor: Editor, elm: Element, alignToTop: boolean) {
  const scrollEvent: any = { elm, alignToTop };
  editor.fire('scrollIntoView', scrollEvent);
  return scrollEvent.isDefaultPrevented();
};

const scrollElementIntoView = function (editor: Editor, elm: HTMLElement, alignToTop: boolean) {
  let y, viewPort;
  const dom = editor.dom;
  const root = dom.getRoot();
  let viewPortY, viewPortH, offsetY = 0;

  if (fireScrollIntoViewEvent(editor, elm, alignToTop)) {
    return;
  }

  if (!NodeType.isElement(elm)) {
    return;
  }

  if (alignToTop === false) {
    offsetY = elm.offsetHeight;
  }

  if (root.nodeName !== 'BODY') {
    const scrollContainer = editor.selection.getScrollContainer();
    if (scrollContainer) {
      y = getPos(elm).y - getPos(scrollContainer).y + offsetY;
      viewPortH = scrollContainer.clientHeight;
      viewPortY = scrollContainer.scrollTop;
      if (y < viewPortY || y + 25 > viewPortY + viewPortH) {
        scrollContainer.scrollTop = y < viewPortY ? y : y - viewPortH + 25;
      }

      return;
    }
  }

  viewPort = dom.getViewPort(editor.getWin());
  y = dom.getPos(elm).y + offsetY;
  viewPortY = viewPort.y;
  viewPortH = viewPort.h;
  if (y < viewPort.y || y + 25 > viewPortY + viewPortH) {
    editor.getWin().scrollTo(0, y < viewPortY ? y : y - viewPortH + 25);
  }
};

const getViewPortRect = (editor: Editor) => {
  if (editor.inline) {
    return editor.getBody().getBoundingClientRect();
  } else {
    const win = editor.getWin();

    return {
      left: 0,
      right: win.innerWidth,
      top: 0,
      bottom: win.innerHeight,
      width: win.innerWidth,
      height: win.innerHeight
    };
  }
};

const scrollBy = (editor: Editor, dx: number, dy: number) => {
  if (editor.inline) {
    editor.getBody().scrollLeft += dx;
    editor.getBody().scrollTop += dy;
  } else {
    editor.getWin().scrollBy(dx, dy);
  }
};

const scrollRangeIntoView = (editor: Editor, rng: Range) => {
  Arr.head(CaretPosition.fromRangeStart(rng).getClientRects()).each((rngRect) => {
    const bodyRect = getViewPortRect(editor);
    const overflow = getOverflow(bodyRect, rngRect);
    const margin = 4;
    const dx = overflow.x > 0 ? overflow.x + margin : overflow.x - margin;
    const dy = overflow.y > 0 ? overflow.y + margin : overflow.y - margin;

    scrollBy(editor, overflow.x !== 0 ? dx : 0, overflow.y !== 0 ? dy : 0);
  });
};

export default {
  scrollElementIntoView,
  scrollRangeIntoView
};