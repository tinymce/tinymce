/**
 * Time.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const parse = (timeString: string, defaultTime: string) => {
  const multiples = {
    s: 1000,
    m: 60000
  };
  const toParse = (timeString || defaultTime);

  const parsedTime = /^(\d+)([ms]?)$/.exec('' + toParse);

  return (parsedTime[2] ? multiples[parsedTime[2]] : 1) * parseInt(toParse, 10);
};

export {
  parse
};