import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import { Highlighting } from '../../api/behaviour/Highlighting';
import { Keying } from '../../api/behaviour/Keying';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import * as SystemEvents from '../../api/events/SystemEvents';
import { TabButton } from '../../api/ui/TabButton';
import * as Fields from '../../data/Fields';
import * as PartType from '../../parts/PartType';
import { TabbarDetail } from '../types/TabbarTypes';
import { TabButtonSpec } from '../types/TabButtonTypes';

const schema: () => FieldProcessorAdt[] = Fun.constant([
  FieldSchema.strict('tabs'),

  FieldSchema.strict('dom'),

  FieldSchema.defaulted('clickToDismiss', false),
  SketchBehaviours.field('tabbarBehaviours', [ Highlighting, Keying ]),
  Fields.markers([ 'tabClass', 'selectedClass' ])
]);

const tabsPart = PartType.group<TabbarDetail, TabButtonSpec>({
  factory: TabButton,
  name: 'tabs',
  unit: 'tab',
  overrides(barDetail) {
    const dismissTab = (tabbar: AlloyComponent, button: AlloyComponent) => {
      Highlighting.dehighlight(tabbar, button);
      AlloyTriggers.emitWith(tabbar, SystemEvents.dismissTab(), {
        tabbar,
        button
      });
    };

    const changeTab = (tabbar: AlloyComponent, button: AlloyComponent) => {
      Highlighting.highlight(tabbar, button);
      AlloyTriggers.emitWith(tabbar, SystemEvents.changeTab(), {
        tabbar,
        button
      });
    };

    return {
      action(button: AlloyComponent) {
        const tabbar = button.getSystem().getByUid(barDetail.uid).getOrDie();
        const activeButton = Highlighting.isHighlighted(tabbar, button);

        const response = (() => {
          if (activeButton && barDetail.clickToDismiss) {
            return dismissTab;
          } else if (! activeButton) {
            return changeTab;
          } else {
            return Fun.noop;
          }
        })();

        response(tabbar, button);
      },

      domModification: {
        classes: [ barDetail.markers.tabClass ]
      }
    };
  }
});

const parts: () => PartType.PartTypeAdt[] = Fun.constant([
  tabsPart
]);

const name = Fun.constant('Tabbar');

export {
  name,
  schema,
  parts
};
