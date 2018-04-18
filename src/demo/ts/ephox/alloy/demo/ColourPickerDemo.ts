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
import * as Tabstopping from 'ephox/alloy/api/behaviour/Tabstopping';


export default <any> function () {
  const gui = Gui.create();
  const body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  HtmlDisplay.section(gui,
    'An example of a colour picker component',
    ColourPicker.sketch({
      dom: {
        tag: 'div',
        classes: [ 'example-colour-picker-container' ]
      }
    })
  );
};
