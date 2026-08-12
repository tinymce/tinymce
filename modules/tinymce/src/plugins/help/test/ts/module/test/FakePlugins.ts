import { Arr, Fun, Type } from '@ephox/katamari';

import PluginManager, { type PluginMetadata } from 'tinymce/core/api/PluginManager';

export interface FakePlugin {
  readonly key: string;
  readonly register: () => void;
  readonly unregister: () => void;
}

// A thunk lets a scenario throw from getMetadata, omitting it entirely gives a plugin with no metadata.
type FakeMetadata = PluginMetadata | (() => PluginMetadata);

const toPlugin = (metadata?: FakeMetadata) => {
  if (Type.isUndefined(metadata)) {
    return Fun.noop;
  } else {
    const getMetadata = Type.isFunction(metadata) ? metadata : Fun.constant(metadata);
    return () => ({ getMetadata });
  }
};

const createFakePlugin = (key: string, metadata?: FakeMetadata): FakePlugin => {
  const plugin = toPlugin(metadata);

  return {
    key,
    register: () => PluginManager.add(key, plugin),
    unregister: () => PluginManager.remove(key)
  };
};

// Third-party plugins are compiled separately, so at runtime their metadata can be any shape. Those
// shapes cannot satisfy PluginMetadata by definition, so this is the one place the type is widened.
const createUntypedFakePlugin = (key: string, metadata: object): FakePlugin =>
  createFakePlugin(key, metadata as PluginMetadata);

const keys = (plugins: FakePlugin[]): string => Arr.map(plugins, (plugin) => plugin.key).join(' ');

const registrations = (plugins: FakePlugin[]): Array<() => void> => Arr.map(plugins, (plugin) => plugin.register);

const unregisterAll = (plugins: FakePlugin[]): void => Arr.each(plugins, (plugin) => plugin.unregister());

export {
  createFakePlugin,
  createUntypedFakePlugin,
  keys,
  registrations,
  unregisterAll
};
