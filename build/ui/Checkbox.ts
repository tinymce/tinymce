/**
 * Checkbox.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Widget from './Widget';

/**
 * This control creates a custom checkbox.
 *
 * @example
 * // Create and render a checkbox to the body element
 * tinymce.core.ui.Factory.create({
 *     type: 'checkbox',
 *     checked: true,
 *     text: 'My checkbox'
 * }).renderTo(document.body);
 *
 * @-x-less Checkbox.less
 * @class tinymce.ui.Checkbox
 * @extends tinymce.ui.Widget
 */

export default Widget.extend({
  Defaults: {
    classes: 'checkbox',
    role: 'checkbox',
    checked: false
  },

  /**
   * Constructs a new Checkbox instance with the specified settings.
   *
   * @constructor
   * @param {Object} settings Name/value object with settings.
   * @setting {Boolean} checked True if the checkbox should be checked by default.
   */
  init (settings) {
    const self = this;

    self._super(settings);

    self.on('click mousedown', function (e) {
      e.preventDefault();
    });

    self.on('click', function (e) {
      e.preventDefault();

      if (!self.disabled()) {
        self.checked(!self.checked());
      }
    });

    self.checked(self.settings.checked);
  },

  /**
   * Getter/setter function for the checked state.
   *
   * @method checked
   * @param {Boolean} [state] State to be set.
   * @return {Boolean|tinymce.ui.Checkbox} True/false or checkbox if it's a set operation.
   */
  checked (state) {
    if (!arguments.length) {
      return this.state.get('checked');
    }

    this.state.set('checked', state);

    return this;
  },

  /**
   * Getter/setter function for the value state.
   *
   * @method value
   * @param {Boolean} [state] State to be set.
   * @return {Boolean|tinymce.ui.Checkbox} True/false or checkbox if it's a set operation.
   */
  value (state) {
    if (!arguments.length) {
      return this.checked();
    }

    return this.checked(state);
  },

  /**
   * Renders the control as a HTML string.
   *
   * @method renderHtml
   * @return {String} HTML representing the control.
   */
  renderHtml () {
    const self = this, id = self._id, prefix = self.classPrefix;

    return (
      '<div id="' + id + '" class="' + self.classes + '" unselectable="on" aria-labelledby="' + id + '-al" tabindex="-1">' +
      '<i class="' + prefix + 'ico ' + prefix + 'i-checkbox"></i>' +
      '<span id="' + id + '-al" class="' + prefix + 'label">' + self.encode(self.state.get('text')) + '</span>' +
      '</div>'
    );
  },

  bindStates () {
    const self = this;

    function checked(state) {
      self.classes.toggle('checked', state);
      self.aria('checked', state);
    }

    self.state.on('change:text', function (e) {
      self.getEl('al').firstChild.data = self.translate(e.value);
    });

    self.state.on('change:checked change:value', function (e) {
      self.fire('change');
      checked(e.value);
    });

    self.state.on('change:icon', function (e) {
      let icon = e.value;
      const prefix = self.classPrefix;

      if (typeof icon === 'undefined') {
        return self.settings.icon;
      }

      self.settings.icon = icon;
      icon = icon ? prefix + 'ico ' + prefix + 'i-' + self.settings.icon : '';

      const btnElm = self.getEl().firstChild;
      let iconElm = btnElm.getElementsByTagName('i')[0];

      if (icon) {
        if (!iconElm || iconElm !== btnElm.firstChild) {
          iconElm = document.createElement('i');
          btnElm.insertBefore(iconElm, btnElm.firstChild);
        }

        iconElm.className = icon;
      } else if (iconElm) {
        btnElm.removeChild(iconElm);
      }
    });

    if (self.state.get('checked')) {
      checked(true);
    }

    return self._super();
  }
});