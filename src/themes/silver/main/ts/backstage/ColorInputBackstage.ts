import { Editor } from '../../../../../core/main/ts/api/Editor';
import ColorSwatch from '../ui/core/ColorSwatch';

export interface UiFactoryBackstageForColorInput {
  colorPicker: (callback, value) => void;
  hasCustomColors: () => boolean;
}

const colorPicker = (editor) => (callback, value) => {
  const dialog = ColorSwatch.colorPickerDialog(editor);
  dialog(callback, value);
};

const hasCustomColors = (editor) => (): boolean => {
  return editor.getParam('custom_colors') !== false;
};

export const ColorInputBackstage = (editor: Editor): UiFactoryBackstageForColorInput => ({
  colorPicker: colorPicker(editor),
  hasCustomColors: hasCustomColors(editor)
});