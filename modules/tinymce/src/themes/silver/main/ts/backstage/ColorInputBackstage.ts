/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import * as ColorSwatch from '../ui/core/color/ColorSwatch';
import * as Settings from '../ui/core/color/Settings';
import { Menu } from '@ephox/bridge';
import { Option } from '@ephox/katamari';

type ColorInputCallback = (valueOpt: Option<string>) => void;

export interface UiFactoryBackstageForColorInput {
  colorPicker: (callback: ColorInputCallback, value: string) => void;
  hasCustomColors: () => boolean;
  getColors: () => Menu.ChoiceMenuItemApi[];
  getColorCols: () => number;
}

const colorPicker = (editor: Editor) => (callback: ColorInputCallback, value: string) => {
  const dialog = ColorSwatch.colorPickerDialog(editor);
  dialog(callback, value);
};

const hasCustomColors = (editor: Editor) => (): boolean => Settings.hasCustomColors(editor);

const getColors = (editor: Editor) => (): Menu.ChoiceMenuItemApi[] => Settings.getColors(editor);

const getColorCols = (editor: Editor) => (): number => ColorSwatch.getColorCols(editor);

export const ColorInputBackstage = (editor: Editor): UiFactoryBackstageForColorInput => ({
  colorPicker: colorPicker(editor),
  hasCustomColors: hasCustomColors(editor),
  getColors: getColors(editor),
  getColorCols: getColorCols(editor)
});
