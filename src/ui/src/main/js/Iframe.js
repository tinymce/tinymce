/**
 * Iframe.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*jshint scripturl:true */

/**
 * This class creates an iframe.
 *
 * @setting {String} url Url to open in the iframe.
 *
 * @-x-less Iframe.less
 * @class tinymce.ui.Iframe
 * @extends tinymce.ui.Widget
 */
define(
  'tinymce.ui.Iframe',
  [
    "tinymce.ui.Widget",
    "tinymce.core.util.Delay"
  ],
  function (Widget, Delay) {
    "use strict";

    return Widget.extend({
      /**
       * Renders the control as a HTML string.
       *
       * @method renderHtml
       * @return {String} HTML representing the control.
       */
      renderHtml: function () {
        var self = this;

        self.classes.add('iframe');
        self.canFocus = false;

        /*eslint no-script-url:0 */
        return (
          '<iframe id="' + self._id + '" class="' + self.classes + '" tabindex="-1" src="' +
          (self.settings.url || "javascript:''") + '" frameborder="0"></iframe>'
        );
      },

      /**
       * Setter for the iframe source.
       *
       * @method src
       * @param {String} src Source URL for iframe.
       */
      src: function (src) {
        this.getEl().src = src;
      },

      /**
       * Inner HTML for the iframe.
       *
       * @method html
       * @param {String} html HTML string to set as HTML inside the iframe.
       * @param {function} callback Optional callback to execute when the iframe body is filled with contents.
       * @return {tinymce.ui.Iframe} Current iframe control.
       */
      html: function (html, callback) {
        var self = this, body = this.getEl().contentWindow.document.body;

        // Wait for iframe to initialize IE 10 takes time
        if (!body) {
          Delay.setTimeout(function () {
            self.html(html);
          });
        } else {
          body.innerHTML = html;

          if (callback) {
            callback();
          }
        }

        return this;
      }
    });
  }
);
