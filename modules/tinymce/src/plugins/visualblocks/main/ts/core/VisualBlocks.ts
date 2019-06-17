/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Events from '../api/Events';
import Editor from 'tinymce/core/api/Editor';
import { Cell } from '@ephox/katamari';

const toggleVisualBlocks = function (editor: Editor, pluginUrl: string, enabledState: Cell<boolean>) {
  const dom = editor.dom;

  dom.toggleClass(editor.getBody(), 'mce-visualblocks');
  enabledState.set(!enabledState.get());

  Events.fireVisualBlocks(editor, enabledState.get());
};

export default {
  toggleVisualBlocks
};