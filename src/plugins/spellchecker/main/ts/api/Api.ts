/**
 * Api.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Settings from './Settings';
import Actions from '../core/Actions';

const get = function (editor, startedState, lastSuggestionsState, textMatcherState, url) {
  const getLanguage = function () {
    return Settings.getLanguage(editor);
  };

  const getWordCharPattern = function () {
    return Settings.getSpellcheckerWordcharPattern(editor);
  };

  const markErrors = function (data) {
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