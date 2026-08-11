import { Fun } from '@ephox/katamari';

import type Editor from 'tinymce/core/api/Editor';
import PluginManager, { type PluginMetadata } from 'tinymce/core/api/PluginManager';

export const invalidTypeFakeKey = 'invalidtypefake';

export default (): void => {
  const Plugin = (_editor: Editor, _url: string) => {
    return {
      getMetadata: Fun.constant({
        name: 'Invalid Type Fake',
        type: 'PREMIUM',
        slug: 'invalid-type'
      } as unknown as PluginMetadata)
    };
  };

  PluginManager.add(invalidTypeFakeKey, Plugin);
};
