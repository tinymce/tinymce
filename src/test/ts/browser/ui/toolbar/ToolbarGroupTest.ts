import { ApproxStructure, Assertions, FocusTools, Keyboard, Keys, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr } from '@ephox/katamari';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import { Tabstopping } from 'ephox/alloy/api/behaviour/Tabstopping';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { ToolbarGroup } from 'ephox/alloy/api/ui/ToolbarGroup';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';

UnitTest.asynctest('ToolbarGroupTest', (success, failure) => {
  const mungeItem = (itemSpec) => {
    return {
      dom: {
        tag: 'button',
        innerHtml: itemSpec.data.text
      },

      behaviours: Behaviour.derive([
        Focusing.config({ })
      ])
    };
  };

  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
      ToolbarGroup.sketch({
        dom: {
          tag: 'div'
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
          itemClass: 'toolbar-item'
        }
      })
    );

  }, (doc, body, gui, component, store) => {
    return [
      Assertions.sAssertStructure(
        'Checking initial toolbar groups',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            classes: [ arr.not('group-items') ],
            attrs: {
              'role': str.is('toolbar'),
              'data-alloy-tabstop': str.is('true')
            },
            children: [
              s.element('button', { html: str.is('A') }),
              s.element('button', { html: str.is('B') })
            ]
          });
        }),
        component.element()
      ),

      Step.sync(() => {
        Keying.focusIn(component);
      }),

      FocusTools.sTryOnSelector('Focus should start on A', doc, 'button:contains("A")'),
      Keyboard.sKeydown(doc, Keys.right(), { }),
      FocusTools.sTryOnSelector('Focus should move to B', doc, 'button:contains("B")')
    ];
  }, () => { success(); }, failure);
});
