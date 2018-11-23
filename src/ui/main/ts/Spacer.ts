/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Widget from './Widget';

/**
 * Creates a spacer. This control is used in flex layouts for example.
 *
 * @-x-less Spacer.less
 * @class tinymce.ui.Spacer
 * @extends tinymce.ui.Widget
 */

export default Widget.extend({
  /**
   * Renders the control as a HTML string.
   *
   * @method renderHtml
   * @return {String} HTML representing the control.
   */
  renderHtml () {
    const self = this;

    self.classes.add('spacer');
    self.canFocus = false;

    return '<div id="' + self._id + '" class="' + self.classes + '"></div>';
  }
});