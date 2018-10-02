import { Sketcher, Keying }  from '@ephox/alloy';
import SaturationBrightnessPalette from './components/SaturationBrightnessPalette';
import HueSlider from './components/HueSlider';
import { Memento, AddEventsBehaviour, Behaviour, AlloyEvents } from '@ephox/alloy';
import RgbForm from './components/RgbForm';
import { Arr, Fun, Cell } from '@ephox/katamari';
import { Composing } from '@ephox/alloy';

import * as ColourEvents from './ColourEvents';
import * as RgbaColour from '../api/colour/RgbaColour';
import * as HsvColour from '../api/colour/HsvColour';
import * as HexColour from '../api/colour/HexColour';
import { calcHex } from './Calculations';
import { FieldSchema } from '@ephox/boulder';

const makeFactory = (translate, getClass) => {
  const factory = (detail) => {
    const rgbForm = RgbForm.rgbFormFactory(translate, getClass, detail.onValidHex(), detail.onInvalidHex());
    const sbPalette = SaturationBrightnessPalette.paletteFactory(translate, getClass);

    const state = {
      paletteRgba: Fun.constant(Cell(RgbaColour.red()))
    };

    const memPalette = Memento.record(
      sbPalette.sketch({ })
    );
    const memRgb = Memento.record(
      rgbForm.sketch({ })
    );

    const updatePalette = (anyInSystem, hex) => {
      memPalette.getOpt(anyInSystem).each((palette) => {
        const rgba = RgbaColour.fromHex(hex);
        state.paletteRgba().set(rgba);
        sbPalette.setRgba(palette, rgba);
      })
    };

    const updateFields = (anyInSystem, hex) => {   
      memRgb.getOpt(anyInSystem).each((form) => {
        rgbForm.updateHex(form, hex);
      });
    };

    const runUpdates = (anyInSystem, hex, updates) => {
      Arr.each(updates, (update) => {
        update(anyInSystem, hex);
      });
    };

    const paletteUpdates = () => {
      const updates = [ updateFields ];
      return (form, simulatedEvent) => {
        const value = simulatedEvent.event().value();
        const oldRgb = state.paletteRgba().get();
        const hsvColour = HsvColour.fromRgb(oldRgb);
        const newHsvColour = HsvColour.hsvColour(hsvColour.hue(), value.x(), (100 - value.y()));
        const rgb = RgbaColour.fromHsv(newHsvColour);
        const nuHex = HexColour.fromRgba(rgb);
        runUpdates(form, nuHex, updates);
      }
    };

    const sliderUpdates = () => {
      const updates = [ updatePalette, updateFields ];
      return (form, simulatedEvent) => {
        const value = simulatedEvent.event().value();
        const hex = calcHex(value.y());
        runUpdates(form, hex, updates);
      }
    };

    return {
      uid: detail.uid(),
      dom: detail.dom(),
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
  }

  const ColourPicker = Sketcher.single({
    name: 'ColourPicker',
    configFields: [ 
      FieldSchema.defaulted('onValidHex', Fun.noop),
      FieldSchema.defaulted('onInvalidHex', Fun.noop),
      FieldSchema.optionString('formChangeEvent')
    ],
    factory: factory
  });

  return ColourPicker;
};

export default {
  makeFactory
};