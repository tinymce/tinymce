/**
 * Scrollable.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This mixin makes controls scrollable using custom scrollbars.
 *
 * @-x-less Scrollable.less
 * @mixin tinymce.ui.Scrollable
 */
define(
  'tinymce.ui.Scrollable',
  [
    "tinymce.core.dom.DomQuery",
    "tinymce.ui.DragHelper"
  ],
  function ($, DragHelper) {
    "use strict";

    return {
      init: function () {
        var self = this;
        self.on('repaint', self.renderScroll);
      },

      renderScroll: function () {
        var self = this, margin = 2;

        function repaintScroll() {
          var hasScrollH, hasScrollV, bodyElm;

          function repaintAxis(axisName, posName, sizeName, contentSizeName, hasScroll, ax) {
            var containerElm, scrollBarElm, scrollThumbElm;
            var containerSize, scrollSize, ratio, rect;
            var posNameLower, sizeNameLower;

            scrollBarElm = self.getEl('scroll' + axisName);
            if (scrollBarElm) {
              posNameLower = posName.toLowerCase();
              sizeNameLower = sizeName.toLowerCase();

              $(self.getEl('absend')).css(posNameLower, self.layoutRect()[contentSizeName] - 1);

              if (!hasScroll) {
                $(scrollBarElm).css('display', 'none');
                return;
              }

              $(scrollBarElm).css('display', 'block');
              containerElm = self.getEl('body');
              scrollThumbElm = self.getEl('scroll' + axisName + "t");
              containerSize = containerElm["client" + sizeName] - (margin * 2);
              containerSize -= hasScrollH && hasScrollV ? scrollBarElm["client" + ax] : 0;
              scrollSize = containerElm["scroll" + sizeName];
              ratio = containerSize / scrollSize;

              rect = {};
              rect[posNameLower] = containerElm["offset" + posName] + margin;
              rect[sizeNameLower] = containerSize;
              $(scrollBarElm).css(rect);

              rect = {};
              rect[posNameLower] = containerElm["scroll" + posName] * ratio;
              rect[sizeNameLower] = containerSize * ratio;
              $(scrollThumbElm).css(rect);
            }
          }

          bodyElm = self.getEl('body');
          hasScrollH = bodyElm.scrollWidth > bodyElm.clientWidth;
          hasScrollV = bodyElm.scrollHeight > bodyElm.clientHeight;

          repaintAxis("h", "Left", "Width", "contentW", hasScrollH, "Height");
          repaintAxis("v", "Top", "Height", "contentH", hasScrollV, "Width");
        }

        function addScroll() {
          function addScrollAxis(axisName, posName, sizeName, deltaPosName, ax) {
            var scrollStart, axisId = self._id + '-scroll' + axisName, prefix = self.classPrefix;

            $(self.getEl()).append(
              '<div id="' + axisId + '" class="' + prefix + 'scrollbar ' + prefix + 'scrollbar-' + axisName + '">' +
              '<div id="' + axisId + 't" class="' + prefix + 'scrollbar-thumb"></div>' +
              '</div>'
            );

            self.draghelper = new DragHelper(axisId + 't', {
              start: function () {
                scrollStart = self.getEl('body')["scroll" + posName];
                $('#' + axisId).addClass(prefix + 'active');
              },

              drag: function (e) {
                var ratio, hasScrollH, hasScrollV, containerSize, layoutRect = self.layoutRect();

                hasScrollH = layoutRect.contentW > layoutRect.innerW;
                hasScrollV = layoutRect.contentH > layoutRect.innerH;
                containerSize = self.getEl('body')["client" + sizeName] - (margin * 2);
                containerSize -= hasScrollH && hasScrollV ? self.getEl('scroll' + axisName)["client" + ax] : 0;

                ratio = containerSize / self.getEl('body')["scroll" + sizeName];
                self.getEl('body')["scroll" + posName] = scrollStart + (e["delta" + deltaPosName] / ratio);
              },

              stop: function () {
                $('#' + axisId).removeClass(prefix + 'active');
              }
            });
          }

          self.classes.add('scroll');

          addScrollAxis("v", "Top", "Height", "Y", "Width");
          addScrollAxis("h", "Left", "Width", "X", "Height");
        }

        if (self.settings.autoScroll) {
          if (!self._hasScroll) {
            self._hasScroll = true;
            addScroll();

            self.on('wheel', function (e) {
              var bodyEl = self.getEl('body');

              bodyEl.scrollLeft += (e.deltaX || 0) * 10;
              bodyEl.scrollTop += e.deltaY * 10;

              repaintScroll();
            });

            $(self.getEl('body')).on("scroll", repaintScroll);
          }

          repaintScroll();
        }
      }
    };
  }
);