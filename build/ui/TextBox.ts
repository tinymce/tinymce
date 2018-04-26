/**
 * TextBox.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/api/util/Tools';
import DomUtils from './DomUtils';
import Widget from './Widget';

/**
 * Creates a new textbox.
 *
 * @-x-less TextBox.less
 * @class tinymce.ui.TextBox
 * @extends tinymce.ui.Widget
 */

export default Widget.extend({
  /**
   * Constructs a instance with the specified settings.
   *
   * @constructor
   * @param {Object} settings Name/value object with settings.
   * @setting {Boolean} multiline True if the textbox is a multiline control.
   * @setting {Number} maxLength Max length for the textbox.
   * @setting {Number} size Size of the textbox in characters.
   */
  init (settings) {
    const self = this;

    self._super(settings);

    self.classes.add('textbox');

    if (settings.multiline) {
      self.classes.add('multiline');
    } else {
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

      self.on('keyup', function (e) {
        self.state.set('value', e.target.value);
      });
    }
  },

  /**
   * Repaints the control after a layout operation.
   *
   * @method repaint
   */
  repaint () {
    const self = this;
    let style, rect, borderBox, borderW, borderH = 0, lastRepaintRect;

    style = self.getEl().style;
    rect = self._layoutRect;
    lastRepaintRect = self._lastRepaintRect || {};

    // Detect old IE 7+8 add lineHeight to align caret vertically in the middle
    const doc: any = document;
    if (!self.settings.multiline && doc.all && (!doc.documentMode || doc.documentMode <= 8)) {
      style.lineHeight = (rect.h - borderH) + 'px';
    }

    borderBox = self.borderBox;
    borderW = borderBox.left + borderBox.right + 8;
    borderH = borderBox.top + borderBox.bottom + (self.settings.multiline ? 8 : 0);

    if (rect.x !== lastRepaintRect.x) {
      style.left = rect.x + 'px';
      lastRepaintRect.x = rect.x;
    }

    if (rect.y !== lastRepaintRect.y) {
      style.top = rect.y + 'px';
      lastRepaintRect.y = rect.y;
    }

    if (rect.w !== lastRepaintRect.w) {
      style.width = (rect.w - borderW) + 'px';
      lastRepaintRect.w = rect.w;
    }

    if (rect.h !== lastRepaintRect.h) {
      style.height = (rect.h - borderH) + 'px';
      lastRepaintRect.h = rect.h;
    }

    self._lastRepaintRect = lastRepaintRect;
    self.fire('repaint', {}, false);

    return self;
  },

  /**
   * Renders the control as a HTML string.
   *
   * @method renderHtml
   * @return {String} HTML representing the control.
   */
  renderHtml () {
    const self = this;
    const settings = self.settings;
    let attrs, elm;

    attrs = {
      id: self._id,
      hidefocus: '1'
    };

    Tools.each([
      'rows', 'spellcheck', 'maxLength', 'size', 'readonly', 'min',
      'max', 'step', 'list', 'pattern', 'placeholder', 'required', 'multiple'
    ], function (name) {
      attrs[name] = settings[name];
    });

    if (self.disabled()) {
      attrs.disabled = 'disabled';
    }

    if (settings.subtype) {
      attrs.type = settings.subtype;
    }

    elm = DomUtils.create(settings.multiline ? 'textarea' : 'input', attrs);
    elm.value = self.state.get('value');
    elm.className = self.classes.toString();

    return elm.outerHTML;
  },

  value (value) {
    if (arguments.length) {
      this.state.set('value', value);
      return this;
    }

    // Make sure the real state is in sync
    if (this.state.get('rendered')) {
      this.state.set('value', this.getEl().value);
    }

    return this.state.get('value');
  },

  /**
   * Called after the control has been rendered.
   *
   * @method postRender
   */
  postRender () {
    const self = this;

    self.getEl().value = self.state.get('value');
    self._super();

    self.$el.on('change', function (e) {
      self.state.set('value', e.target.value);
      self.fire('change', e);
    });
  },

  bindStates () {
    const self = this;

    self.state.on('change:value', function (e) {
      if (self.getEl().value !== e.value) {
        self.getEl().value = e.value;
      }
    });

    self.state.on('change:disabled', function (e) {
      self.getEl().disabled = e.value;
    });

    return self._super();
  },

  remove () {
    this.$el.off();
    this._super();
  }
});