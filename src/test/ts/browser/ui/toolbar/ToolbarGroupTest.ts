import { ApproxStructure } from '@ephox/agar';
import { Assertions } from '@ephox/agar';
import { FocusTools } from '@ephox/agar';
import { Keyboard } from '@ephox/agar';
import { Keys } from '@ephox/agar';
import { Step } from '@ephox/agar';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Focusing from 'ephox/alloy/api/behaviour/Focusing';
import Keying from 'ephox/alloy/api/behaviour/Keying';
import Tabstopping from 'ephox/alloy/api/behaviour/Tabstopping';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Container from 'ephox/alloy/api/ui/Container';
import ToolbarGroup from 'ephox/alloy/api/ui/ToolbarGroup';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import { Arr } from '@ephox/katamari';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('ToolbarGroupTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var mungeItem = function (itemSpec) {
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

  GuiSetup.setup(function (store, doc, body) {
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

  }, function (doc, body, gui, component, store) {
    return [
      Assertions.sAssertStructure(
        'Checking initial toolbar groups',
        ApproxStructure.build(function (s, str, arr) {
          return s.element('div', {
            classes: [ arr.not('group-items') ],
            attrs: {
              role: str.is('toolbar'),
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

      Step.sync(function () {
        Keying.focusIn(component);
      }),

      FocusTools.sTryOnSelector('Focus should start on A', doc, 'button:contains("A")'),
      Keyboard.sKeydown(doc, Keys.right(), { }),
      FocusTools.sTryOnSelector('Focus should move to B', doc, 'button:contains("B")')
    ];
  }, function () { success(); }, failure);
});

