import { Menu } from '@ephox/bridge';

import Editor from 'tinymce/core/api/Editor';

import * as ColorSwatch from '../ui/core/color/ColorSwatch';
import * as Options from '../ui/core/color/Options';

export interface UiFactoryBackstageForColorInput {
  readonly colorPicker: (callback: ColorSwatch.ColorInputCallback, value: string) => void;
  readonly hasCustomColors: () => boolean;
  readonly getColors: () => Menu.ChoiceMenuItemSpec[];
  readonly getColorCols: () => number;
}

const colorPicker = (editor: Editor) => (callback: ColorSwatch.ColorInputCallback, value: string) => {
  const dialog = ColorSwatch.colorPickerDialog(editor);
  dialog(callback, value);
};

const hasCustomColors = (editor: Editor) => (): boolean => Options.hasCustomColors(editor);

const getColors = (editor: Editor) => (): Menu.ChoiceMenuItemSpec[] => Options.getColors(editor);

const getColorCols = (editor: Editor) => (): number => Options.getColorCols(editor);

export const ColorInputBackstage = (editor: Editor): UiFactoryBackstageForColorInput => ({
  colorPicker: colorPicker(editor),
  hasCustomColors: hasCustomColors(editor),
  getColors: getColors(editor),
  getColorCols: getColorCols(editor)
});
