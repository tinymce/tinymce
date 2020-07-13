/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

// Note: This option isn't even used since we only support one dialect
const getDialect = (editor: Editor) => editor.getParam('bbcode_dialect', 'punbb').toLowerCase();

export {
  getDialect
};
