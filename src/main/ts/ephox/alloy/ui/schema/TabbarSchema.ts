import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import { Highlighting } from '../../api/behaviour/Highlighting';
import Keying from '../../api/behaviour/Keying';
import SketchBehaviours from '../../api/component/SketchBehaviours';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import SystemEvents from '../../api/events/SystemEvents';
import TabButton from '../../api/ui/TabButton';
import * as Fields from '../../data/Fields';
import PartType from '../../parts/PartType';

const schema = Fun.constant([
  FieldSchema.strict('tabs'),

  FieldSchema.strict('dom'),

  FieldSchema.defaulted('clickToDismiss', false),
  SketchBehaviours.field('tabbarBehaviours', [ Highlighting, Keying ]),
  Fields.markers([ 'tabClass', 'selectedClass' ])
]);

const tabsPart = PartType.group({
  factory: TabButton,
  name: 'tabs',
  unit: 'tab',
  overrides (barDetail, tabSpec) {
    const dismissTab = function (tabbar, button) {
      Highlighting.dehighlight(tabbar, button);
      AlloyTriggers.emitWith(tabbar, SystemEvents.dismissTab(), {
        tabbar,
        button
      });
    };

    const changeTab = function (tabbar, button) {
      Highlighting.highlight(tabbar, button);
      AlloyTriggers.emitWith(tabbar, SystemEvents.changeTab(), {
        tabbar,
        button
      });
    };

    return {
      action (button) {
        const tabbar = button.getSystem().getByUid(barDetail.uid()).getOrDie();
        const activeButton = Highlighting.isHighlighted(tabbar, button);

        const response = (function () {
          if (activeButton && barDetail.clickToDismiss()) { return dismissTab; } else if (! activeButton) { return changeTab; } else { return Fun.noop; }
        })();

        response(tabbar, button);
      },

      domModification: {
        classes: [ barDetail.markers().tabClass() ]
      }
    };
  }
});

const parts = Fun.constant([
  tabsPart
]);

const name = Fun.constant('Tabbar');

export {
  name,
  schema,
  parts
};