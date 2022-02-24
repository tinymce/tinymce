// Note: Need to use a type here, as types are iterable whereas interfaces are not
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type MediaData = {
  source: string;
  sourcemime?: string;
  width?: string;
  height?: string;
  embed?: string;
  poster: string;
  altsource: string;
  altsourcemime?: string;
  type?: 'ephox-embed-iri' | 'script' | 'object' | 'iframe' | 'embed' | 'video' | 'audio';

  // properties loaded from attributes
  allowfullscreen?: string | boolean;
  src?: string;
  'data-ephox-embed'?: string;
};

export interface DialogSubData {
  value: string;
  meta?: Record<string, any>;
}

export interface MediaDialogData {
  source: DialogSubData;
  altsource: DialogSubData;
  poster: DialogSubData;
  embed?: string;
  dimensions?: {
    width?: string;
    height?: string;
  };
}
