/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';
import { Compare, SugarElement, Traverse } from '@ephox/sugar';

const dropLast = <T>(xs: T[]): T[] => xs.slice(0, -1);

const parentsUntil = (start: SugarElement, root: SugarElement, predicate: (elm: SugarElement) => boolean): SugarElement[] => {
  if (Compare.contains(root, start)) {
    return dropLast(Traverse.parents(start, function (elm) {
      return predicate(elm) || Compare.eq(elm, root);
    }));
  } else {
    return [];
  }
};

const parents = (start: SugarElement, root: SugarElement): SugarElement[] => parentsUntil(start, root, Fun.never);

const parentsAndSelf = (start: SugarElement, root: SugarElement): SugarElement[] => [ start ].concat(parents(start, root));

export {
  parentsUntil,
  parents,
  parentsAndSelf
};
