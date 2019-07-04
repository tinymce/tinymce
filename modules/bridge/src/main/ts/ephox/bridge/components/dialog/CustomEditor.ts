import { ValueSchema, FieldSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { Element } from '@ephox/dom-globals';
import { FormComponent, FormComponentApi, formComponentFields } from './FormComponent';

export interface CustomEditorInit {
  setValue: (value: string) => void;
  getValue: () => string;
  destroy: () =>  void;
}

export interface CustomEditorApi extends FormComponentApi {
  type: 'customeditor';
  tag?: string;
  init: (e: Element) => Promise<CustomEditorInit>;
}

export interface CustomEditor extends FormComponent {
  type: 'customeditor';
  tag: string;
  init: (e: Element) => Promise<CustomEditorInit>;
}

export const customEditorFields = formComponentFields.concat([
  FieldSchema.defaultedString('tag', 'textarea'),
  FieldSchema.strictFunction('init')
]);

export const customEditorSchema = ValueSchema.objOf(customEditorFields);

export const customEditorDataProcessor = ValueSchema.string;

export const createCustomEditor = (spec: CustomEditorApi): Result<CustomEditor, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<CustomEditor>('CustomEditor', customEditorSchema, spec);
};
