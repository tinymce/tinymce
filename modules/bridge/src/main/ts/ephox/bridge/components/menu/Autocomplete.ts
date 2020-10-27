import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { descriptionSchema } from './Description';

export interface AutocompleteSpec {
  type: 'autocomplete';
  text: string;
}

export interface Autocomplete {
  type: 'autocomplete';
  text: string;
}

const autocompleteFields = [
  FieldSchema.strictString('type'),
  FieldSchema.strictString('text')
];

export const autocompleteSchema = ValueSchema.objOf(autocompleteFields);

export const createAutocomplete = (spec: AutocompleteSpec): Result<Autocomplete, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<Autocomplete>('autocomplete', descriptionSchema, spec);