import { Arr, Fun, Option, Result } from '@ephox/katamari';
import { Class, Element, Value } from '@ephox/sugar';
import * as AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Keying from 'ephox/alloy/api/behaviour/Keying';
import Positioning from 'ephox/alloy/api/behaviour/Positioning';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import NativeEvents from 'ephox/alloy/api/events/NativeEvents';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import Button from 'ephox/alloy/api/ui/Button';
import Container from 'ephox/alloy/api/ui/Container';
import InlineView from 'ephox/alloy/api/ui/InlineView';
import Input from 'ephox/alloy/api/ui/Input';
import TieredMenu from 'ephox/alloy/api/ui/TieredMenu';
import DemoSink from 'ephox/alloy/demo/DemoSink';
import HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';

import DemoRenders from './forms/DemoRenders';

export default <any> function () {
  const gui = Gui.create();
  const body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  const sink = DemoSink.make();

  const lazySink = function () {
    return Result.value(sink);
  };

  // Note, this should not in the GUI. It will be connected
  // when it opens.
  const inlineComp = GuiFactory.build(
    InlineView.sketch({
      uid: 'inline-comp',
      dom: {
        tag: 'div'
      },
      lazySink: Fun.constant(Result.value(sink))
    })
  );

  const inlineMenu = TieredMenu.sketch({
    dom: {
      tag: 'div'
    },

    onEscape () {
      console.log('inline.menu.escape');
      return Option.some(true);
    },

    onExecute () {
      console.log('inline.menu.execute');
    },

    onOpenMenu (sandbox, menu) {
      // handled by inline view itself
    },

    onOpenSubmenu (sandbox, item, submenu) {
      const sink = lazySink().getOrDie();
      Positioning.position(sink, {
        anchor: 'submenu',
        item,
        bubble: Option.none()
      }, submenu);

    },

    data: {
      expansions: {
        gamma: 'gamma-menu'
      },
      menus: {
        'dog': DemoRenders.menu({
          value: 'dog',
          items: Arr.map([
            { type: 'item', data: { 'value': 'alpha', 'text': 'Alpha', 'item-class': 'alpha' } },
            { type: 'item', data: { 'value': 'beta', 'text': 'Beta', 'item-class': 'beta' } },
            { type: 'item', data: { 'value': 'gamma', 'text': 'Gamma', 'item-class': 'gamma' } },
            { type: 'item', data: { 'value': 'delta', 'text': 'Delta', 'item-class': 'delta' } }

          ], DemoRenders.item),
          textkey: 'Dog'
        }),
        'gamma-menu': DemoRenders.menu({
          value: 'gamma-menu',
          items: Arr.map([
            { type: 'item', data: { 'value': 'gamma-1', 'text': 'Gamma-1', 'item-class': 'gamma-1' } },
            { type: 'item', data: { 'value': 'gamma-2', 'text': 'Gamma-2', 'item-class': 'gamma-2' } }
          ], DemoRenders.item),
          textkey: 'gamma-menu'
        })
      },
      primary: 'dog'
    },

    markers: DemoRenders.tieredMarkers()
  });

  gui.add(sink);

  HtmlDisplay.section(
    gui,
    'This inline menu component is a context menu. Right click inside the yellow area',
    Container.sketch({
      dom: {
        styles: {
          background: '#ffff33',
          height: '100px'
        }
      },
      events: AlloyEvents.derive([
        AlloyEvents.run(NativeEvents.contextmenu(), function (component, simulatedEvent) {
          simulatedEvent.event().kill();
          console.log('inlineMenu', inlineMenu);
          InlineView.showAt(inlineComp, {
            anchor: 'makeshift',
            x: simulatedEvent.event().x(),
            y: simulatedEvent.event().y()
          }, inlineMenu);
        })
      ])
    })
  );

  HtmlDisplay.section(
    gui,
    'This inline toolbar shows up when you click in the second input field. Note, ' +
    'how when you focus an empty input, it will attach at the end of the field, and ' +
    'when you focus a non-empty input, it will attach below',
    Container.sketch({
      containerBehaviours: Behaviour.derive([
        Keying.config({
          mode: 'cyclic',
          selector: 'input'
        })
      ]),
      components: [
        Input.sketch({
          dom: {
            styles: { 'display': 'block', 'margin-bottom': '50px' }
          }
        }),
        Input.sketch({
          dom: {
            styles: { display: 'block' }
          },

          inputBehaviours: Behaviour.derive([
            AddEventsBehaviour.config('adhoc-show-popup', [
              AlloyEvents.run(NativeEvents.focusin(), function (input) {
                const emptyAnchor = {
                  anchor: 'submenu',
                  item: input
                };

                const nonEmptyAnchor = {
                  anchor: 'selection',
                  root: gui.element()
                };

                const anchor = Value.get(input.element()).length > 0 ? nonEmptyAnchor : emptyAnchor;
                InlineView.showAt(inlineComp, anchor, Container.sketch({
                  containerBehaviours: Behaviour.derive([
                    Keying.config({
                      mode: 'flow',
                      selector: 'button'
                    })
                  ]),
                  components: [
                    Button.sketch({
                      dom: {
                        tag: 'button',
                        innerHtml: 'B'
                      },
                      action () { console.log('inline bold'); }
                    }),
                    Button.sketch({
                      dom: {
                        tag: 'button',
                        innerHtml: 'I'
                      },
                      action () { console.log('inline italic'); }
                    }),
                    Button.sketch({
                      dom: {
                        tag: 'button',
                        innerHtml: 'U'
                      },
                      action () { console.log('inline underline'); }
                    })
                  ]

                }));
              })
            ])
          ])
        })
      ]
    })
  );
};