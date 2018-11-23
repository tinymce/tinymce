/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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