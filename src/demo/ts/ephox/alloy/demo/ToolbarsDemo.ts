import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Toggling from 'ephox/alloy/api/behaviour/Toggling';
import Attachment from 'ephox/alloy/api/system/Attachment';
import Gui from 'ephox/alloy/api/system/Gui';
import Button from 'ephox/alloy/api/ui/Button';
import Container from 'ephox/alloy/api/ui/Container';
import SplitToolbar from 'ephox/alloy/api/ui/SplitToolbar';
import Toolbar from 'ephox/alloy/api/ui/Toolbar';
import ToolbarGroup from 'ephox/alloy/api/ui/ToolbarGroup';
import DemoRenders from './forms/DemoRenders';
import HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';
import { Arr } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { Class } from '@ephox/sugar';



export default <any> function () {
  var gui = Gui.create();
  var body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  var groups = function () {
    return Arr.map([
      {
        label: 'group-1',
        items: Arr.map([
          { text: '1a', action: function () { } },
          { text: '1b', action: function () { } },
          { text: '1c', action: function () { } }

        ], DemoRenders.toolbarItem)
      },
      {
        label: 'group-2',
        items: Arr.map([
          { text: '2a', action: function () { } },
          { text: '2b', action: function () { } },
          { text: '2c', action: function () { } }

        ], DemoRenders.toolbarItem)
      },
      {
        label: 'group-3',
        items: Arr.map([
          { text: '3a', action: function () { } },
          { text: '3b', action: function () { } },
          { text: '3c', action: function () { } }

        ], DemoRenders.toolbarItem)
      },
      {
        label: 'group-4',
        items: Arr.map([
          { text: '4a', action: function () { } },
          { text: '4b', action: function () { } },
          { text: '4c', action: function () { } }

        ], DemoRenders.toolbarItem)
      },
      {
        label: 'group-5',
        items: Arr.map([
          { text: '5a', action: function () { } },
          { text: '5b', action: function () { } },
          { text: '5c', action: function () { } }

        ], DemoRenders.toolbarItem)
      },
      {
        label: 'group-6',
        items: Arr.map([
          { text: '6a', action: function () { } },
          { text: '6b', action: function () { } }

        ], DemoRenders.toolbarItem)
      },
      {
        label: 'group-7',
        items: Arr.map([
          { text: '7a', action: function () { } },
          { text: '7b', action: function () { } }

        ], DemoRenders.toolbarItem)
      }
    ], DemoRenders.toolbarGroup);
  };

  var subject = HtmlDisplay.section(
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
              display: 'flex'
            }
          },
          components: [
            Toolbar.parts().groups()
          ]
        })
      ]
    })
  );

  var toolbar1 = subject.components()[0];
  var gps = Arr.map(groups(), ToolbarGroup.sketch);
  Toolbar.setGroups(toolbar1, gps);

  var subject2 = HtmlDisplay.section(
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
              display: 'flex',
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
      }
    })
  );

  var splitToolbar = subject2;
  var gps2 = Arr.map(groups(), ToolbarGroup.sketch);
  console.log('gps2', gps2);
  SplitToolbar.setGroups(splitToolbar, gps2);

  window.addEventListener('resize', function () {
    SplitToolbar.refresh(splitToolbar);
  });
};