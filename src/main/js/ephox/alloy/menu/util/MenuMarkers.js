import { FieldSchema } from '@ephox/boulder';
import { ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

var menuFields = [
  FieldSchema.strict('menu'),
  FieldSchema.strict('selectedMenu')
];

var itemFields = [
  FieldSchema.strict('item'),
  FieldSchema.strict('selectedItem')
];

var schema = ValueSchema.objOfOnly(
  itemFields.concat(menuFields)
);

var itemSchema = ValueSchema.objOfOnly(itemFields);

export default <any> {
  menuFields: Fun.constant(menuFields),
  itemFields: Fun.constant(itemFields),
  schema: Fun.constant(schema),
  itemSchema: Fun.constant(itemSchema)
};