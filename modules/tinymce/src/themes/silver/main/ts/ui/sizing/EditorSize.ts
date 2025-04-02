import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import * as Options from '../../api/Options';
import * as Utils from './Utils';

export const getHeight = (editor: Editor): Optional<number> => {
  const baseHeight = Utils.convertValueToPx(SugarElement.fromDom(editor.targetElm), Options.getHeightOption(editor));
  const minHeight = Options.getMinHeightOption(editor);
  const maxHeight = Options.getMaxHeightOption(editor);

  return baseHeight.map((height) => Utils.calcCappedSize(height, minHeight, maxHeight));
};

export const getHeightWithFallback = (editor: Editor): string | number => {
  return getHeight(editor).getOr(Options.getHeightOption(editor)); // If we can't parse, set the height while ignoring min/max values.
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
