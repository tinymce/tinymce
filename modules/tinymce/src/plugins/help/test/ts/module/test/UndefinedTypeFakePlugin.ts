import { Fun } from '@ephox/katamari';

import type Editor from 'tinymce/core/api/Editor';
import PluginManager, { type PluginMetadata } from 'tinymce/core/api/PluginManager';

export const undefinedTypeFakeKey = 'undefinedtypefake';

export default (): void => {
  const Plugin = (_editor: Editor, _url: string) => {
    return {
      getMetadata: Fun.constant({
        name: 'Undefined Type Fake',
        url: 'http://www.undefinedtype.com',
        type: undefined
      } as unknown as PluginMetadata)
    };
  };

  PluginManager.add(undefinedTypeFakeKey, Plugin);
};
