/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import $ from 'tinymce/core/api/dom/DomQuery';
import DragHelper from './DragHelper';

/**
 * This mixin makes controls scrollable using custom scrollbars.
 *
 * @-x-less Scrollable.less
 * @mixin tinymce.ui.Scrollable
 */

export default {
  init () {
    const self = this;
    self.on('repaint', self.renderScroll);
  },

  renderScroll () {
    const self = this, margin = 2;

    function repaintScroll() {
      let hasScrollH, hasScrollV, bodyElm;

      function repaintAxis(axisName, posName, sizeName, contentSizeName, hasScroll, ax) {
        let containerElm, scrollBarElm, scrollThumbElm;
        let containerSize, scrollSize, ratio, rect;
        let posNameLower, sizeNameLower;

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
          scrollThumbElm = self.getEl('scroll' + axisName + 't');
          containerSize = containerElm['client' + sizeName] - (margin * 2);
          containerSize -= hasScrollH && hasScrollV ? scrollBarElm['client' + ax] : 0;
          scrollSize = containerElm['scroll' + sizeName];
          ratio = containerSize / scrollSize;

          rect = {};
          rect[posNameLower] = containerElm['offset' + posName] + margin;
          rect[sizeNameLower] = containerSize;
          $(scrollBarElm).css(rect);

          rect = {};
          rect[posNameLower] = containerElm['scroll' + posName] * ratio;
          rect[sizeNameLower] = containerSize * ratio;
          $(scrollThumbElm).css(rect);
        }
      }

      bodyElm = self.getEl('body');
      hasScrollH = bodyElm.scrollWidth > bodyElm.clientWidth;
      hasScrollV = bodyElm.scrollHeight > bodyElm.clientHeight;

      repaintAxis('h', 'Left', 'Width', 'contentW', hasScrollH, 'Height');
      repaintAxis('v', 'Top', 'Height', 'contentH', hasScrollV, 'Width');
    }

    function addScroll() {
      function addScrollAxis(axisName, posName, sizeName, deltaPosName, ax) {
        let scrollStart;
        const axisId = self._id + '-scroll' + axisName, prefix = self.classPrefix;

        $(self.getEl()).append(
          '<div id="' + axisId + '" class="' + prefix + 'scrollbar ' + prefix + 'scrollbar-' + axisName + '">' +
          '<div id="' + axisId + 't" class="' + prefix + 'scrollbar-thumb"></div>' +
          '</div>'
        );

        self.draghelper = new DragHelper(axisId + 't', {
          start () {
            scrollStart = self.getEl('body')['scroll' + posName];
            $('#' + axisId).addClass(prefix + 'active');
          },

          drag (e) {
            let ratio, hasScrollH, hasScrollV, containerSize;
            const layoutRect = self.layoutRect();

            hasScrollH = layoutRect.contentW > layoutRect.innerW;
            hasScrollV = layoutRect.contentH > layoutRect.innerH;
            containerSize = self.getEl('body')['client' + sizeName] - (margin * 2);
            containerSize -= hasScrollH && hasScrollV ? self.getEl('scroll' + axisName)['client' + ax] : 0;

            ratio = containerSize / self.getEl('body')['scroll' + sizeName];
            self.getEl('body')['scroll' + posName] = scrollStart + (e['delta' + deltaPosName] / ratio);
          },

          stop () {
            $('#' + axisId).removeClass(prefix + 'active');
          }
        });
      }

      self.classes.add('scroll');

      addScrollAxis('v', 'Top', 'Height', 'Y', 'Width');
      addScrollAxis('h', 'Left', 'Width', 'X', 'Height');
    }

    if (self.settings.autoScroll) {
      if (!self._hasScroll) {
        self._hasScroll = true;
        addScroll();

        self.on('wheel', function (e) {
          const bodyEl = self.getEl('body');

          bodyEl.scrollLeft += (e.deltaX || 0) * 10;
          bodyEl.scrollTop += e.deltaY * 10;

          repaintScroll();
        });

        $(self.getEl('body')).on('scroll', repaintScroll);
      }

      repaintScroll();
    }
  }
};