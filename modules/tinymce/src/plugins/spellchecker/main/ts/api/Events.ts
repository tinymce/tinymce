/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const fireSpellcheckStart = (editor: Editor) => {
  return editor.fire('SpellcheckStart');
};

const fireSpellcheckEnd = (editor: Editor) => {
  return editor.fire('SpellcheckEnd');
};

export {
  fireSpellcheckStart,
  fireSpellcheckEnd
};
