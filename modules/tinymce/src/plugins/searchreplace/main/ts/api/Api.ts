/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import * as Actions from '../core/Actions';

const get = function (editor: Editor, currentState: Cell<Actions.SearchState>) {
  const done = function (keepEditorSelection?: boolean) {
    return Actions.done(editor, currentState, keepEditorSelection);
  };

  const find = function (text: string, matchCase: boolean, wholeWord: boolean) {
    return Actions.find(editor, currentState, text, matchCase, wholeWord);
  };

  const next = function () {
    return Actions.next(editor, currentState);
  };

  const prev = function () {
    return Actions.prev(editor, currentState);
  };

  const replace = function (text: string, forward?: boolean, all?: boolean) {
    return Actions.replace(editor, currentState, text, forward, all);
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
