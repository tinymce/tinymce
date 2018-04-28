/**
 * Mime.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const guess = function (url) {
  const mimes = {
    mp3: 'audio/mpeg',
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

export default {
  guess
};