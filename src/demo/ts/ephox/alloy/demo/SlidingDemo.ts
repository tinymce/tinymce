import { Class, Element } from '@ephox/sugar';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Sliding } from 'ephox/alloy/api/behaviour/Sliding';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';
import { document, console } from '@ephox/dom-globals';

// tslint:disable:no-console

export default (): void  => {
  const gui = Gui.create();
  const body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  HtmlDisplay.section(
    gui,
    'This container slides its height',
    Container.sketch({
      components: [
        Container.sketch({
          uid: 'height-slider',

          containerBehaviours: Behaviour.derive([
            Sliding.config({
              dimension: {
                property: 'height'
              },
              closedClass: 'demo-sliding-closed',
              openClass: 'demo-sliding-open',
              shrinkingClass: 'demo-sliding-height-shrinking',
              growingClass: 'demo-sliding-height-growing',
              onShrunk () {
                console.log('height.slider.shrunk');
              },
              onGrown () {
                console.log('height.slider.grown');
              }
            })
          ]),
          components: [
            Container.sketch({
              dom: {
                styles: { height: '100px', background: 'blue' }
              }
            })
          ]
        }),

        Button.sketch({
          dom: {
            tag: 'button',
            innerHtml: 'Toggle'
          },
          action () {
            const slider = gui.getByUid('height-slider').getOrDie();
            if (Sliding.hasGrown(slider)) { Sliding.shrink(slider); } else { Sliding.grow(slider); }
          }
        })
      ]
    })
  );

  HtmlDisplay.section(
    gui,
    'This container slides its width',
    Container.sketch({
      components: [
        Container.sketch({
          uid: 'width-slider',

          containerBehaviours: Behaviour.derive([
            Sliding.config({
              dimension: {
                property: 'width'
              },
              closedClass: 'demo-sliding-closed',
              openClass: 'demo-sliding-open',
              shrinkingClass: 'demo-sliding-width-shrinking',
              growingClass: 'demo-sliding-width-growing',
              onShrunk () {
                console.log('width.slider.shrunk');
              },
              onGrown () {
                console.log('width.slider.grown');
              }
            })
          ]),

          components: [
            Container.sketch({
              dom: {
                styles: { height: '100px', background: 'blue' }
              }
            })
          ]
        }),

        Button.sketch({
          dom: {
            tag: 'button',
            innerHtml: 'Toggle'
          },
          action () {
            const slider = gui.getByUid('width-slider').getOrDie();
            if (Sliding.hasGrown(slider)) { Sliding.shrink(slider); } else { Sliding.grow(slider); }
          }
        })
      ]
    })
  );
};