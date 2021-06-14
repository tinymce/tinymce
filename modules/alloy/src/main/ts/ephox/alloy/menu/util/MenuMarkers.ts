import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

const menuFields = Fun.constant([
  FieldSchema.required('menu'),
  FieldSchema.required('selectedMenu')
]);

const itemFields = Fun.constant([
  FieldSchema.required('item'),
  FieldSchema.required('selectedItem')
]);

const schema = Fun.constant(ValueSchema.objOf(
  itemFields().concat(menuFields())
));

const itemSchema = Fun.constant(ValueSchema.objOf(itemFields()));

export {
  menuFields,
  itemFields,
  schema,
  itemSchema
};
