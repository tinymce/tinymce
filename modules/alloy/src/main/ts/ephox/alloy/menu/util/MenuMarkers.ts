import { FieldProcessor, FieldSchema, StructureProcessor, ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

const menuFields: () => FieldProcessor[] = Fun.constant([
  FieldSchema.required('menu'),
  FieldSchema.required('selectedMenu')
]);

const itemFields: () => FieldProcessor[] = Fun.constant([
  FieldSchema.required('item'),
  FieldSchema.required('selectedItem')
]);

const schema: () => StructureProcessor = Fun.constant(ValueSchema.objOf(
  itemFields().concat(menuFields())
));

const itemSchema: () => StructureProcessor = Fun.constant(ValueSchema.objOf(itemFields()));

export {
  menuFields,
  itemFields,
  schema,
  itemSchema
};
