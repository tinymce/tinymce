import { Fun } from '@ephox/katamari';

import PluginManager from 'tinymce/core/api/PluginManager';

export default () => {
  PluginManager.add('nometafake', Fun.noop);
};
