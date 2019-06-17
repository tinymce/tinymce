/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import CodeSample from '../core/CodeSample';
import Languages, { LanguageSpec } from '../core/Languages';
import { Arr } from '@ephox/katamari';

const open = (editor: Editor) => {
  const languages: LanguageSpec[] = Languages.getLanguages(editor);
  const defaultLanguage: string = Arr.head(languages).fold(() => '', (l) => l.value);
  const currentLanguage: string = Languages.getCurrentLanguage(editor, defaultLanguage);
  const currentCode: string = CodeSample.getCurrentCode(editor);

  editor.windowManager.open({
    title: 'Insert/Edit Code Sample',
    size: 'large',
    body: {
      type: 'panel',
      items: [
        {
          type: 'selectbox',
          name: 'language',
          label: 'Language',
          items: languages
        },
        {
          type: 'textarea',
          name: 'code',
          label: 'Code view',
        }
      ]
    },
    buttons: [
      {
        type: 'cancel',
        name: 'cancel',
        text: 'Cancel',
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

export default {
  open
};