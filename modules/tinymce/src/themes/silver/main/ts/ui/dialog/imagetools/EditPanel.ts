/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AlloyComponent,
  AlloyEvents,
  AlloySpec,
  AlloyTriggers,
  Behaviour,
  Container,
  Focusing,
  Memento,
  Replacing,
  Representing,
  Slider,
  SliderTypes,
  Disabling,
  AddEventsBehaviour
} from '@ephox/alloy';
import { ImageResult, ImageTransformations } from '@ephox/imagetools';
import { Fun, Option } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from 'tinymce/themes/silver/backstage/Backstage';
import { renderButton, renderIconButton } from '../../general/Button';
import { renderSizeInput } from '../SizeInput';
import * as ImageToolsEvents from './ImageToolsEvents';

const renderEditPanel = (imagePanel, providersBackstage: UiFactoryBackstageProviders) => {
  const createButton = (text: string, action: (button: AlloyComponent) => void, disabled: boolean, primary: boolean): Memento.MementoRecord => {
    return Memento.record(renderButton({
      name: text,
      text,
      disabled,
      primary,
      icon: Option.none()
    }, action, providersBackstage));
  };

  const createIconButton = (icon: string, tooltip: string, action: (button: AlloyComponent) => void, disabled: boolean): Memento.MementoRecord => {
    return Memento.record(renderIconButton({
      name: icon,
      icon: Option.some(icon),
      tooltip: Option.some(tooltip),
      disabled,
      primary: false
    }, action, providersBackstage));
  };

  const disableAllComponents = (comps, eventcomp) => {
    comps.map((mem) => {
      const component = mem.get(eventcomp);
      if (component.hasConfigured(Disabling)) {
        Disabling.disable(component);
      }
    });
  };

  const enableAllComponents = (comps, eventcomp) => {
    comps.map((mem) => {
      const component = mem.get(eventcomp);
      if (component.hasConfigured(Disabling)) {
        Disabling.enable(component);
      }
    });
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

  const emitDisable = (component) => AlloyTriggers.emit(component, ImageToolsEvents.external.disable());
  const emitEnable = (component) => AlloyTriggers.emit(component, ImageToolsEvents.external.enable());

  const emitTransform = (comp: AlloyComponent, transform: (ir: ImageResult) => ImageResult | PromiseLike<ImageResult>): void => {
    emitDisable(comp);
    emit(comp, ImageToolsEvents.internal.transform(), {
      transform
    });
    emitEnable(comp);
  };

  const emitTempTransform = (comp: AlloyComponent, transform: (ir: ImageResult) => ImageResult | PromiseLike<ImageResult>): void => {
    emitDisable(comp);
    emit(comp, ImageToolsEvents.internal.tempTransform(), {
      transform
    });
    emitEnable(comp);
  };

  const getBackSwap = (anyInSystem: AlloyComponent): (() => void) => (): void => {
    memContainer.getOpt(anyInSystem).each((container) => {
      Replacing.set(container, [ButtonPanel]);
    });
  };

  const emitTransformApply = (comp: AlloyComponent, transform: (ir: ImageResult) => ImageResult | PromiseLike<ImageResult>): void => {
    emitDisable(comp);
    emit(comp, ImageToolsEvents.internal.transformApply(), {
      transform,
      swap: getBackSwap(comp)
    });
    emitEnable(comp);
  };

  const createBackButton = (): Memento.MementoRecord => {
    return createButton('Back', (button) => emit(button, ImageToolsEvents.internal.back(), {
      swap: getBackSwap(button)
    }), false, false);
  };

  const createSpacer = (): Memento.MementoRecord => {
    return Memento.record({
      dom: {
        tag: 'div',
        classes: [ 'tox-spacer' ]
      },
      behaviours: Behaviour.derive([ Disabling.config({ }) ])
    });
  };

  const createApplyButton = (): Memento.MementoRecord => {
    return createButton('Apply', (button) => emit(button, ImageToolsEvents.internal.apply(), {
      swap: getBackSwap(button)
    }), true, true);
  };

  const makeCropTransform = (): ((ir: ImageResult) => Promise<ImageResult>) => (ir: ImageResult): Promise<ImageResult> => {
    const rect = imagePanel.getRect();
    return ImageTransformations.crop(ir, rect.x, rect.y, rect.w, rect.h);
  };

  const cropPanelComponents = [
    createBackButton(),
    createSpacer(),
    createButton('Apply', (button) => {
      const transform = makeCropTransform();
      emitTransformApply(button, transform);
      imagePanel.hideCrop();
    }, false, true)
  ];

  const CropPanel = Container.sketch({
    dom: panelDom,
    components: cropPanelComponents.map((mem) => mem.asSpec()),
    containerBehaviours: Behaviour.derive([
      AddEventsBehaviour.config('image-tools-crop-buttons-events', [
        AlloyEvents.run(ImageToolsEvents.external.disable(), (comp, se) => {
          disableAllComponents(cropPanelComponents, comp);
        }),
        AlloyEvents.run(ImageToolsEvents.external.enable(), (comp, se) => {
          enableAllComponents(cropPanelComponents, comp);
        })
      ])
    ])
  });

  const memSize = Memento.record(
    renderSizeInput({
      name: 'size',
      label: none,
      constrain: true
    }, providersBackstage)
  );

  const makeResizeTransform = (width: number, height: number): ((ir: ImageResult) => Promise<ImageResult>) => (ir: ImageResult): Promise<ImageResult> => {
    return ImageTransformations.resize(ir, width, height);
  };

  const resizePanelComponents = [
    createBackButton(),
    createSpacer(),
    memSize,
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
  ];

  const ResizePanel = Container.sketch({
    dom: panelDom,
    components: resizePanelComponents.map((mem) => mem.asSpec()),
    containerBehaviours: Behaviour.derive([
      AddEventsBehaviour.config('image-tools-resize-buttons-events', [
        AlloyEvents.run(ImageToolsEvents.external.disable(), (comp, se) => {
          disableAllComponents(resizePanelComponents, comp);
        }),
        AlloyEvents.run(ImageToolsEvents.external.enable(), (comp, se) => {
          enableAllComponents(resizePanelComponents, comp);
        })
      ])
    ])
  });

  const makeValueTransform = (transform: (ir: ImageResult, value: any) => Promise<ImageResult>, value: any) => (ir: ImageResult): Promise<ImageResult> => transform(ir, value);

  const horizontalFlip = makeValueTransform(ImageTransformations.flip, 'h');
  const verticalFlip = makeValueTransform(ImageTransformations.flip, 'v');
  const counterclockwiseRotate = makeValueTransform(ImageTransformations.rotate, -90);
  const clockwiseRotate = makeValueTransform(ImageTransformations.rotate, 90);

  const flipRotateOnAction = (comp, operation) => {
    emitTempTransform(comp, operation);
  };

  const flipRotateComponents = [
    createBackButton(),
    createSpacer(),
    createIconButton('flip-horizontally', 'Flip horizontally', (button) => {
      flipRotateOnAction(button, horizontalFlip);
    }, false),
    createIconButton('flip-vertically', 'Flip vertically', (button) => {
      flipRotateOnAction(button, verticalFlip);
    }, false),
    createIconButton('rotate-left', 'Rotate counterclockwise', (button) => {
      flipRotateOnAction(button, counterclockwiseRotate);
    }, false),
    createIconButton('rotate-right', 'Rotate clockwise', (button) => {
      flipRotateOnAction(button, clockwiseRotate);
    }, false),
    createSpacer(),
    createApplyButton()
  ];

  const FlipRotatePanel = Container.sketch({
    dom: panelDom,
    components: flipRotateComponents.map((mem) => mem.asSpec()),
    containerBehaviours: Behaviour.derive([
      AddEventsBehaviour.config('image-tools-fliprotate-buttons-events', [
        AlloyEvents.run(ImageToolsEvents.external.disable(), (comp, se) => {
          disableAllComponents(flipRotateComponents, comp);
        }),
        AlloyEvents.run(ImageToolsEvents.external.enable(), (comp, se) => {
          enableAllComponents(flipRotateComponents, comp);
        })
      ])
    ])
  });

  const makeSlider = (label: string, onChoose: (slider: AlloyComponent, thumb: AlloyComponent, value: SliderTypes.SliderValueX) => void, min: number, value: number, max: number): Memento.MementoRecord => {
    const labelPart = Slider.parts().label({
      dom: {
        tag: 'label',
        classes: ['tox-label'],
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

    return Memento.record(Slider.sketch({
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
    }));
  };

  const makeVariableSlider = (label: string, transform: (ir: ImageResult, adjust: number) => Promise<ImageResult>, min: number, value: number, max: number): Memento.MementoRecord => {
    const onChoose = (slider: AlloyComponent, thumb: AlloyComponent, value: SliderTypes.SliderValueX): void => {
      const valTransform = makeValueTransform(transform, value.x() / 100);
      // TODO: Fire the disable event on mousedown and enable on mouseup for silder
      emitTransform(slider, valTransform);
    };
    return makeSlider(label, onChoose, min, value, max);
  };

  const variableFilterPanelComponents = (label, transform, min, value, max) => {
    return [
      createBackButton(),
      makeVariableSlider(label, transform, min, value, max),
      createApplyButton()
    ];
  };

  const createVariableFilterPanel = (label: string, transform: (ir: ImageResult, adjust: number) => Promise<ImageResult>, min: number, value: number, max: number) => {
    const filterPanelComponents = variableFilterPanelComponents(label, transform, min, value, max);
    return Container.sketch({
      dom: panelDom,
      components: filterPanelComponents.map((mem) => mem.asSpec()),
      containerBehaviours: Behaviour.derive([
        AddEventsBehaviour.config('image-tools-filter-panel-buttons-events', [
          AlloyEvents.run(ImageToolsEvents.external.disable(), (comp, se) => {
            disableAllComponents(filterPanelComponents, comp);
          }),
          AlloyEvents.run(ImageToolsEvents.external.enable(), (comp, se) => {
            enableAllComponents(filterPanelComponents, comp);
          })
        ])
      ])
    });
  };

  const filterPanelComponents = [
    createBackButton(),
    createSpacer(),
    createApplyButton()
  ];

  // Invert, Sharpen, Emboss
  const FilterPanel = Container.sketch({
    dom: panelDom,
    components: filterPanelComponents.map((mem) => mem.asSpec())
  });

  const BrightnessPanel = createVariableFilterPanel('Brightness', ImageTransformations.brightness, -100, 0, 100);
  const ContrastPanel = createVariableFilterPanel('Contrast', ImageTransformations.contrast, -100, 0, 100);
  const GammaPanel = createVariableFilterPanel('Gamma', ImageTransformations.gamma, -100, 0, 100);

  const makeColorTransform = (red: number, green: number, blue: number): ((ir: ImageResult) => Promise<ImageResult>) => (ir: ImageResult): Promise<ImageResult> => ImageTransformations.colorize(ir, red, green, blue);

  const makeColorSlider = (label: string) => {
    const onChoose = (slider: AlloyComponent, thumb: AlloyComponent, value: SliderTypes.SliderValueX): void => {
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

  const memRed = makeColorSlider('R');

  const memGreen = makeColorSlider('G');

  const memBlue = makeColorSlider('B');

  const colorizePanelComponents = [
    createBackButton(),
    memRed,
    memGreen,
    memBlue,
    createApplyButton()
  ];

  // Colorize
  const ColorizePanel = Container.sketch({
    dom: panelDom,
    components: colorizePanelComponents.map((mem) => mem.asSpec())
  });

  const getTransformPanelEvent = (panel: AlloySpec, transform: Option<(ir: ImageResult) => Promise<ImageResult>>, update: (container: AlloyComponent) => void): ((button: AlloyComponent) => void) => (button: AlloyComponent): void => {
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

  const buttonPanelComponents = [
    createIconButton('crop', 'Crop', getTransformPanelEvent(CropPanel, none, cropPanelUpdate), false),
    createIconButton('resize', 'Resize', getTransformPanelEvent(ResizePanel, none, resizePanelUpdate), false),
    createIconButton('orientation', 'Orientation', getTransformPanelEvent(FlipRotatePanel, none, noop), false),
    createIconButton('brightness', 'Brightness', getTransformPanelEvent(BrightnessPanel, none, noop), false),
    createIconButton('sharpen', 'Sharpen', getTransformPanelEvent(FilterPanel, sharpenTransform, noop), false),
    createIconButton('contrast', 'Contrast', getTransformPanelEvent(ContrastPanel, none, noop), false),
    createIconButton('color-levels', 'Color levels', getTransformPanelEvent(ColorizePanel, none, noop), false),
    createIconButton('gamma', 'Gamma', getTransformPanelEvent(GammaPanel, none, noop), false),
    createIconButton('invert', 'Invert', getTransformPanelEvent(FilterPanel, invertTransform, noop), false),
  ];

  const ButtonPanel = Container.sketch({
    dom: panelDom,
    components: buttonPanelComponents.map((mem) => mem.asSpec())
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