/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Id, Obj, Optional } from '@ephox/katamari';

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

export const extractBase64DataUris = (html: string): Base64Extract => {
  const dataImageUri = /data:[^;<"'\s]+;base64,([a-z0-9\+\/=\s]+)/gi;
  const chunks: string[] = [];
  const uris: UriMap = {};
  const prefix = Id.generate('img');
  let matches: RegExpExecArray;
  let index = 0;
  let count = 0;

  while ((matches = dataImageUri.exec(html))) {
    const [ uri ] = matches;
    const imageId = prefix + '_' + count++;

    uris[imageId] = uri;

    if (index < matches.index) {
      chunks.push(html.substr(index, matches.index - index));
    }

    chunks.push(imageId);
    index = matches.index + uri.length;
  }

  const re = new RegExp(`${prefix}_[0-9]+`, 'g');
  if (index === 0) {
    return { prefix, uris, html, re };
  } else {
    if (index < html.length) {
      chunks.push(html.substr(index));
    }

    return { prefix, uris, html: chunks.join(''), re };
  }
};

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
