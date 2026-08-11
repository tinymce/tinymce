import { Fun } from '@ephox/katamari';

import type Editor from 'tinymce/core/api/Editor';
import PluginManager, { type PluginMetadata } from 'tinymce/core/api/PluginManager';

const register = (key: string, getMetadata: () => PluginMetadata) => (): void => {
  PluginManager.add(key, (_editor: Editor, _url: string) => ({ getMetadata }));
};

const emptyMetaFakeKey = 'emptymetafake';
const throwingFakeKey = 'throwingfake';
const randomFieldsFakeKey = 'randomfieldsfake';
const namedRandomFakeKey = 'namedrandomfake';

const EmptyMetaFakePlugin = register(emptyMetaFakeKey, Fun.constant({} as unknown as PluginMetadata));

const ThrowingFakePlugin = register(throwingFakeKey, () => {
  throw new Error('getMetadata exploded');
});

const RandomFieldsFakePlugin = register(randomFieldsFakeKey, Fun.constant({
  foo: 1,
  bar: 'baz'
} as unknown as PluginMetadata));

const NamedRandomFieldsFakePlugin = register(namedRandomFakeKey, Fun.constant({
  name: 'Named Random Fake',
  foo: 1
} as unknown as PluginMetadata));

export {
  EmptyMetaFakePlugin,
  emptyMetaFakeKey,
  NamedRandomFieldsFakePlugin,
  namedRandomFakeKey,
  RandomFieldsFakePlugin,
  randomFieldsFakeKey,
  ThrowingFakePlugin,
  throwingFakeKey
};
