/**
 * MenuBar.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new menubar.
 *
 * @-x-less MenuBar.less
 * @class tinymce.ui.MenuBar
 * @extends tinymce.ui.Container
 */
define(
  'tinymce.core.ui.MenuBar',
  [
    "tinymce.core.ui.Toolbar"
  ],
  function (Toolbar) {
    "use strict";

    return Toolbar.extend({
      Defaults: {
        role: 'menubar',
        containerCls: 'menubar',
        ariaRoot: true,
        defaults: {
          type: 'menubutton'
        }
      }
    });
  }
);