/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { GuiFactory, ItemTypes } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';

import * as ItemClasses from '../ItemClasses';

const renderSeparatorItem = (spec: Menu.SeparatorMenuItem): ItemTypes.ItemSpec => ({
  type: 'separator',
  dom: {
    tag: 'div',
    classes: [ ItemClasses.selectableClass, ItemClasses.groupHeadingClass ]
  },
  components: spec.text.map(GuiFactory.text).toArray()
});

export {
  renderSeparatorItem
};
