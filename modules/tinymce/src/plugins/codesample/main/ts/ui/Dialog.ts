import { Arr, Fun } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as CodeSample from '../core/CodeSample';
import * as Languages from '../core/Languages';

type LanguageSpec = Languages.LanguageSpec;

const open = (editor: Editor): void => {
  const languages: LanguageSpec[] = Languages.getLanguages(editor);
  const defaultLanguage: string = Arr.head(languages).fold(Fun.constant(''), (l) => l.value);
  const currentLanguage: string = Languages.getCurrentLanguage(editor, defaultLanguage);
  const currentCode: string = CodeSample.getCurrentCode(editor);

  editor.windowManager.open({
    title: 'Insert/Edit Code Sample',
    size: 'large',
    body: {
      type: 'panel',
      items: [
        {
          type: 'listbox',
          name: 'language',
          label: 'Language',
          items: languages
        },
        {
          type: 'textarea',
          name: 'code',
          label: 'Code view'
        }
      ]
    },
    buttons: [
      {
        type: 'cancel',
        name: 'cancel',
        text: 'Cancel'
      },
      {
        type: 'submit',
        name: 'save',
        text: 'Save',
        primary: true
      }
    ],
    initialData: {
      language: currentLanguage,
      code: currentCode
    },
    onSubmit: (api) => {
      const data = api.getData();
      CodeSample.insertCodeSample(editor, data.language, data.code);
      api.close();
    }
  });
};

export {
  open
};
