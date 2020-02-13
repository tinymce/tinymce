import { document, console, window, setTimeout } from '@ephox/dom-globals';
import { Arr, Result } from '@ephox/katamari';
import { Class, Element } from '@ephox/sugar';

import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Container } from 'ephox/alloy/api/ui/Container';
import { SplitFloatingToolbar } from 'ephox/alloy/api/ui/SplitFloatingToolbar';
import { SplitSlidingToolbar } from 'ephox/alloy/api/ui/SplitSlidingToolbar';
import { Toolbar } from 'ephox/alloy/api/ui/Toolbar';
import { ToolbarGroup } from 'ephox/alloy/api/ui/ToolbarGroup';
import * as HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';
import * as DemoSink from 'ephox/alloy/demo/DemoSink';
import { LazySink } from 'ephox/alloy/api/component/CommonTypes';
import { CustomList } from 'ephox/alloy/api/ui/CustomList';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

import * as DemoRenders from './forms/DemoRenders';

// tslint:disable:no-console

export default (): void => {
  const gui = Gui.create();
  const body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  const sink = DemoSink.make();
  gui.add(sink);

  const lazySink: LazySink = (_) => {
    return Result.value(sink);
  };

  const groups = () => {
    return Arr.map([
      {
        label: 'group-1',
        items: Arr.map([
          { text: '1a', action () { } },
          { text: '1b', action () { } },
          { text: '1c', action () { } }

        ], DemoRenders.toolbarItem)
      },
      {
        label: 'group-2',
        items: Arr.map([
          { text: '2a', action () { } },
          { text: '2b', action () { } },
          { text: '2c', action () { } }

        ], DemoRenders.toolbarItem)
      },
      {
        label: 'group-3',
        items: Arr.map([
          { text: '3a', action () { } },
          { text: '3b', action () { } },
          { text: '3c', action () { } }

        ], DemoRenders.toolbarItem)
      },
      {
        label: 'group-4',
        items: Arr.map([
          { text: '4a', action () { } },
          { text: '4b', action () { } },
          { text: '4c', action () { } }

        ], DemoRenders.toolbarItem)
      },
      {
        label: 'group-5',
        items: Arr.map([
          { text: '5a', action () { } },
          { text: '5b', action () { } },
          { text: '5c', action () { } }

        ], DemoRenders.toolbarItem)
      },
      {
        label: 'group-6',
        items: Arr.map([
          { text: '6a', action () { } },
          { text: '6b', action () { } }

        ], DemoRenders.toolbarItem)
      },
      {
        label: 'group-7',
        items: Arr.map([
          { text: '7a', action () { } },
          { text: '7b', action () { } }

        ], DemoRenders.toolbarItem)
      }
    ], DemoRenders.toolbarGroup);
  };

  const subject = HtmlDisplay.section(
    gui,
    'This demo plays around with skinning for the Ui',
    Container.sketch({
      dom: {
        classes: [ 'mce-container' ]
      },
      components: [
        Toolbar.sketch({
          dom: {
            tag: 'div',
            styles: {
              'overflow-x': 'auto',
              'max-width': '200px',
              'display': 'flex'
            }
          },
          components: [
            Toolbar.parts().groups({ })
          ]
        })
      ]
    })
  );

  const toolbar1 = subject.components()[0];
  const gps = Arr.map(groups(), ToolbarGroup.sketch);

  Toolbar.setGroups(toolbar1, gps);

  const subject2 = HtmlDisplay.section(
    gui,
    'This toolbar has overflow behaviour that uses a sliding more drawer',
    SplitSlidingToolbar.sketch({
      uid: 'demo-toolstrip-sliding',
      dom: {
        tag: 'div'
      },
      parts: {
        'overflow-group': DemoRenders.toolbarGroup({
          items: [ ]
        }),
        'overflow-button': {
          dom: {
            tag: 'button',
            innerHtml: 'More'
          }
        }
      },
      components: [
        SplitSlidingToolbar.parts().primary({
          dom: {
            tag: 'div',
            styles: {
              display: 'flex'
            }
          }
        }),
        SplitSlidingToolbar.parts().overflow({
          dom: {
            tag: 'div',
              styles: {
              'display': 'flex',
              'flex-wrap': 'wrap'
            }
          }
        })
      ],

      markers: {
        openClass: 'demo-sliding-open',
        closedClass: 'demo-sliding-closed',
        growingClass: 'demo-sliding-height-growing',
        shrinkingClass: 'demo-sliding-height-shrinking',
        overflowToggledClass: 'demo-more-button-toggled'
      }
    })
  );

  const splitSlidingToolbar = subject2;
  const gps2 = Arr.map(groups(), ToolbarGroup.sketch);
  console.log('gps2', gps2);
  SplitSlidingToolbar.setGroups(splitSlidingToolbar, gps2);

  const subject3 = HtmlDisplay.section(
    gui,
    'This toolbar has overflow behaviour that uses a floating more drawer',
    SplitFloatingToolbar.sketch({
      uid: 'demo-toolstrip-floating',
      dom: {
        tag: 'div'
      },
      lazySink,
      parts: {
        'overflow-group': DemoRenders.toolbarGroup({
          items: [ ]
        }),
        'overflow-button': {
          dom: {
            tag: 'button',
            innerHtml: 'More'
          }
        },
        'overflow': {
          dom: {
            tag: 'div',
            styles: {
              'display': 'flex',
              'flex-wrap': 'wrap'
            }
          }
        }
      },
      components: [
        SplitFloatingToolbar.parts().primary({
          dom: {
            tag: 'div',
            styles: {
              display: 'flex'
            }
          }
        })
      ],

      markers: {
        overflowToggledClass: 'demo-more-button-toggled'
      }
    })
  );

  const splitFloatingToolbar = subject3;
  const gps3 = Arr.map(groups(), ToolbarGroup.sketch);
  console.log('gps3', gps3);
  SplitFloatingToolbar.setGroups(splitFloatingToolbar, gps3);

  // Multiple toolbars demo
  const subject4 = HtmlDisplay.section(
    gui,
    'This is a toolbar array that contains multiple toolbars within',
    CustomList.sketch({
      dom: {
        tag: 'div',
        classes: [ 'multiple-toolbar' ]
      },
      components: [
        // Does not get applied when shell is true
        // CustomList.parts().items({
        //   dom: {
        //     tag: 'div',
        //     classes: [ 'custom-list-wrapper' ]
        //   }
        // })
      ],
      shell: true,
      makeItem: () => {
        return Toolbar.sketch(
          {
            dom: {
              tag: 'div',
              classes: [ 'single-toolbar' ],
              styles: {
                display: 'flex'
              }
            },
            components: [ ]
          }
        );
      },
      setupItem: (mToolbar: AlloyComponent, tc: AlloyComponent, data: any, index: number) => {
        Toolbar.setGroups(tc, data);
      }
    })
  );

  CustomList.setItems(subject4, [
    Arr.map(groups(), ToolbarGroup.sketch),
    Arr.map(groups(), ToolbarGroup.sketch),
    Arr.map(groups(), ToolbarGroup.sketch),
    Arr.map(groups(), ToolbarGroup.sketch),
    Arr.map(groups(), ToolbarGroup.sketch)
  ]);

  setTimeout(() => {
    CustomList.setItems(subject4, [
      Arr.map(groups(), ToolbarGroup.sketch),
      Arr.map(groups(), ToolbarGroup.sketch),
      Arr.map(groups(), ToolbarGroup.sketch)
    ]);

    setTimeout(() => {
      CustomList.setItems(subject4, [ ]);

      setTimeout(() => {
        CustomList.setItems(subject4, [
          Arr.map(groups(), ToolbarGroup.sketch),
          Arr.map(groups(), ToolbarGroup.sketch),
          Arr.map(groups(), ToolbarGroup.sketch),
        ]);

        setTimeout(() => {
          CustomList.setItems(subject4, [
            Arr.map(groups().slice(0, 1), ToolbarGroup.sketch),
            Arr.map(groups(), ToolbarGroup.sketch),
            Arr.map(groups(), ToolbarGroup.sketch),
          ]);
        }, 2000);
      }, 2000);
    }, 2000);
  }, 2000);

  window.addEventListener('resize', () => {
    SplitSlidingToolbar.refresh(splitSlidingToolbar);
    SplitFloatingToolbar.refresh(splitFloatingToolbar);
  });
};
