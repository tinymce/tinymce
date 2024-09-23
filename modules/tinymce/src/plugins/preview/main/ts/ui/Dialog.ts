import Editor from 'tinymce/core/api/Editor';

import * as IframeContent from '../core/IframeContent';

export const open = (editor: Editor): void => {

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
          transparent: false
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

  // Focus the close button, as by default the first element in the body is selected
  // which we don't want to happen here since the body only has the iframe content
  dataApi.focus('close');
};
