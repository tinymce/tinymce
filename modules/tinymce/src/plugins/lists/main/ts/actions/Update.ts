/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Obj, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import { getParentList } from '../core/Selection';

interface ListUpdate {
  readonly attrs?: Record<string, string>;
  readonly styles?: Record<string, string>;
}

export const updateList = (editor: Editor, update: ListUpdate): void => {
  const parentList = getParentList(editor);
  editor.undoManager.transact(() => {
    if (Type.isObject(update.styles)) {
      editor.dom.setStyles(parentList, update.styles);
    }
    if (Type.isObject(update.attrs)) {
      Obj.each(update.attrs, (v, k) => editor.dom.setAttrib(parentList, k, v));
    }
  });
};
