/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const getSeparatorHtml = (editor: Editor): string => editor.getParam('pagebreak_separator', '<!-- pagebreak -->');

const shouldSplitBlock = (editor: Editor): boolean => editor.getParam('pagebreak_split_block', false);

export {
  getSeparatorHtml,
  shouldSplitBlock
};
