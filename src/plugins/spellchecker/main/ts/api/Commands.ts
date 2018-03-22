/**
 * Commands.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Actions, { LastSuggestion } from '../core/Actions';
import { Editor } from 'tinymce/core/api/Editor';
import { Cell } from '@ephox/katamari';
import { DomTextMatcher } from 'tinymce/plugins/spellchecker/core/DomTextMatcher';

const register = function (editor: Editor, pluginUrl: string, startedState: Cell<boolean>, textMatcherState: Cell<DomTextMatcher>, lastSuggestionsState: Cell<LastSuggestion>, currentLanguageState: Cell<string>) {
  editor.addCommand('mceSpellCheck', function () {
    Actions.spellcheck(editor, pluginUrl, startedState, textMatcherState, lastSuggestionsState, currentLanguageState);
  });
};

export default {
  register
};