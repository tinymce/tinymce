/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Editor } from 'tinymce/core/api/Editor';

const getLanguages = function (editor: Editor) {
  const defaultLanguages = 'English=en,Danish=da,Dutch=nl,Finnish=fi,French=fr_FR,German=de,Italian=it,Polish=pl,Portuguese=pt_BR,Spanish=es,Swedish=sv';
  return editor.getParam('spellchecker_languages', defaultLanguages);
};

const getLanguage = function (editor: Editor) {
  const defaultLanguage = editor.getParam('language', 'en');
  return editor.getParam('spellchecker_language', defaultLanguage);
};

const getRpcUrl = function (editor: Editor) {
  return editor.getParam('spellchecker_rpc_url');
};

const getSpellcheckerCallback = function (editor: Editor) {
  return editor.getParam('spellchecker_callback');
};

const getSpellcheckerWordcharPattern = function (editor: Editor) {
  const defaultPattern = new RegExp('[^' +
  '\\s!"#$%&()*+,-./:;<=>?@[\\]^_{|}`' +
  '\u00a7\u00a9\u00ab\u00ae\u00b1\u00b6\u00b7\u00b8\u00bb' +
  '\u00bc\u00bd\u00be\u00bf\u00d7\u00f7\u00a4\u201d\u201c\u201e\u00a0\u2002\u2003\u2009' +
  ']+', 'g');
  return editor.getParam('spellchecker_wordchar_pattern', defaultPattern);
};

export default {
  getLanguages,
  getLanguage,
  getRpcUrl,
  getSpellcheckerCallback,
  getSpellcheckerWordcharPattern
};