import { Editor } from '../../../../../core/main/ts/api/Editor';

export interface UiFactoryBackstageForColorInput {
  colorPicker: (callback, value) => void;
}

const colorPicker = (editor) => (callback, value) => {
  editor.settings.color_picker_callback(callback, value);
};

export const ColorInputBackstage = (editor: Editor): UiFactoryBackstageForColorInput => ({
  colorPicker: colorPicker(editor)
});