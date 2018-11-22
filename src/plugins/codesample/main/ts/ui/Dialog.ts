/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Settings from '../api/Settings';
import CodeSample from '../core/CodeSample';
import Languages from '../core/Languages';

export default {
  open (editor) {
    const minWidth = Settings.getDialogMinWidth(editor);
    const minHeight = Settings.getDialogMinHeight(editor);
    const currentLanguage = Languages.getCurrentLanguage(editor);
    const currentLanguages = Languages.getLanguages(editor);
    const currentCode = CodeSample.getCurrentCode(editor);

    editor.windowManager.open({
      title: 'Insert/Edit code sample',
      minWidth,
      minHeight,
      layout: 'flex',
      direction: 'column',
      align: 'stretch',
      body: [
        {
          type: 'listbox',
          name: 'language',
          label: 'Language',
          maxWidth: 200,
          value: currentLanguage,
          values: currentLanguages
        },

        {
          type: 'textbox',
          name: 'code',
          multiline: true,
          spellcheck: false,
          ariaLabel: 'Code view',
          flex: 1,
          style: 'direction: ltr; text-align: left',
          classes: 'monospace',
          value: currentCode,
          autofocus: true
        }
      ],
      onSubmit (e) {
        CodeSample.insertCodeSample(editor, e.data.language, e.data.code);
      }
    });
  }
};