/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Option } from '@ephox/katamari';

export type IconProvider = () => Record<string, string>;

const defaultIcon = (icons: IconProvider): string => {
  return Option.from(icons()['temporary-placeholder']).getOr('!not found!');
};

const get = (name: string, icons: IconProvider): string => {
  return Option.from(icons()[name]).getOrThunk(() => defaultIcon(icons));
};

const getOr = (name: string, icons: IconProvider, fallback: Option<string>): string => {
  return Option.from(icons()[name]).or(fallback).getOrThunk(() => defaultIcon(icons));
};

const getFirst = (names: string[], icons: IconProvider): string => {
  return Arr.findMap(names, (name) => Option.from(icons()[name])).getOrThunk(() => defaultIcon(icons));
};

export {
  getFirst,
  getOr,
  get
};
