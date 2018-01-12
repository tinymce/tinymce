/**
 * Toolbar.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Container from './Container';

/**
 * Creates a new toolbar.
 *
 * @class tinymce.ui.Toolbar
 * @extends tinymce.ui.Container
 */

export default Container.extend({
  Defaults: {
    role: 'toolbar',
    layout: 'flow'
  },

  /**
   * Constructs a instance with the specified settings.
   *
   * @constructor
   * @param {Object} settings Name/value object with settings.
   */
  init (settings) {
    const self = this;

    self._super(settings);
    self.classes.add('toolbar');
  },

  /**
   * Called after the control has been rendered.
   *
   * @method postRender
   */
  postRender () {
    const self = this;

    self.items().each(function (ctrl) {
      ctrl.classes.add('toolbar-item');
    });

    return self._super();
  }
});