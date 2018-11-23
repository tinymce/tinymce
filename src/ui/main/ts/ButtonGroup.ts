/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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