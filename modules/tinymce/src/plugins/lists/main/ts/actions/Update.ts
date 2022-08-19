import { Obj, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import { getParentList } from '../core/Selection';
import { isWithinNonEditableList } from '../core/Util';

interface ListUpdate {
  readonly attrs?: Record<string, string>;
  readonly styles?: Record<string, string>;
}

export const updateList = (editor: Editor, update: ListUpdate): void => {
  const parentList = getParentList(editor);
  if (parentList === null || isWithinNonEditableList(editor, parentList)) {
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
