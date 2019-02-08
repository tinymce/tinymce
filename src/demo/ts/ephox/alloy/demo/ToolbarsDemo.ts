import { Arr, Option } from '@ephox/katamari';
import { Class, Element } from '@ephox/sugar';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Container } from 'ephox/alloy/api/ui/Container';
import { SplitToolbar } from 'ephox/alloy/api/ui/SplitToolbar';
import { Toolbar } from 'ephox/alloy/api/ui/Toolbar';
import { ToolbarGroup } from 'ephox/alloy/api/ui/ToolbarGroup';
import * as HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';

import * as DemoRenders from './forms/DemoRenders';
import { document, console, window } from '@ephox/dom-globals';

// tslint:disable:no-console

export default (): void => {
  const gui = Gui.create();
  const body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

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
    'This toolbar has overflow behaviour that uses a more drawer',
    SplitToolbar.sketch({
      uid: 'demo-toolstrip',
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
        SplitToolbar.parts().primary({
          dom: {
            tag: 'div',
            styles: {
              display: 'flex'
            }
          }
        }),
        SplitToolbar.parts().overflow({
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
        shrinkingClass: 'demo-sliding-height-shrinking'
      },
      measure: Option.none()
    })
  );

  const splitToolbar = subject2;
  const gps2 = Arr.map(groups(), ToolbarGroup.sketch);
  console.log('gps2', gps2);
  SplitToolbar.setGroups(splitToolbar, gps2);

  window.addEventListener('resize', () => {
    SplitToolbar.refresh(splitToolbar);
  });
};