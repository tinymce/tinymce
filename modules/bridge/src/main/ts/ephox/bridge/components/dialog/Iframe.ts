import { ValueSchema, FieldSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { FormComponentWithLabel, FormComponentWithLabelSpec, formComponentWithLabelFields } from './FormComponent';

export interface IframeSpec extends FormComponentWithLabelSpec {
  type: 'iframe';
  sandboxed?: boolean;
}

export interface Iframe extends FormComponentWithLabel {
  type: 'iframe';
  sandboxed: boolean;
}

const iframeFields = formComponentWithLabelFields.concat([
  FieldSchema.defaultedBoolean('sandboxed', true)
]);

export const iframeSchema = ValueSchema.objOf(iframeFields);

export const iframeDataProcessor = ValueSchema.string;

export const createIframe = (spec: IframeSpec): Result<Iframe, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<Iframe>('iframe', iframeSchema, spec);
