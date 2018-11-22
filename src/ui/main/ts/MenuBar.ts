/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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