import { console, document } from '@ephox/dom-globals';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as InsertAll from 'ephox/sugar/api/dom/InsertAll';
import * as DomEvent from 'ephox/sugar/api/events/DomEvent';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as Css from 'ephox/sugar/api/properties/Css';
import * as Html from 'ephox/sugar/api/properties/Html';

/* tslint:disable:no-console */

const container = SugarElement.fromTag('div');

const instructions = SugarElement.fromTag('p');
Html.set(instructions, 'Clicking on the button will remove "width" from the blue rectangle. Clicking it again will do nothing.');
Insert.append(container, instructions);

const button = SugarElement.fromTag('button');
Html.set(button, 'Click on me');
const input = SugarElement.fromTag('input');

InsertAll.append(container, [ button, input ]);

const doc = SugarElement.fromDom(document);
DomEvent.bind(doc, 'click', function (event) {
  console.log('target: ', event.target().dom());
  console.log('x: ', event.x());
  console.log('y: ', event.y());

  Css.remove(div, 'width');
});

const div = SugarElement.fromTag('div');
Css.setAll(div, {
  width: '100px',
  height: '300px',
  background: 'blue'
});

Insert.append(container, div);

const ephoxUi = SugarElement.fromDom(document.getElementById('ephox-ui'));
Insert.append(ephoxUi, container);
