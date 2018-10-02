import { Fun, Option } from '@ephox/katamari';
import { Behaviour, Composing, Focusing, Slider, Tabstopping, SketchSpec, UiSketcher, Sketcher, ComponentApi, AlloyTriggers } from '@ephox/alloy';

import { Rgba } from '../../api/colour/ColourTypes';
import * as RgbaColour from '../../api/colour/RgbaColour';
import * as ColourEvents from '../ColourEvents';

export interface SaturationBrightnessPaletteDetail extends Sketcher.SingleSketchDetail {
}

export interface SaturationBrightnessPaletteSpec extends Sketcher.SingleSketchSpec {
}
export interface SaturationBrightnessPaletteSketcher extends Sketcher.SingleSketch<SaturationBrightnessPaletteSpec, SaturationBrightnessPaletteDetail> {
  setRgba: (slider: ComponentApi.AlloyComponent, colour: Rgba) => void;
};

var paletteFactory = (translate, getClass) => {
  var spectrum = Slider.parts().spectrum({
    dom: {
      tag: 'canvas',
      attributes: {
        role: 'presentation'
      },
      classes: [ getClass('sv-palette-spectrum') ]
    }
  });

  var thumb = Slider.parts().thumb({
    dom: {
      tag: 'div',
      attributes: {
        role: 'presentation'
      },
      classes: [ getClass('sv-palette-thumb') ],
      innerHtml: `<div class=${getClass("sv-palette-inner-thumb")} role="presentation"></div>`
    }
  });

  const setColour = (canvas, rgba: string): void => {
    const { width, height } = canvas;
    const ctx = canvas.getContext('2d');

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

  const setSliderColour = (slider, rgba: Rgba): void => {
    // Very open to a better way of doing this.
    const canvas = slider.components()[0].element().dom();
    setColour(canvas, RgbaColour.toString(rgba));
  };

  const factory: UiSketcher.SingleSketchFactory<SaturationBrightnessPaletteDetail, SaturationBrightnessPaletteSpec> = (detail): SketchSpec => {
    const getInitialValue = Fun.constant({
      x: Fun.constant(0),
      y: Fun.constant(0)
    });

    const onChange = (slider, _thumb, value) => {
      AlloyTriggers.emitWith(slider, ColourEvents.paletteUpdate(), {
        value
      })
    };

    const onInit = (_slider, _thumb, spectrum, _value) => {
      // Maybe make this initial value configurable?
      setColour(spectrum.element().dom(), RgbaColour.toString(RgbaColour.red()));
    };

    const sliderBehaviours = Behaviour.derive([
      Composing.config({
        find: Option.some
      }),
      Focusing.config({ })
    ]);

    return Slider.sketch({
      dom: {
        tag: 'div',
        attributes: {
          role: 'presentation'
        },
        classes: [ getClass('sv-palette') ]
      },
      model: {
        mode: 'xy',
        getInitialValue
      },
      rounded: false,
      components: [
        spectrum,
        thumb
      ],
      onChange,
      onInit,
      sliderBehaviours
    });
  };

  const SaturationBrightnessPalette = Sketcher.single({
    factory: factory,
    name: 'SaturationBrightnessPalette',
    configFields: [ ],
    apis: {
      setRgba: (apis, slider, rgba) => {
        setSliderColour(slider, rgba);
      }
    },
    extraApis: { }
  }) as SaturationBrightnessPaletteSketcher;

  return SaturationBrightnessPalette;
};

export default {
  paletteFactory
};