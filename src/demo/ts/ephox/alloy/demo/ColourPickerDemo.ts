import { Class, Element } from '@ephox/sugar';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { ColourPicker } from 'ephox/alloy/api/ui/ColourPicker';
import HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';

import * as Memento from 'ephox/alloy/api/component/Memento';
import { Form } from 'ephox/alloy/api/ui/Form';
import { FormField } from 'ephox/alloy/api/ui/FormField';
import { Input } from 'ephox/alloy/api/ui/Input';
import { Slider } from 'ephox/alloy/api/ui/Slider';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Tabstopping } from 'ephox/alloy/api/behaviour/Tabstopping';
import { Composing } from 'ephox/alloy/api/behaviour/Composing';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';


import { Obj } from '@ephox/katamari';

export default <any> function () {
  const gui = Gui.create();
  const body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  const picker = HtmlDisplay.section(gui,
    'An example of a colour picker component',
    ColourPicker.sketch({
      dom: {
        tag: 'div',
        classes: [ 'example-colour-picker-container' ]
      },
      components: [
        {
          dom: {
            tag: 'h1',
            innerHtml: 'I am not the body'
          }
        },
        ColourPicker.parts().body({
          dom: {
            tag: 'div',
            classes: [ 'josh' ]
          }
        })
      ]
    })
  );

  setInterval(function () {
    var formOpt = Composing.getCurrent(picker);
    formOpt.each(function (form) {
      const values = Representing.getValue(form);
      Obj.each(values, function (ov, k) {
        ov.each(function (v) {
          console.log('k', k, 'v', v);
        })
      })
      console.log('values', values);
    })
  }, 5999)
};
