import { Arr, Fun } from '@ephox/katamari';
import { ContentEditable, SugarElement, SugarNode, SugarShadowDom } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as EditableRange from '../selection/EditableRange';

export const setup = (editor: Editor): void => {
  editor.on('beforeinput', (e) => {
    // Normally input is blocked on non-editable elements that have contenteditable="false" however we are also treating
    // SVG elements as non-editable and deleting inside or into is possible in some browsers so we need to detect that and prevent that.
    if (!editor.selection.isEditable() || Arr.exists(e.getTargetRanges(), (range) => !isInEditableRange(range))) {
      e.preventDefault();
    }
  });

  const isInEditableRange = (range: StaticRange) => {
    if (EditableRange.isEditableRange(editor.dom, range)) {
      return true;
    }

    if (isInEditableHost(range.startContainer)) {
      return true;
    }

    if (!range.collapsed) {
      return isInEditableHost(range.endContainer);
    }

    return false;
  };
};

const isInEditableHost = (node: Node) => {
  const sugar = SugarElement.fromDom(node);
  return SugarShadowDom.isInShadowRoot(sugar) && isInEditable(sugar);
};

const isInEditable = (node: SugarElement<Node>) =>
  SugarShadowDom.getShadowRoot(node).map(SugarShadowDom.getShadowHost).fold(
    Fun.never,
    (value) => SugarNode.isHTMLElement(value) && !ContentEditable.isEditable(value)
  );