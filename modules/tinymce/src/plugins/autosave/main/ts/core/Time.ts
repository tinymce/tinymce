/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const parse = (timeString: string): number => {
  const multiples: Record<string, number> = {
    s: 1000,
    m: 60000
  };

  const parsedTime = /^(\d+)([ms]?)$/.exec(timeString);

  return (parsedTime[2] ? multiples[parsedTime[2]] : 1) * parseInt(timeString, 10);
};

export {
  parse
};
