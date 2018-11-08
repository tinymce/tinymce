/**
 * Dialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Settings from '../api/Settings';
import CodeSample from '../core/CodeSample';
import Languages, { LanguageSpec } from '../core/Languages';
import { Arr } from '@ephox/katamari';

const open = (editor) => {
  const minWidth = Settings.getDialogMinWidth(editor);
  const minHeight = Settings.getDialogMinHeight(editor);
  const languages: LanguageSpec[] = Languages.getLanguages(editor);
  const defaultLanguage: string = Arr.head(languages).fold(() => '', (l) => l.value);
  const currentLanguage: string = Languages.getCurrentLanguage(editor, defaultLanguage);
  const currentCode: string = CodeSample.getCurrentCode(editor);

  editor.windowManager.open({
    title: 'Insert/Edit Code Sample',
    size: 'large',
    minWidth,
    minHeight,
    layout: 'flex',
    direction: 'column',
    align: 'stretch',
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
          multiline: true,
          flex: true,
          spellcheck: false,
          ariaLabel: 'Code view',
          style: 'direction: ltr; text-align: left',
          classes: 'monospace',
          value: currentCode,
          autofocus: true
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