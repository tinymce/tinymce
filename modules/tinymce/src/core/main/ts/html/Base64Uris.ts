import { Obj, Optional } from '@ephox/katamari';

export type UriMap = Record<string, string>;

export interface Base64Extract {
  readonly prefix: string;
  readonly uris: UriMap;
  readonly html: string;
  readonly re: RegExp;
}

export interface Base64UriParts {
  readonly type: string;
  readonly data: string;
}

export const restoreDataUris = (html: string, result: Base64Extract): string =>
  html.replace(result.re, (imageId) =>
    Obj.get(result.uris, imageId).getOr(imageId)
  );

export const parseDataUri = (uri: string): Optional<Base64UriParts> => {
  const matches = /data:([^;]+);base64,([a-z0-9\+\/=\s]+)/i.exec(uri);
  if (matches) {
    return Optional.some({ type: matches[1], data: decodeURIComponent(matches[2]) });
  } else {
    return Optional.none();
  }
};
