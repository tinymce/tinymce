import { MakeshiftAnchorSpec, SelectionAnchorSpec } from '@ephox/alloy';
import { Element } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import { Editor } from 'tinymce/core/api/Editor';

const nu = function (x, y): MakeshiftAnchorSpec {
  return {
    anchor: 'makeshift',
    x,
    y
  };
};

const transpose = function (pos, dx, dy) {
  return nu(pos.x + dx, pos.y + dy);
};

const fromPageXY = function (e) {
  return nu(e.pageX, e.pageY);
};

const fromClientXY = function (e) {
  return nu(e.clientX, e.clientY);
};

const transposeContentAreaContainer = function (element, pos) {
  const containerPos = DOMUtils.DOM.getPos(element);
  return transpose(pos, containerPos.x, containerPos.y);
};

export const getPointAnchor = function (editor: Editor, e) {
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