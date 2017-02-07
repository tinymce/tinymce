/**
 * Progress.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Progress control.
 *
 * @-x-less Progress.less
 * @class tinymce.ui.Progress
 * @extends tinymce.ui.Control
 */
define(
  'tinymce.core.ui.Progress',
  [
    "tinymce.core.ui.Widget"
  ],
  function (Widget) {
    "use strict";

    return Widget.extend({
      Defaults: {
        value: 0
      },

      init: function (settings) {
        var self = this;

        self._super(settings);
        self.classes.add('progress');

        if (!self.settings.filter) {
          self.settings.filter = function (value) {
            return Math.round(value);
          };
        }
      },

      renderHtml: function () {
        var self = this, id = self._id, prefix = this.classPrefix;

        return (
          '<div id="' + id + '" class="' + self.classes + '">' +
          '<div class="' + prefix + 'bar-container">' +
          '<div class="' + prefix + 'bar"></div>' +
          '</div>' +
          '<div class="' + prefix + 'text">0%</div>' +
          '</div>'
        );
      },

      postRender: function () {
        var self = this;

        self._super();
        self.value(self.settings.value);

        return self;
      },

      bindStates: function () {
        var self = this;

        function setValue(value) {
          value = self.settings.filter(value);
          self.getEl().lastChild.innerHTML = value + '%';
          self.getEl().firstChild.firstChild.style.width = value + '%';
        }

        self.state.on('change:value', function (e) {
          setValue(e.value);
        });

        setValue(self.state.get('value'));

        return self._super();
      }
    });
  }
);