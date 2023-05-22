/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

type SpellcheckCallback = (method: string, text: string, success: () => void, failure: (message: string) => void) => void;

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K];
  <T>(name: string): (editor: Editor) => T;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('spellchecker_languages', {
    processor: 'string',
    default: 'English=en,Danish=da,Dutch=nl,Finnish=fi,French=fr_FR,German=de,Italian=it,Polish=pl,Portuguese=pt_BR,Spanish=es,Swedish=sv'
  });

  const defaultLanguage = option('language').toString();
  registerOption('spellchecker_language', {
    processor: 'string',
    default: defaultLanguage
  });

  registerOption('spellchecker_rpc_url', {
    processor: 'string',
    default: ''
  });

  registerOption('spellchecker_callback', {
    processor: 'function'
  });

  registerOption('spellchecker_wordchar_pattern', {
    processor: 'regexp',
    default: new RegExp('[^' +
      '\\s!"#$%&()*+,-./:;<=>?@[\\]^_{|}`' +
      '\u00a7\u00a9\u00ab\u00ae\u00b1\u00b6\u00b7\u00b8\u00bb' +
      '\u00bc\u00bd\u00be\u00bf\u00d7\u00f7\u00a4\u201d\u201c\u201e\u00a0\u2002\u2003\u2009' +
      ']+', 'g')
  });
};

const getLanguages = option<string>('spellchecker_languages');
const getLanguage = option<string>('spellchecker_language');
const getRpcUrl = option<string>('spellchecker_rpc_url');
const getSpellcheckerCallback = option<SpellcheckCallback>('spellchecker_callback');
const getSpellcheckerWordcharPattern = option<RegExp>('spellchecker_wordchar_pattern');

export {
  register,
  getLanguages,
  getLanguage,
  getRpcUrl,
  getSpellcheckerCallback,
  getSpellcheckerWordcharPattern
};
