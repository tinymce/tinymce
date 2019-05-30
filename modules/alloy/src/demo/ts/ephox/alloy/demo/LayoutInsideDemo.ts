import { document } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { Class, Css, Element } from '@ephox/sugar';
import { Positioning } from 'ephox/alloy/api/behaviour/Positioning';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as DemoSink from 'ephox/alloy/demo/DemoSink';
import * as HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';
import { LayoutInside } from '../../../../../main/ts/ephox/alloy/api/Main';
import { HasLayoutAnchorSpec } from '../../../../../main/ts/ephox/alloy/positioning/mode/Anchoring';

export default (): void => {
  const gui = Gui.create();
  const body = Element.fromDom(document.body);
  // Css.set(gui.element(), 'direction', 'rtl');
  Class.add(gui.element(), 'gui-root-demo-container');
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

  const makeExample = (id: string, ltrDescription: string, rtlDescription: string, layouts) => {
    return HtmlDisplay.section(gui, 'Position anchoring to text selection', Container.sketch({
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
          action(button) {
            Attachment.attach(sink, popup);
            Positioning.position(sink, {
              anchor: 'node',
              root: button.getSystem().getByUid(`inner-${id}-editor`).getOrDie().element(),
              node: Option.from(button.getSystem().getByUid(`inner-${id}-editor`).getOrDie().element()),
              layouts
            }, popup);
          }
        })
      ]
    }));
  };

  const n = makeExample('n', 'top', 'top', {
    onLtr: () => [ LayoutInside.north ],
    onRtl: () => [ LayoutInside.north ],
  });

  const s = makeExample('s', 'bottom', 'bottom', {
    onLtr: () => [ LayoutInside.south ],
    onRtl: () => [ LayoutInside.south ],
  });

  const e_w = makeExample('e', 'right', 'left', {
    onLtr: () => [ LayoutInside.east ],
    onRtl: () => [ LayoutInside.west ],
  });

  const w_e = makeExample('w', 'left', 'right', {
    onLtr: () => [ LayoutInside.west ],
    onRtl: () => [ LayoutInside.east ],
  });

  const ne_nw = makeExample('ne-nw', 'top right', 'top left', {
    onLtr: () => [ LayoutInside.northwest ],
    onRtl: () => [ LayoutInside.northeast ],
  });

  const se_sw = makeExample('se-sw', 'bottom right', 'bottom left', {
    onLtr: () => [ LayoutInside.southwest ],
    onRtl: () => [ LayoutInside.southeast ],
  });
};