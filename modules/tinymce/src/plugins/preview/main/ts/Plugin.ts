import { Arr, Optional, Type } from '@ephox/katamari';

import type Editor from 'tinymce/core/api/Editor';
import PluginManager from 'tinymce/core/api/PluginManager';
import type { TinyMCE } from 'tinymce/core/api/Tinymce';

import * as Commands from './api/Commands';
import type { ContentCssResource } from './core/Types';
import * as Buttons from './ui/Buttons';

declare const tinymce: TinyMCE;

// Duplicated in modules/tinymce/src/core/main/ts/init/ContentCss.ts
const toContentSkinResourceName = (url: string): string => 'content/' + url + '/content.css';

const getContentCssResources = (editor: Editor): ContentCssResource[] => {
  return Arr.map(editor.contentCSS, (url) => {
    const resourceName = toContentSkinResourceName(url);
    return Optional.from(tinymce.Resource.get(resourceName))
      .filter(Type.isString)
      .map((content): ContentCssResource => ({ type: 'bundled', content }))
      .getOr({ type: 'link', url: editor.documentBaseURI.toAbsolute(url) });
  });
};

export default (): void => {
  PluginManager.add('preview', (editor) => {
    Commands.register(editor, () => getContentCssResources(editor));
    Buttons.register(editor);
  });
};
