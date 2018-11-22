/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Widget from './Widget';

/**
 * Creates a new select box control.
 *
 * @-x-less SelectBox.less
 * @class tinymce.ui.SelectBox
 * @extends tinymce.ui.Widget
 */

function createOptions(options) {
  let strOptions = '';
  if (options) {
    for (let i = 0; i < options.length; i++) {
      strOptions += '<option value="' + options[i] + '">' + options[i] + '</option>';
    }
  }
  return strOptions;
}

export default Widget.extend({
  Defaults: {
    classes: 'selectbox',
    role: 'selectbox',
    options: []
  },
  /**
   * Constructs a instance with the specified settings.
   *
   * @constructor
   * @param {Object} settings Name/value object with settings.
   * @setting {Array} options Array with options to add to the select box.
   */
  init (settings) {
    const self = this;

    self._super(settings);

    if (self.settings.size) {
      self.size = self.settings.size;
    }

    if (self.settings.options) {
      self._options = self.settings.options;
    }

    self.on('keydown', function (e) {
      let rootControl;

      if (e.keyCode === 13) {
        e.preventDefault();

        // Find root control that we can do toJSON on
        self.parents().reverse().each(function (ctrl) {
          if (ctrl.toJSON) {
            rootControl = ctrl;
            return false;
          }
        });

        // Fire event on current text box with the serialized data of the whole form
        self.fire('submit', { data: rootControl.toJSON() });
      }
    });
  },

  /**
   * Getter/setter function for the options state.
   *
   * @method options
   * @param {Array} [state] State to be set.
   * @return {Array|tinymce.ui.SelectBox} Array of string options.
   */
  options (state) {
    if (!arguments.length) {
      return this.state.get('options');
    }

    this.state.set('options', state);

    return this;
  },

  renderHtml () {
    const self = this;
    let options, size = '';

    options = createOptions(self._options);

    if (self.size) {
      size = ' size = "' + self.size + '"';
    }

    return (
      '<select id="' + self._id + '" class="' + self.classes + '"' + size + '>' +
      options +
      '</select>'
    );
  },

  bindStates () {
    const self = this;

    self.state.on('change:options', function (e) {
      self.getEl().innerHTML = createOptions(e.value);
    });

    return self._super();
  }
});