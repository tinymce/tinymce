import { document, window } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { Css, DomEvent, Insert, SelectorFind, SugarElement, SugarNode } from '@ephox/sugar';
import * as DomWrapping from 'ephox/phoenix/api/dom/DomWrapping';

const editor = SugarElement.fromTag('div');
Css.setAll(editor, {
  width: '400px',
  height: '300px',
  border: '1px solid blue'
});
const ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

DomEvent.bind(SugarElement.fromDom(document), 'keydown', function (event) {
  if (event.raw().keyCode === 13) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const spans = DomWrapping.reuse(SugarElement.fromDom(selection.anchorNode), selection.anchorOffset, SugarElement.fromDom(selection.focusNode), selection.focusOffset, function (elem) {
        return SugarNode.name(elem) === 'span';
      }, function () {
        return DomWrapping.nu(SugarElement.fromTag('span'));
      });

      Arr.each(spans, function (span) {
        Css.set(span, 'border-bottom', '1px solid red');
      });
    }
  }
});

Insert.append(ephoxUi, editor);

editor.dom().innerHTML = 'Hello <span style="background-color: blue;">world</span> again<br/>, this is Earth.';
