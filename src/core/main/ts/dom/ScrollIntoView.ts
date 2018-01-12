/**
 * ScrollIntoView.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import NodeType from './NodeType';

const getPos = function (elm) {
  let x = 0, y = 0;

  let offsetParent = elm;
  while (offsetParent && offsetParent.nodeType) {
    x += offsetParent.offsetLeft || 0;
    y += offsetParent.offsetTop || 0;
    offsetParent = offsetParent.offsetParent;
  }

  return { x, y };
};

const fireScrollIntoViewEvent = function (editor, elm, alignToTop) {
  const scrollEvent: any = { elm, alignToTop };
  editor.fire('scrollIntoView', scrollEvent);
  return scrollEvent.isDefaultPrevented();
};

const scrollIntoView = function (editor, elm, alignToTop) {
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

export default {
  scrollIntoView
};