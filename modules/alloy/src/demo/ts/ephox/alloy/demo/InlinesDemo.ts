import { Arr, Fun, Optional, Result } from '@ephox/katamari';
import { Class, EventArgs, SugarElement, Value } from '@ephox/sugar';

import * as AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import { Positioning } from 'ephox/alloy/api/behaviour/Positioning';
import { Tooltipping } from 'ephox/alloy/api/behaviour/Tooltipping';
import { LazySink } from 'ephox/alloy/api/component/CommonTypes';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as NativeEvents from 'ephox/alloy/api/events/NativeEvents';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';
import { InlineView } from 'ephox/alloy/api/ui/InlineView';
import { Input } from 'ephox/alloy/api/ui/Input';
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import * as DemoSink from 'ephox/alloy/demo/DemoSink';
import * as HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';
import { AnchorSpec, SelectionAnchorSpec, SubmenuAnchorSpec } from 'ephox/alloy/positioning/mode/Anchoring';

import * as DemoRenders from './forms/DemoRenders';

/* eslint-disable no-console */

export default (): void => {
  const gui = Gui.create();
  const body = SugarElement.fromDom(document.body);
  Class.add(gui.element, 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  const sink = DemoSink.make();

  const lazySink: LazySink = (_) => Result.value(sink);

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

  const makeItem = (v: string, t: string, c: string): DemoRenders.DemoItem => ({
    type: 'item',
    data: {
      value: v,
      meta: {
        'text': t,
        'item-class': c
      }
    },

    itemBehaviours: Behaviour.derive([
      Tooltipping.config({
        lazySink,
        tooltipDom: {
          tag: 'div',
          styles: {
            background: '#cadbee',
            padding: '3em'
          }
        },
        tooltipComponents: [
          GuiFactory.text(t)
        ],
        anchor: (comp) => ({
          type: 'submenu',
          item: comp
        }),
        onShow: (component, _tooltip) => {
          setTimeout(() => {
            Tooltipping.setComponents(component, [
              {
                dom: {
                  tag: 'div',
                  innerHtml: 'This lazy loaded'
                }
              }
            ]);
          }, 2000);
        },
        onHide: (_component, _tooltip) => {

        }
      })
    ])
  });

  const inlineMenu = TieredMenu.sketch({
    dom: {
      tag: 'div'
    },

    onEscape: () => {
      console.log('inline.menu.escape');
      return Optional.some<boolean>(true);
    },

    onExecute: () => {
      console.log('inline.menu.execute');
      return Optional.some<boolean>(true);
    },

    onOpenMenu: (_sandbox, _menu) => {
      // handled by inline view itself
    },

    onOpenSubmenu: (sandbox, item, submenu) => {
      const sink = lazySink(sandbox).getOrDie();
      Positioning.position(sink, submenu, {
        anchor: {
          type: 'submenu',
          item
        }
      });

    },

    data: {
      expansions: {
        gamma: 'gamma-menu'
      },
      menus: {
        'dog': DemoRenders.menu({
          value: 'dog',
          items: Arr.map([
            makeItem('alpha', 'Alpha', 'alpha'),
            makeItem('beta', 'Beta', 'beta'),
            makeItem('gamma', 'Gamma', 'gamma'),
            makeItem('delta', 'Delta', 'delta')
          ], DemoRenders.item),
          textkey: 'Dog'
        }),
        'gamma-menu': DemoRenders.menu({
          value: 'gamma-menu',
          items: Arr.map([
            makeItem('gamma-1', 'Gamma-1', 'gamma-1'),
            makeItem('gamma-2', 'Gamma-2', 'gamma-2')
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
        AlloyEvents.run<EventArgs<MouseEvent>>(NativeEvents.contextmenu(), (component, simulatedEvent) => {
          simulatedEvent.event.kill();
          InlineView.showAt(inlineComp, inlineMenu, {
            anchor: {
              type: 'makeshift',
              x: simulatedEvent.event.x,
              y: simulatedEvent.event.y
            }
          });
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
          inputStyles: { 'display': 'block', 'margin-bottom': '50px' }
        }),
        Input.sketch({
          inputStyles: { display: 'block' },

          inputBehaviours: Behaviour.derive([
            AddEventsBehaviour.config('adhoc-show-popup', [
              AlloyEvents.run(NativeEvents.focusin(), (input) => {
                const emptyAnchor: SubmenuAnchorSpec = {
                  type: 'submenu',
                  item: input
                };

                const nonEmptyAnchor: SelectionAnchorSpec = {
                  type: 'selection',
                  root: gui.element
                };

                const anchor: AnchorSpec = Value.get(input.element).length > 0 ? nonEmptyAnchor : emptyAnchor;
                InlineView.showAt(inlineComp, Container.sketch({
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
                      action: () => {
                        console.log('inline bold');
                      }
                    }),
                    Button.sketch({
                      dom: {
                        tag: 'button',
                        innerHtml: 'I'
                      },
                      action: () => {
                        console.log('inline italic');
                      }
                    }),
                    Button.sketch({
                      dom: {
                        tag: 'button',
                        innerHtml: 'U'
                      },
                      action: () => {
                        console.log('inline underline');
                      }
                    })
                  ]

                }), { anchor });
              })
            ])
          ])
        })
      ]
    })
  );
};
