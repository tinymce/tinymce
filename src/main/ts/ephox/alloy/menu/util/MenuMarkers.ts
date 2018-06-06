import { FieldSchema, ValueSchema, DslType } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

const menuFields: () => DslType.FieldProcessorAdt[] = Fun.constant([
  FieldSchema.strict('menu'),
  FieldSchema.strict('selectedMenu')
]);

const itemFields: () => DslType.FieldProcessorAdt[] = Fun.constant([
  FieldSchema.strict('item'),
  FieldSchema.strict('selectedItem')
]);

const schema: () => DslType.Processor = Fun.constant(ValueSchema.objOfOnly(
  itemFields().concat(menuFields())
));

const itemSchema: () => DslType.Processor = Fun.constant(ValueSchema.objOfOnly(itemFields()));

export {
  menuFields,
  itemFields,
  schema,
  itemSchema
};