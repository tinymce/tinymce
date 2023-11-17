import { Arr } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as EditableRange from '../selection/EditableRange';

export const setup = (editor: Editor): void => {
  editor.on('beforeinput', (e) => {
    // Normally input is blocked on non-editable elements that have contenteditable="false" however we are also treating
    // SVG elements as non-editable and deleting inside or into is possible in some browsers so we need to detect that and prevent that.
    if (!editor.selection.isEditable() || Arr.exists(e.getTargetRanges(), (rng) => !EditableRange.isEditableRange(editor.dom, rng))) {
      e.preventDefault();
    }
  });
};
