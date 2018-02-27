/**
 * InfoBox.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Widget from './Widget';

/**
 * ....
 *
 * @-x-less InfoBox.less
 * @class tinymce.ui.InfoBox
 * @extends tinymce.ui.Widget
 */

export default Widget.extend({
  /**
   * Constructs a instance with the specified settings.
   *
   * @constructor
   * @param {Object} settings Name/value object with settings.
   * @setting {Boolean} multiline Multiline label.
   */
  init (settings) {
    const self = this;

    self._super(settings);
    self.classes.add('widget').add('infobox');
    self.canFocus = false;
  },

  severity (level) {
    this.classes.remove('error');
    this.classes.remove('warning');
    this.classes.remove('success');
    this.classes.add(level);
  },

  help (state) {
    this.state.set('help', state);
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
      '<div id="' + self._id + '" class="' + self.classes + '">' +
      '<div id="' + self._id + '-body">' +
      self.encode(self.state.get('text')) +
      '<button role="button" tabindex="-1">' +
      '<i class="' + prefix + 'ico ' + prefix + 'i-help"></i>' +
      '</button>' +
      '</div>' +
      '</div>'
    );
  },

  bindStates () {
    const self = this;

    self.state.on('change:text', function (e) {
      self.getEl('body').firstChild.data = self.encode(e.value);

      if (self.state.get('rendered')) {
        self.updateLayoutRect();
      }
    });

    self.state.on('change:help', function (e) {
      self.classes.toggle('has-help', e.value);

      if (self.state.get('rendered')) {
        self.updateLayoutRect();
      }
    });

    return self._super();
  }
});