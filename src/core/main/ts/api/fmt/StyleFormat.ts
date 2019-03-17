/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { BlockFormat, InlineFormat, SelectorFormat } from './Format';

// somewhat documented at https://www.tiny.cloud/docs/configure/content-formatting/#style_formats
export type StyleFormat = BlockStyleFormat | InlineStyleFormat | SelectorStyleFormat;
export type AllowedFormat = Separator | FormatReference | StyleFormat | NestedFormatting;

export interface Separator {
  title: string;
}

export interface FormatReference {
  title: string;
  format: string;
  icon?: string;
}

export interface NestedFormatting {
  title: string;
  items: Array<FormatReference | StyleFormat>;
}

interface CommonStyleFormat {
  title: string;
  icon?: string;
}

export interface BlockStyleFormat extends BlockFormat, CommonStyleFormat {}
export interface InlineStyleFormat extends InlineFormat, CommonStyleFormat {}
export interface SelectorStyleFormat extends SelectorFormat, CommonStyleFormat {}