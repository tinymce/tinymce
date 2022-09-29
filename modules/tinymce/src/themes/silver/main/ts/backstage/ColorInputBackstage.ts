import { Menu } from '@ephox/bridge';

import Editor from 'tinymce/core/api/Editor';

import * as ColorSwatch from '../ui/core/color/ColorSwatch';
import * as Options from '../ui/core/color/Options';

export interface UiFactoryBackstageForColorInput {
  readonly colorPicker: (callback: ColorSwatch.ColorInputCallback, value: string) => void;
  readonly hasCustomColors: () => boolean;
  readonly getColors: (id: string) => Menu.ChoiceMenuItemSpec[];
  readonly getColorCols: (id: string) => number;
}

const colorPicker = (editor: Editor) => (callback: ColorSwatch.ColorInputCallback, value: string) => {
  const dialog = ColorSwatch.colorPickerDialog(editor);
  dialog(callback, value);
};

const hasCustomColors = (editor: Editor) => (): boolean => Options.hasCustomColors(editor);

const getColors = (editor: Editor) => (id: string): Menu.ChoiceMenuItemSpec[] => Options.getColors(editor, id);

const getColorCols = (editor: Editor) => (id: string): number => Options.getColorCols(editor, id);

export const ColorInputBackstage = (editor: Editor): UiFactoryBackstageForColorInput => ({
  colorPicker: colorPicker(editor),
  hasCustomColors: hasCustomColors(editor),
  getColors: getColors(editor),
  getColorCols: getColorCols(editor)
});
