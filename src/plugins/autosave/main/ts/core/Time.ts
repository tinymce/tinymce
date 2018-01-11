/**
 * Time.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const parse = function (time, defaultTime) {
  const multiples = {
    s: 1000,
    m: 60000
  };

  time = /^(\d+)([ms]?)$/.exec('' + (time || defaultTime));

  return (time[2] ? multiples[time[2]] : 1) * parseInt(time, 10);
};

export default {
  parse
};