import { Fun } from '@ephox/katamari';
import PluginManager from 'tinymce/core/api/PluginManager';

PluginManager.add('nometafake', Fun.noop);

export default () => {};
