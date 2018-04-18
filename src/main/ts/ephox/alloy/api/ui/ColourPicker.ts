import * as Sketcher from './Sketcher';
import * as ColourPickerSpec from '../../ui/composite/ColourPickerSpec';
import * as ColourPickerSchema from '../../ui/schema/ColourPickerSchema';

const ColourPicker = Sketcher.composite({
  name: 'ColourPicker',
  configFields: ColourPickerSchema.schema(),
  partFields: ColourPickerSchema.parts(),
  factory: ColourPickerSpec.make
});

export {
  ColourPicker
};