/**
 * ImagePanel.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Rect from 'tinymce/core/api/geom/Rect';
import Factory from 'tinymce/core/api/ui/Factory';
import LoadImage from '../core/LoadImage';
import CropRect from './CropRect';
import { Image, document } from '@ephox/dom-globals';

const create = function (settings) {
  const Control = Factory.get('Control');
  const ImagePanel = Control.extend({
    Defaults: {
      classes: 'imagepanel'
    },

    selection (rect) {
      if (arguments.length) {
        this.state.set('rect', rect);
        return this;
      }

      return this.state.get('rect');
    },

    imageSize () {
      const viewRect = this.state.get('viewRect');

      return {
        w: viewRect.w,
        h: viewRect.h
      };
    },

    toggleCropRect (state) {
      this.state.set('cropEnabled', state);
    },

    imageSrc (url) {
      const self = this, img = new Image();

      img.src = url;

      LoadImage.loadImage(img).then(function () {
        let rect, $img;
        const lastRect = self.state.get('viewRect');

        $img = self.$el.find('img');
        if ($img[0]) {
          $img.replaceWith(img);
        } else {
          const bg = document.createElement('div');
          bg.className = 'mce-imagepanel-bg';
          self.getEl().appendChild(bg);
          self.getEl().appendChild(img);
        }

        rect = { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight };
        self.state.set('viewRect', rect);
        self.state.set('rect', Rect.inflate(rect, -20, -20));

        if (!lastRect || lastRect.w !== rect.w || lastRect.h !== rect.h) {
          self.zoomFit();
        }

        self.repaintImage();
        self.fire('load');
      });
    },

    zoom (value) {
      if (arguments.length) {
        this.state.set('zoom', value);
        return this;
      }

      return this.state.get('zoom');
    },

    postRender () {
      this.imageSrc(this.settings.imageSrc);
      return this._super();
    },

    zoomFit () {
      const self = this;
      let $img, pw, ph, w, h, zoom, padding;

      padding = 10;
      $img = self.$el.find('img');
      pw = self.getEl().clientWidth;
      ph = self.getEl().clientHeight;
      w = $img[0].naturalWidth;
      h = $img[0].naturalHeight;
      zoom = Math.min((pw - padding) / w, (ph - padding) / h);

      if (zoom >= 1) {
        zoom = 1;
      }

      self.zoom(zoom);
    },

    repaintImage () {
      let x, y, w, h, pw, ph, $img, $bg, zoom, rect, elm;

      elm = this.getEl();
      zoom = this.zoom();
      rect = this.state.get('rect');
      $img = this.$el.find('img');
      $bg = this.$el.find('.mce-imagepanel-bg');
      pw = elm.offsetWidth;
      ph = elm.offsetHeight;
      w = $img[0].naturalWidth * zoom;
      h = $img[0].naturalHeight * zoom;
      x = Math.max(0, pw / 2 - w / 2);
      y = Math.max(0, ph / 2 - h / 2);

      $img.css({
        left: x,
        top: y,
        width: w,
        height: h
      });

      $bg.css({
        left: x,
        top: y,
        width: w,
        height: h
      });

      if (this.cropRect) {
        this.cropRect.setRect({
          x: rect.x * zoom + x,
          y: rect.y * zoom + y,
          w: rect.w * zoom,
          h: rect.h * zoom
        });

        this.cropRect.setClampRect({
          x,
          y,
          w,
          h
        });

        this.cropRect.setViewPortRect({
          x: 0,
          y: 0,
          w: pw,
          h: ph
        });
      }
    },

    bindStates () {
      const self = this;

      function setupCropRect(rect) {
        self.cropRect = CropRect(
          rect,
          self.state.get('viewRect'),
          self.state.get('viewRect'),
          self.getEl(),
          function () {
            self.fire('crop');
          }
        );

        self.cropRect.on('updateRect', function (e) {
          let rect = e.rect;
          const zoom = self.zoom();

          rect = {
            x: Math.round(rect.x / zoom),
            y: Math.round(rect.y / zoom),
            w: Math.round(rect.w / zoom),
            h: Math.round(rect.h / zoom)
          };

          self.state.set('rect', rect);
        });

        self.on('remove', self.cropRect.destroy);
      }

      self.state.on('change:cropEnabled', function (e) {
        self.cropRect.toggleVisibility(e.value);
        self.repaintImage();
      });

      self.state.on('change:zoom', function () {
        self.repaintImage();
      });

      self.state.on('change:rect', function (e) {
        const rect = e.value;

        if (!self.cropRect) {
          setupCropRect(rect);
        }

        self.cropRect.setRect(rect);
      });
    }
  });

  return new ImagePanel(settings);
};

export default {
  create
};