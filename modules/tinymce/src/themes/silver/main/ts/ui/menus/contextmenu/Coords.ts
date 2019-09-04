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
import { HTMLElement, PointerEvent } from '@ephox/dom-globals';

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

const fromPageXY = function (e: PointerEvent) {
  return nu(e.pageX, e.pageY);
};

const fromClientXY = function (e: PointerEvent) {
  return nu(e.clientX, e.clientY);
};

const transposeContentAreaContainer = function (element: HTMLElement, pos: Position) {
  const containerPos = DOMUtils.DOM.getPos(element);
  return transpose(pos, containerPos.x, containerPos.y);
};

export const getPointAnchor = function (editor: Editor, e: PointerEvent) {
  // If the contextmenu event is fired via the editor.fire() API or some other means, fall back to selection anchor
  if (e.type === 'contextmenu') {
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

export const getNodeAnchor = (editor: Editor): NodeAnchorSpec => {
  return {
    anchor: 'node',
    node: Option.some(Element.fromDom(editor.selection.getNode())),
    root: Element.fromDom(editor.getBody())
  };
};
