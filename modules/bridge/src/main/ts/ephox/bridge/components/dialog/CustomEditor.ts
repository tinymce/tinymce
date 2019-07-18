import { ValueSchema, FieldSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { Element } from '@ephox/dom-globals';
import { FormComponent, FormComponentApi, formComponentFields } from './FormComponent';

export interface CustomEditorInit {
  setValue: (value: string) => void;
  getValue: () => string;
  destroy: () =>  void;
}

export type CustomEditorInitFn = (elm: Element) => Promise<CustomEditorInit>;

export interface CustomEditorApi extends FormComponentApi {
  type: 'customeditor';
  tag?: string;
  scriptId: string;
  scriptUrl: string;
}

export interface CustomEditor extends FormComponent {
  type: 'customeditor';
  tag: string;
  scriptId: string;
  scriptUrl: string;
}

export const customEditorFields = formComponentFields.concat([
  FieldSchema.defaultedString('tag', 'textarea'),
  FieldSchema.strictString('scriptId'),
  FieldSchema.strictString('scriptUrl')
]);

export const customEditorSchema = ValueSchema.objOf(customEditorFields);

export const customEditorDataProcessor = ValueSchema.string;

export const createCustomEditor = (spec: CustomEditorApi): Result<CustomEditor, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<CustomEditor>('CustomEditor', customEditorSchema, spec);
};
