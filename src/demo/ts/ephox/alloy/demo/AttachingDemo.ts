import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Replacing from 'ephox/alloy/api/behaviour/Replacing';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import Attachment from 'ephox/alloy/api/system/Attachment';
import Gui from 'ephox/alloy/api/system/Gui';
import Container from 'ephox/alloy/api/ui/Container';
import HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';
import { Element } from '@ephox/sugar';
import { Class } from '@ephox/sugar';



export default <any> function () {
  var gui = Gui.create();
  var body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  var list = HtmlDisplay.section(
    gui,
    'This list will change after three seconds (when the square is added to the page)',
    Container.sketch({
      dom: {
        tag: 'ol'
      },
      components: [
        {
          dom: {
            tag: 'li',
            innerHtml: 'The square is an in-memory component not connected to the system'
          }
        }
      ],

      containerBehaviours: Behaviour.derive([
        Replacing.config({ })
      ])
    })
  );

  var square = GuiFactory.build({
    dom: {
      tag: 'div',
      styles: {
        position: 'absolute',
        width: '20px',
        height: '20px',
        background: 'black'
      }
    },

    events: AlloyEvents.derive([
      AlloyEvents.runOnAttached(function (sq, simulatedEvent) {
        simulatedEvent.stop();
        Replacing.append(list, {
          dom: {
            tag: 'li',
            innerHtml: 'The square has been attached to the DOM: ' + new Date().getSeconds()
          }
        });
      }),
      
      AlloyEvents.runOnInit(function (sq, simulatedEvent) {
        simulatedEvent.stop();
        Replacing.append(list, {
          dom: {
            tag: 'li',
            innerHtml: 'The square has been added to the system: ' + new Date().getSeconds()
          }
        });
      })
    ])
  });

  setTimeout(function () {
    list.getSystem().addToWorld(square);
    setTimeout(function () {
      gui.add(square);
    }, 2000);
  }, 2000);

};