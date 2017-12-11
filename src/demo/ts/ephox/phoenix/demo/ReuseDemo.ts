import { Arr } from '@ephox/katamari';
import DomWrapping from 'ephox/phoenix/api/dom/DomWrapping';
import { Css } from '@ephox/sugar';
import { DomEvent } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Insert } from '@ephox/sugar';
import { Node } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';



export default <any> function () {
  var editor = Element.fromTag('div');
  Css.setAll(editor, {
    width: '400px',
    height: '300px',
    border: '1px solid blue'
  });
  var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

  DomEvent.bind(Element.fromDom(document), 'keydown', function (event) {
    if (event.raw().keyCode === 13) {
      var selection = window.getSelection();
      if (selection.rangeCount > 0) {
        var spans = DomWrapping.reuse(Element.fromDom(selection.anchorNode), selection.anchorOffset, Element.fromDom(selection.focusNode), selection.focusOffset, function (elem) {
          return Node.name(elem) === 'span';
        }, function () {
          return DomWrapping.nu(Element.fromTag('span'));
        });

        Arr.each(spans, function (span) {
          Css.set(span, 'border-bottom', '1px solid red');
        });
      }
    }
  });

  Insert.append(ephoxUi, editor);

  editor.dom().innerHTML = 'Hello <span style="background-color: blue;">world</span> again<br/>, this is Earth.';

  
};