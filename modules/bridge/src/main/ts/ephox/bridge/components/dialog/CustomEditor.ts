import { FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
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

export const customEditorSchema = StructureSchema.valueOf(
  (v) => StructureSchema.asRaw('customeditor.old', StructureSchema.objOfOnly(customEditorFieldsOld), v).orThunk(
    () => StructureSchema.asRaw('customeditor.new', StructureSchema.objOfOnly(customEditorFields), v)
  )
);

export const customEditorDataProcessor = ValueType.string;

export const createCustomEditor = (spec: CustomEditorSpec): Result<CustomEditor, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<CustomEditor>('CustomEditor', customEditorSchema, spec);
