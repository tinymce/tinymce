import { Arr, Future, Obj, Result } from '@ephox/katamari';
import { Class, Element } from '@ephox/sugar';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import { Tabstopping } from 'ephox/alloy/api/behaviour/Tabstopping';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';
import { Dropdown } from 'ephox/alloy/api/ui/Dropdown';
import { Input } from 'ephox/alloy/api/ui/Input';
import { SplitDropdown } from 'ephox/alloy/api/ui/SplitDropdown';
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import DemoSink from 'ephox/alloy/demo/DemoSink';
import HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';

import DemoRenders from './forms/DemoRenders';
import { document, console } from '@ephox/dom-globals';

export default <any> function () {
  const gui = Gui.create();
  const body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  // Css.set(gui.element(), 'direction', 'rtl');

  Attachment.attachSystem(body, gui);

  const sink = DemoSink.make();

  gui.add(sink);

  const lazySink = function () {
    return Result.value(sink);
  };

  const menuMarkers = DemoRenders.tieredMarkers();

  const wDoubleInput = DemoRenders.widgetItem({
    type: 'widget',
    autofocus: true,
    data: {
      value: 'widget1',
      text: 'Widget1'
    },
    widget: Container.sketch({
      dom: {
        classes: [ 'my-widget' ]
      },
      containerBehaviours: Behaviour.derive([
        Keying.config({ mode: 'cyclic' })
      ]),
      components: [
        Input.sketch({ tag: 'input' }),
        Input.sketch({ tag: 'input' })
      ]
    })

  });

  HtmlDisplay.section(
    gui,
    'Thi is a split-button dropdown',
    SplitDropdown.sketch({
      toggleClass: 'demo-selected',
      dom: {
        tag: 'div'
      },
      components: [
        SplitDropdown.parts().button({
          dom: {
            tag: 'button',
            innerHtml: 'Run'
          },
          uid: 'supplied'
        }),
        SplitDropdown.parts().arrow({
          dom: {
            tag: 'button',
            innerHtml: 'v'
          }
        }),
        SplitDropdown.parts().sink({ })
      ],
      fetch () {
        const wMenu = DemoRenders.menu({
          value: 'demo.1.widget.menu',
          items: [ wDoubleInput ]
        });

        return Future.pure(
          TieredMenu.singleData('name', wMenu)
        );
      },
      lazySink,
      onExecute () {
        console.log('split-dropdown button clicked');
      },
      onItemExecute () {
        console.log('split-dropdown menuitem clicked');
      },
      parts: {
        menu: {
          markers: menuMarkers,
          dom: {
            tag: 'div'
          }
        }
      }
    })
  );

  const x = HtmlDisplay.section(
    gui,
    'This dropdown button shows a widget',
    Dropdown.sketch({
      lazySink,

      toggleClass: 'demo-selected',

      dom: {
        tag: 'div',
        innerHtml: 'Dropdown widget'
      },

      parts: {
        menu: {
          markers: menuMarkers,
          dom: {
            tag: 'div'
          }
        }
      },

      fetch () {
        const menu = DemoRenders.menu({
          value: 'demo.2.widget',
          items: [ wDoubleInput ]
        });

        return Future.pure(menu).map(function (m) {
          return TieredMenu.singleData('demo.2.menu', menu);
        });
      }
    })
  );

  HtmlDisplay.section(
    gui,
    'This grid dropdown button is a grid of 2 x 2',
    Dropdown.sketch({
      dom: {
        tag: 'div',
        innerHtml: 'here'
      },
      components: [

      ],

      toggleClass: 'demo-selected',

      parts: {
        menu: {
          markers: menuMarkers,
          dom: {
            tag: 'div'
          }
        }
      },
      fetch () {

        const data = Arr.map([
          { type: 'item', data: { value: 'alpha', text: '+Alpha' } },
          { type: 'item', data: { value: 'beta', text: '+Beta' } },
          { type: 'item', data: { value: 'gamma', text: '+Gamma' } },
          { type: 'item', data: { value: 'delta', text: '+Delta' } }
        ], DemoRenders.gridItem);

        const future = Future.pure(data);
        return future.map(function (items) {
          const menu = DemoRenders.gridMenu({
            value: 'demo.3.menu',
            items,
            columns: 2,
            rows: 2
          });
          return TieredMenu.singleData('grid-list', menu);
        });
      },

      lazySink
    })
  );

  HtmlDisplay.section(
    gui,
    'This dropdown button has four possible values: alpha, beta, gamma, and delta AND an internal sink',
    Dropdown.sketch({
      dom: {
        tag: 'button',
        innerHtml: 'Click me to expand'
      },
      components: [
        Dropdown.parts().sink({ })
      ],

      toggleClass: 'demo-selected',

      parts: {
        menu: {
          markers: menuMarkers,
          dom: {
            tag: 'div'
          }
        }
      },
      lazySink,

      matchWidth: true,

      fetch () {
        const data = Arr.map([
          { 'type': 'item', 'data': { value: 'alpha', text: 'Alpha' }, 'item-class': 'class-alpha' },
          { 'type': 'item', 'data': { value: 'beta', text: 'Beta' }, 'item-class': 'class-beta' },
          { type: 'separator', data: { value: 'text', text: '-- separator --' } },
          { 'type': 'item', 'data': { value: 'gamma', text: 'Gamma' }, 'item-class': 'class-gamma' },
          { 'type': 'item', 'data': { value: 'delta', text: 'Delta' }, 'item-class': 'class-delta' }
        ], DemoRenders.item);

        const future = Future.pure(data);
        return future.map(function (items) {
          const menu = DemoRenders.menu({
            value: 'demo.4.menu',
            items
          });
          return TieredMenu.singleData('basic-list', menu);
        });
      },
      onExecute (sandbox, item, itemValue) {
        console.log('*** dropdown demo execute on: ' + Representing.getValue(item));
      }
    })
  );

  HtmlDisplay.section(
    gui,
    'This dropdown menu has an intricate menu system derived from Sublime sorting',
    Dropdown.sketch({
      dom: {
        tag: 'div',
        innerHtml: '+'
      },
      components: [

      ],
      lazySink,
      parts: {
        menu: {
          markers: menuMarkers,
          dom: {
            tag: 'div'
          }
        }
      },

      toggleClass: 'demo-selected',

      onExecute (sandbox, item, itemValue) {
        console.trace();
        console.log('*** dropdown menu demo execute on: ' + Representing.getValue(item).value + ' ***');
      },
      fetch () {
        const future = Future.pure({
          primary: 'tools-menu',
          menus: Obj.map({
            'tools-menu': {
              value: 'tools-menu',
              text: 'tools-menu',
              items: Arr.map([
                { 'type': 'item', 'data': { value: 'packages', text: 'Packages' }, 'item-class': '' },
                { 'type': 'item', 'data': { value: 'about', text: 'About' }, 'item-class': '' },
                {
                  type: 'widget',
                  data: {
                    value: 'widget',
                    text: 'Widget'
                  },
                  widget: Container.sketch({
                    dom: {
                      tag: 'div'
                    },
                    components: [
                      Input.sketch({
                        tag: 'input',
                        inputStyles: {
                          display: 'inline-block',
                          width: '50px'
                        },
                        inputBehaviours: Behaviour.derive([
                          Tabstopping.config({ })
                        ])
                      }),
                      Container.sketch({
                        components: [
                          Button.sketch({
                            action () { console.log('clicked on a button', arguments); },
                            dom: {
                              tag: 'button',
                              innerHtml: '-'
                            }
                          }),
                          Button.sketch({
                            action () { console.log('clicked on a button', arguments); },
                            dom: {
                              tag: 'button',
                              innerHtml: '+'
                            }
                          })
                        ],
                        containerBehaviours: Behaviour.derive([
                          Tabstopping.config({ }),
                          Keying.config({
                            mode: 'flow',
                            selector: 'button'
                          })
                        ])
                      })
                    ],
                    containerBehaviours: Behaviour.derive([
                      Keying.config({
                        mode: 'cyclic'
                      })
                    ])
                  })
                }
              ], DemoRenders.item)
            },
            'packages-menu': {
              value: 'packages',
              text: 'packages',
              items: Arr.map([
                { 'type': 'item', 'data': { value: 'sortby', text: 'SortBy' }, 'item-class': '' }
              ], DemoRenders.item)
            },
            'sortby-menu': {
              value: 'sortby',
              text: 'sortby',
              items: Arr.map([
                { 'type': 'item', 'data': { value: 'strings', text: 'Strings' }, 'item-class': '' },
                { 'type': 'item', 'data': { value: 'numbers', text: 'Numbers' }, 'item-class': '' }
              ], DemoRenders.item)
            },
            'strings-menu': {
              value: 'strings',
              text: 'strings',
              items: Arr.map([
                { 'type': 'item', 'data': { value: 'version', text: 'Versions', html: '<b>V</b>ersions' }, 'item-class': '' },
                { 'type': 'item', 'data': { value: 'alphabetic', text: 'Alphabetic' }, 'item-class': '' }
              ], DemoRenders.item)
            },
            'numbers-menu': {
              value: 'numbers',
              text: 'numbers',
              items: Arr.map([
                { 'type': 'item', 'data': { value: 'doubled', text: 'Double digits' }, 'item-class': '' }
              ], DemoRenders.item)
            }
          }, DemoRenders.menu),
          expansions: {
            packages: 'packages-menu',
            sortby: 'sortby-menu',
            strings: 'strings-menu',
            numbers: 'numbers-menu'
          }
        });

        return future.map(function (f) {
          return TieredMenu.tieredData(f.primary, f.menus, f.expansions);
        });
      }
    })
  );
};