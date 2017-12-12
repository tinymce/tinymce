import AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Keying from 'ephox/alloy/api/behaviour/Keying';
import Positioning from 'ephox/alloy/api/behaviour/Positioning';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import NativeEvents from 'ephox/alloy/api/events/NativeEvents';
import Attachment from 'ephox/alloy/api/system/Attachment';
import Gui from 'ephox/alloy/api/system/Gui';
import Button from 'ephox/alloy/api/ui/Button';
import Container from 'ephox/alloy/api/ui/Container';
import InlineView from 'ephox/alloy/api/ui/InlineView';
import Input from 'ephox/alloy/api/ui/Input';
import TieredMenu from 'ephox/alloy/api/ui/TieredMenu';
import DemoSink from 'ephox/alloy/demo/DemoSink';
import DemoRenders from './forms/DemoRenders';
import HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Result } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { Class } from '@ephox/sugar';
import { Value } from '@ephox/sugar';



export default <any> function () {
  var gui = Gui.create();
  var body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  var sink = DemoSink.make();


  var lazySink = function () {
    return Result.value(sink);
  };

  // Note, this should not in the GUI. It will be connected
  // when it opens.
  var inlineComp = GuiFactory.build(
    InlineView.sketch({
      uid: 'inline-comp',
      dom: {
        tag: 'div'
      },
      lazySink: Fun.constant(Result.value(sink))
    })
  );

  var inlineMenu = TieredMenu.sketch({
    dom: {
      tag: 'div'
    },

    onEscape: function () {
      console.log('inline.menu.escape');
      return Option.some(true);
    },

    onExecute: function () {
      console.log('inline.menu.execute');
    },

    onOpenMenu: function (sandbox, menu) {
      // handled by inline view itself
    },

    onOpenSubmenu: function (sandbox, item, submenu) {
      var sink = lazySink().getOrDie();
      Positioning.position(sink, {
        anchor: 'submenu',
        item: item,
        bubble: Option.none()
      }, submenu);

    },

    data: {
      expansions: {
        'gamma': 'gamma-menu'
      },
      menus: {
        dog: DemoRenders.menu({
          value: 'dog',
          items: Arr.map([
            { type: 'item', data: { value: 'alpha', text: 'Alpha', 'item-class': 'alpha' } },
            { type: 'item', data: { value: 'beta', text: 'Beta', 'item-class': 'beta' } },
            { type: 'item', data: { value: 'gamma', text: 'Gamma', 'item-class': 'gamma' } },
            { type: 'item', data: { value: 'delta', text: 'Delta', 'item-class': 'delta' } }

          ], DemoRenders.item),
          textkey: 'Dog'
        }),
        'gamma-menu': DemoRenders.menu({
          value: 'gamma-menu',
          items: Arr.map([
            { type: 'item', data: { value: 'gamma-1', text: 'Gamma-1', 'item-class': 'gamma-1' } },
            { type: 'item', data: { value: 'gamma-2', text: 'Gamma-2', 'item-class': 'gamma-2' } }
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
            styles: { display: 'block', 'margin-bottom': '50px' }
          }
        }),
        Input.sketch({
          dom: {
            styles: { display: 'block' }
          },

          inputBehaviours: Behaviour.derive([
            AddEventsBehaviour.config('adhoc-show-popup', [
              AlloyEvents.run(NativeEvents.focusin(), function (input) {
                var emptyAnchor = {
                  anchor: 'submenu',
                  item: input
                };

                var nonEmptyAnchor = {
                  anchor: 'selection',
                  root: gui.element()
                };

                var anchor = Value.get(input.element()).length > 0 ? nonEmptyAnchor : emptyAnchor;
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
                      action: function () { console.log('inline bold'); }
                    }),
                    Button.sketch({
                      dom: {
                        tag: 'button',
                        innerHtml: 'I'
                      },
                      action: function () { console.log('inline italic'); }
                    }),
                    Button.sketch({
                      dom: {
                        tag: 'button',
                        innerHtml: 'U'
                      },
                      action: function () { console.log('inline underline'); }
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