/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import Editor from 'tinymce/core/api/Editor';
import { window } from '@ephox/dom-globals';

const hasProPlugin = function (editor: Editor) {
  // draw back if power version is requested and registered
  if (/(^|[ ,])powerpaste([, ]|$)/.test(editor.getParam('plugins')) && PluginManager.get('powerpaste')) {
    if (typeof window.console !== 'undefined' && window.console.log) {
      window.console.log(`PowerPaste is incompatible with Paste plugin! Remove 'paste' from the 'plugins' option.`);
    }
    return true;
  } else {
    return false;
  }
};

export {
  hasProPlugin
};
