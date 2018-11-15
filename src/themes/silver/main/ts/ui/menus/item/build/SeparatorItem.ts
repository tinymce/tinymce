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
      classes: [ ItemClasses.separatorClass, ItemClasses.groupHeadingClass, ItemClasses.selectableClass ],
      ...innerHtml
    },
    components: [ ]
  };
};

export {
  renderSeparatorItem
};