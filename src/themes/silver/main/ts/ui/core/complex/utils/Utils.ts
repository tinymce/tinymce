/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Tools from '../../../../../../../../core/main/ts/api/util/Tools';

const processFormatsString = (rawFormats) => {

  const formats = Tools.map(rawFormats, (item) => {
    let title = item, format = item;
    // Allow text=value block formats
    const values = item.split('=');
    if (values.length > 1) {
      title = values[0];
      format = values[1];
    }

    return { title, format };
  });

  return formats;
};

export {
  processFormatsString
};