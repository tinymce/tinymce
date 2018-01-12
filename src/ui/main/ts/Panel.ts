/**
 * Panel.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Container from './Container';
import Scrollable from './Scrollable';

/**
 * Creates a new panel.
 *
 * @-x-less Panel.less
 * @class tinymce.ui.Panel
 * @extends tinymce.ui.Container
 * @mixes tinymce.ui.Scrollable
 */

export default Container.extend({
  Defaults: {
    layout: 'fit',
    containerCls: 'panel'
  },

  Mixins: [Scrollable],

  /**
   * Renders the control as a HTML string.
   *
   * @method renderHtml
   * @return {String} HTML representing the control.
   */
  renderHtml () {
    const self = this;
    const layout = self._layout;
    let innerHtml = self.settings.html;

    self.preRender();
    layout.preRender(self);

    if (typeof innerHtml === 'undefined') {
      innerHtml = (
        '<div id="' + self._id + '-body" class="' + self.bodyClasses + '">' +
        layout.renderHtml(self) +
        '</div>'
      );
    } else {
      if (typeof innerHtml === 'function') {
        innerHtml = innerHtml.call(self);
      }

      self._hasBody = false;
    }

    return (
      '<div id="' + self._id + '" class="' + self.classes + '" hidefocus="1" tabindex="-1" role="group">' +
      (self._preBodyHtml || '') +
      innerHtml +
      '</div>'
    );
  }
});