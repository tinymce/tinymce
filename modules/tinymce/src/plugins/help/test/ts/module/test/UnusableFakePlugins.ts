import { Fun } from '@ephox/katamari';

import type Editor from 'tinymce/core/api/Editor';
import PluginManager, { type PluginMetadata } from 'tinymce/core/api/PluginManager';

const register = (key: string, getMetadata: () => PluginMetadata) => (): void => {
  PluginManager.add(key, (_editor: Editor, _url: string) => ({ getMetadata }));
};

const EmptyMetaFakePlugin = register('emptymetafake', Fun.constant({} as unknown as PluginMetadata));

const ThrowingFakePlugin = register('throwingfake', () => {
  throw new Error('getMetadata exploded');
});

const RandomFieldsFakePlugin = register('randomfieldsfake', Fun.constant({
  foo: 1,
  bar: 'baz'
} as unknown as PluginMetadata));

const NamedRandomFieldsFakePlugin = register('namedrandomfake', Fun.constant({
  name: 'Named Random Fake',
  foo: 1
} as unknown as PluginMetadata));

export {
  EmptyMetaFakePlugin,
  NamedRandomFieldsFakePlugin,
  RandomFieldsFakePlugin,
  ThrowingFakePlugin
};
