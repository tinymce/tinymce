import Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';
import * as CodeSample from './CodeSample';

export interface LanguageSpec {
  readonly text: string;
  readonly value: string;
}

const getLanguages = (editor: Editor): LanguageSpec[] => {
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

  const customLanguages = Options.getLanguages(editor);
  return customLanguages ? customLanguages : defaultLanguages;
};

const getCurrentLanguage = (editor: Editor, fallback: string): string => {
  const node = CodeSample.getSelectedCodeSample(editor);

  return node.fold(() => fallback, (n) => {
    const matches = n.className.match(/language-(\w+)/);
    return matches ? matches[1] : fallback;
  });
};

export {
  getLanguages,
  getCurrentLanguage
};
