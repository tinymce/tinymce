/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const isEnabledByDefault = (editor: Editor) => editor.getParam('visualchars_default_state', false);

const hasForcedRootBlock = (editor: Editor): boolean => editor.getParam('forced_root_block') !== false;

export {
  isEnabledByDefault,
  hasForcedRootBlock
};
