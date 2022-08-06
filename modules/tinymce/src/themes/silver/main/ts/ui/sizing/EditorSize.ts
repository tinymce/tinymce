import { Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Options from '../../api/Options';
import * as Utils from './Utils';

export const getHeight = (editor: Editor): Optional<number> => {
  const baseHeight = Options.getHeightOption(editor);
  const minHeight = Options.getMinHeightOption(editor);
  const maxHeight = Options.getMaxHeightOption(editor);

  return Utils.parseToInt(baseHeight).map((height) => Utils.calcCappedSize(height, minHeight, maxHeight));
};

export const getHeightWithFallback = (editor: Editor): string | number => {
  const height = getHeight(editor);
  return height.getOr(Options.getHeightOption(editor));
};

export const getWidth = (editor: Editor): Optional<number> => {
  const baseWidth = Options.getWidthOption(editor);
  const minWidth = Options.getMinWidthOption(editor);
  const maxWidth = Options.getMaxWidthOption(editor);

  return Utils.parseToInt(baseWidth).map((width) => Utils.calcCappedSize(width, minWidth, maxWidth));
};

export const getWidthWithFallback = (editor: Editor): string | number => {
  const width = getWidth(editor);
  return width.getOr(Options.getWidthOption(editor));
};
