/**
 * SelectionMatcher.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Matcher from './Matcher';
import Measure from './Measure';
import { Editor } from 'tinymce/core/api/Editor';
import { GeomRect } from 'tinymce/core/api/geom/Rect';
import { Element } from '@ephox/dom-globals';

// textSelection :: String -> (Editor -> Matcher.result | Null)
const textSelection = function (id: string) {
  return function (editor: Editor) {
    if (!editor.selection.isCollapsed()) {
      const result: {id: string, rect: GeomRect} = Matcher.result(id, Measure.getSelectionRect(editor));
      return result;
    }

    return null;
  };
};

// emptyTextBlock :: [Elements], String -> (Editor -> Matcher.result | Null)
const emptyTextBlock = function (elements: Element[], id: string) {
  return function (editor) {
    let i;
    const textBlockElementsMap = editor.schema.getTextBlockElements();

    for (i = 0; i < elements.length; i++) {
      if (elements[i].nodeName === 'TABLE') {
        return null;
      }
    }

    for (i = 0; i < elements.length; i++) {
      if (elements[i].nodeName in textBlockElementsMap) {
        if (editor.dom.isEmpty(elements[i])) {
          return Matcher.result(id, Measure.getSelectionRect(editor));
        }

        return null;
      }
    }

    return null;
  };
};

export default {
  textSelection,
  emptyTextBlock
};