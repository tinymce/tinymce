import { StructureProcessor, FieldSchema, Processor, ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

const menuFields: () => StructureProcessor[] = Fun.constant([
  FieldSchema.required('menu'),
  FieldSchema.required('selectedMenu')
]);

const itemFields: () => StructureProcessor[] = Fun.constant([
  FieldSchema.required('item'),
  FieldSchema.required('selectedItem')
]);

const schema: () => Processor = Fun.constant(ValueSchema.objOf(
  itemFields().concat(menuFields())
));

const itemSchema: () => Processor = Fun.constant(ValueSchema.objOf(itemFields()));

export {
  menuFields,
  itemFields,
  schema,
  itemSchema
};