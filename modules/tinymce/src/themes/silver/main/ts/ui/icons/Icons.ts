/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optional } from '@ephox/katamari';

export type IconProvider = () => Record<string, string>;

const defaultIcon = (icons: IconProvider): string => Optional.from(icons()['temporary-placeholder']).getOr('!not found!');

const get = (name: string, icons: IconProvider): string => Optional.from(icons()[name.toLowerCase()]).getOrThunk(() => defaultIcon(icons));

const getOr = (name: string, icons: IconProvider, fallback: Optional<string>): string => Optional.from(icons()[name.toLowerCase()]).or(fallback).getOrThunk(() => defaultIcon(icons));

const getFirst = (names: string[], icons: IconProvider): string => Arr.findMap(names, (name) => Optional.from(icons()[name.toLowerCase()])).getOrThunk(() => defaultIcon(icons));

export {
  getFirst,
  getOr,
  get
};
