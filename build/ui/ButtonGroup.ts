/**
 * ButtonGroup.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Container from './Container';

/**
 * This control enables you to put multiple buttons into a group. This is
 * useful when you want to combine similar toolbar buttons into a group.
 *
 * @example
 * // Create and render a buttongroup with two buttons to the body element
 * tinymce.ui.Factory.create({
 *     type: 'buttongroup',
 *     items: [
 *         {text: 'Button A'},
 *         {text: 'Button B'}
 *     ]
 * }).renderTo(document.body);
 *
 * @-x-less ButtonGroup.less
 * @class tinymce.ui.ButtonGroup
 * @extends tinymce.ui.Container
 */

export default Container.extend({
  Defaults: {
    defaultType: 'button',
    role: 'group'
  },

  /**
   * Renders the control as a HTML string.
   *
   * @method renderHtml
   * @return {String} HTML representing the control.
   */
  renderHtml () {
    const self = this, layout = self._layout;

    self.classes.add('btn-group');
    self.preRender();
    layout.preRender(self);

    return (
      '<div id="' + self._id + '" class="' + self.classes + '">' +
      '<div id="' + self._id + '-body">' +
      (self.settings.html || '') + layout.renderHtml(self) +
      '</div>' +
      '</div>'
    );
  }
});