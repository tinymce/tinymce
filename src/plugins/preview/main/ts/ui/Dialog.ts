import IframeContent from '../core/IframeContent';

/**
 * Dialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

export const open = (editor) => {

  const content = IframeContent.getPreviewHtml(editor);

  const dataApi = editor.windowManager.open({
    title: 'Preview',
    size: 'large',
    body: {
      type: 'panel',
      items: [
        {
          name: 'preview',
          type: 'iframe',
          sandboxed: true,
          flex: true
        }
      ]
    },
    buttons: [
      {
        type: 'cancel',
        name: 'close',
        text: 'Close',
        primary: true
      }
    ],
    initialData: {
      preview: content
    }
  });

  // NOTE: AP-217 hack - Workout why this is necessary
  dataApi.focus('cancel');
};