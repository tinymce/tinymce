/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Attribute, SugarElement } from '@ephox/sugar';

const safeParse = (element: SugarElement<Element>, attribute: string): number => {
  const parsed = parseInt(Attribute.get(element, attribute), 10);
  return isNaN(parsed) ? 0 : parsed;
};

export {
  safeParse
};
