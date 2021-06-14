import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

const menuFields = Fun.constant([
  FieldSchema.required('menu'),
  FieldSchema.required('selectedMenu')
]);

const itemFields = Fun.constant([
  FieldSchema.required('item'),
  FieldSchema.required('selectedItem')
]);

const schema = Fun.constant(StructureSchema.objOf(
  itemFields().concat(menuFields())
));

const itemSchema = Fun.constant(StructureSchema.objOf(itemFields()));

export {
  menuFields,
  itemFields,
  schema,
  itemSchema
};
