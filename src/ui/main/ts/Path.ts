/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Widget from './Widget';

/**
 * Creates a new path control.
 *
 * @-x-less Path.less
 * @class tinymce.ui.Path
 * @extends tinymce.ui.Widget
 */

export default Widget.extend({
  /**
   * Constructs a instance with the specified settings.
   *
   * @constructor
   * @param {Object} settings Name/value object with settings.
   * @setting {String} delimiter Delimiter to display between row in path.
   */
  init (settings) {
    const self = this;

    if (!settings.delimiter) {
      settings.delimiter = '\u00BB';
    }

    self._super(settings);
    self.classes.add('path');
    self.canFocus = true;

    self.on('click', function (e) {
      let index;
      const target = e.target;

      if ((index = target.getAttribute('data-index'))) {
        self.fire('select', { value: self.row()[index], index });
      }
    });

    self.row(self.settings.row);
  },

  /**
   * Focuses the current control.
   *
   * @method focus
   * @return {tinymce.ui.Control} Current control instance.
   */
  focus () {
    const self = this;

    self.getEl().firstChild.focus();

    return self;
  },

  /**
   * Sets/gets the data to be used for the path.
   *
   * @method row
   * @param {Array} row Array with row name is rendered to path.
   */
  row (row) {
    if (!arguments.length) {
      return this.state.get('row');
    }

    this.state.set('row', row);

    return this;
  },

  /**
   * Renders the control as a HTML string.
   *
   * @method renderHtml
   * @return {String} HTML representing the control.
   */
  renderHtml () {
    const self = this;

    return (
      '<div id="' + self._id + '" class="' + self.classes + '">' +
      self._getDataPathHtml(self.state.get('row')) +
      '</div>'
    );
  },

  bindStates () {
    const self = this;

    self.state.on('change:row', function (e) {
      self.innerHtml(self._getDataPathHtml(e.value));
    });

    return self._super();
  },

  _getDataPathHtml (data) {
    const self = this;
    const parts = data || [];
    let i, l, html = '';
    const prefix = self.classPrefix;

    for (i = 0, l = parts.length; i < l; i++) {
      html += (
        (i > 0 ? '<div class="' + prefix + 'divider" aria-hidden="true"> ' + self.settings.delimiter + ' </div>' : '') +
        '<div role="button" class="' + prefix + 'path-item' + (i === l - 1 ? ' ' + prefix + 'last' : '') + '" data-index="' +
        i + '" tabindex="-1" id="' + self._id + '-' + i + '" aria-level="' + (i + 1) + '">' + parts[i].name + '</div>'
      );
    }

    if (!html) {
      html = '<div class="' + prefix + 'path-item">\u00a0</div>';
    }

    return html;
  }
});