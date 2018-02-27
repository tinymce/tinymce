/**
 * Matcher.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
import { Editor } from 'tinymce/core/api/Editor';
import { GeomRect } from 'tinymce/core/api/geom/Rect';

// result :: String, Rect -> Matcher.result
const result = function (id: string, rect: GeomRect) {
  return {
    id,
    rect
  };
};

// match :: Editor, [(Editor -> Matcher.result | Null)] -> Matcher.result | Null
const match = function (editor: Editor, matchers) {
  for (let i = 0; i < matchers.length; i++) {
    const f = matchers[i];
    const result = f(editor);

    if (result) {
      return result;
    }
  }

  return null;
};

export default {
  match,
  result
};