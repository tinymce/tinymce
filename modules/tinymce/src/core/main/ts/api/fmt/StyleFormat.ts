import { BlockFormat, InlineFormat, SelectorFormat } from './Format';

// somewhat documented at https://www.tiny.cloud/docs/tinymce/6/content-formatting/#formats
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
  name?: string;
  title: string;
  icon?: string;
}

export interface BlockStyleFormat extends BlockFormat, CommonStyleFormat {}
export interface InlineStyleFormat extends InlineFormat, CommonStyleFormat {}
export interface SelectorStyleFormat extends SelectorFormat, CommonStyleFormat {}
