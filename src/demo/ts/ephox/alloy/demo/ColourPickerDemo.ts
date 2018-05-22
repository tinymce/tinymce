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

import { Button } from 'ephox/alloy/api/ui/Button';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Tabstopping } from 'ephox/alloy/api/behaviour/Tabstopping';
import { Composing } from 'ephox/alloy/api/behaviour/Composing';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import { Disabling } from 'ephox/alloy/api/behaviour/Disabling';


import { Receiving } from 'ephox/alloy/api/behaviour/Receiving';

import { Obj, Merger, Arr } from '@ephox/katamari';
import { RgbForm } from 'ephox/alloy/demo/colourpicker/RgbForm';

export default <any> function () {
  const gui = Gui.create();
  const body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  const header = {
    dom: {
      tag: 'h1',
      innerHtml: 'I am not the body'
    }
  };

  const colourPicker = ColourPicker.sketch({
    dom: {
      tag: 'div',
      classes: [ 'example-colour-picker-container' ]
    }
  });

  const picker = HtmlDisplay.section(gui,
    'An example of a colour picker component',
    colourPicker
  );

};
