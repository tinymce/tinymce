import { AlloyComponent, Behaviour, Memento, SimpleSpec } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Cell, Optional, Type } from '@ephox/katamari';
import { Attribute, Class, Css, Height, Ready, SugarElement, Width } from '@ephox/sugar';

import { ComposingConfigs } from '../alien/ComposingConfigs';
import * as RepresentingConfigs from '../alien/RepresentingConfigs';

type ImagePreviewSpec = Omit<Dialog.ImagePreview, 'type'>;

export interface ImagePreviewDataSpec {
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
  return Math.min(panelW / width, panelH / height, 1);
};

export const renderImagePreview = (spec: ImagePreviewSpec, initialData: Optional<Dialog.ImagePreviewData>): SimpleSpec => {
  const cachedData = Cell<Dialog.ImagePreviewData>(initialData.getOr({ url: '' }));

  const memImage = Memento.record({
    dom: {
      tag: 'img',
      classes: [ 'tox-imagepreview__image' ],
      attributes: initialData.map((data) => ({ src: data.url })).getOr({})
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

  const setValue = (frameComponent: AlloyComponent, data: ImagePreviewDataSpec) => {
    const translatedData: Dialog.ImagePreviewData = {
      url: data.url
    };
    // update properties that are set by the data
    data.zoom.each((z) => translatedData.zoom = z);
    data.cachedWidth.each((z) => translatedData.cachedWidth = z);
    data.cachedHeight.each((z) => translatedData.cachedHeight = z);
    cachedData.set(translatedData);

    const applyFramePositioning = () => {
      const { cachedWidth, cachedHeight, zoom } = translatedData;
      if (!Type.isUndefined(cachedWidth) && !Type.isUndefined(cachedHeight)) {
        if (Type.isUndefined(zoom)) {
          const z = zoomToFit(frameComponent.element, cachedWidth, cachedHeight);
          // sneaky mutation since we own the object
          translatedData.zoom = z;
        }
        const position = calculateImagePosition(
          Width.get(frameComponent.element),
          Height.get(frameComponent.element),
          cachedWidth,
          cachedHeight,
          translatedData.zoom as number
        );
        memContainer.getOpt(frameComponent).each((container) => {
          Css.setAll(container.element, position);
        });
      }
    };

    memImage.getOpt(frameComponent).each((imageComponent) => {
      const img = imageComponent.element;
      if (data.url !== Attribute.get(img, 'src')) {
        Attribute.set(img, 'src', data.url);
        Class.remove(frameComponent.element, 'tox-imagepreview__loaded');
      }

      applyFramePositioning();

      Ready.image(img).then((img) => {
        // Ensure the component hasn't been removed while the image was loading
        // if it is disconnected, just do nothing
        if (frameComponent.getSystem().isConnected()) {
          Class.add(frameComponent.element, 'tox-imagepreview__loaded');
          // sneaky mutation since we own the object
          translatedData.cachedWidth = img.dom.naturalWidth;
          translatedData.cachedHeight = img.dom.naturalHeight;
          applyFramePositioning();
        }
      });
    });
  };

  const styles: Record<string, string> = {};
  spec.height.each((h) => styles.height = h);

  // TODO: TINY-8393 Use the initial data properly once it's validated
  const fakeValidatedData: Optional<ImagePreviewDataSpec> = initialData.map((d) => ({
    url: d.url,
    zoom: Optional.from(d.zoom),
    cachedWidth: Optional.from(d.cachedWidth),
    cachedHeight: Optional.from(d.cachedHeight),
  }));

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
      RepresentingConfigs.withComp(
        fakeValidatedData,
        () =>
          /*
            NOTE: This is intentionally returning the cached image width and height.

            Including those details in the dialog data helps when `setData` only changes the URL, as
            the old image must continue to be displayed at the old size until the new image has loaded.
          */
          cachedData.get(),
        setValue
      ),
    ])
  };
};
