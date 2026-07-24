import AddOnManager from './AddOnManager';
import type Editor from './Editor';

interface BasePluginMetadata {
  name: string;
  hidden?: boolean;
}

interface UrlPluginMetadata extends BasePluginMetadata {
  url: string;
}

interface TypedPluginMetadata extends BasePluginMetadata {
  type: 'premium' | 'opensource';
  slug: string;
}

export type PluginMetadata = UrlPluginMetadata | TypedPluginMetadata;

export interface Plugin {
  getMetadata?: () => PluginMetadata;
  init?: (editor: Editor, url: string) => void;

  // Allow custom apis
  [key: string]: any;
}

type PluginManager = AddOnManager<void | Plugin>;
const PluginManager: PluginManager = AddOnManager.PluginManager;

export default PluginManager;
