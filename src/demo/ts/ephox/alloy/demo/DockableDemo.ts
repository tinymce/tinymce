import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Docking from 'ephox/alloy/api/behaviour/Docking';
import Dragging from 'ephox/alloy/api/behaviour/Dragging';
import Attachment from 'ephox/alloy/api/system/Attachment';
import Gui from 'ephox/alloy/api/system/Gui';
import Container from 'ephox/alloy/api/ui/Container';
import HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';
import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { Class } from '@ephox/sugar';
import { Css } from '@ephox/sugar';



export default <any> function () {
  var gui = Gui.create();
  var body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  // Css.set(gui.element(), 'direction', 'rtl');

  Attachment.attachSystem(body, gui);
  // Css.set(body, 'margin-top', '2000px');
  Css.set(body, 'margin-bottom', '2000px');

  var dockable = HtmlDisplay.section(
    gui,
    'The blue panel will always stay on screen as long as the red rectangle is on screen',
    Container.sketch({
      uid: 'panel-container',
      dom: {
        styles: {
          background: 'red',
          'margin-top': '1400px',
          width: '500px',
          height: '3600px',
          'z-index': '50'
        }
      },
      components: [
        Container.sketch({
          dom: {
            styles: {
              background: '#cadbee',
              width: '400px',
              height: '50px',
              border: '2px solid black',
              position: 'absolute',
              top: '2500px',
              left: '150px',
              'z-index': '100'
            }
          },
          containerBehaviours: Behaviour.derive([
            Dragging.config({
              mode: 'mouse',
              blockerClass: [ 'blocker' ]
            }),

            Docking.config({
              contextual: {
                transitionClass: 'demo-alloy-dock-transition',
                fadeOutClass: 'demo-alloy-dock-fade-out',
                fadeInClass: 'demo-alloy-dock-fade-in',
                lazyContext: function (component) {
                  return component.getSystem().getByUid('panel-container').fold(Option.none, function (comp) {
                    return Option.some(comp.element());
                  });
                }
              },
              leftAttr: 'data-dock-left',
              topAttr: 'data-dock-top'
            })
          ])
        })
      ]
    })
  );

};