/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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