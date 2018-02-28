/**
 * StackLayout.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import FlowLayout from './FlowLayout';

/**
 * This layout uses the browsers layout when the items are blocks.
 *
 * @-x-less StackLayout.less
 * @class tinymce.ui.StackLayout
 * @extends tinymce.ui.FlowLayout
 */

export default FlowLayout.extend({
  Defaults: {
    containerClass: 'stack-layout',
    controlClass: 'stack-layout-item',
    endClass: 'break'
  },

  isNative () {
    return true;
  }
});