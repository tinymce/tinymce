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
define(
  'tinymce.core.ui.Sidebar',
  [
  ],
  function (
  ) {
    var add = function (editor, name, settings) {
      var sidebars = editor.sidebars ? editor.sidebars : [];
      sidebars.push({ name: name, settings: settings });
      editor.sidebars = sidebars;
    };

    return {
      add: add
    };
  }
);
