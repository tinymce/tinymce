import { Arr } from '@ephox/katamari';
import { Attr } from '@ephox/sugar';

import * as AlloyParts from '../../parts/AlloyParts';
import * as TabSectionSchema from '../../ui/schema/TabSectionSchema';
import { Highlighting } from '../behaviour/Highlighting';
import { Replacing } from '../behaviour/Replacing';
import { Representing } from '../behaviour/Representing';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as AlloyEvents from '../events/AlloyEvents';
import * as SystemEvents from '../events/SystemEvents';
import * as Sketcher from './Sketcher';
import { TabSectionSketcher, TabSectionDetail, TabSectionSpec } from '../../ui/types/TabSectionTypes';
import { CompositeSketchFactory } from '../../api/ui/UiSketcher';
import { AlloyChangeTabEvent, AlloyDismissTabEvent } from '../events/SystemEvents';

const factory: CompositeSketchFactory<TabSectionDetail, TabSectionSpec> = (detail, components, spec, externals) => {
  const changeTab = (button) => {
    const tabValue = Representing.getValue(button);
    AlloyParts.getPart(button, detail, 'tabview').each((tabview) => {
      const tabWithValue = Arr.find(detail.tabs(), (t) => {
        return t.value === tabValue;
      });

      tabWithValue.each((tabData) => {
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
          AlloyEvents.runOnAttached((section, simulatedEvent) => {
            AlloyParts.getPart(section, detail, 'tabbar').each((tabbar) => {
              Highlighting.getFirst(tabbar).each((button) => {
                Highlighting.highlight(tabbar, button);
                changeTab(button);
              });
            });
          })
        ] : [ ],

        [
          AlloyEvents.run<AlloyChangeTabEvent>(SystemEvents.changeTab(), (section, simulatedEvent) => {
            const button = simulatedEvent.event().button();
            changeTab(button);
          }),
          AlloyEvents.run<AlloyDismissTabEvent>(SystemEvents.dismissTab(), (section, simulatedEvent) => {
            const button = simulatedEvent.event().button();
            detail.onDismissTab()(section, button);
          })
        ]
      ])
    ),

    apis: {
      getViewItems (section) {
        return AlloyParts.getPart(section, detail, 'tabview').map((tabview) => {
          return Replacing.contents(tabview);
        }).getOr([ ]);
      }
    }
  };

};

const TabSection = Sketcher.composite({
  name: 'TabSection',
  configFields: TabSectionSchema.schema(),
  partFields: TabSectionSchema.parts(),
  factory,
  apis: {
    getViewItems (apis, component) {
      return apis.getViewItems(component);
    }
  }
}) as TabSectionSketcher;

export {
  TabSection
};