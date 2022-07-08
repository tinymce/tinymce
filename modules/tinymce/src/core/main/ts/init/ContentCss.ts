import { Arr } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Options from '../api/Options';

const isContentCssSkinName = (url: string) => /^[a-z0-9\-]+$/i.test(url);

const getContentCssUrls = (editor: Editor): string[] => {
  return transformToUrls(editor, Options.getContentCss(editor));
};

const getFontCssUrls = (editor: Editor): string[] => {
  return transformToUrls(editor, Options.getFontCss(editor));
};

const transformToUrls = (editor: Editor, cssLinks: string[]): string[] => {
  const skinUrl = editor.editorManager.baseURL + '/skins/content';
  const suffix = editor.editorManager.suffix;
  const contentCssFile = `content${suffix}.css`;

  return Arr.map(cssLinks, (url) => {
    if (isContentCssSkinName(url) && !editor.inline) {
      return `${skinUrl}/${url}/${contentCssFile}`;
    } else {
      return editor.documentBaseURI.toAbsolute(url);
    }
  });
};

const appendContentCssFromSettings = (editor: Editor): void => {
  editor.contentCSS = editor.contentCSS.concat(getContentCssUrls(editor), getFontCssUrls(editor));
};

export {
  appendContentCssFromSettings
};
