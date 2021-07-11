/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { RangeLikeObject } from '../selection/RangeTypes';

export type ApplyFormat = BlockFormat | InlineFormat | SelectorFormat;
export type RemoveFormat = RemoveBlockFormat | RemoveInlineFormat | RemoveSelectorFormat;
export type Format = ApplyFormat | RemoveFormat;
export type Formats = Record<string, Format | Format[]>;

export type FormatAttrOrStyleValue = string | ((vars?: FormatVars) => string);
export type FormatVars = Record<string, string | null >;

// Largely derived from the docs and src/core/main/ts/fmt/DefaultFormats.ts
export interface BaseFormat<T> {
  ceFalseOverride?: boolean;
  classes?: string | string[];
  collapsed?: boolean;
  exact?: boolean;
  expand?: boolean;
  links?: boolean;
  mixed?: boolean;
  block_expand?: boolean;
  onmatch?: (node: Node, fmt: T, itemName: string) => boolean;

  // These are only used when removing formats
  remove?: 'none' | 'empty' | 'all';
  remove_similar?: boolean;
  split?: boolean;
  deep?: boolean;
  preserve_attributes?: string[];
}

interface Block {
  block: string;
  list_block?: string; // Legacy
  wrapper?: boolean;
}

interface Inline {
  inline: string;
}

interface Selector {
  selector: string;
  inherit?: boolean;
}

// A common format is one that can be both applied and removed
export interface CommonFormat<T> extends BaseFormat<T> {
  attributes?: Record<string, FormatAttrOrStyleValue>;
  styles?: Record<string, FormatAttrOrStyleValue>;
  toggle?: boolean;
  preview?: string | false;

  // These are only used when applying formats
  onformat?: (elm: Node, fmt: T, vars?: FormatVars, node?: Node | RangeLikeObject) => void;
  clear_child_styles?: boolean;
  merge_siblings?: boolean;
  merge_with_parents?: boolean;
  defaultBlock?: string;
}

export interface BlockFormat extends Block, CommonFormat<BlockFormat> {}

export interface InlineFormat extends Inline, CommonFormat<InlineFormat> {}

export interface SelectorFormat extends Selector, CommonFormat<SelectorFormat> {}

// Mixed format is a combination of SelectorFormat and InlineFormat
export interface MixedFormat extends Inline, Selector, CommonFormat<MixedFormat> {
  block_expand: true;
  mixed: true;
}

// A remove format is one that can only be removed and never applied
export interface CommonRemoveFormat<T> extends BaseFormat<T> {
  attributes?: string[] | Record<string, FormatAttrOrStyleValue>;
  styles?: string[] | Record<string, FormatAttrOrStyleValue>;
}

export interface RemoveBlockFormat extends Block, CommonRemoveFormat<RemoveBlockFormat> {}

export interface RemoveInlineFormat extends Inline, CommonRemoveFormat<RemoveInlineFormat> {}

export interface RemoveSelectorFormat extends Selector, CommonRemoveFormat<RemoveSelectorFormat> {}
