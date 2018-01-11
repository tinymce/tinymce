/**
 * Sidebar.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This module handle sidebar instances for the editor.
 *
 * @class tinymce.ui.Sidebar
 * @private
 */

const add = function (editor, name, settings) {
  const sidebars = editor.sidebars ? editor.sidebars : [];
  sidebars.push({ name, settings });
  editor.sidebars = sidebars;
};

export default {
  add
};