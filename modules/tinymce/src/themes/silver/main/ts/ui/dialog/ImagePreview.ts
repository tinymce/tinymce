/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, Behaviour, Memento, Representing, SimpleSpec } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Optional, Optionals, Singleton } from '@ephox/katamari';
import { Attribute, Css, Height, Ready, SugarElement, Width } from '@ephox/sugar';

import { ComposingConfigs } from '../alien/ComposingConfigs';

type ImagePreviewSpec = Omit<Dialog.ImagePreview, 'type'>;

export interface ImagePreviewData {
  readonly url: string;
  readonly zoom: Optional<number>;
  // not documented, but can be helpful when dynamically changing the URL
  readonly cachedWidth: Optional<number>;
  readonly cachedHeight: Optional<number>;
}

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

const zoomToFit = (panel: SugarElement<HTMLElement>, width: number, height: number) => {
  const panelW = Width.get(panel);
  const panelH = Height.get(panel);
  return Math.min((panelW) / width, (panelH) / height, 1);
};

export const renderImagePreview = (spec: ImagePreviewSpec): SimpleSpec => {
  const cachedData = Singleton.value<ImagePreviewData>();

  const memImage = Memento.record({
    dom: {
      tag: 'img',
      classes: [ 'tox-imagepreview__image' ],
    },
  });

  const memContainer = Memento.record({
    dom: {
      tag: 'div',
      classes: [ 'tox-imagepreview__container' ],
      attributes: {
        role: 'presentation'
      },
    },
    components: [
      memImage.asSpec()
    ]
  });

  const setValue = (frameComponent: AlloyComponent, data: ImagePreviewData) => {
    const applyFramePositioning = (imageWidth: number, imageHeight: number) => {
      const zoom = data.zoom.getOrThunk(() => {
        const z = zoomToFit(frameComponent.element, imageWidth, imageHeight);
        cachedData.set({
          ...data,
          zoom: Optional.some(z)
        });
        return z;
      }
      );
      const position = calculateImagePosition(
        Width.get(frameComponent.element),
        Height.get(frameComponent.element),
        imageWidth, imageHeight,
        zoom
      );
      memContainer.getOpt(frameComponent).each((container) => {
        Css.setAll(container.element, position);
      });
    };

    memImage.getOpt(frameComponent).each((imageComponent) => {
      const img = imageComponent.element;
      if (data.url !== Attribute.get(img, 'src')) {
        Attribute.set(img, 'src', data.url);
      }

      Optionals.lift2(data.cachedWidth, data.cachedHeight, (width, height) => {
        applyFramePositioning(width, height);
      });

      Ready.image(img).then((img: SugarElement<HTMLImageElement>) => {
        // Ensure the component hasn't been removed while the image was loading
        // if it is disconnected, just do nothing
        if (frameComponent.getSystem().isConnected()) {
          applyFramePositioning(img.dom.naturalWidth, img.dom.naturalHeight);
        }
      });
    });
  };

  const styles: Record<string, string> = {};
  spec.height.each((h) => styles.height = h);

  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-imagepreview' ],
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
