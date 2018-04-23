import { AlloyComponent } from '../../api/component/ComponentApi';

import PaletteParts from '../../ui/palette/PaletteParts';
import { PaletteSchema } from '../../ui/palette/PaletteSchema';
import * as PaletteUi from '../../ui/palette/PaletteUi';
import * as Sketcher from './Sketcher';

export interface SliderSketch extends Sketcher.CompositeSketch {
  refresh: (slider: AlloyComponent) => void;
}

const Slider = Sketcher.composite({
  name: 'Palette',
  configFields: PaletteSchema,
  partFields: PaletteParts,
  factory: PaletteUi.sketch,
  apis: {
    refresh (apis, slider) {
      apis.refresh(slider);
    }
  }
}) as SliderSketch;

export {
  Slider
};