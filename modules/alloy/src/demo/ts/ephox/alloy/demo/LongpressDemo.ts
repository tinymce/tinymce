import { Arr, Future, Result, Option } from '@ephox/katamari';
import { Class, Element } from '@ephox/sugar';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Menu } from 'ephox/alloy/api/ui/Menu';
import { TouchMenu } from 'ephox/alloy/api/ui/TouchMenu';
import * as Debugging from 'ephox/alloy/debugging/Debugging';
import * as DemoSink from 'ephox/alloy/demo/DemoSink';
import * as HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';

import * as DemoRenders from './forms/DemoRenders';
import { document, console } from '@ephox/dom-globals';

// tslint:disable:no-console

export default (): void => {
  const gui = Gui.create();
  Debugging.registerInspector('gui', gui);

  const body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  const sink = DemoSink.make();

  const button1 = HtmlDisplay.section(
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
          lazySink () {
            return Result.value(sink);
          },
          fetch () {
            return Future.pure(Option.from(Arr.map([
              { type: 'item', data: { value: 'alpha', meta: { text: 'Alpha' } } },
              { type: 'item', data: { value: 'beta', meta: { text: 'Beta'} } }
            ], DemoRenders.orb)));
          },
          onExecute (component, menuComp, item, data) {
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