import { ValueSchema, FieldSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { Element } from '@ephox/dom-globals';

export interface CustomEditorInit {
  setValue: (value: string) => void;
  getValue: () => string;
  destroy: () =>  void;
}

export interface CustomEditorApi {
  type: 'customeditor';
  tag?: string;
  init: (e: Element) => Promise<CustomEditorInit>;
}

export interface CustomEditor {
  // The custom editor component is currently being used in the Advanced Source Code dialog
  type: 'customeditor';
  tag: string;
  init: (e: Element) => Promise<CustomEditorInit>;
}

export const customEditorFields = [
  FieldSchema.strictString('type'),
  FieldSchema.defaultedString('tag', 'textarea'),
  FieldSchema.strictFunction('init')
];

export const customEditorSchema = ValueSchema.objOf(customEditorFields);

export const customEditorDataProcessor = ValueSchema.string;

export const createCustomEditor = (spec: CustomEditorApi): Result<CustomEditor, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<CustomEditor>('CustomEditor', customEditorSchema, spec);
};
