import { Arr, Optional, Type } from '@ephox/katamari';

import PluginManager from 'tinymce/core/api/PluginManager';
import type { TinyMCE } from 'tinymce/core/api/Tinymce';

import * as Commands from './api/Commands';
import type { ContentCssResource } from './core/Types';
import * as Buttons from './ui/Buttons';

declare const tinymce: TinyMCE;

const PLUGIN_CODE = 'preview';

export default (): void => {

  PluginManager.add(PLUGIN_CODE, (editor) => {
    const getContentCssResources = (): ContentCssResource[] =>
      Arr.map(editor.contentCSS, (key) =>
        Optional.from(tinymce.Resource.get(key))
          .filter(Type.isString)
          .map((content): ContentCssResource => ({ type: 'bundled', content }))
          .getOr({ type: 'link' as const, url: editor.documentBaseURI.toAbsolute(key) }));

    Commands.register(editor, getContentCssResources);
    Buttons.register(editor);

    return {
      getMetadata: () => ({ name: 'Preview', type: 'opensource', slug: PLUGIN_CODE })
    };
  });
};
