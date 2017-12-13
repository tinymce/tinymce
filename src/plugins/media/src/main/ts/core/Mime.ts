/**
 * Mime.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

var guess = function (url) {
  var mimes = {
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogg': 'video/ogg',
    'swf': 'application/x-shockwave-flash'
  };
  var fileEnd = url.toLowerCase().split('.').pop();
  var mime = mimes[fileEnd];

  return mime ? mime : '';
};

export default <any> {
  guess: guess
};