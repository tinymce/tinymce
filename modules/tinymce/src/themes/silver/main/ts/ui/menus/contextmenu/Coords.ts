/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { NodeAnchorSpec, MakeshiftAnchorSpec, SelectionAnchorSpec } from '@ephox/alloy';
import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import { HTMLElement, MouseEvent, TouchEvent } from '@ephox/dom-globals';

type Position = {
  x: number;
  y: number;
};

const nu = function (x: number, y: number): MakeshiftAnchorSpec {
  return {
    anchor: 'makeshift',
    x,
    y
  };
};

const transpose = function (pos: Position, dx: number, dy: number) {
  return nu(pos.x + dx, pos.y + dy);
};

const isTouchEvent = (e: MouseEvent | TouchEvent): e is TouchEvent => e.type === 'longpress' || e.type.indexOf('touch') === 0;

const fromPageXY = function (e: MouseEvent | TouchEvent) {
  if (isTouchEvent(e)) {
    const touch = e.touches[0];
    return nu(touch.pageX, touch.pageY);
  } else {
    return nu(e.pageX, e.pageY);
  }
};

const fromClientXY = function (e: MouseEvent | TouchEvent) {
  if (isTouchEvent(e)) {
    const touch = e.touches[0];
    return nu(touch.clientX, touch.clientY);
  } else {
    return nu(e.clientX, e.clientY);
  }
};

const transposeContentAreaContainer = function (element: HTMLElement, pos: Position) {
  const containerPos = DOMUtils.DOM.getPos(element);
  return transpose(pos, containerPos.x, containerPos.y);
};

export const getPointAnchor = function (editor: Editor, e: MouseEvent | TouchEvent) {
  // If the contextmenu event is fired via the editor.fire() API or some other means, fall back to selection anchor
  if (e.type === 'contextmenu' || e.type === 'longpress') {
    if (editor.inline) {
      return fromPageXY(e);
    } else {
      return transposeContentAreaContainer(editor.getContentAreaContainer(), fromClientXY(e));
    }
  } else {
    return getSelectionAnchor(editor);
  }
};

export const getSelectionAnchor = function (editor: Editor): SelectionAnchorSpec {
  return {
    anchor: 'selection',
    root: Element.fromDom(editor.selection.getNode())
  };
};

export const getNodeAnchor = (editor: Editor): NodeAnchorSpec => ({
  anchor: 'node',
  node: Option.some(Element.fromDom(editor.selection.getNode())),
  root: Element.fromDom(editor.getBody())
});
