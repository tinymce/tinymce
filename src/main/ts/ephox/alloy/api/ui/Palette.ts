import { AlloyComponent } from '../../api/component/ComponentApi';

import PaletteParts from '../../ui/palette/PaletteParts';
import { PaletteSchema } from '../../ui/palette/PaletteSchema';
import * as PaletteUi from '../../ui/palette/PaletteUi';
import * as Sketcher from './Sketcher';
import { RgbaColour } from '@ephox/acid';

export interface PaletteSketch extends Sketcher.CompositeSketch {
  refresh: (palette: AlloyComponent) => void;
  refreshColour: (palette: AlloyComponent, colour: RgbaColour) => void;
}

const Palette = Sketcher.composite({
  name: 'Palette',
  configFields: PaletteSchema,
  partFields: PaletteParts,
  factory: PaletteUi.sketch,
  apis: {
    refresh (apis, palette) {
      apis.refresh(palette);
    },
    refreshColour (apis, palette, colour) {
      apis.refreshColour(palette, colour);
    }
  }
}) as PaletteSketch;

export {
  Palette
};