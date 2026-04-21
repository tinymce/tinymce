import AddOnManager from './AddOnManager';
import type Editor from './Editor';

export type PluginMetadata =
  | { name: string; url: string; hidden?: boolean }
  | { name: string; type: 'premium' | 'opensource'; slug?: string; hidden?: boolean };

export interface Plugin {
  getMetadata?: () => PluginMetadata;
  init?: (editor: Editor, url: string) => void;

  // Allow custom apis
  [key: string]: any;
}

type PluginManager = AddOnManager<void | Plugin>;
const PluginManager: PluginManager = AddOnManager.PluginManager;

export default PluginManager;
