/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Actions from '../core/Actions';
import Formula from '../core/Formula';

const get = function (editor) {
  const getFormula = function () {
    return Formula.getFormula(editor);
  };

  const insertChar = function (chr) {
    Actions.insertChar(editor, chr);
  };

  return {
    getFormula,
    insertChar
  };
};

export default {
  get
};