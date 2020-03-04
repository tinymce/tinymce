/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const guess = function (url: string): string {
  const mimes = {
    mp3: 'audio/mpeg',
    m4a: 'audio/x-m4a',
    wav: 'audio/wav',
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    swf: 'application/x-shockwave-flash'
  };
  const fileEnd = url.toLowerCase().split('.').pop();
  const mime = mimes[fileEnd];

  return mime ? mime : '';
};

export {
  guess
};
