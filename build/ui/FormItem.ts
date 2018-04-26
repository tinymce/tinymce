/**
 * FormItem.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Container from './Container';

/**
 * This class is a container created by the form element with
 * a label and control item.
 *
 * @class tinymce.ui.FormItem
 * @extends tinymce.ui.Container
 * @setting {String} label Label to display for the form item.
 */

export default Container.extend({
  Defaults: {
    layout: 'flex',
    align: 'center',
    defaults: {
      flex: 1
    }
  },

  /**
   * Renders the control as a HTML string.
   *
   * @method renderHtml
   * @return {String} HTML representing the control.
   */
  renderHtml () {
    const self = this, layout = self._layout, prefix = self.classPrefix;

    self.classes.add('formitem');
    layout.preRender(self);

    return (
      '<div id="' + self._id + '" class="' + self.classes + '" hidefocus="1" tabindex="-1">' +
      (self.settings.title ? ('<div id="' + self._id + '-title" class="' + prefix + 'title">' +
        self.settings.title + '</div>') : '') +
      '<div id="' + self._id + '-body" class="' + self.bodyClasses + '">' +
      (self.settings.html || '') + layout.renderHtml(self) +
      '</div>' +
      '</div>'
    );
  }
});