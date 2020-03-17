/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Id, Obj, Option } from '@ephox/katamari';

export type UriMap = Record<string, string>;

export interface Base64Extract {
  prefix: string;
  uris: UriMap;
  html: string;
}

export interface Base64UriParts {
  type: string;
  data: string;
}

export const extractBase64DataUris = (html: string): Base64Extract => {
  const dataImageUri = /data:[^;]+;base64,([a-z0-9\+\/=]+)/gi;
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

  if (index === 0) {
    return { prefix, uris, html };
  } else {
    if (index < html.length) {
      chunks.push(html.substr(index));
    }

    return { prefix, uris, html: chunks.join('') };
  }
};

export const restoreDataUris = (html: string, result: Base64Extract) => html.replace(new RegExp(`${result.prefix}_[0-9]+`, 'g'), (imageId) => Obj.get(result.uris, imageId).getOr(imageId));

export const parseDataUri = (uri: string): Option<Base64UriParts> => {
  const matches = /data:([^;]+);base64,([a-z0-9\+\/=]+)/i.exec(uri);
  if (matches) {
    return Option.some({ type: matches[1], data: decodeURIComponent(matches[2]) });
  } else {
    return Option.none();
  }
};
