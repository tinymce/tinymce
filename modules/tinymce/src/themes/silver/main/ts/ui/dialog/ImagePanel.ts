/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, Behaviour, Memento, Representing, SimpleSpec } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Optional, Singleton } from '@ephox/katamari';
import { Attribute, Css, Height, SugarElement, Width } from '@ephox/sugar';

import { ComposingConfigs } from '../alien/ComposingConfigs';

type ImagePanelSpec = Omit<Dialog.ImagePanel, 'type'>;

interface ImagePanelData {
  url: string;
  zoom: Optional<number>;
}

// Does this belong somewhere else?
const loadImage = (image: SugarElement<HTMLImageElement>): Promise<SugarElement<HTMLImageElement>> => new Promise((resolve) => {
  const loaded = () => {
    image.dom.removeEventListener('load', loaded);
    resolve(image);
  };

  if (image.dom.complete) {
    resolve(image);
  } else {
    image.dom.addEventListener('load', loaded);
  }
});

const calculateImagePosition = (panelWidth: number, panelHeight: number, imageWidth: number, imageHeight: number, zoom: number) => {
  const width = imageWidth * zoom;
  const height = imageHeight * zoom;
  const left = Math.max(0, panelWidth / 2 - width / 2);
  const top = Math.max(0, panelHeight / 2 - height / 2);

  return {
    left: left.toString() + 'px',
    top: top.toString() + 'px',
    width: width.toString() + 'px',
    height: height.toString() + 'px',
  };
};

const zoomToFit = (panel: SugarElement, img: SugarElement) => {
  const panelW = Width.get(panel);
  const panelH = Height.get(panel);
  const width = img.dom.naturalWidth;
  const height = img.dom.naturalHeight;
  return Math.min((panelW) / width, (panelH) / height, 1);
};

export const renderImagePanel = (spec: ImagePanelSpec): SimpleSpec => {
  const cachedData = Singleton.value<ImagePanelData>();

  const memImage = Memento.record({
    dom: {
      tag: 'img',
      classes: [ 'tox-imagepanel__image' ],
    },
  });

  const memContainer = Memento.record({
    dom: {
      tag: 'div',
      classes: [ 'tox-imagepanel__container' ],
      attributes: {
        role: 'presentation'
      },
    },
    components: [
      memImage.asSpec()
    ]
  });

  const setValue = (frameComponent: AlloyComponent, data: ImagePanelData) => {
    const repaintImg = (img) => {
      const zoom = data.zoom.getOrThunk(() => {
        const z = zoomToFit(frameComponent.element, img);
        data.zoom = Optional.some(z);
        return z;
      }
      );
      const position = calculateImagePosition(
        Width.get(frameComponent.element),
        Height.get(frameComponent.element),
        img.dom.naturalWidth,
        img.dom.naturalHeight,
        zoom
      );
      memContainer.getOpt(frameComponent).each((container) => {
        Css.setAll(container.element, position);
      });
      cachedData.set(data);
    };

    memImage.getOpt(frameComponent).each((imageComponent) => {
      const img = imageComponent.element;
      if (data.url !== Attribute.get(img, 'src')) {
        Attribute.set(img, 'src', data.url);
      }

      loadImage(img).then(repaintImg);
    });
  };

  const styles: Record<string, string> = {};
  spec.width.each((w) => styles.width = w);
  spec.height.each((h) => styles.height = h);

  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-imagepanel' ],
      styles,
      attributes: {
        role: 'presentation'
      }
    },
    components: [
      memContainer.asSpec(),
    ],
    behaviours: Behaviour.derive([
      ComposingConfigs.self(),
      Representing.config({
        store: {
          mode: 'manual',
          getValue: () => {
            const value: Record<string, string | number> = {};
            // if data hasn't been set yet, it doesn't seem to matter what we return
            cachedData.on((data) => {
              value.url = data.url;
              data.zoom.each((z) => value.zoom = z);
            });
            return value;
          },
          setValue
        }
      }),
    ])
  };
};
