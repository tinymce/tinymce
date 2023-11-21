import { Arr } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Options from '../api/Options';
import { TinyMCE } from '../api/Tinymce';

declare let tinymce: TinyMCE;

const isContentCssSkinName = (url: string) => /^[a-z0-9\-]+$/i.test(url);

const toContentSkinResourceName = (url: string): string => 'content/' + url + '/content.css';

const isBundledCssSkinName = (url: string) => tinymce.Resource.has(toContentSkinResourceName(url));

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
    if (isBundledCssSkinName(url)) {
      return url;
    } else if (isContentCssSkinName(url) && !editor.inline) {
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
  toContentSkinResourceName,
  appendContentCssFromSettings
};
