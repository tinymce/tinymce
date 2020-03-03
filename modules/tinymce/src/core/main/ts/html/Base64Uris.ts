/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Id, Obj } from '@ephox/katamari';

export interface Base64UriMatch {
  mime: string;
  base64: string;
}

export interface Base64Extract {
  prefix: string;
  uris: Record<string, Base64UriMatch>;
  html: string;
}

export const extractBase64DataUris = (html: string): Base64Extract => {
  const dataImageUri = /data:(image\/[a-z]+);base64,([a-z0-9\+\/=]+)/gi;
  const chunks = [];
  const uris = {};
  const prefix = Id.generate('img');
  let matches: RegExpExecArray;
  let index = 0;
  let count = 0;

  while ((matches = dataImageUri.exec(html))) {
    const [matchText, mime, base64] = matches;
    const imageId = prefix + '_' + count++;

    uris[imageId] = { mime, base64 };

    if (index < matches.index) {
      chunks.push(html.substr(index, matches.index - index));
    }

    chunks.push(imageId);
    index = matches.index + matchText.length;
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

export const buildBase64DataUri = (match: Base64UriMatch) => {
  return `data:${match.mime};base64,${match.base64}`;
};

export const restoreDataUris = (html: string, result: Base64Extract) => {
  return html.replace(new RegExp(`${result.prefix}_[0-9]+`, 'g'), (imageId) => {
    return Obj.get(result.uris, imageId).map(buildBase64DataUri).getOr(imageId);
  });
};
