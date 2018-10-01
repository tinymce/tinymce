/**
 * Languages.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Settings from '../api/Settings';
import CodeSample from './CodeSample';

export interface LanguageSpec {
  text: string;
  value: string;
}

const getLanguages = (editor): LanguageSpec[] => {
  const defaultLanguages: LanguageSpec[] = [
    { text: 'HTML/XML', value: 'markup' },
    { text: 'JavaScript', value: 'javascript' },
    { text: 'CSS', value: 'css' },
    { text: 'PHP', value: 'php' },
    { text: 'Ruby', value: 'ruby' },
    { text: 'Python', value: 'python' },
    { text: 'Java', value: 'java' },
    { text: 'C', value: 'c' },
    { text: 'C#', value: 'csharp' },
    { text: 'C++', value: 'cpp' }
  ];

  const customLanguages = Settings.getLanguages(editor);
  return customLanguages ? customLanguages : defaultLanguages;
};

const getCurrentLanguage = (editor, fallback: string): string => {
  const node = CodeSample.getSelectedCodeSample(editor);

  return node.fold(() => fallback, (n) => {
    const matches = n.className.match(/language-(\w+)/);
    return matches ? matches[1] : fallback;
  });
};

export default {
  getLanguages,
  getCurrentLanguage
};