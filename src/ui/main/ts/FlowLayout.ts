/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Layout from './Layout';

/**
 * This layout manager will place the controls by using the browsers native layout.
 *
 * @-x-less FlowLayout.less
 * @class tinymce.ui.FlowLayout
 * @extends tinymce.ui.Layout
 */

export default Layout.extend({
  Defaults: {
    containerClass: 'flow-layout',
    controlClass: 'flow-layout-item',
    endClass: 'break'
  },

  /**
   * Recalculates the positions of the controls in the specified container.
   *
   * @method recalc
   * @param {tinymce.ui.Container} container Container instance to recalc.
   */
  recalc (container) {
    container.items().filter(':visible').each(function (ctrl) {
      if (ctrl.recalc) {
        ctrl.recalc();
      }
    });
  },

  isNative () {
    return true;
  }
});