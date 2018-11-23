/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Settings from './Settings';
import Actions, { LastSuggestion } from '../core/Actions';
import { Editor } from 'tinymce/core/api/Editor';
import { Cell } from '@ephox/katamari';
import { DomTextMatcher } from 'tinymce/plugins/spellchecker/core/DomTextMatcher';

const get = function (editor: Editor, startedState: Cell<boolean>, lastSuggestionsState: Cell<LastSuggestion>, textMatcherState: Cell<DomTextMatcher>, currentLanguageState: Cell<string>, url: string) {
  const getLanguage = function () {
    return currentLanguageState.get();
  };

  const getWordCharPattern = function () {
    return Settings.getSpellcheckerWordcharPattern(editor);
  };

  const markErrors = function (data: string) {
    Actions.markErrors(editor, startedState, textMatcherState, lastSuggestionsState, data);
  };

  const getTextMatcher = function () {
    return textMatcherState.get();
  };

  return {
    getTextMatcher,
    getWordCharPattern,
    markErrors,
    getLanguage
  };
};

export default {
  get
};