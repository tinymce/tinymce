import { Fun } from '@ephox/katamari';

import type Editor from 'tinymce/core/api/Editor';
import PluginManager, { type PluginMetadata } from 'tinymce/core/api/PluginManager';

export default (): void => {
  const Plugin = (_editor: Editor, _url: string) => {
    return {
      getMetadata: Fun.constant({
        name: 'Slug No Type Fake',
        slug: 'slug-no-type'
      } as unknown as PluginMetadata)
    };
  };

  PluginManager.add('slugnotypefake', Plugin);
};
