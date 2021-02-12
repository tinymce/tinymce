/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Obj } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { getParentList } from '../core/Selection';

interface ListUpdate {
  attrs?: Record<string, string>;
  styles?: Record<string, string>;
}

export const updateList = (editor: Editor, update: ListUpdate) => {
  const parentList = getParentList(editor);
  editor.undoManager.transact(() => {
    if (update.styles) {
      editor.dom.setStyles(parentList, update.styles);
    }
    if (update.attrs) {
      Obj.each(update.attrs, (v, k) => editor.dom.setAttrib(parentList, k, v));
    }
  });
};
