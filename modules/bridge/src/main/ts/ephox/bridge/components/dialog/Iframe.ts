import { ValueSchema, FieldSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { FormComponentWithLabel, FormComponentWithLabelApi, formComponentWithLabelFields } from './FormComponent';

export interface IframeApi extends FormComponentWithLabelApi {
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

export const createIframe = (spec: IframeApi): Result<Iframe, ValueSchema.SchemaError<any>> => ValueSchema.asRaw<Iframe>('iframe', iframeSchema, spec);
