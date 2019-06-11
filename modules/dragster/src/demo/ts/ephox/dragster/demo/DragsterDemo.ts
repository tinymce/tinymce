import { document } from '@ephox/dom-globals';
import { Css, DomEvent, Element, Insert, SelectorFind } from '@ephox/sugar';
import Dragger from 'ephox/dragster/api/Dragger';
import Sizers from 'ephox/dragster/demo/Sizers';
import * as Grow from 'ephox/dragster/transform/Grow';
import * as Relocate from 'ephox/dragster/transform/Relocate';

// const container = $('<div/>').append('Hi.');

// const dialog = Dragster();

// const titlebar = Element.fromText('title', document);

// const content = (function () {
//   const text = Element.fromText('This is the body of the text ...', document);
//   const p = Element.fromTag('p');
//   Insert.append(p, text);
//   return p;
// })();

// dialog.setHeader(titlebar);
// dialog.setContent(content);

// // Demonstrate that dialog can change after being created.
// setTimeout(function () {
//   dialog.setHeader(Element.fromText('blah'));
//   dialog.setContent(Element.fromText('new content'));
// }, 5000);

// container.append(dialog.element().dom());

// $('#ephox-ui').append(container);

// dialog.show(10, 10);

const div = Element.fromTag('div');
Css.setAll(div, {
  position: 'absolute',
  left: '10px',
  top: '20px',
  width: '100px',
  height: '50px',
  background: 'blue'
});

// will need closers.
const sizers = Sizers();

DomEvent.bind(div, 'mousedown', function () {
  sizers.show();
  sizers.update(div);
  relocater.on();
});

const ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();
Insert.append(ephoxUi, div);

const neGrow = Grow.both(div);
neGrow.events.grow.bind(function () {
  sizers.hide();
  relocater.off();
});

const relocate = Relocate.both(div);
relocate.events.relocate.bind(function () {
  sizers.hide();
});

const grower = Dragger.transform(neGrow);
grower.events.stop.bind(function () {
  sizers.update(div);
  sizers.show();
  relocater.on();
});
grower.on();
DomEvent.bind(sizers.southeast().element(), 'mousedown', function () {
  grower.go(ephoxUi);
});

const relocater = Dragger.transform(relocate);
relocater.events.stop.bind(function () {
  sizers.update(div);
  sizers.show();
});
DomEvent.bind(div, 'mousedown', function () {
  relocater.go(Element.fromDom(document.body));
});
relocater.off();
