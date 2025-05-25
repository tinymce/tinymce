import { Obj, Type } from '@ephox/katamari';

import Editor from '../../api/Editor';
import * as Selection from '../lists/Selection';
import * as Util from '../lists/Util';

interface ListUpdate {
  readonly attrs?: Record<string, string>;
  readonly styles?: Record<string, string>;
}

export const updateList = (editor: Editor, update: ListUpdate): void => {
  const parentList = Selection.getParentList(editor);
  if (parentList === null || Util.isWithinNonEditableList(editor, parentList)) {
    return;
  }

  editor.undoManager.transact(() => {
    if (Type.isObject(update.styles)) {
      editor.dom.setStyles(parentList, update.styles);
    }
    if (Type.isObject(update.attrs)) {
      Obj.each(update.attrs, (v, k) => editor.dom.setAttrib(parentList, k, v));
    }
  });
};
