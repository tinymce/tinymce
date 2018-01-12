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

const getLanguages = function (editor) {
  const defaultLanguages = [
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

const getCurrentLanguage = function (editor) {
  let matches;
  const node = CodeSample.getSelectedCodeSample(editor);

  if (node) {
    matches = node.className.match(/language-(\w+)/);
    return matches ? matches[1] : '';
  }

  return '';
};

export default {
  getLanguages,
  getCurrentLanguage
};