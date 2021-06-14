import { FieldSchema, ValueSchema, ValueType } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { FormComponent, formComponentFields, FormComponentSpec } from './FormComponent';

export interface CustomEditorInit {
  setValue: (value: string) => void;
  getValue: () => string;
  destroy: () => void;
}

export type CustomEditorInitFn = (elm: HTMLElement, settings: any) => Promise<CustomEditorInit>;

interface CustomEditorOldSpec extends FormComponentSpec {
  type: 'customeditor';
  tag?: string;
  init: (e: HTMLElement) => Promise<CustomEditorInit>;
}

interface CustomEditorNewSpec extends FormComponentSpec {
  type: 'customeditor';
  tag?: string;
  scriptId: string;
  scriptUrl: string;
  settings?: any;
}

export type CustomEditorSpec = CustomEditorOldSpec | CustomEditorNewSpec;

export interface CustomEditorOld extends FormComponent {
  type: 'customeditor';
  tag: string;
  init: (e: HTMLElement) => Promise<CustomEditorInit>;
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
  FieldSchema.requiredString('scriptId'),
  FieldSchema.requiredString('scriptUrl'),
  FieldSchema.defaultedPostMsg('settings', undefined)
]);

const customEditorFieldsOld = formComponentFields.concat([
  FieldSchema.defaultedString('tag', 'textarea'),
  FieldSchema.requiredFunction('init')
]);

export const customEditorSchema = ValueSchema.valueOf(
  (v) => ValueSchema.asRaw('customeditor.old', ValueSchema.objOfOnly(customEditorFieldsOld), v).orThunk(
    () => ValueSchema.asRaw('customeditor.new', ValueSchema.objOfOnly(customEditorFields), v)
  )
);

export const customEditorDataProcessor = ValueType.string;

export const createCustomEditor = (spec: CustomEditorSpec): Result<CustomEditor, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<CustomEditor>('CustomEditor', customEditorSchema, spec);
