/**
 * Button.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class is used to create buttons. You can create them directly or through the Factory.
 *
 * @example
 * // Create and render a button to the body element
 * tinymce.ui.Factory.create({
 *     type: 'button',
 *     text: 'My button'
 * }).renderTo(document.body);
 *
 * @-x-less Button.less
 * @class tinymce.ui.Button
 * @extends tinymce.ui.Widget
 */
define(
  'tinymce.core.ui.Button',
  [
    "tinymce.core.ui.Widget"
  ],
  function (Widget) {
    "use strict";

    return Widget.extend({
      Defaults: {
        classes: "widget btn",
        role: "button"
      },

      /**
       * Constructs a new button instance with the specified settings.
       *
       * @constructor
       * @param {Object} settings Name/value object with settings.
       * @setting {String} size Size of the button small|medium|large.
       * @setting {String} image Image to use for icon.
       * @setting {String} icon Icon to use for button.
       */
      init: function (settings) {
        var self = this, size;

        self._super(settings);
        settings = self.settings;

        size = self.settings.size;

        self.on('click mousedown', function (e) {
          e.preventDefault();
        });

        self.on('touchstart', function (e) {
          self.fire('click', e);
          e.preventDefault();
        });

        if (settings.subtype) {
          self.classes.add(settings.subtype);
        }

        if (size) {
          self.classes.add('btn-' + size);
        }

        if (settings.icon) {
          self.icon(settings.icon);
        }
      },

      /**
       * Sets/gets the current button icon.
       *
       * @method icon
       * @param {String} [icon] New icon identifier.
       * @return {String|tinymce.ui.MenuButton} Current icon or current MenuButton instance.
       */
      icon: function (icon) {
        if (!arguments.length) {
          return this.state.get('icon');
        }

        this.state.set('icon', icon);

        return this;
      },

      /**
       * Repaints the button for example after it's been resizes by a layout engine.
       *
       * @method repaint
       */
      repaint: function () {
        var btnElm = this.getEl().firstChild,
          btnStyle;

        if (btnElm) {
          btnStyle = btnElm.style;
          btnStyle.width = btnStyle.height = "100%";
        }

        this._super();
      },

      /**
       * Renders the control as a HTML string.
       *
       * @method renderHtml
       * @return {String} HTML representing the control.
       */
      renderHtml: function () {
        var self = this, id = self._id, prefix = self.classPrefix;
        var icon = self.state.get('icon'), image, text = self.state.get('text'), textHtml = '';

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

        if (text) {
          self.classes.add('btn-has-text');
          textHtml = '<span class="' + prefix + 'txt">' + self.encode(text) + '</span>';
        }

        icon = icon ? prefix + 'ico ' + prefix + 'i-' + icon : '';

        return (
          '<div id="' + id + '" class="' + self.classes + '" tabindex="-1">' +
          '<button id="' + id + '-button" role="presentation" type="button" tabindex="-1">' +
          (icon ? '<i class="' + icon + '"' + image + '></i>' : '') +
          textHtml +
          '</button>' +
          '</div>'
        );
      },

      bindStates: function () {
        var self = this, $ = self.$, textCls = self.classPrefix + 'txt';

        function setButtonText(text) {
          var $span = $('span.' + textCls, self.getEl());

          if (text) {
            if (!$span[0]) {
              $('button:first', self.getEl()).append('<span class="' + textCls + '"></span>');
              $span = $('span.' + textCls, self.getEl());
            }

            $span.html(self.encode(text));
          } else {
            $span.remove();
          }

          self.classes.toggle('btn-has-text', !!text);
        }

        self.state.on('change:text', function (e) {
          setButtonText(e.value);
        });

        self.state.on('change:icon', function (e) {
          var icon = e.value, prefix = self.classPrefix;

          self.settings.icon = icon;
          icon = icon ? prefix + 'ico ' + prefix + 'i-' + self.settings.icon : '';

          var btnElm = self.getEl().firstChild, iconElm = btnElm.getElementsByTagName('i')[0];

          if (icon) {
            if (!iconElm || iconElm != btnElm.firstChild) {
              iconElm = document.createElement('i');
              btnElm.insertBefore(iconElm, btnElm.firstChild);
            }

            iconElm.className = icon;
          } else if (iconElm) {
            btnElm.removeChild(iconElm);
          }

          setButtonText(self.state.get('text'));
        });

        return self._super();
      }
    });
  }
);
