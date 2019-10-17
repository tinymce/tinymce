import { document, window } from '@ephox/dom-globals';
import { Class, Css, Element, DomEvent } from '@ephox/sugar';

import * as Boxes from 'ephox/alloy/alien/Boxes';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Docking } from 'ephox/alloy/api/behaviour/Docking';
import { Dragging } from 'ephox/alloy/api/behaviour/Dragging';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';

export default (): void => {
  const gui = Gui.create();
  const body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  // Css.set(gui.element(), 'direction', 'rtl');

  Attachment.attachSystem(body, gui);
  // Css.set(body, 'margin-top', '2000px');
  Css.set(body, 'margin-bottom', '2000px');

  /* As of alloy 3.51.0, alloy root contains must be told about scroll events */
  DomEvent.bind(Element.fromDom(window), 'scroll', (evt) => {
    gui.broadcastEvent(SystemEvents.windowScroll(), evt);
  });

  HtmlDisplay.section(
    gui,
    'The blue panel will always stay on screen as long as the red rectangle is on screen',
    Container.sketch({
      uid: 'panel-container',
      dom: {
        styles: {
          'background': 'red',
          'margin-top': '1400px',
          'width': '500px',
          'height': '3600px',
          'z-index': '50'
        }
      },
      components: [
        Container.sketch({
          dom: {
            styles: {
              'background': '#cadbee',
              'width': '400px',
              'height': '50px',
              'border': '2px solid black',
              'position': 'absolute',
              'top': '2500px',
              'left': '150px',
              'z-index': '100'
            }
          },
          containerBehaviours: Behaviour.derive([
            Dragging.config({
              mode: 'mouse',
              blockerClass: 'blocker'
            }),

            Docking.config({
              contextual: {
                transitionClass: 'demo-alloy-dock-transition',
                fadeOutClass: 'demo-alloy-dock-fade-out',
                fadeInClass: 'demo-alloy-dock-fade-in',
                lazyContext: (component) => component.getSystem().getByUid('panel-container').toOption().map((comp) => Boxes.box(comp.element()))
              },
              leftAttr: 'data-dock-left',
              topAttr: 'data-dock-top',
              positionAttr: 'data-dock-pos'
            })
          ])
        })
      ]
    })
  );

};
