import { FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import { FormComponentWithLabel, formComponentWithLabelFields, FormComponentWithLabelSpec } from './FormComponent';

export interface IframeSpec extends FormComponentWithLabelSpec {
  type: 'iframe';
  sandboxed?: boolean;
  scrollToBottom?: boolean;
  transparent?: boolean;
  useDocumentWrite?: boolean;
}

export interface Iframe extends FormComponentWithLabel {
  type: 'iframe';
  sandboxed: boolean;
  scrollToBottom: boolean;
  transparent: boolean;
  useDocumentWrite: boolean;
}

const iframeFields = formComponentWithLabelFields.concat([
  FieldSchema.defaultedBoolean('scrollToBottom', false),
  FieldSchema.defaultedBoolean('sandboxed', true),
  FieldSchema.defaultedBoolean('transparent', true),
  FieldSchema.defaultedBoolean('useDocumentWrite', false)
]);

export const iframeSchema = StructureSchema.objOf(iframeFields);

export const iframeDataProcessor = ValueType.string;

export const createIframe = (spec: IframeSpec): Result<Iframe, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<Iframe>('iframe', iframeSchema, spec);
