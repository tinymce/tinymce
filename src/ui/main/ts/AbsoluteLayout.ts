/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Layout from './Layout';

/**
 * LayoutManager for absolute positioning. This layout manager is more of
 * a base class for other layouts but can be created and used directly.
 *
 * @-x-less AbsoluteLayout.less
 * @class tinymce.ui.AbsoluteLayout
 * @extends tinymce.ui.Layout
 */

export default Layout.extend({
  Defaults: {
    containerClass: 'abs-layout',
    controlClass: 'abs-layout-item'
  },

  /**
   * Recalculates the positions of the controls in the specified container.
   *
   * @method recalc
   * @param {tinymce.ui.Container} container Container instance to recalc.
   */
  recalc (container) {
    container.items().filter(':visible').each(function (ctrl) {
      const settings = ctrl.settings;

      ctrl.layoutRect({
        x: settings.x,
        y: settings.y,
        w: settings.w,
        h: settings.h
      });

      if (ctrl.recalc) {
        ctrl.recalc();
      }
    });
  },

  /**
   * Renders the specified container and any layout specific HTML.
   *
   * @method renderHtml
   * @param {tinymce.ui.Container} container Container to render HTML for.
   */
  renderHtml (container) {
    return '<div id="' + container._id + '-absend" class="' + container.classPrefix + 'abs-end"></div>' + this._super(container);
  }
});