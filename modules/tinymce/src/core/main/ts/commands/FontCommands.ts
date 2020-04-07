/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Range, Node } from '@ephox/dom-globals';
import { Arr, Option, Strings } from '@ephox/katamari';
import Editor from '../api/Editor';
import * as Settings from '../api/Settings';
import * as FontInfo from '../fmt/FontInfo';
import * as CaretFinder from '../caret/CaretFinder';
import * as NodeType from '../dom/NodeType';

const findFirstCaretElement = (editor: Editor) => CaretFinder.firstPositionIn(editor.getBody()).map((caret) => {
  const container = caret.container();
  return NodeType.isText(container) ? container.parentNode : container;
});

const isRangeAtStartOfNode = (rng: Range, root: Node) => rng.startContainer === root && rng.startOffset === 0;

const getCaretElement = (editor: Editor): Option<Node> => Option.from(editor.selection.getRng()).bind((rng) => {
  const root = editor.getBody();
  return isRangeAtStartOfNode(rng, root) ? Option.none() : Option.from(editor.selection.getStart(true));
});

const fromFontSizeNumber = (editor: Editor, value: string): string => {
  if (/^[0-9\.]+$/.test(value)) {
    const fontSizeNumber = parseInt(value, 10);

    // Convert font size 1-7 to styles
    if (fontSizeNumber >= 1 && fontSizeNumber <= 7) {
      const fontSizes = Settings.getFontStyleValues(editor);
      const fontClasses = Settings.getFontSizeClasses(editor);

      if (fontClasses) {
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

const normalizeFontNames = (font: string) => {
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

export const fontNameAction = (editor: Editor, value: string) => {
  const font = fromFontSizeNumber(editor, value);
  editor.formatter.toggle('fontname', { value: normalizeFontNames(font) });
  editor.nodeChanged();
};

export const fontNameQuery = (editor: Editor) => getCaretElement(editor).fold(
  () => findFirstCaretElement(editor).map((caretElement) => FontInfo.getFontFamily(editor.getBody(), caretElement)).getOr(''),
  (caretElement) => FontInfo.getFontFamily(editor.getBody(), caretElement)
);

export const fontSizeAction = (editor: Editor, value: string) => {
  editor.formatter.toggle('fontsize', { value: fromFontSizeNumber(editor, value) });
  editor.nodeChanged();
};

export const fontSizeQuery = (editor: Editor) => getCaretElement(editor).fold(
  () => findFirstCaretElement(editor).map((caretElement) => FontInfo.getFontSize(editor.getBody(), caretElement)).getOr(''),
  (caretElement) => FontInfo.getFontSize(editor.getBody(), caretElement)
);
