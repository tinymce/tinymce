import { Fun } from '@ephox/katamari';

import PluginManager from 'tinymce/core/api/PluginManager';

export const noMetaFakeKey = 'nometafake';

export default (): void => {
  PluginManager.add(noMetaFakeKey, Fun.noop);
};
