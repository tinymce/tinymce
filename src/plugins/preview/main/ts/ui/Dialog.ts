/**
 * Dialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Env from 'tinymce/core/api/Env';
import Settings from '../api/Settings';
import IframeContent from './IframeContent';

const open = function (editor) {
  const sandbox = !Env.ie;
  const dialogHtml = '<iframe src="" frameborder="0"' + (sandbox ? ' sandbox="allow-scripts"' : '') + '></iframe>';
  const dialogWidth = Settings.getPreviewDialogWidth(editor);
  const dialogHeight = Settings.getPreviewDialogHeight(editor);

  editor.windowManager.open({
    title: 'Preview',
    width: dialogWidth,
    height: dialogHeight,
    html: dialogHtml,
    buttons: {
      text: 'Close',
      onclick (e) {
        e.control.parent().parent().close();
      }
    },
    onPostRender (e) {
      const iframeElm = e.control.getEl('body').firstChild;
      IframeContent.injectIframeContent(editor, iframeElm, sandbox);
    }
  });
};

export default {
  open
};