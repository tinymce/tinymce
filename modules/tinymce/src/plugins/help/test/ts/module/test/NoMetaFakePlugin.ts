import { Fun } from '@ephox/katamari';

import PluginManager from 'tinymce/core/api/PluginManager';

export default (): void => {
  PluginManager.add('nometafake', Fun.noop);
};
