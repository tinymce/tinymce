/**
 * ColorBox.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import ComboBox from './ComboBox';

/**
 * This widget lets you enter colors and browse for colors by pressing the color button. It also displays
 * a preview of the current color.
 *
 * @-x-less ColorBox.less
 * @class tinymce.ui.ColorBox
 * @extends tinymce.ui.ComboBox
 */

export default ComboBox.extend({
  /**
   * Constructs a new control instance with the specified settings.
   *
   * @constructor
   * @param {Object} settings Name/value object with settings.
   */
  init (settings) {
    const self = this;

    settings.spellcheck = false;

    if (settings.onaction) {
      settings.icon = 'none';
    }

    self._super(settings);

    self.classes.add('colorbox');
    self.on('change keyup postrender', function () {
      self.repaintColor(self.value());
    });
  },

  repaintColor (value) {
    const openElm = this.getEl('open');
    const elm = openElm ? openElm.getElementsByTagName('i')[0] : null;

    if (elm) {
      try {
        elm.style.background = value;
      } catch (ex) {
        // Ignore
      }
    }
  },

  bindStates () {
    const self = this;

    self.state.on('change:value', function (e) {
      if (self.state.get('rendered')) {
        self.repaintColor(e.value);
      }
    });

    return self._super();
  }
});