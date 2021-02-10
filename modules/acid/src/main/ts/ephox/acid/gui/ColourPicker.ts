import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, Behaviour, Composing, Keying, Memento, RawDomSchema, SimulatedEvent, Sketcher, Slider
} from '@ephox/alloy';
import { FieldSchema } from '@ephox/boulder';
import { Arr, Cell, Fun } from '@ephox/katamari';
import { Hex } from '../api/colour/ColourTypes';
import * as HexColour from '../api/colour/HexColour';
import * as HsvColour from '../api/colour/HsvColour';
import * as RgbaColour from '../api/colour/RgbaColour';
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
  translate: (key: string) => string,
  getClass: (key: string) => string
): ColourPickerSketcher => {
  const factory = (detail: ColourPickerDetail) => {
    const rgbForm = RgbForm.rgbFormFactory(translate, getClass, detail.onValidHex, detail.onInvalidHex);
    const sbPalette = SaturationBrightnessPalette.paletteFactory(translate, getClass);

    const state = {
      paletteRgba: Cell(RgbaColour.red)
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
        Slider.setValue(slider, { y: 100 - (hue / 360) * 100 });
      });
    };

    const updatePaletteThumb = (anyInSystem: AlloyComponent, hex: Hex) => {
      memPalette.getOpt(anyInSystem).each((palette) => {
        sbPalette.setThumb(palette, hex);
      });
    };

    const updateRgbaCell = (hex: Hex) => {
      const rgba = RgbaColour.fromHex(hex);
      state.paletteRgba.set(rgba);
    };

    const runUpdates = (anyInSystem: AlloyComponent, hex: Hex, hue: number, updates: ((anyInSystem: AlloyComponent, hex: Hex, hue: number) => void)[]) => {
      updateRgbaCell(hex);
      Arr.each(updates, (update) => {
        update(anyInSystem, hex, hue);
      });
    };

    const paletteUpdates = () => {
      const updates = [ updateFields ];
      return (form: AlloyComponent, simulatedEvent: SimulatedEvent<ColourEvents.PaletteUpdateEvent>) => {
        const value = simulatedEvent.event.value;
        const oldRgb = state.paletteRgba.get();
        const oldHex = HexColour.fromRgba(oldRgb);
        const hsvColour = HsvColour.fromRgb(oldRgb);
        const hue = hsvColour.hue;
        const newHsvColour = HsvColour.hsvColour(hue, value.x, (100 - value.y));
        const newRgb = RgbaColour.fromHsv(newHsvColour);
        const newHex = HexColour.fromRgba(newRgb);
        if (oldHex.value !== newHex.value) {
          runUpdates(form, newHex, hue, updates);
        }
      };
    };

    const sliderUpdates = () => {
      const updates = [ updatePalette, updateFields ];
      return (form: AlloyComponent, simulatedEvent: SimulatedEvent<ColourEvents.SliderUpdateEvent>) => {
        const hue = ((100 - simulatedEvent.event.value.y) / 100) * 360; // transform 0-100 value to 0-360
        const oldRgb = state.paletteRgba.get();
        const hsvColour = HsvColour.fromRgb(oldRgb);
        const newHsvColour = HsvColour.hsvColour(hue, hsvColour.saturation, hsvColour.value);
        const newRgb = RgbaColour.fromHsv(newHsvColour);
        const newHex = HexColour.fromRgba(newRgb);
        runUpdates(form, newHex, hue, updates);
      };
    };

    const fieldsUpdates = () => {
      const updates = [ updatePalette, updateSlider, updatePaletteThumb ];
      return (form: AlloyComponent, simulatedEvent: SimulatedEvent<ColourEvents.FieldsUpdateEvent>) => {
        const hex = simulatedEvent.event.hex;
        const rgb = RgbaColour.fromHex(hex);
        const hsvColour = HsvColour.fromRgb(rgb);
        runUpdates(form, hex, hsvColour.hue, updates); // TODO: hue is a garbage value
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
          AlloyEvents.run(ColourEvents.fieldsUpdate, fieldsUpdates()),
          AlloyEvents.run(ColourEvents.paletteUpdate, paletteUpdates()),
          AlloyEvents.run(ColourEvents.sliderUpdate, sliderUpdates())
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
      FieldSchema.strict('dom'),
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
