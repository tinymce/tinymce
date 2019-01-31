/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Menu } from '@ephox/bridge';

import * as ItemClasses from '../ItemClasses';
import { ItemTypes } from '@ephox/alloy';

const renderSeparatorItem = (spec: Menu.SeparatorMenuItem): ItemTypes.ItemSpec => {
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