/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const getSetting = <T>(name: string, defaultValue?: T, type?: string) => (editor: Editor): T =>
  editor.getParam(name, defaultValue, type);

const getSeparatorHtml = getSetting('pagebreak_separator', '<!-- pagebreak -->');

const shouldSplitBlock = getSetting('pagebreak_split_block', false);

export {
  getSeparatorHtml,
  shouldSplitBlock
};
