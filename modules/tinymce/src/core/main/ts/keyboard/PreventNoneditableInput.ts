import { Arr } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as EditableRange from '../selection/EditableRange';

const isValidContainer = (root: Element, container: Node) => root === container || root.contains(container);

const isInEditableRange = (editor: Editor, range: StaticRange) => {
  // If the range is not in the body then it's in a shadow root and we should allow that more details in: TINY-11446
  if (!isValidContainer(editor.getBody(), range.startContainer) || !isValidContainer(editor.getBody(), range.endContainer)) {
    return true;
  }

  return EditableRange.isEditableRange(editor.dom, range);
};

export const setup = (editor: Editor): void => {
  editor.on('beforeinput', (e) => {
    // Normally input is blocked on non-editable elements that have contenteditable="false" however we are also treating
    // SVG elements as non-editable and deleting inside or into is possible in some browsers so we need to detect that and prevent that.
    if (!editor.selection.isEditable() || Arr.exists(e.getTargetRanges(), (rng) => !isInEditableRange(editor, rng))) {
      e.preventDefault();
    }
  });
};
