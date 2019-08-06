import { ApproxStructure, Assertions, FocusTools, Keyboard, Keys, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr } from '@ephox/katamari';
import { SelectorFind } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import { Tabstopping } from 'ephox/alloy/api/behaviour/Tabstopping';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { ToolbarGroup } from 'ephox/alloy/api/ui/ToolbarGroup';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';

UnitTest.asynctest('ToolbarGroupTest', (success, failure) => {
  const mungeItem = (itemSpec) => {
    return {
      dom: {
        tag: 'button',
        innerHtml: itemSpec.data.text,
        classes: [ 'toolbar-item' ]
      },

      behaviours: Behaviour.derive([
        Focusing.config({ })
      ])
    };
  };

  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
      {
        dom: {
          tag: 'div'
        },
        components: [
          ToolbarGroup.sketch({
            dom: {
              tag: 'div',
              classes: [ 'test-group1' ]
            },
            components: [
              ToolbarGroup.parts().items({
                dom: {
                  tag: 'div',
                  classes: [ 'group-items' ]
                }
              })
            ],

            tgroupBehaviours: Behaviour.derive([
              Tabstopping.config({ })
            ]),

            items: Arr.map([ { data: { value: 'a', text: 'A' } }, { data: { value: 'b', text: 'B' }} ], mungeItem),
            markers: {
              itemSelector: '.toolbar-item'
            }
          })
        ]
      }
    );

  }, (doc, body, gui, component: AlloyComponent, store) => {

    const group1 = component.getSystem().getByDom(
      SelectorFind.descendant(component.element(), '.test-group1').getOrDie('Could not find test-group1')
    ).getOrDie();

    return [
      Assertions.sAssertStructure(
        'Checking initial toolbar groups (group1)',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            classes: [ arr.not('group-items') ],
            attrs: {
              'role': str.is('toolbar'),
              'data-alloy-tabstop': str.is('true')
            },
            children: [
              s.element('button', { html: str.is('A'), classes: [ arr.has('toolbar-item') ] }),
              s.element('button', { html: str.is('B'), classes: [ arr.has('toolbar-item') ] })
            ]
          });
        }),
        group1.element()
      ),

      Step.sync(() => {
        Keying.focusIn(group1);
      }),

      FocusTools.sTryOnSelector('Focus should start on A', doc, 'button:contains("A")'),
      Keyboard.sKeydown(doc, Keys.right(), { }),
      FocusTools.sTryOnSelector('Focus should move to B', doc, 'button:contains("B")')
    ];
  }, () => { success(); }, failure);
});
