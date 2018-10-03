import { ValueSchema, FieldSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { FormComponent, FormComponentApi, formComponentFields } from './FormComponent';

export interface IframeApi extends FormComponentApi {
  type: 'iframe';
  sandboxed?: boolean;
  flex?: boolean;
}

export interface Iframe extends FormComponent {
  type: 'iframe';
  sandboxed: boolean;
  flex: boolean;
}

export const iframeFields = formComponentFields.concat([
  FieldSchema.defaultedBoolean('sandboxed', true),
  FieldSchema.defaultedBoolean('flex', false)
]);

export const iframeSchema = ValueSchema.objOf(iframeFields);

export const iframeDataProcessor = ValueSchema.string;

export const createIframe = (spec: IframeApi): Result<Iframe, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<Iframe>('iframe', iframeSchema, spec);
};
