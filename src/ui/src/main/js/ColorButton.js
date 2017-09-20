/**
 * ColorButton.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class creates a color button control. This is a split button in which the main
 * button has a visual representation of the currently selected color. When clicked
 * the caret button displays a color picker, allowing the user to select a new color.
 *
 * @-x-less ColorButton.less
 * @class tinymce.ui.ColorButton
 * @extends tinymce.ui.PanelButton
 */
define(
  'tinymce.ui.ColorButton',
  [
    "tinymce.ui.PanelButton",
    "tinymce.core.dom.DOMUtils"
  ],
  function (PanelButton, DomUtils) {
    "use strict";

    var DOM = DomUtils.DOM;

    return PanelButton.extend({
      /**
       * Constructs a new ColorButton instance with the specified settings.
       *
       * @constructor
       * @param {Object} settings Name/value object with settings.
       */
      init: function (settings) {
        this._super(settings);
        this.classes.add('splitbtn');
        this.classes.add('colorbutton');
      },

      /**
       * Getter/setter for the current color.
       *
       * @method color
       * @param {String} [color] Color to set.
       * @return {String|tinymce.ui.ColorButton} Current color or current instance.
       */
      color: function (color) {
        if (color) {
          this._color = color;
          this.getEl('preview').style.backgroundColor = color;
          return this;
        }

        return this._color;
      },

      /**
       * Resets the current color.
       *
       * @method resetColor
       * @return {tinymce.ui.ColorButton} Current instance.
       */
      resetColor: function () {
        this._color = null;
        this.getEl('preview').style.backgroundColor = null;
        return this;
      },

      /**
       * Renders the control as a HTML string.
       *
       * @method renderHtml
       * @return {String} HTML representing the control.
       */
      renderHtml: function () {
        var self = this, id = self._id, prefix = self.classPrefix, text = self.state.get('text');
        var icon = self.settings.icon ? prefix + 'ico ' + prefix + 'i-' + self.settings.icon : '';
        var image = self.settings.image ? ' style="background-image: url(\'' + self.settings.image + '\')"' : '',
          textHtml = '';

        if (text) {
          self.classes.add('btn-has-text');
          textHtml = '<span class="' + prefix + 'txt">' + self.encode(text) + '</span>';
        }

        return (
          '<div id="' + id + '" class="' + self.classes + '" role="button" tabindex="-1" aria-haspopup="true">' +
          '<button role="presentation" hidefocus="1" type="button" tabindex="-1">' +
          (icon ? '<i class="' + icon + '"' + image + '></i>' : '') +
          '<span id="' + id + '-preview" class="' + prefix + 'preview"></span>' +
          textHtml +
          '</button>' +
          '<button type="button" class="' + prefix + 'open" hidefocus="1" tabindex="-1">' +
          ' <i class="' + prefix + 'caret"></i>' +
          '</button>' +
          '</div>'
        );
      },

      /**
       * Called after the control has been rendered.
       *
       * @method postRender
       */
      postRender: function () {
        var self = this, onClickHandler = self.settings.onclick;

        self.on('click', function (e) {
          if (e.aria && e.aria.key === 'down') {
            return;
          }

          if (e.control == self && !DOM.getParent(e.target, '.' + self.classPrefix + 'open')) {
            e.stopImmediatePropagation();
            onClickHandler.call(self, e);
          }
        });

        delete self.settings.onclick;

        return self._super();
      }
    });
  }
);
