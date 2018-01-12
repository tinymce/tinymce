/**
 * MenuBar.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Toolbar from './Toolbar';

/**
 * Creates a new menubar.
 *
 * @-x-less MenuBar.less
 * @class tinymce.ui.MenuBar
 * @extends tinymce.ui.Container
 */

export default Toolbar.extend({
  Defaults: {
    role: 'menubar',
    containerCls: 'menubar',
    ariaRoot: true,
    defaults: {
      type: 'menubutton'
    }
  }
});