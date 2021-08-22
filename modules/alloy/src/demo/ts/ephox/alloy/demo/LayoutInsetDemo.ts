import { Optional } from '@ephox/katamari';
import { Class, SugarElement } from '@ephox/sugar';

import { Positioning } from 'ephox/alloy/api/behaviour/Positioning';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as DemoSink from 'ephox/alloy/demo/DemoSink';
import * as HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';
import * as LayoutInset from 'ephox/alloy/positioning/layout/LayoutInset';
import { Layouts } from 'ephox/alloy/positioning/mode/Anchoring';

export default (): void => {
  const gui = Gui.create();
  const body = SugarElement.fromDom(document.body);
  // Css.set(gui.element, 'direction', 'rtl');
  Class.add(gui.element, 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  const sink = DemoSink.make();

  gui.add(sink);

  const popup = GuiFactory.build(
    Container.sketch({
      components: [
        Container.sketch({
          dom: {
            styles: {
              padding: '10px',
              background: 'white',
              border: '2px solid black'
            }
          },
          components: [
            GuiFactory.text('This is a popup')
          ]
        })
      ]
    })
  );

  const makeExample = (id: string, ltrDescription: string, rtlDescription: string, layouts: Layouts) => HtmlDisplay.section(gui, 'SugarPosition anchoring to text selection', Container.sketch({
    dom: {
      tag: 'div'
    },
    components: [
      Container.sketch({
        dom: {
          attributes: {
            contenteditable: 'true'
          },
          styles: {
            border: '1px solid black',
            width: '300px',
            height: '200px',
            display: 'inline-block'
          },
          innerHtml: `Popup will appear in the ${ltrDescription} for LTR and ${rtlDescription} for RTL`
        },
        uid: `inner-${id}-editor`
      }),
      Button.sketch({
        dom: {
          tag: 'button',
          innerHtml: 'Show popup inside editor'
        },
        action: (button) => {
          Attachment.attach(sink, popup);
          Positioning.position(sink, popup, {
            anchor: {
              type: 'node',
              root: button.getSystem().getByUid(`inner-${id}-editor`).getOrDie().element,
              node: Optional.from(button.getSystem().getByUid(`inner-${id}-editor`).getOrDie().element),
              layouts
            }
          });
        }
      })
    ]
  }));

  // North
  makeExample('n', 'top', 'top', {
    onLtr: () => [ LayoutInset.north ],
    onRtl: () => [ LayoutInset.north ]
  });

  // South
  makeExample('s', 'bottom', 'bottom', {
    onLtr: () => [ LayoutInset.south ],
    onRtl: () => [ LayoutInset.south ]
  });

  // East/west
  makeExample('e', 'right', 'left', {
    onLtr: () => [ LayoutInset.east ],
    onRtl: () => [ LayoutInset.west ]
  });

  // West/east
  makeExample('w', 'left', 'right', {
    onLtr: () => [ LayoutInset.west ],
    onRtl: () => [ LayoutInset.east ]
  });

  // Northeast/northwest
  makeExample('ne-nw', 'top right', 'top left', {
    onLtr: () => [ LayoutInset.northwest ],
    onRtl: () => [ LayoutInset.northeast ]
  });

  // Southeast/southwestt
  makeExample('se-sw', 'bottom right', 'bottom left', {
    onLtr: () => [ LayoutInset.southwest ],
    onRtl: () => [ LayoutInset.southeast ]
  });
};
