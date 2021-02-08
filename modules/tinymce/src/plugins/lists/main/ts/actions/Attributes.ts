/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Obj } from '@ephox/katamari';
import { getParentList } from '../core/Selection';

export const setParentListAttributes = (editor, attrs) => {
  const parentList = getParentList(editor);
  editor.undoManager.transact(() =>
    Obj.each(attrs, (v, k) => editor.dom.setAttrib(parentList, k, v))
  );
};
