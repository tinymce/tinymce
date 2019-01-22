import { Debugging, Gui, GuiFactory } from '@ephox/alloy';
import { document } from '@ephox/dom-globals';
import { Class, Element, Insert } from '@ephox/sugar';
import ColourPicker from 'ephox/acid/gui/ColourPicker';

import { strings } from '../../../../i18n/en';

const gui = Gui.create();
const body = Element.fromDom(document.body);
Class.add(gui.element(), 'gui-root-demo-container');
Insert.append(body, gui.element());

var fakeTranslate = (key) => strings[key];

const fakeGetClass = (key) => key;

const colourPickerFactory = ColourPicker.makeFactory(fakeTranslate, fakeGetClass);

const colourPicker = GuiFactory.build(colourPickerFactory.sketch({
  dom: {
    tag: 'div',
    classes: [ 'example-colour-picker' ]
  }
}));
gui.add(colourPicker);
Debugging.registerInspector('htmldisplay', gui);