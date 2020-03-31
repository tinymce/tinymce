/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const isSkinDisabled = (editor: Editor): boolean => editor.settings.skin === false;

const readOnlyOnInit = (_editor: Editor) =>
  // Intentional short circuit, TODO: implement editor.settings.mobile
  false;

export {
  isSkinDisabled,
  readOnlyOnInit
};
