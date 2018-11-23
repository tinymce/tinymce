/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import AbsoluteLayout from './AbsoluteLayout';

/**
 * This layout manager will resize the control to be the size of it's parent container.
 * In other words width: 100% and height: 100%.
 *
 * @-x-less FitLayout.less
 * @class tinymce.ui.FitLayout
 * @extends tinymce.ui.AbsoluteLayout
 */

export default AbsoluteLayout.extend({
  /**
   * Recalculates the positions of the controls in the specified container.
   *
   * @method recalc
   * @param {tinymce.ui.Container} container Container instance to recalc.
   */
  recalc (container) {
    const contLayoutRect = container.layoutRect(), paddingBox = container.paddingBox;

    container.items().filter(':visible').each(function (ctrl) {
      ctrl.layoutRect({
        x: paddingBox.left,
        y: paddingBox.top,
        w: contLayoutRect.innerW - paddingBox.right - paddingBox.left,
        h: contLayoutRect.innerH - paddingBox.top - paddingBox.bottom
      });

      if (ctrl.recalc) {
        ctrl.recalc();
      }
    });
  }
});