/**
 * DropZone.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Widget from './Widget';
import Tools from 'tinymce/core/api/util/Tools';
import DomUtils from './DomUtils';

/**
 * Creates a new dropzone.
 *
 * @-x-less DropZone.less
 * @class tinymce.ui.DropZone
 * @extends tinymce.ui.Widget
 */

export default Widget.extend({
  /**
   * Constructs a instance with the specified settings.
   *
   * @constructor
   * @param {Object} settings Name/value object with settings.
   * @setting {Boolean} multiple True if the dropzone is a multiple control.
   * @setting {Number} maxLength Max length for the dropzone.
   * @setting {Number} size Size of the dropzone in characters.
   */
  init (settings) {
    const self = this;

    settings = Tools.extend({
      height: 100,
      text: 'Drop an image here',
      multiple: false,
      accept: null // by default accept any files
    }, settings);

    self._super(settings);

    self.classes.add('dropzone');

    if (settings.multiple) {
      self.classes.add('multiple');
    }
  },

  /**
   * Renders the control as a HTML string.
   *
   * @method renderHtml
   * @return {String} HTML representing the control.
   */
  renderHtml () {
    const self = this;
    let attrs, elm;
    const cfg = self.settings;

    attrs = {
      id: self._id,
      hidefocus: '1'
    };

    elm = DomUtils.create('div', attrs, '<span>' + this.translate(cfg.text) + '</span>');

    if (cfg.height) {
      DomUtils.css(elm, 'height', cfg.height + 'px');
    }

    if (cfg.width) {
      DomUtils.css(elm, 'width', cfg.width + 'px');
    }

    elm.className = self.classes;

    return elm.outerHTML;
  },

    /**
   * Called after the control has been rendered.
   *
   * @method postRender
   */
  postRender () {
    const self = this;

    const toggleDragClass = function (e) {
      e.preventDefault();
      self.classes.toggle('dragenter');
      self.getEl().className = self.classes;
    };

    const filter = function (files) {
      const accept = self.settings.accept;
      if (typeof accept !== 'string') {
        return files;
      }

      const re = new RegExp('(' + accept.split(/\s*,\s*/).join('|') + ')$', 'i');
      return Tools.grep(files, function (file) {
        return re.test(file.name);
      });
    };

    self._super();

    self.$el.on('dragover', function (e) {
      e.preventDefault();
    });

    self.$el.on('dragenter', toggleDragClass);
    self.$el.on('dragleave', toggleDragClass);

    self.$el.on('drop', function (e) {
      e.preventDefault();

      if (self.state.get('disabled')) {
        return;
      }

      const files = filter(e.dataTransfer.files);

      self.value = function () {
        if (!files.length) {
          return null;
        } else if (self.settings.multiple) {
          return files;
        } else {
          return files[0];
        }
      };

      if (files.length) {
        self.fire('change', e);
      }
    });
  },

  remove () {
    this.$el.off();
    this._super();
  }
});