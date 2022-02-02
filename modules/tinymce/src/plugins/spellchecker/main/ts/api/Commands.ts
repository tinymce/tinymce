/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Actions from '../core/Actions';
import { DomTextMatcher } from '../core/DomTextMatcher';

type LastSuggestion = Actions.LastSuggestion;

const register = (editor: Editor, pluginUrl: string, startedState: Cell<boolean>, textMatcherState: Cell<DomTextMatcher>, lastSuggestionsState: Cell<LastSuggestion>, currentLanguageState: Cell<string>): void => {
  editor.addCommand('mceSpellCheck', () => {
    Actions.spellcheck(editor, pluginUrl, startedState, textMatcherState, lastSuggestionsState, currentLanguageState);
  });
};

export {
  register
};
