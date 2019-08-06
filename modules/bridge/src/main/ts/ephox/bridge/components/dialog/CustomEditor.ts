import { ValueSchema, FieldSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { Element } from '@ephox/dom-globals';
import { FormComponent, FormComponentApi, formComponentFields } from './FormComponent';

export interface CustomEditorInit {
  setValue: (value: string) => void;
  getValue: () => string;
  destroy: () =>  void;
}

export type CustomEditorInitFn = (elm: Element, settings: any) => Promise<CustomEditorInit>;

interface CustomEditorOldApi extends FormComponentApi {
  type: 'customeditor';
  tag?: string;
  init: (e: Element) => Promise<CustomEditorInit>;
}

interface CustomEditorNewApi extends FormComponentApi {
  type: 'customeditor';
  tag?: string;
  scriptId: string;
  scriptUrl: string;
  settings?: any;
}

export type CustomEditorApi = CustomEditorOldApi | CustomEditorNewApi;

export interface CustomEditorOld extends FormComponent {
  type: 'customeditor';
  tag: string;
  init: (e: Element) => Promise<CustomEditorInit>;
}

export interface CustomEditorNew extends FormComponent {
  type: 'customeditor';
  tag: string;
  scriptId: string;
  scriptUrl: string;
  settings: any;
}

export type CustomEditor = CustomEditorOld | CustomEditorNew;

const customEditorFields = formComponentFields.concat([
  FieldSchema.defaultedString('tag', 'textarea'),
  FieldSchema.strictString('scriptId'),
  FieldSchema.strictString('scriptUrl'),
  FieldSchema.defaultedPostMsg('settings', undefined)
]);

const customEditorFieldsOld = formComponentFields.concat([
  FieldSchema.defaultedString('tag', 'textarea'),
  FieldSchema.strictFunction('init')
]);

export const customEditorSchema = ValueSchema.valueOf(
  (v) => ValueSchema.asRaw('customeditor.old', ValueSchema.objOfOnly(customEditorFieldsOld), v).orThunk(
    () => ValueSchema.asRaw('customeditor.new', ValueSchema.objOfOnly(customEditorFields), v)
  )
);

export const customEditorDataProcessor = ValueSchema.string;

export const createCustomEditor = (spec: CustomEditorApi): Result<CustomEditor, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<CustomEditor>('CustomEditor', customEditorSchema, spec);
};
