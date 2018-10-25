import { BodyComponentApi, BodyComponent } from './BodyComponent';
import { Result } from '@ephox/katamari';
import { ValueSchema, FieldSchema, FieldPresence } from '@ephox/boulder';
import { itemSchema } from './ItemSchema';

export interface LabelApi {
  type: 'label';
  label: string;
  items: BodyComponentApi[];
}

export interface Label {
  type: 'label';
  label: string;
  items: BodyComponent[];
}

export const labelFields = [
  FieldSchema.strictString('type'),
  FieldSchema.strictString('label'),
  FieldSchema.field(
    'items',
    'items',
    FieldPresence.strict(),
    ValueSchema.arrOf(ValueSchema.valueOf((v) => {
      return ValueSchema.asRaw('Checking item of label', itemSchema, v).fold(
        (sErr) => Result.error(ValueSchema.formatError(sErr)),
        (passValue) => Result.value(passValue)
      );
    }))
  )
];

export const labelSchema = ValueSchema.objOf(labelFields);

export const createLabel = (spec: LabelApi): Result<Label, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<Label>('label', labelSchema, spec);
};
