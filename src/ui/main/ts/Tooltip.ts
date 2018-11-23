/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Control from './Control';
import Movable from './Movable';

/**
 * Creates a tooltip instance.
 *
 * @-x-less ToolTip.less
 * @class tinymce.ui.ToolTip
 * @extends tinymce.ui.Control
 * @mixes tinymce.ui.Movable
 */

export default Control.extend({
  Mixins: [Movable],

  Defaults: {
    classes: 'widget tooltip tooltip-n'
  },

  /**
   * Renders the control as a HTML string.
   *
   * @method renderHtml
   * @return {String} HTML representing the control.
   */
  renderHtml () {
    const self = this, prefix = self.classPrefix;

    return (
      '<div id="' + self._id + '" class="' + self.classes + '" role="presentation">' +
      '<div class="' + prefix + 'tooltip-arrow"></div>' +
      '<div class="' + prefix + 'tooltip-inner">' + self.encode(self.state.get('text')) + '</div>' +
      '</div>'
    );
  },

  bindStates () {
    const self = this;

    self.state.on('change:text', function (e) {
      self.getEl().lastChild.innerHTML = self.encode(e.value);
    });

    return self._super();
  },

  /**
   * Repaints the control after a layout operation.
   *
   * @method repaint
   */
  repaint () {
    const self = this;
    let style, rect;

    style = self.getEl().style;
    rect = self._layoutRect;

    style.left = rect.x + 'px';
    style.top = rect.y + 'px';
    style.zIndex = 0xFFFF + 0xFFFF;
  }
});