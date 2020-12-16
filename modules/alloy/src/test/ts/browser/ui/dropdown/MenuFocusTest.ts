import { Chain, FocusTools, GeneralSteps, Logger, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';

import * as AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as FocusManagers from 'ephox/alloy/api/focus/FocusManagers';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import * as ItemWidget from 'ephox/alloy/api/ui/ItemWidget';
import { Menu } from 'ephox/alloy/api/ui/Menu';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import { NormalItemSpec, WidgetItemSpec } from 'ephox/alloy/ui/types/ItemTypes';

UnitTest.asynctest('MenuFocusTest', (success, failure) => {

  GuiSetup.setup((store, _doc, _body) => {
    const markers = {
      item: TestDropdownMenu.markers().item,
      selectedItem: TestDropdownMenu.markers().selectedItem
    };

    const items = (suffix: string) => [
      {
        type: 'widget',
        data: { value: 'alpha', meta: { text: 'Alpha' }},
        dom: {
          tag: 'span',
          classes: [ `alpha-widget-${suffix}` ]
        },
        components: [
          ItemWidget.parts.widget({
            dom: {
              tag: 'div',
              classes: [ 'internal-widget' ],
              innerHtml: `internal-widget-${suffix}`
            }
          })
        ],
        widgetBehaviours: Behaviour.derive([
          AddEventsBehaviour.config('widget-item-test-behaviour', [
            AlloyEvents.runOnAttached(store.adder('widget.item.' + suffix + '.attached'))
          ])
        ])
      } as WidgetItemSpec,

      {
        type: 'item',
        data: { value: 'beta', meta: { text: 'Beta' }},
        dom: {
          tag: 'span',
          classes: [ `beta-item-${suffix}` ],
          innerHtml: `beta-item-${suffix}`
        },
        components: [ ],
        itemBehaviours: Behaviour.derive([
          AddEventsBehaviour.config('normal-item-test-behaviour', [
            AlloyEvents.runOnAttached(store.adder('normal.item.' + suffix + '.attached'))
          ])
        ])
      } as NormalItemSpec
    ];

    const menu1 = Menu.sketch({
      value: 'test-menu-1',
      items: items('1'),
      dom: {
        tag: 'div',
        classes: [ 'test-menu' ]
      },
      components: [
        Menu.parts.items({ })
      ],

      markers
    });

    const menu2 = Menu.sketch({
      value: 'test-menu-1',
      items: items('2'),
      dom: {
        tag: 'div',
        classes: [ 'test-menu' ]
      },
      components: [
        Menu.parts.items({ })
      ],
      fakeFocus: true,
      focusManager: FocusManagers.highlights(),

      markers
    });

    return GuiFactory.build(
      {
        dom: {
          tag: 'div',
          classes: [ 'menu-focus-test-container' ]
        },
        components: [
          menu1,
          {
            dom: {
              tag: 'input'
            }
          },
          menu2
        ]
      }
    );
  }, (doc, _body, _gui, component, store) => {

    const sAssertFocusShift = (label: string, expected: string, focusTarget: string) => Logger.t(
      label,
      GeneralSteps.sequence([
        FocusTools.sSetFocus('Focus input field', component.element, 'input'),
        Chain.asStep(component.element, [
          UiFinder.cFindIn(focusTarget),
          Chain.op((alphaWidget) => {
            Focusing.focus(component.getSystem().getByDom(alphaWidget).toOptional().getOrDie('Could not find selector: ' + focusTarget));
          })
        ]),
        FocusTools.sTryOnSelector('Focus hould be on', doc, expected)
      ])
    );

    return [
      store.sAssertEq('Checking behaviours were added', [
        'widget.item.1.attached',
        'normal.item.1.attached',
        'widget.item.2.attached',
        'normal.item.2.attached'
      ]),
      sAssertFocusShift('Focusing on alpha-widget-1', '.alpha-widget-1', '.alpha-widget-1'),
      sAssertFocusShift('Focusing on beta-item-1', '.beta-item-1', '.beta-item-1'),

      sAssertFocusShift('Focusing on alpha-widget-2 (fakeFocus)', 'input', '.alpha-widget-2'),
      sAssertFocusShift('Focusing on beta-item-2 (fakeFocus)', 'input', '.beta-item-2')
    ];
  }, success, failure);
});
