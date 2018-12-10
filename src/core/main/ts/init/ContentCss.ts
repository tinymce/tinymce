/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Editor } from '../api/Editor';
import Settings from '../api/Settings';
import { Arr } from '@ephox/katamari';

const isNamedContentCss = (url: string) => /^[a-z0-9\-]+$/i.test(url);

const getContentCssUrls = (editor: Editor): string[] => {
  const contentCss = Settings.getContentCss(editor);
  const skinUrl = editor.editorManager.baseURL + '/skins/content';

  return Arr.map(contentCss, (url) => {
    if (isNamedContentCss(url)) {
      return `${skinUrl}/` + url;
    } else {
      return editor.documentBaseURI.toAbsolute(url);
    }
  });
};

const appendContentCssFromSettings = (editor: Editor) => {
  editor.contentCSS = editor.contentCSS.concat(getContentCssUrls(editor));
};

export {
  appendContentCssFromSettings
};
