import { AnchorSpec, MakeshiftAnchorSpec, NodeAnchorSpec, SelectionAnchorSpec } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';

export type AnchorType = 'node' | 'selection' | 'point';

interface Position {
  readonly x: number;
  readonly y: number;
}

const nu = (x: number, y: number): MakeshiftAnchorSpec => ({
  type: 'makeshift',
  x,
  y
});

const transpose = (pos: Position, dx: number, dy: number) => {
  return nu(pos.x + dx, pos.y + dy);
};

const isTouchEvent = (e: MouseEvent | TouchEvent): e is TouchEvent => e.type === 'longpress' || e.type.indexOf('touch') === 0;

const fromPageXY = (e: MouseEvent | TouchEvent) => {
  if (isTouchEvent(e)) {
    const touch = e.touches[0];
    return nu(touch.pageX, touch.pageY);
  } else {
    return nu(e.pageX, e.pageY);
  }
};

const fromClientXY = (e: MouseEvent | TouchEvent) => {
  if (isTouchEvent(e)) {
    const touch = e.touches[0];
    return nu(touch.clientX, touch.clientY);
  } else {
    return nu(e.clientX, e.clientY);
  }
};

const transposeContentAreaContainer = (element: HTMLElement, pos: Position) => {
  const containerPos = DOMUtils.DOM.getPos(element);
  return transpose(pos, containerPos.x, containerPos.y);
};

export const getPointAnchor = (editor: Editor, e: MouseEvent | TouchEvent): MakeshiftAnchorSpec | SelectionAnchorSpec => {
  // If the contextmenu event is fired via the editor.dispatch() API or some other means, fall back to selection anchor
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

export const getSelectionAnchor = (editor: Editor): SelectionAnchorSpec => {
  return {
    type: 'selection',
    root: SugarElement.fromDom(editor.selection.getNode())
  };
};

export const getNodeAnchor = (editor: Editor): NodeAnchorSpec => ({
  type: 'node',
  node: Optional.some(SugarElement.fromDom(editor.selection.getNode())),
  root: SugarElement.fromDom(editor.getBody())
});

export const getAnchorSpec = (editor: Editor, e: MouseEvent | TouchEvent, anchorType: AnchorType): AnchorSpec => {
  switch (anchorType) {
    case 'node':
      return getNodeAnchor(editor);
    case 'point':
      return getPointAnchor(editor, e);
    case 'selection':
      return getSelectionAnchor(editor);
  }
};
