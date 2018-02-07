/**
 * DetectProPlugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import { Editor } from 'tinymce/core/api/Editor';

const hasProPlugin = function (editor: Editor) {
  // draw back if power version is requested and registered
  if (/(^|[ ,])powerpaste([, ]|$)/.test(editor.settings.plugins) && PluginManager.get('powerpaste')) {

    if (typeof window.console !== 'undefined' && window.console.log) {
      window.console.log('PowerPaste is incompatible with Paste plugin! Remove \'paste\' from the \'plugins\' option.');
    }
    return true;
  } else {
    return false;
  }
};

export default {
  hasProPlugin
};