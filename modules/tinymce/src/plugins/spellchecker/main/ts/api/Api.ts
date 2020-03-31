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
import * as Settings from './Settings';

type LastSuggestion = Actions.LastSuggestion;
type Data = Actions.Data;

const get = function (editor: Editor, startedState: Cell<boolean>, lastSuggestionsState: Cell<LastSuggestion>, textMatcherState: Cell<DomTextMatcher>, currentLanguageState: Cell<string>, _url: string) {
  const getLanguage = function () {
    return currentLanguageState.get();
  };

  const getWordCharPattern = function () {
    return Settings.getSpellcheckerWordcharPattern(editor);
  };

  const markErrors = function (data: Data) {
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

export {
  get
};
