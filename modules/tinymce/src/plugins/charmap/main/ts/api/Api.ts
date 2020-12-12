/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as Actions from '../core/Actions';
import * as CharMap from '../core/CharMap';

const get = (editor) => {
  const getCharMap = () => {
    return CharMap.getCharMap(editor);
  };

  const insertChar = (chr) => {
    Actions.insertChar(editor, chr);
  };

  return {
    getCharMap,
    insertChar
  };
};

export {
  get
};
