import { AddEventsBehaviour, AlloyComponent, AlloyEvents, Behaviour, Composing, Keying, Memento, RawDomSchema, SimulatedEvent, Sketcher } from '@ephox/alloy';
import { FieldSchema } from '@ephox/boulder';
import { Arr, Cell, Fun } from '@ephox/katamari';
import { Hex } from '../api/colour/ColourTypes';
import * as HexColour from '../api/colour/HexColour';
import * as HsvColour from '../api/colour/HsvColour';
import * as RgbaColour from '../api/colour/RgbaColour';
import { calcHex } from './Calculations';
import * as ColourEvents from './ColourEvents';
import HueSlider from './components/HueSlider';
import RgbForm from './components/RgbForm';
import SaturationBrightnessPalette from './components/SaturationBrightnessPalette';

export interface ColourPickerDetail extends Sketcher.SingleSketchDetail {
  dom: RawDomSchema;
  onValidHex: (component: AlloyComponent) => void;
  onInvalidHex: (component: AlloyComponent) => void;
}

export interface ColourPickerSpec extends Sketcher.SingleSketchSpec {
  dom: RawDomSchema;
  onValidHex?: (component: AlloyComponent) => void;
  onInvalidHex?: (component: AlloyComponent) => void;
}

export interface ColourPickerSketcher extends Sketcher.SingleSketch<ColourPickerSpec, ColourPickerDetail> {
}

const makeFactory = (translate: (key: string) => string, getClass: (key: string) => string) => {
  const factory = (detail: ColourPickerDetail) => {
    const rgbForm = RgbForm.rgbFormFactory(translate, getClass, detail.onValidHex, detail.onInvalidHex);
    const sbPalette = SaturationBrightnessPalette.paletteFactory(translate, getClass);

    const state = {
      paletteRgba: Fun.constant(Cell(RgbaColour.red()))
    };

    const memPalette = Memento.record(
      sbPalette.sketch({})
    );
    const memRgb = Memento.record(
      rgbForm.sketch({})
    );

    const updatePalette = (anyInSystem: AlloyComponent, hex: Hex) => {
      memPalette.getOpt(anyInSystem).each((palette) => {
        const rgba = RgbaColour.fromHex(hex);
        state.paletteRgba().set(rgba);
        sbPalette.setRgba(palette, rgba);
      });
    };

    const updateFields = (anyInSystem: AlloyComponent, hex: Hex) => {
      memRgb.getOpt(anyInSystem).each((form) => {
        rgbForm.updateHex(form, hex);
      });
    };

    const runUpdates = (anyInSystem: AlloyComponent, hex: Hex, updates: ((anyInSystem: AlloyComponent, hex: Hex) => void)[]) => {
      Arr.each(updates, (update) => {
        update(anyInSystem, hex);
      });
    };

    const paletteUpdates = () => {
      const updates = [updateFields];
      return (form: AlloyComponent, simulatedEvent: SimulatedEvent<ColourEvents.PaletteUpdateEvent>) => {
        const value = simulatedEvent.event().value();
        const oldRgb = state.paletteRgba().get();
        const hsvColour = HsvColour.fromRgb(oldRgb);
        const newHsvColour = HsvColour.hsvColour(hsvColour.hue(), value.x(), (100 - value.y()));
        const rgb = RgbaColour.fromHsv(newHsvColour);
        const nuHex = HexColour.fromRgba(rgb);
        runUpdates(form, nuHex, updates);
      };
    };

    const sliderUpdates = () => {
      const updates = [updatePalette, updateFields];
      return (form: AlloyComponent, simulatedEvent: SimulatedEvent<ColourEvents.SliderUpdateEvent>) => {
        const value = simulatedEvent.event().value();
        const hex = calcHex(value.y());
        runUpdates(form, hex, updates);
      };
    };

    return {
      uid: detail.uid,
      dom: detail.dom,
      components: [
        memPalette.asSpec(),
        HueSlider.sliderFactory(translate, getClass),
        memRgb.asSpec()
      ],

      behaviours: Behaviour.derive([
        AddEventsBehaviour.config('colour-picker-events', [
          // AlloyEvents.run(ColourEvents.fieldsUpdate(), fieldsUpdates()),
          AlloyEvents.run(ColourEvents.paletteUpdate(), paletteUpdates()),
          AlloyEvents.run(ColourEvents.sliderUpdate(), sliderUpdates())
        ]),
        Composing.config({
          find: (comp) => {
            return memRgb.getOpt(comp);
          }
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

export default {
  makeFactory
};
