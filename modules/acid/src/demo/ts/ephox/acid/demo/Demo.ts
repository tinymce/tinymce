import { Debugging, Gui, GuiFactory, Channels } from '@ephox/alloy';
import { console, document } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { Class, Element, Insert, DomEvent } from '@ephox/sugar';
import * as ColourPicker from 'ephox/acid/gui/ColourPicker';
import { strings } from '../../../../i18n/en';

const gui = Gui.create();
const body = Element.fromDom(document.body);
Class.add(gui.element(), 'gui-root-demo-container');
Insert.append(body, gui.element());

DomEvent.bind(Element.fromDom(document), 'mouseup', (evt) => {
  if (evt.raw().button === 0) {
    gui.broadcastOn([Channels.mouseReleased()], {
      target: evt.target()
    });
  }
});

const fakeTranslate = (key: string): string =>
  Option.from(strings[key]).getOrThunk(() => {
    // tslint:disable-next-line:no-console
    console.error('Missing translation for ' + key);
    return key;
  });

const fakeGetClass = (key: string): string => key;

const colourPickerFactory = ColourPicker.makeFactory(fakeTranslate, fakeGetClass);

const colourPicker = GuiFactory.build(colourPickerFactory.sketch({
  dom: {
    tag: 'div',
    classes: ['example-colour-picker']
  }
}));
gui.add(colourPicker);
Debugging.registerInspector('htmldisplay', gui);
