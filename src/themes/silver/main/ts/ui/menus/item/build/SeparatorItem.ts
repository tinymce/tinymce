import { ItemSpec } from '@ephox/alloy/lib/main/ts/ephox/alloy/ui/types/ItemTypes';
import { Menu } from '@ephox/bridge';

import * as ItemClasses from '../ItemClasses';

const renderSeparatorItem = (spec: Menu.SeparatorMenuItem): ItemSpec => {
  return {
    type: 'separator',
    dom: {
      tag: 'div',
      classes: [ ItemClasses.separatorClass ],

      innerHtml: spec.text.getOr('')
    },
    components: [ ]
  };
};

export {
  renderSeparatorItem
};