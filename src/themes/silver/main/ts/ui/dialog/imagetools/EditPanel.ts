/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AlloyComponent,
  AlloySpec,
  AlloyTriggers,
  Behaviour,
  Container,
  Focusing,
  Memento,
  Replacing,
  Representing,
  SketchSpec,
  Slider,
} from '@ephox/alloy';
import { SliderValueX } from '@ephox/alloy/lib/main/ts/ephox/alloy/ui/types/SliderTypes';
import { ImageTransformations } from '@ephox/imagetools';
import { Fun, Option } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from '../../../backstage/Backstage';
import { renderButton, renderIconButton } from '../../general/Button';
import { renderSizeInput } from '../SizeInput';
import * as ImageToolsEvents from './ImageToolsEvents';

const renderEditPanel = (imagePanel, providersBackstage: UiFactoryBackstageProviders) => {
  const createButton = (text: string, action: (button: AlloyComponent) => void, disabled: boolean, primary: boolean): SketchSpec => {
    return renderButton({
      name: text,
      text,
      disabled,
      primary
    }, action, providersBackstage);
  };

  const createIconButton = (icon: string, tooltip: string, action: (button: AlloyComponent) => void, disabled: boolean): SketchSpec => {
    return renderIconButton({
      name: icon,
      icon: Option.some(icon),
      tooltip: Option.some(tooltip),
      disabled
    }, action, providersBackstage);
  };

  const panelDom = {
    tag: 'div',
    classes: [ 'tox-image-tools__toolbar', 'tox-image-tools-edit-panel']
  };

  const none = Option.none();
  const noop = Fun.noop;

  const emit = (comp: AlloyComponent, event: string, data: Object): void => {
    AlloyTriggers.emitWith(comp, event, data);
  };

  const emitTransform = (comp: AlloyComponent, transform: (ir: any) => any): void => {
    emit(comp, ImageToolsEvents.internal.transform(), {
      transform
    });
  };

  const emitTempTransform = (comp: AlloyComponent, transform: (ir: any) => any): void => {
    emit(comp, ImageToolsEvents.internal.tempTransform(), {
      transform
    });
  };

  const getBackSwap = (anyInSystem: AlloyComponent): (() => void) => (): void => {
    memContainer.getOpt(anyInSystem).each((container) => {
      Replacing.set(container, [ButtonPanel]);
    });
  };

  const emitTransformApply = (comp: AlloyComponent, transform: (ir: any) => any): void => {
    emit(comp, ImageToolsEvents.internal.transformApply(), {
      transform,
      swap: getBackSwap(comp)
    });
  };

  const createBackButton = (): SketchSpec => {
    return createButton('Back', (button) => emit(button, ImageToolsEvents.internal.back(), {
      swap: getBackSwap(button)
    }), false, false);
  };

  const createSpacer = (): AlloySpec => {
    return {
      dom: {
        tag: 'div',
        classes: [ 'tox-spacer' ]
      }
    };
  };

  const createApplyButton = (): SketchSpec => {
    return createButton('Apply', (button) => emit(button, ImageToolsEvents.internal.apply(), {
      swap: getBackSwap(button)
    }), true, true);
  };

  const makeCropTransform = (): ((ir: any) => any) => (ir: any): any => {
    const rect = imagePanel.getRect();
    return ImageTransformations.crop(ir, rect.x, rect.y, rect.w, rect.h);
  };

  const CropPanel = Container.sketch({
    dom: panelDom,
    components: [
      createBackButton(),
      createSpacer(),
      createButton('Apply', (button) => {
        const transform = makeCropTransform();
        emitTransformApply(button, transform);
        imagePanel.hideCrop();
      }, false, true)
    ]
  });

  const memSize = Memento.record(
    renderSizeInput({
      name: 'size',
      label: none,
      type: 'sizeinput',
      constrain: true
    }, providersBackstage)
  );

  const makeResizeTransform = (width: number, height: number): ((ir: any) => any) => (ir: any): any => {
    return ImageTransformations.resize(ir, width, height);
  };

  const ResizePanel = Container.sketch({
    dom: panelDom,
    components: [
      createBackButton(),
      createSpacer(),
      memSize.asSpec(),
      createSpacer(),
      createButton('Apply', (button) => {
        memSize.getOpt(button).each((sizeInput) => {
          const value = Representing.getValue(sizeInput);
          const width = parseInt(value.width, 10);
          const height = parseInt(value.height, 10);
          const transform = makeResizeTransform(width, height);
          emitTransformApply(button, transform);
        });
      }, false, true)
    ]
  });

  const makeValueTransform = (transform: (ir: any, value: any) => any, value: any) => (ir: any): any => transform(ir, value);

  const horizontalFlip = makeValueTransform(ImageTransformations.flip, 'h');
  const verticalFlip = makeValueTransform(ImageTransformations.flip, 'v');
  const counterclockwiseRotate = makeValueTransform(ImageTransformations.rotate, -90);
  const clockwiseRotate = makeValueTransform(ImageTransformations.rotate, 90);

  const FlipRotatePanel = Container.sketch({
    dom: panelDom,
    components: [
      createBackButton(),
      createSpacer(),
      createIconButton('flip-horizontally', 'Flip horizontally', (button) => {
        emitTempTransform(button, horizontalFlip);
      }, false),
      createIconButton('flip-vertically', 'Flip vertically', (button) => {
        emitTempTransform(button, verticalFlip);
      }, false),
      createIconButton('rotate-left', 'Rotate counterclockwise', (button) => {
        emitTempTransform(button, counterclockwiseRotate);
      }, false),
      createIconButton('rotate-right', 'Rotate clockwise', (button) => {
        emitTempTransform(button, clockwiseRotate);
      }, false),
      createSpacer(),
      createApplyButton()
    ]
  });

  const makeSlider = (label: string, onChoose: (slider: AlloyComponent, thumb: AlloyComponent, value: SliderValueX) => void, min: number, value: number, max: number): SketchSpec => {
    const labelPart = Slider.parts().label({
      dom: {
        tag: 'label',
        innerHtml: providersBackstage.translate(label)
      }
    });

    const spectrum = Slider.parts().spectrum({
      dom: {
        tag: 'div',
        classes: ['tox-slider__rail'],
        attributes: {
          role: 'presentation'
        }
      }
    });

    const thumb = Slider.parts().thumb({
      dom: {
        tag: 'div',
        classes: ['tox-slider__handle'],
        attributes: {
          role: 'presentation'
        }
      }
    });

    return Slider.sketch({
      dom: {
        tag: 'div',
        classes: ['tox-slider'],
        attributes: {
          role: 'presentation'
        }
      },
      model: {
        mode: 'x',
        minX: min,
        maxX: max,
        getInitialValue: Fun.constant({ x: Fun.constant(value) })
      },
      components: [
        labelPart,
        spectrum,
        thumb
      ],
      sliderBehaviours: Behaviour.derive([
        Focusing.config({})
      ]),
      onChoose
    });
  };

  const makeVariableSlider = (label: string, transform: (ir: any, adjust: any) => any, min: number, value: number, max: number): SketchSpec => {
    const onChoose = (slider: AlloyComponent, thumb: AlloyComponent, value: SliderValueX): void => {
      const valTransform = makeValueTransform(transform, value.x() / 100);

      emitTransform(slider, valTransform);
    };
    return makeSlider(label, onChoose, min, value, max);
  };

  const createVariableFilterPanel = (label: string, transform: (ir: any, adjust: any) => any, min: number, value: number, max: number): SketchSpec => {
    return Container.sketch({
      dom: panelDom,
      components: [
        createBackButton(),
        makeVariableSlider(label, transform, min, value, max),
        createApplyButton()
      ]
    });
  };

  // Invert, Sharpen, Emboss
  const FilterPanel = Container.sketch({
    dom: panelDom,
    components: [
      createBackButton(),
      createSpacer(),
      createApplyButton()
    ]
  });

  const BrightnessPanel = createVariableFilterPanel('Brightness', ImageTransformations.brightness, -100, 0, 100);
  const ContrastPanel = createVariableFilterPanel('Contrast', ImageTransformations.contrast, -100, 0, 100);
  const GammaPanel = createVariableFilterPanel('Gamma', ImageTransformations.gamma, -100, 0, 100);

  const makeColorTransform = (red: number, green: number, blue: number): ((ir: any) => any) => (ir: any): any => ImageTransformations.colorize(ir, red, green, blue);

  const makeColorSlider = (label: string) => {
    const onChoose = (slider: AlloyComponent, thumb: AlloyComponent, value: SliderValueX): void => {
      const redOpt = memRed.getOpt(slider);
      const blueOpt = memBlue.getOpt(slider);
      const greenOpt = memGreen.getOpt(slider);
      redOpt.each((red) => {
        blueOpt.each((blue) => {
          greenOpt.each((green) => {
            const r = Representing.getValue(red).x() / 100;
            const g = Representing.getValue(green).x() / 100;
            const b = Representing.getValue(blue).x() / 100;
            const transform = makeColorTransform(r, g, b);
            emitTransform(slider, transform);
          });
        });
      });
    };

    return makeSlider(label, onChoose, 0, 100, 200);
  };

  const memRed = Memento.record(
    makeColorSlider('R')
  );

  const memGreen = Memento.record(
    makeColorSlider('G')
  );

  const memBlue = Memento.record(
    makeColorSlider('B')
  );

  // Colorize
  const ColorizePanel = Container.sketch({
    dom: panelDom,
    components: [
      createBackButton(),
      memRed.asSpec(),
      memGreen.asSpec(),
      memBlue.asSpec(),
      createApplyButton()
    ]
  });

  const getTransformPanelEvent = (panel: AlloySpec, transform: Option<(ir: any) => any>, update: (container: AlloyComponent) => void): ((button: AlloyComponent) => void) => (button: AlloyComponent): void => {
    const swap = () => {
      memContainer.getOpt(button).each((container) => {
        Replacing.set(container, [panel]);
        update(container);
      });
    };
    emit(button, ImageToolsEvents.internal.swap(), {
      transform,
      swap
    });
  };

  const cropPanelUpdate = (_anyInSystem: AlloyComponent): void => {
    imagePanel.showCrop();
  };

  const resizePanelUpdate = (anyInSystem: AlloyComponent): void => {
    memSize.getOpt(anyInSystem).each((sizeInput) => {
      const measurements = imagePanel.getMeasurements();
      const width = measurements.width;
      const height = measurements.height;
      Representing.setValue(sizeInput, {
        width,
        height
      });
    });
  };

  const sharpenTransform = Option.some(ImageTransformations.sharpen);
  const invertTransform = Option.some(ImageTransformations.invert);

  const ButtonPanel = Container.sketch({
    dom: panelDom,
    components: [
      createIconButton('crop', 'Crop', getTransformPanelEvent(CropPanel, none, cropPanelUpdate), false),
      createIconButton('resize', 'Resize', getTransformPanelEvent(ResizePanel, none, resizePanelUpdate), false),
      createIconButton('orientation', 'Orientation', getTransformPanelEvent(FlipRotatePanel, none, noop), false),
      createIconButton('brightness', 'Brightness', getTransformPanelEvent(BrightnessPanel, none, noop), false),
      createIconButton('sharpen', 'Sharpen', getTransformPanelEvent(FilterPanel, sharpenTransform, noop), false),
      createIconButton('contrast', 'Contrast', getTransformPanelEvent(ContrastPanel, none, noop), false),
      createIconButton('color-levels', 'Color levels', getTransformPanelEvent(ColorizePanel, none, noop), false),
      createIconButton('gamma', 'Gamma', getTransformPanelEvent(GammaPanel, none, noop), false),
      createIconButton('invert', 'Invert', getTransformPanelEvent(FilterPanel, invertTransform, noop), false),
    ]
  });

  const container = Container.sketch({
    dom: {
      tag: 'div'
    },
    components: [
      ButtonPanel
    ],
    containerBehaviours: Behaviour.derive([
      Replacing.config({})
    ])
  });

  const memContainer = Memento.record(container);

  const getApplyButton = (anyInSystem: AlloyComponent): Option<AlloyComponent> => {
    return memContainer.getOpt(anyInSystem).map((container) => {
      const panel = container.components()[0];
      return panel.components()[panel.components().length - 1];
    });
  };

  return {
    memContainer,
    getApplyButton
  };
};

export {
  renderEditPanel
};