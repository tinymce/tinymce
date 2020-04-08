import { Arr, Option } from '@ephox/katamari';
import { Attr } from '@ephox/sugar';

import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import * as AlloyParts from '../../parts/AlloyParts';
import * as TabSectionSchema from '../../ui/schema/TabSectionSchema';
import { TabSectionApis, TabSectionDetail, TabSectionSketcher, TabSectionSpec } from '../../ui/types/TabSectionTypes';
import { Highlighting } from '../behaviour/Highlighting';
import { Replacing } from '../behaviour/Replacing';
import { Representing } from '../behaviour/Representing';
import { AlloyComponent } from '../component/ComponentApi';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as AlloyEvents from '../events/AlloyEvents';
import * as SystemEvents from '../events/SystemEvents';
import * as Sketcher from './Sketcher';
import { CompositeSketchFactory } from './UiSketcher';

const factory: CompositeSketchFactory<TabSectionDetail, TabSectionSpec> = (detail, components, _spec, _externals) => {
  const changeTab = (button: AlloyComponent) => {
    const tabValue = Representing.getValue(button);
    AlloyParts.getPart(button, detail, 'tabview').each((tabview) => {
      const tabWithValue = Arr.find(detail.tabs, (t) => t.value === tabValue);

      tabWithValue.each((tabData) => {
        const panel = tabData.view();

        // Update the tabview to refer to the current tab.
        Attr.getOpt(button.element(), 'id').each((id) => {
          Attr.set(tabview.element(), 'aria-labelledby', id);
        });
        Replacing.set(tabview, panel);
        detail.onChangeTab(tabview, button, panel);
      });
    });
  };

  const changeTabBy = (section: AlloyComponent, byPred: (tbar: AlloyComponent) => Option<AlloyComponent>) => {
    AlloyParts.getPart(section, detail, 'tabbar').each((tabbar) => {
      byPred(tabbar).each(AlloyTriggers.emitExecute);
    });
  };

  return {
    uid: detail.uid,
    dom: detail.dom,
    components,
    behaviours: SketchBehaviours.get(detail.tabSectionBehaviours),

    events: AlloyEvents.derive(
      Arr.flatten([

        detail.selectFirst ? [
          AlloyEvents.runOnAttached((section, _simulatedEvent) => {
            changeTabBy(section, Highlighting.getFirst);
          })
        ] : [ ],

        [
          AlloyEvents.run<SystemEvents.AlloyChangeTabEvent>(SystemEvents.changeTab(), (section, simulatedEvent) => {
            const button = simulatedEvent.event().button();
            changeTab(button);
          }),
          AlloyEvents.run<SystemEvents.AlloyDismissTabEvent>(SystemEvents.dismissTab(), (section, simulatedEvent) => {
            const button = simulatedEvent.event().button();
            detail.onDismissTab(section, button);
          })
        ]
      ])
    ),

    apis: {
      getViewItems(section: AlloyComponent) {
        return AlloyParts.getPart(section, detail, 'tabview').map((tabview) => Replacing.contents(tabview)).getOr([ ]);
      },

      // How should "clickToDismiss" interact with this? At the moment, it will never dismiss
      showTab(section: AlloyComponent, tabKey: string) {
        // We only change the tab if it isn't currently active because that takes
        // the whole "dismiss" issue out of the equation.
        const getTabIfNotActive = (tabbar: AlloyComponent) => {
          const candidates = Highlighting.getCandidates(tabbar);
          const optTab = Arr.find(candidates, (c) => Representing.getValue(c) === tabKey);

          return optTab.filter((tab) => !Highlighting.isHighlighted(tabbar, tab));
        };

        changeTabBy(section, getTabIfNotActive);
      }
    }
  };

};

const TabSection: TabSectionSketcher = Sketcher.composite<TabSectionSpec, TabSectionDetail, TabSectionApis>({
  name: 'TabSection',
  configFields: TabSectionSchema.schema(),
  partFields: TabSectionSchema.parts(),
  factory,
  apis: {
    getViewItems: (apis, component) => apis.getViewItems(component),
    showTab: (apis, component, tabKey) => {
      apis.showTab(component, tabKey);
    }
  }
});

export {
  TabSection
};
