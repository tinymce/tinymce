/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const getSetting = <T>(name: string, defaultValue?: T, type?: string) => (editor: Editor): T =>
  editor.getParam(name, defaultValue, type);

const getNonEditableClass = getSetting('noneditable_noneditable_class', 'mceNonEditable');

const getEditableClass = getSetting('noneditable_editable_class', 'mceEditable');

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
