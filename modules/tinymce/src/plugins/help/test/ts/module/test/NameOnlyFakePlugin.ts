import { Fun } from '@ephox/katamari';

import type Editor from 'tinymce/core/api/Editor';
import PluginManager, { type PluginMetadata } from 'tinymce/core/api/PluginManager';

export const nameOnlyFakeKey = 'nameonlyfake';

export default (): void => {
  const Plugin = (_editor: Editor, _url: string) => {
    return {
      getMetadata: Fun.constant({
        name: 'Name Only Fake'
      } as unknown as PluginMetadata)
    };
  };

  PluginManager.add(nameOnlyFakeKey, Plugin);
};
