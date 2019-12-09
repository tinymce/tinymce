import { document, prompt, setTimeout } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { Class, Element } from '@ephox/sugar';

import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import { PremadeSpec } from 'ephox/alloy/api/component/SpecTypes';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Tabbar } from 'ephox/alloy/api/ui/Tabbar';
import { TabSection } from 'ephox/alloy/api/ui/TabSection';
import * as HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';

export default (): void => {
  const gui = Gui.create();
  const body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  const makeTab = (tabSpec: { view: () => PremadeSpec[]; value: string; text: string; }) => {
    return {
      view: tabSpec.view,
      value: tabSpec.value,
      dom: {
        tag: 'button',
        attributes: {
          'data-value': tabSpec.value
        }
      },
      components: [
        GuiFactory.text(tabSpec.text)
      ]
    };
  };

  const pTabbar = TabSection.parts().tabbar({
    dom: {
      tag: 'div'
    },
    components: [
      Tabbar.parts().tabs({ })
    ],
    markers: {
      tabClass: 'demo-tab',
      selectedClass: 'demo-selected-tab'
    }
  });

  const memTabSection = Memento.record(
    TabSection.sketch({
      dom: {
        tag: 'div'
      },
      components: [
        pTabbar,
        TabSection.parts().tabview({
          dom: {
            tag: 'div'
          }
        })
      ],
      tabs: Arr.map([
        {
          value: 'alpha',
          text: 'Alpha',
          view () {
            return [
              GuiFactory.text('Alpha panel text')
            ];
          }
        },
        {
          value: 'beta',
          text: 'Beta',
          view () {
            return [
              GuiFactory.text('Beta panel text')
            ];
          }
        }
      ], makeTab)
    })
  );

  const subject = HtmlDisplay.section(
    gui,
    'A basic tab view (refactoring)',
    memTabSection.asSpec()
  );

  setTimeout(() => {
    const chosenTab = prompt('Move to tab?');
    if (chosenTab !== null) {
      const tabSection = memTabSection.get(subject);
      TabSection.showTab(tabSection, chosenTab);
    }
  });
};
