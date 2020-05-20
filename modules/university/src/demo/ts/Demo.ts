import { document, console } from '@ephox/dom-globals';

import { Element, DomEvent, InsertAll, Html, Insert, Css } from '@ephox/sugar';
import { Arr } from '@ephox/katamari';


interface ClosureVariable {
  name: string;
  value: any;
}

/* tslint:disable:no-console */
const university = (() => {

  const evaluate = (code: string, imports: ClosureVariable[]) => {
    const fn = Function.apply(null, Arr.map(imports, i => i.name));
    const args = Arr.map(imports, i => i.value);

    return fn.apply(undefined, args);
  };

  return {
    evaluate
  };
})();




const container = Element.fromTag('div');

const instructions = Element.fromTag('p');
Html.set(instructions, 'Clicking on the button will remove "width" from the blue rectangle. Clicking it again will do nothing.');
Insert.append(container, instructions);

const button = Element.fromTag('button');
Html.set(button, 'Click on me');
const input = Element.fromTag('input');

InsertAll.append(container, [ button, input ]);

const doc = Element.fromDom(document);
DomEvent.bind(doc, 'click', function (event) {
  console.log('target: ', event.target().dom());
  console.log('x: ', event.x());
  console.log('y: ', event.y());

  Css.remove(div, 'width');
});

const div = Element.fromTag('div');
Css.setAll(div, {
  width: '100px',
  height: '300px',
  background: 'magenta'
});

Insert.append(container, div);

const ephoxUi = Element.fromDom(document.getElementById('ephox-ui'));
Html.set(ephoxUi, 'I did this');
Insert.append(ephoxUi, container);
