/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const getSetting = <T>(name: string, defaultValue?: T, type?: string) => (editor: Editor): T =>
  editor.getParam(name, defaultValue, type);

const shouldIndentOnTab = getSetting('lists_indent_on_tab', true);

const getForcedRootBlock = (editor: Editor): string => {
  const block = editor.getParam('forced_root_block', 'p');
  if (block === false) {
    return '';
  } else if (block === true) {
    return 'p';
  } else {
    return block;
  }
};

const getForcedRootBlockAttrs = getSetting<Record<string, string>>('forced_root_block_attrs', {});

export {
  shouldIndentOnTab,
  getForcedRootBlock,
  getForcedRootBlockAttrs
};
