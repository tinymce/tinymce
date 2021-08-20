/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

type UserChar = [ number, string ];

const getCharMap = (editor: Editor): UserChar[] | (() => UserChar[]) | undefined =>
  editor.getParam('charmap');

const getCharMapAppend = (editor: Editor): UserChar[] | undefined =>
  editor.getParam('charmap_append');

export {
  getCharMap,
  getCharMapAppend
};
