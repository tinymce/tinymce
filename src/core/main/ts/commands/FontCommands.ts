/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Editor } from 'tinymce/core/api/Editor';
import Settings from 'tinymce/core/api/Settings';
import FontInfo from 'tinymce/core/fmt/FontInfo';
import { Option } from '@ephox/katamari';
import CaretFinder from 'tinymce/core/caret/CaretFinder';
import NodeType from 'tinymce/core/dom/NodeType';
import { Range, Node } from '@ephox/dom-globals';

const findFirstCaretElement = (editor: Editor) => {
  return CaretFinder.firstPositionIn(editor.getBody()).map((caret) => {
    const container = caret.container();
    return NodeType.isText(container) ? container.parentNode : container;
  });
};

const isRangeAtStartOfNode = (rng: Range, root: Node) => {
  return rng.startContainer === root && rng.startOffset === 0;
};

const getCaretElement = (editor: Editor): Option<Node> => {
  return Option.from(editor.selection.getRng()).bind((rng) => {
    const root = editor.getBody();
    return isRangeAtStartOfNode(rng, root) ? Option.none() : Option.from(editor.selection.getStart(true));
  });
};

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

export const fontNameAction = (editor: Editor, value: string) => {
  editor.formatter.toggle('fontname', { value: fromFontSizeNumber(editor, value) });
  editor.nodeChanged();
};

export const fontNameQuery = (editor: Editor) => {
  return getCaretElement(editor).fold(
    () => findFirstCaretElement(editor).map((caretElement) => FontInfo.getFontFamily(editor.getBody(), caretElement)).getOr(''),
    (caretElement) => FontInfo.getFontFamily(editor.getBody(), caretElement)
  );
};

export const fontSizeAction = (editor: Editor, value: string) => {
  editor.formatter.toggle('fontsize', { value: fromFontSizeNumber(editor, value) });
  editor.nodeChanged();
};

export const fontSizeQuery = (editor: Editor) => {
  return getCaretElement(editor).fold(
    () => findFirstCaretElement(editor).map((caretElement) => FontInfo.getFontSize(editor.getBody(), caretElement)).getOr(''),
    (caretElement) => FontInfo.getFontSize(editor.getBody(), caretElement)
  );
};