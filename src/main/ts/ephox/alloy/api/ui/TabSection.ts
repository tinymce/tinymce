import { Arr } from '@ephox/katamari';
import { Attr } from '@ephox/sugar';

import * as AlloyParts from '../../parts/AlloyParts';
import * as TabSectionSchema from '../../ui/schema/TabSectionSchema';
import { Highlighting } from '../behaviour/Highlighting';
import Replacing from '../behaviour/Replacing';
import Representing from '../behaviour/Representing';
import SketchBehaviours from '../component/SketchBehaviours';
import * as AlloyEvents from '../events/AlloyEvents';
import SystemEvents from '../events/SystemEvents';
import * as Sketcher from './Sketcher';

const factory = function (detail, components, spec, externals) {
  const changeTab = function (button) {
    const tabValue = Representing.getValue(button);
    AlloyParts.getPart(button, detail, 'tabview').each(function (tabview) {
      const tabWithValue = Arr.find(detail.tabs(), function (t) {
        return t.value === tabValue;
      });

      tabWithValue.each(function (tabData) {
        const panel = tabData.view();

        // Update the tabview to refer to the current tab.
        Attr.set(tabview.element(), 'aria-labelledby', Attr.get(button.element(), 'id'));
        Replacing.set(tabview, panel);
        detail.onChangeTab()(tabview, button, panel);
      });
    });
  };

  return {
    uid: detail.uid(),
    dom: detail.dom(),
    components,
    behaviours: SketchBehaviours.get(detail.tabSectionBehaviours()),

    events: AlloyEvents.derive(
      Arr.flatten([

        detail.selectFirst() ? [
          AlloyEvents.runOnAttached(function (section, simulatedEvent) {
            AlloyParts.getPart(section, detail, 'tabbar').each(function (tabbar) {
              Highlighting.getFirst(tabbar).each(function (button) {
                Highlighting.highlight(tabbar, button);
                changeTab(button);
              });
            });
          })
        ] : [ ],

        [
          AlloyEvents.run(SystemEvents.changeTab(), function (section, simulatedEvent) {
            const button = simulatedEvent.event().button();
            changeTab(button);
          }),
          AlloyEvents.run(SystemEvents.dismissTab(), function (section, simulatedEvent) {
            const button = simulatedEvent.event().button();
            detail.onDismissTab()(section, button);
          })
        ]
      ])
    )
  };

};

export default <any> Sketcher.composite({
  name: 'TabSection',
  configFields: TabSectionSchema.schema(),
  partFields: TabSectionSchema.parts(),
  factory
});