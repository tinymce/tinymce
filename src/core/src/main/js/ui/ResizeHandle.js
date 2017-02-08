/**
 * ResizeHandle.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Renders a resize handle that fires ResizeStart, Resize and ResizeEnd events.
 *
 * @-x-less ResizeHandle.less
 * @class tinymce.ui.ResizeHandle
 * @extends tinymce.ui.Widget
 */
define(
  'tinymce.core.ui.ResizeHandle',
  [
    "tinymce.core.ui.Widget",
    "tinymce.core.ui.DragHelper"
  ],
  function (Widget, DragHelper) {
    "use strict";

    return Widget.extend({
      /**
       * Renders the control as a HTML string.
       *
       * @method renderHtml
       * @return {String} HTML representing the control.
       */
      renderHtml: function () {
        var self = this, prefix = self.classPrefix;

        self.classes.add('resizehandle');

        if (self.settings.direction == "both") {
          self.classes.add('resizehandle-both');
        }

        self.canFocus = false;

        return (
          '<div id="' + self._id + '" class="' + self.classes + '">' +
          '<i class="' + prefix + 'ico ' + prefix + 'i-resize"></i>' +
          '</div>'
        );
      },

      /**
       * Called after the control has been rendered.
       *
       * @method postRender
       */
      postRender: function () {
        var self = this;

        self._super();

        self.resizeDragHelper = new DragHelper(this._id, {
          start: function () {
            self.fire('ResizeStart');
          },

          drag: function (e) {
            if (self.settings.direction != "both") {
              e.deltaX = 0;
            }

            self.fire('Resize', e);
          },

          stop: function () {
            self.fire('ResizeEnd');
          }
        });
      },

      remove: function () {
        if (this.resizeDragHelper) {
          this.resizeDragHelper.destroy();
        }

        return this._super();
      }
    });
  }
);
