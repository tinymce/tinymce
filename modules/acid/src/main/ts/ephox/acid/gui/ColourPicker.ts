import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, Behaviour, Composing, Keying, Memento, RawDomSchema, SimulatedEvent, Sketcher, Slider
} from '@ephox/alloy';
import { FieldSchema } from '@ephox/boulder';
import { Arr, Cell, Fun } from '@ephox/katamari';

import { Untranslated } from '../alien/I18n';
import { Hex } from '../api/colour/ColourTypes';
import * as HsvColour from '../api/colour/HsvColour';
import * as RgbaColour from '../api/colour/RgbaColour';
import * as Transformations from '../api/colour/Transformations';
import * as ColourEvents from './ColourEvents';
import * as HueSlider from './components/HueSlider';
import * as RgbForm from './components/RgbForm';
import * as SaturationBrightnessPalette from './components/SaturationBrightnessPalette';

export interface ColourPickerDetail extends Sketcher.SingleSketchDetail {
  readonly dom: RawDomSchema;
  readonly onValidHex: (component: AlloyComponent) => void;
  readonly onInvalidHex: (component: AlloyComponent) => void;
}

export interface ColourPickerSpec extends Sketcher.SingleSketchSpec {
  readonly dom: RawDomSchema;
  readonly onValidHex?: (component: AlloyComponent) => void;
  readonly onInvalidHex?: (component: AlloyComponent) => void;
}

export interface ColourPickerSketcher extends Sketcher.SingleSketch<ColourPickerSpec> {
}

const makeFactory = (
  translate: (key: Untranslated) => string,
  getClass: (key: string) => string
): ColourPickerSketcher => {
  const factory = (detail: ColourPickerDetail) => {
    const rgbForm = RgbForm.rgbFormFactory(translate, getClass, detail.onValidHex, detail.onInvalidHex);
    const sbPalette = SaturationBrightnessPalette.paletteFactory(translate, getClass);

    const hueSliderToDegrees = (hue: number): number => (100 - hue) / 100 * 360;
    const hueDegreesToSlider = (hue: number): number => 100 - (hue / 360) * 100;

    const state = {
      paletteRgba: Cell(RgbaColour.red),
      paletteHue: Cell(0)
    };

    const memSlider = Memento.record(
      HueSlider.sliderFactory(translate, getClass)
    );

    const memPalette = Memento.record(
      sbPalette.sketch({})
    );
    const memRgb = Memento.record(
      rgbForm.sketch({})
    );

    const updatePalette = (anyInSystem: AlloyComponent, _hex: Hex, hue: number) => {
      memPalette.getOpt(anyInSystem).each((palette) => {
        sbPalette.setHue(palette, hue);
      });
    };

    const updateFields = (anyInSystem: AlloyComponent, hex: Hex) => {
      memRgb.getOpt(anyInSystem).each((form) => {
        rgbForm.updateHex(form, hex);
      });
    };

    const updateSlider = (anyInSystem: AlloyComponent, _hex: Hex, hue: number) => {
      memSlider.getOpt(anyInSystem).each((slider) => {
        Slider.setValue(slider, hueDegreesToSlider(hue));
      });
    };

    const updatePaletteThumb = (anyInSystem: AlloyComponent, hex: Hex) => {
      memPalette.getOpt(anyInSystem).each((palette) => {
        sbPalette.setThumb(palette, hex);
      });
    };

    const updateState = (hex: Hex, hue: number) => {
      const rgba = RgbaColour.fromHex(hex);
      state.paletteRgba.set(rgba);
      state.paletteHue.set(hue);
    };

    const runUpdates = (anyInSystem: AlloyComponent, hex: Hex, hue: number, updates: ((anyInSystem: AlloyComponent, hex: Hex, hue: number) => void)[]) => {
      updateState(hex, hue);
      Arr.each(updates, (update) => {
        update(anyInSystem, hex, hue);
      });
    };

    const onPaletteUpdate = () => {
      const updates = [ updateFields ];
      return (form: AlloyComponent, simulatedEvent: SimulatedEvent<ColourEvents.PaletteUpdateEvent>) => {
        const value = simulatedEvent.event.value;
        const oldHue = state.paletteHue.get();
        const newHsv = HsvColour.hsvColour(oldHue, value.x, (100 - value.y));
        const newHex = Transformations.hsvToHex(newHsv);

        runUpdates(form, newHex, oldHue, updates);
      };
    };

    const onSliderUpdate = () => {
      const updates = [ updatePalette, updateFields ];
      return (form: AlloyComponent, simulatedEvent: SimulatedEvent<ColourEvents.SliderUpdateEvent>) => {
        const hue = hueSliderToDegrees(simulatedEvent.event.value);
        const oldRgb = state.paletteRgba.get();
        const oldHsv = HsvColour.fromRgb(oldRgb);
        const newHsv = HsvColour.hsvColour(hue, oldHsv.saturation, oldHsv.value);
        const newHex = Transformations.hsvToHex(newHsv);

        runUpdates(form, newHex, hue, updates);
      };
    };

    const onFieldsUpdate = () => {
      const updates = [ updatePalette, updateSlider, updatePaletteThumb ];
      return (form: AlloyComponent, simulatedEvent: SimulatedEvent<ColourEvents.FieldsUpdateEvent>) => {
        const hex = simulatedEvent.event.hex;
        const hsv = Transformations.hexToHsv(hex);

        runUpdates(form, hex, hsv.hue, updates);
      };
    };

    return {
      uid: detail.uid,
      dom: detail.dom,
      components: [
        memPalette.asSpec(),
        memSlider.asSpec(),
        memRgb.asSpec()
      ],

      behaviours: Behaviour.derive([
        AddEventsBehaviour.config('colour-picker-events', [
          AlloyEvents.run(ColourEvents.fieldsUpdate, onFieldsUpdate()),
          AlloyEvents.run(ColourEvents.paletteUpdate, onPaletteUpdate()),
          AlloyEvents.run(ColourEvents.sliderUpdate, onSliderUpdate())
        ]),
        Composing.config({
          find: (comp) => memRgb.getOpt(comp)
        }),
        Keying.config({
          mode: 'acyclic'
        })
      ])
    };
  };

  const colourPickerSketcher = Sketcher.single({
    name: 'ColourPicker',
    configFields: [
      FieldSchema.required('dom'),
      FieldSchema.defaulted('onValidHex', Fun.noop),
      FieldSchema.defaulted('onInvalidHex', Fun.noop)
    ],
    factory
  }) as ColourPickerSketcher;

  return colourPickerSketcher;
};

export {
  makeFactory
};
