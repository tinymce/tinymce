/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { Element } from '@ephox/sugar';

const removePxSuffix = (size: string) => size ? size.replace(/px$/, '') : '';

const addSizeSuffix = (size: string) => {
  if (/^[0-9]+$/.test(size)) {
    size += 'px';
  }
  return size;
};

const getBody = (editor: Editor) => Element.fromDom(editor.getBody());
const getSelectionStart = (editor) => Element.fromDom(editor.selection.getStart());
const getThunkedSelectionStart = (editor) => () => Element.fromDom(editor.selection.getStart());

export { addSizeSuffix, removePxSuffix, getBody, getSelectionStart, getThunkedSelectionStart };
