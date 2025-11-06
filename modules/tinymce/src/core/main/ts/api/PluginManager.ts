import AddOnManager from './AddOnManager';
import type Editor from './Editor';

export interface Plugin {
  getMetadata?: () => { name: string; url: string };
  init?: (editor: Editor, url: string) => void;

  // Allow custom apis
  [key: string]: any;
}

type PluginManager = AddOnManager<void | Plugin>;
const PluginManager: PluginManager = AddOnManager.PluginManager;

export default PluginManager;
