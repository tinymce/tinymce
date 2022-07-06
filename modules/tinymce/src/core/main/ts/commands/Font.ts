import { Arr, Strings } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as Options from '../api/Options';
import * as FontInfo from '../fmt/FontInfo';
import { mapRange } from '../selection/RangeMap';

const fromFontSizeNumber = (editor: Editor, value: string): string => {
  if (/^[0-9.]+$/.test(value)) {
    const fontSizeNumber = parseInt(value, 10);

    // Convert font size 1-7 to styles
    if (fontSizeNumber >= 1 && fontSizeNumber <= 7) {
      const fontSizes = Options.getFontStyleValues(editor);
      const fontClasses = Options.getFontSizeClasses(editor);

      if (fontClasses.length > 0) {
        return fontClasses[fontSizeNumber - 1] || value;
      } else {
        return fontSizes[fontSizeNumber - 1] || value;
      }
    } else {
      return value;
    }
  } else {
    return value;
  }
};

const normalizeFontNames = (font: string): string => {
  const fonts = font.split(/\s*,\s*/);
  return Arr.map(fonts, (font) => {
    if (font.indexOf(' ') !== -1 && !(Strings.startsWith(font, '"') || Strings.startsWith(font, `'`))) {
      // TINY-3801: The font has spaces, so need to wrap with quotes as the browser sometimes automatically handles this, but not always
      return `'${font}'`;
    } else {
      return font;
    }
  }).join(',');
};

export const fontNameAction = (editor: Editor, value: string): void => {
  const font = fromFontSizeNumber(editor, value);
  editor.formatter.toggle('fontname', { value: normalizeFontNames(font) });
  editor.nodeChanged();
};

export const fontNameQuery = (editor: Editor): string => mapRange(editor, (elm: SugarElement<Element>) =>
  FontInfo.getFontFamily(editor.getBody(), elm.dom)
).getOr('');

export const fontSizeAction = (editor: Editor, value: string): void => {
  editor.formatter.toggle('fontsize', { value: fromFontSizeNumber(editor, value) });
  editor.nodeChanged();
};

export const fontSizeQuery = (editor: Editor): string => mapRange(editor, (elm: SugarElement<Element>) =>
  FontInfo.getFontSize(editor.getBody(), elm.dom)
).getOr('');
