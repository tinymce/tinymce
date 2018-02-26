import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

const menuFields = Fun.constant([
  FieldSchema.strict('menu'),
  FieldSchema.strict('selectedMenu')
]);

const itemFields = Fun.constant([
  FieldSchema.strict('item'),
  FieldSchema.strict('selectedItem')
]);

const schema = Fun.constant(ValueSchema.objOfOnly(
  itemFields().concat(menuFields())
));

const itemSchema = Fun.constant(ValueSchema.objOfOnly(itemFields()));

export {
  menuFields,
  itemFields,
  schema,
  itemSchema
};