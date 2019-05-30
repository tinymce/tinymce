/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node } from '@ephox/dom-globals';

export type ApplyFormat = BlockFormat | InlineFormat | SelectorFormat;
export type RemoveFormat = RemoveBlockFormat | RemoveInlineFormat | RemoveSelectorFormat;
export type Format = ApplyFormat | RemoveFormat;
export type Formats = Record<string, Format | Format[]>;

export type FormatVars = Record<string, any>;

// Largely derived from the docs and src/core/main/ts/fmt/DefaultFormats.ts
export interface CommonFormat<T> {
  ceFalseOverride?: boolean;
  classes?: string | string[];
  collapsed?: boolean;
  exact?: boolean;
  expand?: boolean;
  links?: boolean;
  onmatch?: (node: Node, fmt: T, itemName: string) => boolean;
  onformat?: (node: Node, fmt: T, vars?: FormatVars) => void;
  remove_similar?: boolean;
}

export interface CommonApplyFormat<T> extends CommonFormat<T> {
  attributes?: Record<string, string | ((vars?: FormatVars) => string | number)>;
  preview?: string | boolean;
  styles?: Record<string, string>;
  toggle?: boolean;
  wrapper?: boolean;
}

export interface BlockFormat extends CommonApplyFormat<BlockFormat> {
  block: string;
  block_expand?: boolean;
}

export interface InlineFormat extends CommonApplyFormat<InlineFormat> {
  inline: string;
  clear_child_styles?: boolean;
}

export interface SelectorFormat extends CommonApplyFormat<SelectorFormat> {
  selector: string;
  defaultBlock?: string;
  inherit?: boolean;
}

export interface CommonRemoveFormat<T> extends CommonFormat<T> {
  remove?: 'none' | 'empty' | 'all';
  attributes?: string[];
  styles?: string[];
  split?: boolean;
  deep?: boolean;
}

export interface RemoveBlockFormat extends CommonRemoveFormat<RemoveBlockFormat> {
  block: string;
}

export interface RemoveInlineFormat extends CommonRemoveFormat<RemoveInlineFormat> {
  inline: string;
}

export interface RemoveSelectorFormat extends CommonRemoveFormat<RemoveSelectorFormat> {
  selector: string;
}