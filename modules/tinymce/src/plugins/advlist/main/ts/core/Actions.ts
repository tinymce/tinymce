/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const applyListFormat = (editor: Editor, listName: string, styleValue: false | string): void => {
  const cmd = listName === 'UL' ? 'InsertUnorderedList' : 'InsertOrderedList';
  editor.execCommand(cmd, false, styleValue === false ? null : { 'list-style-type': styleValue });
};

export {
  applyListFormat
};
