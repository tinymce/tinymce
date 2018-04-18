import { Class, Element } from '@ephox/sugar';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { ColourPicker } from 'ephox/alloy/api/ui/ColourPicker';
import HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';

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

  const stops = '#ff0000,#ff0080,#ff00ff,#8000ff,#0000ff,#0080ff,#00ffff,#00ff80,#00ff00,#80ff00,#ffff00,#ff8000,#ff0000';
  const gradientCssText = (
    'background: -ms-linear-gradient(right,' + stops + ');' +
    'background: linear-gradient(to right,' + stops + ');'
  );

  var spectrum = Slider.parts().spectrum({
    dom: {
      tag: 'div',
      attributes: {
        title: 'spectrum',
        style: gradientCssText
      },
      classes: [ 'example-slider-spectrum' ]
    }
  });

  var thumb = Slider.parts().thumb({
    dom: {
      tag: 'div',
      innerHtml: 'Thumb',
      attributes: {
        title: 'thumb'
      },
      classes: [ 'example-slider-thumb' ]
    }
  });

  var hue = ColourPicker.parts().hue({
    dom: {
      tag: 'div',
      attributes: {
        title: 'slider'
      },
      classes: [ 'example-slider' ]
    },
    components: [
      spectrum,
      thumb
    ],
    min: 0,
    max: 100,
    getInitialValue: function () { return 10; }
  })

  var renderRawInput = function (spec) {
    var pLabel = FormField.parts().label({
      dom: { tag: 'label', innerHtml: spec.label }
    });
  
    var pField = FormField.parts().field({
      factory: Input,
      // inputBehaviours: Behaviour.derive([
      //   Tabstopping.config({ })
      // ])
    });
  
    return {
      dom: {
        tag: 'div',
        classes: [ 'example-field-container' ]
      },
      components: [
        pLabel,
        pField
      ]
    };
  };
  
  var red = ColourPicker.parts().red(
    renderRawInput({
      label: 'Red'
    })
  );

  var green = ColourPicker.parts().green(
    renderRawInput({
      label: 'Green'
    })
  );

  var blue = ColourPicker.parts().blue(
    renderRawInput({
      label: 'Blue'
    })
  );

  var hex = ColourPicker.parts().hex(
    renderRawInput({
      label: 'Hex'
    })
  );

  HtmlDisplay.section(gui,
    'An example of a colour picker component',
    ColourPicker.sketch({
      dom: {
        tag: 'div',
        classes: [ 'example-colour-picker-container' ]
      },
      components: [red, green, blue, hex, hue]
    })
  );
};
