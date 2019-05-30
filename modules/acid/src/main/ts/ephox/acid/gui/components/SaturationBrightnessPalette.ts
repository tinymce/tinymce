import { AlloyComponent, AlloyTriggers, Behaviour, Composing, Focusing, Sketcher, SketchSpec, Slider, SliderTypes, UiSketcher } from '@ephox/alloy';
import { HTMLCanvasElement } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';
import { Rgba } from '../../api/colour/ColourTypes';
import * as RgbaColour from '../../api/colour/RgbaColour';
import * as ColourEvents from '../ColourEvents';

// tslint:disable:no-empty-interface
export interface SaturationBrightnessPaletteDetail extends Sketcher.SingleSketchDetail {
}

export interface SaturationBrightnessPaletteSpec extends Sketcher.SingleSketchSpec {
}
// tslint:enable:no-empty-interface

export interface SaturationBrightnessPaletteSketcher extends Sketcher.SingleSketch<SaturationBrightnessPaletteSpec, SaturationBrightnessPaletteDetail> {
  setRgba: (slider: AlloyComponent, colour: Rgba) => void;
}

const paletteFactory = (_translate: (key: string) => string, getClass: (key: string) => string) => {
  const spectrumPart = Slider.parts().spectrum({
    dom: {
      tag: 'canvas',
      attributes: {
        role: 'presentation'
      },
      classes: [getClass('sv-palette-spectrum')]
    }
  });

  const thumbPart = Slider.parts().thumb({
    dom: {
      tag: 'div',
      attributes: {
        role: 'presentation'
      },
      classes: [getClass('sv-palette-thumb')],
      innerHtml: `<div class=${getClass('sv-palette-inner-thumb')} role="presentation"></div>`
    }
  });

  const setColour = (canvas: HTMLCanvasElement, rgba: string): void => {
    const { width, height } = canvas;
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
      return;
    }

    ctx.fillStyle = rgba;
    ctx.fillRect(0, 0, width, height);

    const grdWhite = ctx.createLinearGradient(0, 0, width, 0);
    grdWhite.addColorStop(0, 'rgba(255,255,255,1)');
    grdWhite.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grdWhite;
    ctx.fillRect(0, 0, width, height);

    const grdBlack = ctx.createLinearGradient(0, 0, 0, height);
    grdBlack.addColorStop(0, 'rgba(0,0,0,0)');
    grdBlack.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = grdBlack;
    ctx.fillRect(0, 0, width, height);
  };

  const setSliderColour = (slider: AlloyComponent, rgba: Rgba): void => {
    // Very open to a better way of doing this.
    const canvas = slider.components()[0].element().dom();
    setColour(canvas, RgbaColour.toString(rgba));
  };

  const factory: UiSketcher.SingleSketchFactory<SaturationBrightnessPaletteDetail, SaturationBrightnessPaletteSpec> = (_detail): SketchSpec => {
    const getInitialValue = Fun.constant({
      x: Fun.constant(0),
      y: Fun.constant(0)
    });

    const onChange = (slider: AlloyComponent, _thumb: AlloyComponent, value: number | SliderTypes.SliderValue) => {
      AlloyTriggers.emitWith(slider, ColourEvents.paletteUpdate(), {
        value
      });
    };

    const onInit = (_slider: AlloyComponent, _thumb: AlloyComponent, spectrum: AlloyComponent, _value: number | SliderTypes.SliderValue) => {
      // Maybe make this initial value configurable?
      setColour(spectrum.element().dom(), RgbaColour.toString(RgbaColour.red()));
    };

    const sliderBehaviours = Behaviour.derive([
      Composing.config({
        find: Option.some
      }),
      Focusing.config({})
    ]);

    return Slider.sketch({
      dom: {
        tag: 'div',
        attributes: {
          role: 'presentation'
        },
        classes: [getClass('sv-palette')]
      },
      model: {
        mode: 'xy',
        getInitialValue
      },
      rounded: false,
      components: [
        spectrumPart,
        thumbPart
      ],
      onChange,
      onInit,
      sliderBehaviours
    });
  };

  const saturationBrightnessPaletteSketcher = Sketcher.single({
    factory,
    name: 'SaturationBrightnessPalette',
    configFields: [],
    apis: {
      setRgba: (_apis: {}, slider: AlloyComponent, rgba: Rgba) => {
        setSliderColour(slider, rgba);
      }
    },
    extraApis: {}
  }) as SaturationBrightnessPaletteSketcher;

  return saturationBrightnessPaletteSketcher;
};

export default {
  paletteFactory
};