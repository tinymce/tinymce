import { Arr, Future, Obj, Optional, Result } from '@ephox/katamari';
import { Class, SugarElement } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import { Tabstopping } from 'ephox/alloy/api/behaviour/Tabstopping';
import * as Memento from 'ephox/alloy/api/component/Memento';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';
import { Dropdown } from 'ephox/alloy/api/ui/Dropdown';
import { Input } from 'ephox/alloy/api/ui/Input';
import { SplitDropdown } from 'ephox/alloy/api/ui/SplitDropdown';
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import * as DemoSink from 'ephox/alloy/demo/DemoSink';
import * as HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';

import * as DemoRenders from './forms/DemoRenders';

/* eslint-disable no-console */

const makeItem = (v: string, t: string, c?: string): DemoRenders.DemoItem => ({
  type: 'item',
  data: {
    value: v,
    meta: {
      text: t,
      ...c ? { 'item-class': c } : { }
    }
  }
});

export default (): void => {
  const gui = Gui.create();
  const body = SugarElement.fromDom(document.body);
  Class.add(gui.element, 'gui-root-demo-container');
  // Css.set(gui.element, 'direction', 'rtl');

  Attachment.attachSystem(body, gui);

  const sink = DemoSink.make();

  gui.add(sink);

  const lazySink = () => Result.value(sink);

  const menuMarkers = DemoRenders.tieredMarkers();

  const wDoubleInput = DemoRenders.widgetItem({
    type: 'widget',
    autofocus: true,
    data: {
      value: 'widget1',
      meta: {
        text: 'Widget1'
      }
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
        SplitDropdown.parts.button({
          dom: {
            tag: 'button',
            innerHtml: 'Run'
          },
          uid: 'supplied'
        }),
        SplitDropdown.parts.arrow({
          dom: {
            tag: 'button',
            innerHtml: 'v'
          }
        }),
        SplitDropdown.parts.sink({ })
      ],
      fetch: () => {
        const wMenu = DemoRenders.menu({
          value: 'demo.1.widget.menu',
          items: [ wDoubleInput ]
        });

        return Future.pure(
          Optional.some(TieredMenu.singleData('name', wMenu))
        );
      },
      lazySink,
      onExecute: () => {
        console.log('split-dropdown button clicked');
      },
      onItemExecute: () => {
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

  HtmlDisplay.section(
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

      fetch: () => {
        const menu = DemoRenders.menu({
          value: 'demo.2.widget',
          items: [ wDoubleInput ]
        });

        return Future.pure(menu).map(() => Optional.some(TieredMenu.singleData('demo.2.menu', menu)));
      }
    })
  );

  const memHotspotBox = Memento.record(
    {
      dom: {
        tag: 'div',
        styles: {
          'padding': '10px',
          'border': '1px solid blue',
          'margin-bottom': '100px'
        },
        innerHtml: 'Hotspot'
      }
    }
  );

  HtmlDisplay.section(
    gui,
    'This dropdown button shows a widget with a different hotspot',
    Container.sketch({
      components: [
        memHotspotBox.asSpec(),
        Dropdown.sketch({
          lazySink,
          getHotspot: memHotspotBox.getOpt,

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

          fetch: () => {
            const menu = DemoRenders.menu({
              value: 'demo.2.widget',
              items: [ wDoubleInput ]
            });

            return Future.pure(menu).map(() => Optional.some(TieredMenu.singleData('demo.2.menu', menu)));
          }
        })
      ]
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
      fetch: () => {
        const data = Arr.map([
          makeItem('alpha', '+Alpha'),
          makeItem('beta', '+Beta'),
          makeItem('gamma', '+Gamma'),
          makeItem('delta', '+Delta')
        ], DemoRenders.gridItem);

        const future = Future.pure(data);
        return future.map((items) => {
          const menu = DemoRenders.gridMenu({
            value: 'demo.3.menu',
            items,
            columns: 2,
            rows: 2
          });
          return Optional.some(TieredMenu.singleData('grid-list', menu));
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
        Dropdown.parts.sink({ })
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

      fetch: () => {
        const data = Arr.map([
          makeItem('alpha', 'Alpha', 'class-alpha'),
          makeItem('beta', 'Beta', 'class-beta'),
          { type: 'separator', data: { value: 'text', meta: { text: '-- separator --' }}} as DemoRenders.DemoSeparatorItem,
          makeItem('gamma', 'Gamma', 'class-gamma'),
          makeItem('delta', 'Delta', 'class-delta')
        ], DemoRenders.item);

        const future = Future.pure(data);
        return future.map((items) => {
          const menu = DemoRenders.menu({
            value: 'demo.4.menu',
            items
          });
          return Optional.some(TieredMenu.singleData('basic-list', menu));
        });
      },
      onExecute: (sandbox, item) => {
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

      onExecute: (sandbox, item) => {
        console.trace();
        console.log('*** dropdown menu demo execute on: ' + Representing.getValue(item).value + ' ***');
      },
      fetch: () => {
        const future = Future.pure({
          primary: 'tools-menu',
          menus: Obj.map({
            'tools-menu': {
              value: 'tools-menu',
              text: 'tools-menu',
              items: Arr.map([
                makeItem('packages', 'Packages', ''),
                makeItem('about', 'About Us', ''),
                {
                  type: 'widget',
                  data: {
                    value: 'widget',
                    meta: {
                      text: 'Widget'
                    }
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
                            action: (...args) => {
                              console.log('clicked on a button', ...args);
                            },
                            dom: {
                              tag: 'button',
                              innerHtml: '-'
                            }
                          }),
                          Button.sketch({
                            action: (...args) => {
                              console.log('clicked on a button', ...args);
                            },
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
                } as DemoRenders.DemoWidgetItem
              ], DemoRenders.item)
            },
            'packages-menu': {
              value: 'packages',
              text: 'packages',
              items: Arr.map([
                makeItem('sortby', 'SortBy', '')
              ], DemoRenders.item)
            },
            'sortby-menu': {
              value: 'sortby',
              text: 'sortby',
              items: Arr.map([
                makeItem('strings', 'Strings', ''),
                makeItem('numbers', 'Numbers', '')
              ], DemoRenders.item)
            },
            'strings-menu': {
              value: 'strings',
              text: 'strings',
              items: Arr.map([
                makeItem('version', 'Versions', ''),
                makeItem('alphabetic', 'Alphabetic', '')
              ], DemoRenders.item)
            },
            'numbers-menu': {
              value: 'numbers',
              text: 'numbers',
              items: Arr.map([
                makeItem('doubled', 'Double Digits', '')
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

        return future.map((f) => Optional.from(TieredMenu.tieredData(f.primary, f.menus, f.expansions)));
      }
    })
  );
};
