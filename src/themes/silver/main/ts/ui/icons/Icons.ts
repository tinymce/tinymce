/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option, Options } from '@ephox/katamari';
import { getAll as getAllOxide } from '@ephox/oxide-icons-default';

export type IconProvider = () => Record<string, string>;

const defaultIcons = getAllOxide();

const getDefault = (name: string) => {
  // todo add a broken icon here instead of !not found!
  return getDefaultOr(name, () => '!not found!');
};

const getDefaultOr = (name: string, fallback: () => string) => {
  return Option.from(defaultIcons[name]).getOrThunk(fallback);
};

const get = (name: string, icons: IconProvider) => {
  return Option.from(icons()[name]).getOrThunk(() => getDefault(name));
};

const getOr = (name: string, icons: IconProvider, fallback: () => string) => {
  return Option.from(icons()[name]).getOrThunk(() => getDefaultOr(name, fallback));
};

const getDefaultFirstOr = (names: string[], fallback: () => string) => {
  return Options.findMap(names, (name) => Option.from(defaultIcons[name])).getOrThunk(fallback);
};

const getFirstOr = (names: string[], icons: IconProvider, fallback: () => string) => {
  return Options.findMap(names, (name) => Option.from(icons()[name])).getOrThunk(fallback);
};

export {
  getDefault,
  getDefaultOr,
  getDefaultFirstOr,
  getFirstOr,
  get,
  getOr
};