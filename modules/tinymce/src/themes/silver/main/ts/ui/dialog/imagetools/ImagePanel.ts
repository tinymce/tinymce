/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AddEventsBehaviour, AlloyComponent, AlloyEvents, Behaviour, Container, GuiFactory, Memento, Replacing } from '@ephox/alloy';
import { Cell, Fun, Optional, Singleton } from '@ephox/katamari';
import { Attribute, Css, Height, SugarElement, Width } from '@ephox/sugar';

import Rect, { GeomRect } from 'tinymce/core/api/geom/Rect';
import Promise from 'tinymce/core/api/util/Promise';

import { CropRect } from './CropRect';

const loadImage = (image: HTMLImageElement): Promise<HTMLImageElement> => new Promise((resolve) => {
  const loaded = () => {
    image.removeEventListener('load', loaded);
    resolve(image);
  };

  if (image.complete) {
    resolve(image);
  } else {
    image.addEventListener('load', loaded);
  }
});

const renderImagePanel = (initialUrl: string) => {
  const memBg = Memento.record(
    {
      dom: {
        tag: 'div',
        classes: [ 'tox-image-tools__image-bg' ],
        attributes: {
          role: 'presentation'
        }
      }
    }
  );

  const zoomState = Cell(1);
  const cropRect = Singleton.api<CropRect>();
  const rectState = Cell({
    x: 0,
    y: 0,
    w: 1,
    h: 1
  });
  const viewRectState = Cell({
    x: 0,
    y: 0,
    w: 1,
    h: 1
  });

  const repaintImg = (anyInSystem: AlloyComponent, img: SugarElement): void => {
    memContainer.getOpt(anyInSystem).each((panel) => {
      const zoom = zoomState.get();

      const panelW = Width.get(panel.element);
      const panelH = Height.get(panel.element);
      const width = img.dom.naturalWidth * zoom;
      const height = img.dom.naturalHeight * zoom;
      const left = Math.max(0, panelW / 2 - width / 2);
      const top = Math.max(0, panelH / 2 - height / 2);

      const css = {
        left: left.toString() + 'px',
        top: top.toString() + 'px',
        width: width.toString() + 'px',
        height: height.toString() + 'px',
        position: 'absolute'
      };

      Css.setAll(img, css);
      memBg.getOpt(panel).each((bg) => {
        Css.setAll(bg.element, css);
      });

      cropRect.run((cRect) => {
        const rect = rectState.get();
        cRect.setRect({
          x: rect.x * zoom + left,
          y: rect.y * zoom + top,
          w: rect.w * zoom,
          h: rect.h * zoom
        });
        cRect.setClampRect({
          x: left,
          y: top,
          w: width,
          h: height
        });
        cRect.setViewPortRect({
          x: 0,
          y: 0,
          w: panelW,
          h: panelH
        });
      });
    });
  };

  const zoomFit = (anyInSystem: AlloyComponent, img: SugarElement): void => {
    memContainer.getOpt(anyInSystem).each((panel) => {
      const panelW = Width.get(panel.element);
      const panelH = Height.get(panel.element);
      const width = img.dom.naturalWidth;
      const height = img.dom.naturalHeight;
      const zoom = Math.min((panelW) / width, (panelH) / height);

      if (zoom >= 1) {
        zoomState.set(1);
      } else {
        zoomState.set(zoom);
      }
    });
  };

  const updateSrc = (anyInSystem: AlloyComponent, url: string): Promise<void> => {
    const img = SugarElement.fromTag('img');
    Attribute.set(img, 'src', url);
    return loadImage(img.dom).then(() => {
      // Ensure the component hasn't been removed while the image was loading
      // if it has, then just do nothing
      if (anyInSystem.getSystem().isConnected()) {
        memContainer.getOpt(anyInSystem).map((panel) => {
          const aImg = GuiFactory.external({
            element: img
          });

          Replacing.replaceAt(panel, 1, Optional.some(aImg));

          const lastViewRect = viewRectState.get();
          const viewRect = {
            x: 0,
            y: 0,
            w: img.dom.naturalWidth,
            h: img.dom.naturalHeight
          };
          viewRectState.set(viewRect);
          const rect = Rect.inflate(viewRect, -20, -20);
          rectState.set(rect);

          if (lastViewRect.w !== viewRect.w || lastViewRect.h !== viewRect.h) {
            zoomFit(panel, img);
          }

          repaintImg(panel, img);
        });
      }
    });
  };

  const zoom = (anyInSystem: AlloyComponent, direction: number): void => {
    const currentZoom = zoomState.get();
    const newZoom = (direction > 0) ? Math.min(2, currentZoom + 0.1) : Math.max(0.1, currentZoom - 0.1);
    zoomState.set(newZoom);

    memContainer.getOpt(anyInSystem).each((panel) => {
      const img = panel.components()[1].element; // TODO: Do this better
      repaintImg(panel, img);
    });
  };

  const showCrop = (): void => {
    cropRect.run((cRect) => {
      cRect.toggleVisibility(true);
    });
  };

  const hideCrop = (): void => {
    cropRect.run((cRect) => {
      cRect.toggleVisibility(false);
    });
  };

  const getRect = (): GeomRect => rectState.get();

  const container = Container.sketch({
    dom: {
      tag: 'div',
      classes: [ 'tox-image-tools__image' ]
    },
    components: [
      memBg.asSpec(),
      {
        dom: {
          tag: 'img',
          attributes: {
            src: initialUrl
          }
        }
      },
      {
        dom: {
          tag: 'div'
        },
        behaviours: Behaviour.derive([
          AddEventsBehaviour.config('image-panel-crop-events', [
            AlloyEvents.runOnAttached((comp) => {
              memContainer.getOpt(comp).each((container) => {
                const el = container.element.dom;
                const cRect = CropRect.create(
                  { x: 10, y: 10, w: 100, h: 100 },
                  { x: 0, y: 0, w: 200, h: 200 },
                  { x: 0, y: 0, w: 200, h: 200 },
                  el,
                  Fun.noop // TODO: Add back keyboard handling for cropping
                );
                cRect.toggleVisibility(false);
                cRect.on('updateRect', (e) => {
                  const rect = e.rect;
                  const zoom = zoomState.get();
                  const newRect = {
                    x: Math.round(rect.x / zoom),
                    y: Math.round(rect.y / zoom),
                    w: Math.round(rect.w / zoom),
                    h: Math.round(rect.h / zoom)
                  };
                  rectState.set(newRect);
                });
                cropRect.set(cRect);
              });
            }),
            AlloyEvents.runOnDetached(() => {
              cropRect.clear();
            })
          ])
        ])
      }
    ],
    containerBehaviours: Behaviour.derive([
      Replacing.config({}),
      AddEventsBehaviour.config('image-panel-events', [
        AlloyEvents.runOnAttached((comp) => {
          updateSrc(comp, initialUrl);
        })
      ])
    ])
  });

  const memContainer = Memento.record(container);

  const getMeasurements = () => {
    const viewRect = viewRectState.get();
    return {
      width: viewRect.w,
      height: viewRect.h
    };
  };

  return {
    memContainer,
    updateSrc,
    zoom,
    showCrop,
    hideCrop,
    getRect,
    getMeasurements
  };
};

export {
  renderImagePanel
};
