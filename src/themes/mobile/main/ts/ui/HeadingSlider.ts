import { Arr } from '@ephox/katamari';
import { Compare, Element, Node, TransformFind } from '@ephox/sugar';

import UiDomFactory from '../util/UiDomFactory';
import SizeSlider from './SizeSlider';
import ToolbarWidgets from './ToolbarWidgets';

const headings = [ 'p', 'h3', 'h2', 'h1' ];

const makeSlider = function (spec) {
  return SizeSlider.sketch({
    category: 'heading',
    sizes: headings,
    onChange: spec.onChange,
    getInitialValue: spec.getInitialValue
  });
};

const sketch = function (realm, editor) {
  const spec = {
    onChange (value) {
      editor.execCommand('FormatBlock', null, headings[value].toLowerCase());
    },
    getInitialValue () {
      const node = editor.selection.getStart();
      const elem = Element.fromDom(node);
      return TransformFind.closest(elem, function (e) {
        const nodeName = Node.name(e);
        return Arr.indexOf(headings, nodeName);
      }, function (e) {
        return Compare.eq(e, Element.fromDom(editor.getBody()));
      }).getOr(0);
    }
  };

  return ToolbarWidgets.button(realm, 'heading', function () {
    return [
      UiDomFactory.spec('<span class="${prefix}-toolbar-button ${prefix}-icon-small-heading ${prefix}-icon"></span>'),
      makeSlider(spec),
      UiDomFactory.spec('<span class="${prefix}-toolbar-button ${prefix}-icon-large-heading ${prefix}-icon"></span>')
    ];
  });
};

export default {
  sketch
};