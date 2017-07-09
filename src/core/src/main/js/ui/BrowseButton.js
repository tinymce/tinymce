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
  'tinymce.core.ui.BrowseButton',
  [
    'tinymce.core.ui.Button',
    'tinymce.core.util.Tools',
    'tinymce.core.ui.DomUtils',
    'global!RegExp'
  ],
  function (Button, Tools, DomUtils, RegExp) {
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

        self._super();

        self.on('click', function () {
          var input = DomUtils.create('input', {
            type: 'file',
            accept: self.settings.accept
          });

          DomUtils.on(input, 'change', function onChange(e) {
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
            DomUtils.off(this, 'change', onChange);

            if (files.length) {
              self.fire('change', e);
            }
          });

          input.click();
        });
      }
    });
  }
);
