/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const getDialect = function (editor) {
  // Note: This option isn't even used since we only support one dialect
  return editor.getParam('bbcode_dialect', 'punbb').toLowerCase();
};

export {
  getDialect
};
