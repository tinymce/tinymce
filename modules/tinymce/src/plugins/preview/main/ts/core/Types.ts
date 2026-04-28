import type { CrossOrigin } from 'tinymce/core/api/OptionTypes';

export interface LinkContentCss {
  readonly type: 'link';
  readonly url: string;
}

export interface BundledContentCss {
  readonly type: 'bundled';
  readonly content: string;
}

export type ContentCssResource = LinkContentCss | BundledContentCss;

export type CrossOriginResolver = (url: string) => ReturnType<CrossOrigin>;
