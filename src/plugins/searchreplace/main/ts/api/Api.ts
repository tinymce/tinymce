/**
 * Api.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
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