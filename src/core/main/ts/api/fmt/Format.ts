/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node } from '@ephox/dom-globals';

export type Format = BlockFormat | InlineFormat | SelectorFormat;

// Largely derived from the docs and src/core/main/ts/fmt/DefaultFormats.ts
export interface CommonFormat<T> {
  classes?: string;
  styles?: Record<string, string>;
  attributes?: Record<string, string>;
  remove?: 'none' | 'empty' | 'all';
  remove_similar?: boolean;
  preview?: string | boolean;
  ceFalseOverride?: boolean;
  collapsed?: boolean;
  deep?: boolean;
  exact?: boolean;
  expand?: boolean;
  links?: boolean;
  split?: boolean;
  toggle?: boolean;
  wrapper?: boolean;
  onmatch?: (node: Node, fmt: T, itemName: string) => boolean;
  onformat?: (node: Node, fmt: T, vars?: object) => void;
}

export interface BlockFormat extends CommonFormat<BlockFormat> {
  block: string;
  block_expand?: boolean;
}

export interface InlineFormat extends CommonFormat<InlineFormat> {
  inline: string;
  clear_child_styles?: boolean;
}

export interface SelectorFormat extends CommonFormat<SelectorFormat> {
  selector: string;
  defaultBlock?: string;
  inherit?: boolean;
}