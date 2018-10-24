/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const isEnabledByDefault = function (editor) {
  return editor.getParam('visualchars_default_state', false);
};

export default {
  isEnabledByDefault
};
