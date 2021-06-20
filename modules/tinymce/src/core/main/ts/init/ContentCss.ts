/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Settings from '../api/Settings';

const isContentCssSkinName = (url: string) => /^[a-z0-9\-]+$/i.test(url);

const getContentCssUrls = (editor: Editor): string[] => {
  return transformToUrls(editor, Settings.getContentCss(editor));
};

const getFontCssUrls = (editor: Editor): string[] => {
  return transformToUrls(editor, Settings.getFontCss(editor));
};

const transformToUrls = (editor: Editor, cssLinks: string[]): string[] => {
  const skinUrl = editor.editorManager.baseURL + '/skins/content';
  const suffix = editor.editorManager.suffix;
  const contentCssFile = `content${suffix}.css`;
  const inline = editor.inline === true;

  return Arr.map(cssLinks, (url) => {
    if (isContentCssSkinName(url) && !inline) {
      return `${skinUrl}/${url}/${contentCssFile}`;
    } else {
      return editor.documentBaseURI.toAbsolute(url);
    }
  });
};

const appendContentCssFromSettings = (editor: Editor) => {
  editor.contentCSS = editor.contentCSS.concat(getContentCssUrls(editor), getFontCssUrls(editor));
};

export {
  appendContentCssFromSettings
};
