/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Actions from '../core/Actions';

const get = function (editor, currentIndexState) {
  const done = function (keepEditorSelection) {
    return Actions.done(editor, currentIndexState, keepEditorSelection);
  };

  const find = function (text, matchCase, wholeWord) {
    return Actions.find(editor, currentIndexState, text, matchCase, wholeWord);
  };

  const next = function () {
    return Actions.next(editor, currentIndexState);
  };

  const prev = function () {
    return Actions.prev(editor, currentIndexState);
  };

  const replace = function (text, forward, all) {
    return Actions.replace(editor, currentIndexState, text, forward, all);
  };

  return {
    done,
    find,
    next,
    prev,
    replace
  };
};

export default {
  get
};