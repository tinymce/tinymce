import { AlloyComponent } from '../../api/component/ComponentApi';

import PaletteParts from '../../ui/palette/PaletteParts';
import { PaletteSchema } from '../../ui/palette/PaletteSchema';
import * as PaletteUi from '../../ui/palette/PaletteUi';
import * as Sketcher from './Sketcher';
import { RgbColour } from '@ephox/acid';

export interface PaletteSketch extends Sketcher.CompositeSketch {
  refresh: (slider: AlloyComponent) => void;
  refreshColour: (slider: AlloyComponent, colour: RgbColour) => void;
}

const Palette = Sketcher.composite({
  name: 'Palette',
  configFields: PaletteSchema,
  partFields: PaletteParts,
  factory: PaletteUi.sketch,
  apis: {
    refresh (apis, slider) {
      apis.refresh(slider);
    },
    refreshColour (apis, slider, colour) {
      apis.refreshColour(slider, colour);
    }
  }
}) as PaletteSketch;

export {
  Palette
};