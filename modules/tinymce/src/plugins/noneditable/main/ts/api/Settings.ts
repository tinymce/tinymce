/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const getNonEditableClass = (editor: Editor): string =>
  editor.getParam('noneditable_noneditable_class', 'mceNonEditable');

const getEditableClass = (editor: Editor): string =>
  editor.getParam('noneditable_editable_class', 'mceEditable');

const getNonEditableRegExps = (editor: Editor): RegExp[] => {
  const nonEditableRegExps = editor.getParam('noneditable_regexp', []);

  if (nonEditableRegExps && nonEditableRegExps.constructor === RegExp) {
    return [ nonEditableRegExps ];
  } else {
    return nonEditableRegExps;
  }
};

export {
  getNonEditableClass,
  getEditableClass,
  getNonEditableRegExps
};
