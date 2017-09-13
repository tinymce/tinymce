/**
 * SplitButton.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a split button.
 *
 * @-x-less SplitButton.less
 * @class tinymce.ui.SplitButton
 * @extends tinymce.ui.Button
 */
define(
  'tinymce.ui.SplitButton',
  [
    'global!window',
    'tinymce.core.dom.DomQuery',
    'tinymce.ui.DomUtils',
    'tinymce.ui.MenuButton'
  ],
  function (window, DomQuery, DomUtils, MenuButton) {
    return MenuButton.extend({
      Defaults: {
        classes: "widget btn splitbtn",
        role: "button"
      },

      /**
       * Repaints the control after a layout operation.
       *
       * @method repaint
       */
      repaint: function () {
        var self = this, elm = self.getEl(), rect = self.layoutRect(), mainButtonElm, menuButtonElm;

        self._super();

        mainButtonElm = elm.firstChild;
        menuButtonElm = elm.lastChild;

        DomQuery(mainButtonElm).css({
          width: rect.w - DomUtils.getSize(menuButtonElm).width,
          height: rect.h - 2
        });

        DomQuery(menuButtonElm).css({
          height: rect.h - 2
        });

        return self;
      },

      /**
       * Sets the active menu state.
       *
       * @private
       */
      activeMenu: function (state) {
        var self = this;

        DomQuery(self.getEl().lastChild).toggleClass(self.classPrefix + 'active', state);
      },

      /**
       * Renders the control as a HTML string.
       *
       * @method renderHtml
       * @return {String} HTML representing the control.
       */
      renderHtml: function () {
        var self = this, id = self._id, prefix = self.classPrefix, image;
        var icon = self.state.get('icon'), text = self.state.get('text'),
          textHtml = '';

        image = self.settings.image;
        if (image) {
          icon = 'none';

          // Support for [high dpi, low dpi] image sources
          if (typeof image != "string") {
            image = window.getSelection ? image[0] : image[1];
          }

          image = ' style="background-image: url(\'' + image + '\')"';
        } else {
          image = '';
        }

        icon = self.settings.icon ? prefix + 'ico ' + prefix + 'i-' + icon : '';

        if (text) {
          self.classes.add('btn-has-text');
          textHtml = '<span class="' + prefix + 'txt">' + self.encode(text) + '</span>';
        }

        return (
          '<div id="' + id + '" class="' + self.classes + '" role="button" tabindex="-1">' +
          '<button type="button" hidefocus="1" tabindex="-1">' +
          (icon ? '<i class="' + icon + '"' + image + '></i>' : '') +
          textHtml +
          '</button>' +
          '<button type="button" class="' + prefix + 'open" hidefocus="1" tabindex="-1">' +
          //(icon ? '<i class="' + icon + '"></i>' : '') +
          (self._menuBtnText ? (icon ? '\u00a0' : '') + self._menuBtnText : '') +
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
          var node = e.target;

          if (e.control == this) {
            // Find clicks that is on the main button
            while (node) {
              if ((e.aria && e.aria.key != 'down') || (node.nodeName == 'BUTTON' && node.className.indexOf('open') == -1)) {
                e.stopImmediatePropagation();

                if (onClickHandler) {
                  onClickHandler.call(this, e);
                }

                return;
              }

              node = node.parentNode;
            }
          }
        });

        delete self.settings.onclick;

        return self._super();
      }
    });
  }
);