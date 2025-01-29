import { Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Options from '../../api/Options';
import * as Utils from './Utils';

const convertValueToPx = (editor: Editor, value: number | string): Optional<number> => {
  if (typeof value === 'number') {
    return Optional.from(value);
  }

  return Utils.parseToInt(value.trim()).orThunk(() => {
    const splitValue = /^([0-9.]+)(pt|em|px)$/.exec(value);

    if (splitValue) {
      const type = splitValue[2];
      const parsed = Number.parseFloat(splitValue[1]);

      if (Number.isNaN(parsed) || parsed < 0) {
        return Optional.none();
      } else if (type === 'em') {
        return Optional.from(parsed * Number.parseFloat(window.getComputedStyle(editor.targetElm).fontSize));
      } else if (type === 'pt') {
        return Optional.from(parsed * (72 / 96));
      } else if (type === 'px') {
        return Optional.from(parsed);
      }
    }

    return Optional.none();
  });
};

export const getHeight = (editor: Editor): Optional<number> => {
  const baseHeight = convertValueToPx(editor, Options.getHeightOption(editor));
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
