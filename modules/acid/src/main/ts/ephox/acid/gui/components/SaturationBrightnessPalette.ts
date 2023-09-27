import { AlloyComponent, AlloyTriggers, Behaviour, Composing, Focusing, Sketcher, SketchSpec, Slider, SliderTypes, UiSketcher } from '@ephox/alloy';
import { Fun, Optional, Type } from '@ephox/katamari';
import { Attribute } from '@ephox/sugar';

import { Untranslated } from '../../alien/I18n';
import { Hex } from '../../api/colour/ColourTypes';
import * as HsvColour from '../../api/colour/HsvColour';
import * as RgbaColour from '../../api/colour/RgbaColour';
import * as ColourEvents from '../ColourEvents';

// tslint:disable:no-empty-interface
export interface SaturationBrightnessPaletteDetail extends Sketcher.SingleSketchDetail {
}

export interface SaturationBrightnessPaletteSpec extends Sketcher.SingleSketchSpec {
}
// tslint:enable:no-empty-interface

export interface SaturationBrightnessPaletteSketcher extends Sketcher.SingleSketch<SaturationBrightnessPaletteSpec> {
  setHue: (slider: AlloyComponent, hue: number) => void;
  setThumb: (slider: AlloyComponent, hex: Hex) => void;
}

const paletteFactory = (translate: (key: Untranslated) => string, getClass: (key: string) => string): SaturationBrightnessPaletteSketcher => {

  const spectrumPart = Slider.parts.spectrum({
    dom: {
      tag: 'canvas',
      attributes: {
        role: 'presentation'
      },
      classes: [ getClass('sv-palette-spectrum') ]
    }
  });

  const thumbPart = Slider.parts.thumb({
    dom: {
      tag: 'div',
      attributes: {
        role: 'presentation'
      },
      classes: [ getClass('sv-palette-thumb') ],
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

  const setPaletteHue = (slider: AlloyComponent, hue: number): void => {
    const canvas = slider.components()[0].element.dom;
    const hsv = HsvColour.hsvColour(hue, 100, 100);
    const rgba = RgbaColour.fromHsv(hsv);
    setColour(canvas, RgbaColour.toString(rgba));
  };

  const setPaletteThumb = (slider: AlloyComponent, hex: Hex): void => {
    const hsv = HsvColour.fromRgb(RgbaColour.fromHex(hex));
    Slider.setValue(slider, { x: hsv.saturation, y: 100 - hsv.value });
    Attribute.set(slider.element, 'aria-valuetext', translate([ 'Saturation {0}%, Brightness {1}%', hsv.saturation, hsv.value ]));
  };

  const factory: UiSketcher.SingleSketchFactory<SaturationBrightnessPaletteDetail, SaturationBrightnessPaletteSpec> = (_detail): SketchSpec => {
    const getInitialValue = Fun.constant({
      x: 0,
      y: 0
    });

    const onChange = (slider: AlloyComponent, _thumb: AlloyComponent, value: number | SliderTypes.SliderValue) => {
      if (!Type.isNumber(value)) {
        Attribute.set(slider.element, 'aria-valuetext', translate([ 'Saturation {0}%, Brightness {1}%', Math.floor(value.x), Math.floor(100 - value.y) ]));
      }
      AlloyTriggers.emitWith(slider, ColourEvents.paletteUpdate, {
        value
      });
    };

    const onInit = (_slider: AlloyComponent, _thumb: AlloyComponent, spectrum: AlloyComponent, _value: number | SliderTypes.SliderValue) => {
      // Maybe make this initial value configurable?
      setColour(spectrum.element.dom, RgbaColour.toString(RgbaColour.red));
    };

    const sliderBehaviours = Behaviour.derive([
      Composing.config({
        find: Optional.some
      }),
      Focusing.config({})
    ]);

    return Slider.sketch({
      dom: {
        tag: 'div',
        attributes: {
          'role': 'slider',
          'aria-valuetext': translate([ 'Saturation {0}%, Brightness {1}%', 0, 0 ])
        },
        classes: [ getClass('sv-palette') ]
      },
      model: {
        mode: 'xy',
        getInitialValue,
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
      setHue: (_apis: {}, slider: AlloyComponent, hue: number) => {
        setPaletteHue(slider, hue);
      },
      setThumb: (_apis: {}, slider: AlloyComponent, hex: Hex) => {
        setPaletteThumb(slider, hex);
      }
    },
    extraApis: {}
  }) as SaturationBrightnessPaletteSketcher;

  return saturationBrightnessPaletteSketcher;
};

export {
  paletteFactory
};
