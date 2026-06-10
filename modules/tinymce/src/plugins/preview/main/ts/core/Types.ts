export interface LinkContentCss {
  readonly type: 'link';
  readonly url: string;
}

export interface BundledContentCss {
  readonly type: 'bundled';
  readonly content: string;
}

export type ContentCssResource = LinkContentCss | BundledContentCss;
