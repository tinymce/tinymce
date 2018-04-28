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

const hasProPlugin = function (editor) {
  // draw back if power version is requested and registered
  if (/(^|[ ,])tinymcespellchecker([, ]|$)/.test(editor.settings.plugins) && PluginManager.get('tinymcespellchecker')) {

    if (typeof window.console !== 'undefined' && window.console.log) {
      window.console.log(
        'Spell Checker Pro is incompatible with Spell Checker plugin! ' +
        'Remove \'spellchecker\' from the \'plugins\' option.'
      );
    }
    return true;
  } else {
    return false;
  }
};

export default {
  hasProPlugin
};