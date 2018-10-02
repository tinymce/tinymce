import { FieldProcessorAdt, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import { FormComponent, FormComponentApi, formComponentFields } from './FormComponent';

export interface ResultsBoxApi extends FormComponentApi {
  type: 'resultsbox';
  columns?: number;
}

export interface ResultsBox extends FormComponent {
  type: 'resultsbox';
  columns: number;
}

export const resultsBoxFields: FieldProcessorAdt[] = formComponentFields.concat([
  FieldSchema.defaulted('columns', 1)
]);

export const resultsBoxSchema = ValueSchema.objOf(resultsBoxFields);

export const resultsBoxDataProcessor = ValueSchema.arrOf(
  // We accept anything here, because this is immediately pushed through the
  // ChoiceItem bouldering. If we bouldered here, we'd probably double-boulder.
  ValueSchema.anyValue()
);

export const createResultsBox = (spec: ResultsBoxApi): Result<ResultsBox, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<ResultsBox>('resultsbox', resultsBoxSchema, spec);
};
