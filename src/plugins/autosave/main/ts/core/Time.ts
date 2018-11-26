/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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