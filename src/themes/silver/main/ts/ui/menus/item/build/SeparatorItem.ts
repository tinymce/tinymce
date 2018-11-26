/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { ItemSpec } from '@ephox/alloy/lib/main/ts/ephox/alloy/ui/types/ItemTypes';
import { Menu } from '@ephox/bridge';

import * as ItemClasses from '../ItemClasses';

const renderSeparatorItem = (spec: Menu.SeparatorMenuItem): ItemSpec => {
  const innerHtml = spec.text.fold(
    () => ({ }),
    (text) => ({ innerHtml: text })
  );
  return {
    type: 'separator',
    dom: {
      tag: 'div',
      classes: [ ItemClasses.selectableClass, ItemClasses.groupHeadingClass ],
      ...innerHtml
    },
    components: [ ]
  };
};

export {
  renderSeparatorItem
};