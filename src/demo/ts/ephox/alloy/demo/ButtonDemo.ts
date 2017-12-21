import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Toggling from 'ephox/alloy/api/behaviour/Toggling';
import Attachment from 'ephox/alloy/api/system/Attachment';
import Gui from 'ephox/alloy/api/system/Gui';
import Button from 'ephox/alloy/api/ui/Button';
import HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';
import DomModification from 'ephox/alloy/dom/DomModification';
import { Element } from '@ephox/sugar';
import { Class } from '@ephox/sugar';



export default <any> function () {
  var gui = Gui.create();
  var body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  var redBehaviour = Behaviour.create({
    fields: [ ],
    name: 'red.behaviour',
    active: {
      exhibit: function (base, info) {
        return DomModification.nu({
          classes: [ 'cat' ],
          attributes: {

          },
          styles: {
            color: 'red'
          }
        });
      }
    }
  });

  var catBehaviour = Behaviour.create({
    fields: [ ],
    name: 'cat.behaviour',
    active: {
      exhibit: function (base, info) {
        return DomModification.nu({
          classes: [ 'cat' ],
          attributes: {
            'data-cat': 'cat'
          },
          styles: {
            background: 'blue'
          },
          value: 10
        });
      }
    }
  });

  var button1 = HtmlDisplay.section(
    gui,
    'This button is a <code>button</code> tag with an image',
    Button.sketch({
      dom: {
        tag: 'button',
        styles: {
          'background-color': 'black',
          'background-image': 'url(http://yamaha/textbox/icons/Transforms13.png)',
          width: '20px',
          height: '20px'
        }
      },
      action: function () {
        console.log('*** Image ButtonDemo click ***');
      }
    })
  );

  var button2 = HtmlDisplay.section(
    gui,
    'This toggle button is a <code>span</code> tag with an font',
    Button.sketch({
      dom: {
        tag: 'button',
        classes: [ 'demo-alloy-bold' ],
        styles: {
          border: '1px solid #ccc',
          display: 'inline-block'
        }
      },
      action: function () {
        console.log('*** Font ButtonDemo click ***');
      },
      buttonBehaviours: Behaviour.derive([
        Toggling.config({
          toggleClass: 'demo-selected',
          aria: {
            mode: 'pressed'
          }
        })
      ])
    })
  );

  Toggling.on(button2);

  var customButton = HtmlDisplay.section(
    gui,
    'This text button has two custom behaviours. One adds (among other things) "data-cat" and ' +
    'background blue, and the other adds color red',
    Button.sketch({
      dom: {
        tag: 'span',
        innerHtml: 'Button.with.Text'
      },
      action: function () {
        console.log('*** ButtonDemo click ***');
      },

      buttonBehaviours: Behaviour.derive([
        catBehaviour.config({ }),
        redBehaviour.config({ })
      ])
    })
  );
};