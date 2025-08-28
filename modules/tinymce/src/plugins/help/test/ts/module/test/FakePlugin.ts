import { Fun } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import PluginManager from 'tinymce/core/api/PluginManager';

export default (): void => {
  const Plugin = (_editor: Editor, _url: string) => {
    return {
      getMetadata: Fun.constant({
        name: 'Fake',
        url: 'http://www.fake.com'
      })
    };
  };

  PluginManager.add('fake', Plugin);
};
