/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from '../api/Editor';
import * as Settings from '../api/Settings';
import { Arr } from '@ephox/katamari';

const isContentCssSkinName = (url: string) => /^[a-z0-9\-]+$/i.test(url);

const getContentCssUrls = (editor: Editor): string[] => {
  const contentCss = Settings.getContentCss(editor);
  const skinUrl = editor.editorManager.baseURL + '/skins/content';
  const suffix = editor.editorManager.suffix;
  const contentCssFile = `content${suffix}.css`;
  const inline = editor.inline === true;

  return Arr.map(contentCss, (url) => {
    if (isContentCssSkinName(url) && !inline) {
      return `${skinUrl}/${url}/${contentCssFile}`;
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
