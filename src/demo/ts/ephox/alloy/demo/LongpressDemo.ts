import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Attachment from 'ephox/alloy/api/system/Attachment';
import Gui from 'ephox/alloy/api/system/Gui';
import Menu from 'ephox/alloy/api/ui/Menu';
import TouchMenu from 'ephox/alloy/api/ui/TouchMenu';
import Debugging from 'ephox/alloy/debugging/Debugging';
import DemoSink from 'ephox/alloy/demo/DemoSink';
import DemoRenders from './forms/DemoRenders';
import HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';
import { Arr } from '@ephox/katamari';
import { Future } from '@ephox/katamari';
import { Result } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { Class } from '@ephox/sugar';



export default <any> function () {
  var gui = Gui.create();
  Debugging.registerInspector('gui', gui);

  var body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  var sink = DemoSink.make();

  var button1 = HtmlDisplay.section(
    gui,
    'Run this in touch device mode. It is a button that if you press and hold on it, it opens a circular menu below.',
    {
      dom: {
        tag: 'div'
      },
      components: [
        GuiFactory.premade(sink),

        TouchMenu.sketch({
          dom: {
            tag: 'span',
            innerHtml: 'Menu button (sketch)',
            classes: [ 'tap-menu' ]
          },
          lazySink: function () {
            return Result.value(sink);
          },
          fetch: function () {
            return Future.pure(Arr.map([
              { type: 'item', data: { value: 'alpha', text: 'Alpha' } },
              { type: 'item', data: { value: 'beta', text: 'Beta'} }
            ], DemoRenders.orb));
          },
          onExecute: function (component, menuComp, item, data) {
            console.log('selected', data.value);
          },
          menuTransition: {
            property: 'transform',
            transitionClass: 'longpress-menu-transitioning'
          },

          toggleClass: 'selected',
          parts: {
            view: {
              dom: {
                tag: 'div'
              }
            },
            menu: {
              dom: {
                tag: 'div'
              },
              components: [
                Menu.parts().items({ })
              ],
              value: 'touchmenu',
              markers: DemoRenders.orbMarkers()
            }
          }
        })
      ]
    }
  );
};