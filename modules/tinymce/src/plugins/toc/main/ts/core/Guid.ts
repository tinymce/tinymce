/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const create = (prefix: string): () => string => {
  let counter = 0;

  return (): string => {
    const guid = new Date().getTime().toString(32);
    return prefix + guid + (counter++).toString(32);
  };
};

export {
  create
};
