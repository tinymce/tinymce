/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import * as Actions from '../core/Actions';

const get = (editor: Editor, currentState: Cell<Actions.SearchState>) => {
  const done = (keepEditorSelection?: boolean) => {
    return Actions.done(editor, currentState, keepEditorSelection);
  };

  const find = (text: string, matchCase: boolean, wholeWord: boolean, inSelection: boolean = false) => {
    return Actions.find(editor, currentState, text, matchCase, wholeWord, inSelection);
  };

  const next = () => {
    return Actions.next(editor, currentState);
  };

  const prev = () => {
    return Actions.prev(editor, currentState);
  };

  const replace = (text: string, forward?: boolean, all?: boolean) => {
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

export {
  get
};
