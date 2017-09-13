/**
 * BrowseButton.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new browse button.
 *
 * @-x-less BrowseButton.less
 * @class tinymce.ui.BrowseButton
 * @extends tinymce.ui.Widget
 */
define(
  'tinymce.ui.BrowseButton',
  [
    'tinymce.ui.Button',
    'tinymce.core.util.Tools',
    'tinymce.ui.DomUtils',
    'tinymce.core.dom.DomQuery',
    'global!RegExp'
  ],
  function (Button, Tools, DomUtils, $, RegExp) {
    return Button.extend({
      /**
       * Constructs a instance with the specified settings.
       *
       * @constructor
       * @param {Object} settings Name/value object with settings.
       * @setting {Boolean} multiple True if the dropzone is a multiple control.
       * @setting {Number} maxLength Max length for the dropzone.
       * @setting {Number} size Size of the dropzone in characters.
       */
      init: function (settings) {
        var self = this;

        settings = Tools.extend({
          text: "Browse...",
          multiple: false,
          accept: null // by default accept any files
        }, settings);

        self._super(settings);

        self.classes.add('browsebutton');

        if (settings.multiple) {
          self.classes.add('multiple');
        }
      },

       /**
       * Called after the control has been rendered.
       *
       * @method postRender
       */
      postRender: function () {
        var self = this;

        var input = DomUtils.create('input', {
          type: 'file',
          id: self._id + '-browse',
          accept: self.settings.accept
        });

        self._super();

        $(input).on('change', function (e) {
          var files = e.target.files;

          self.value = function () {
            if (!files.length) {
              return null;
            } else if (self.settings.multiple) {
              return files;
            } else {
              return files[0];
            }
          };

          e.preventDefault();

          if (files.length) {
            self.fire('change', e);
          }
        });

        // ui.Button prevents default on click, so we shouldn't let the click to propagate up to it
        $(input).on('click', function (e) {
          e.stopPropagation();
        });

        $(self.getEl('button')).on('click', function (e) {
          e.stopPropagation();
          input.click();
        });

        // in newer browsers input doesn't have to be attached to dom to trigger browser dialog
        // however older IE11 (< 11.1358.14393.0) still requires this
        self.getEl().appendChild(input);
      },


      remove: function () {
        $(this.getEl('button')).off();
        $(this.getEl('input')).off();

        this._super();
      }
    });
  }
);
