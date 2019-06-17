/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Actions, { LastSuggestion } from '../core/Actions';
import Editor from 'tinymce/core/api/Editor';
import { Cell } from '@ephox/katamari';
import { DomTextMatcher } from '../core/DomTextMatcher';

const register = function (editor: Editor, pluginUrl: string, startedState: Cell<boolean>, textMatcherState: Cell<DomTextMatcher>, lastSuggestionsState: Cell<LastSuggestion>, currentLanguageState: Cell<string>) {
  editor.addCommand('mceSpellCheck', function () {
    Actions.spellcheck(editor, pluginUrl, startedState, textMatcherState, lastSuggestionsState, currentLanguageState);
  });
};

export default {
  register
};
