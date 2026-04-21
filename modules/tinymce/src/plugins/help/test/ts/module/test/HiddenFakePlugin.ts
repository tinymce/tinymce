import { Fun } from '@ephox/katamari';

import type Editor from 'tinymce/core/api/Editor';
import PluginManager from 'tinymce/core/api/PluginManager';

export default (): void => {
  const Plugin = (_editor: Editor, _url: string) => {
    return {
      getMetadata: Fun.constant({
        name: 'Hidden Fake',
        type: 'opensource' as const,
        hidden: true
      })
    };
  };

  PluginManager.add('hiddenfake', Plugin);
};
