/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const getSeparatorHtml = function (editor) {
  return editor.getParam('pagebreak_separator', '<!-- pagebreak -->');
};

const shouldSplitBlock = function (editor) {
  return editor.getParam('pagebreak_split_block', false);
};

export default {
  getSeparatorHtml,
  shouldSplitBlock
};