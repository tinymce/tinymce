import { Editor } from '../../../../../core/main/ts/api/Editor';
import ColorSwatch from '../ui/core/ColorSwatch';

export interface UiFactoryBackstageForColorInput {
  colorPicker: (callback, value) => void;
}

const colorPicker = (editor) => (callback, value) => {
  const dialog = ColorSwatch.colorPickerDialog(editor);
  dialog(callback, value);
};

export const ColorInputBackstage = (editor: Editor): UiFactoryBackstageForColorInput => ({
  colorPicker: colorPicker(editor)
});