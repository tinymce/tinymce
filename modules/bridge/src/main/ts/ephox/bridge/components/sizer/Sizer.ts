import { ValueSchema, FieldSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

export interface SizerApi {
  type?: 'sizer';
}

export interface Sizer {
  type: 'sizer';
}

const sizerSchema = ValueSchema.objOf([
  FieldSchema.defaulted('type', 'sizer')
]);

export const createSizer = (spec: SizerApi): Result<Sizer, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<Sizer>('Sizer', sizerSchema, spec);
};