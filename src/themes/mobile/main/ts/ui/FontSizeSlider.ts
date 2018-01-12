import SizeSlider from './SizeSlider';
import ToolbarWidgets from './ToolbarWidgets';
import FontSizes from '../util/FontSizes';
import UiDomFactory from '../util/UiDomFactory';

const sizes = FontSizes.candidates();

const makeSlider = function (spec) {
  return SizeSlider.sketch({
    onChange: spec.onChange,
    sizes,
    category: 'font',
    getInitialValue: spec.getInitialValue
  });
};

const makeItems = function (spec) {
  return [
    UiDomFactory.spec('<span class="${prefix}-toolbar-button ${prefix}-icon-small-font ${prefix}-icon"></span>'),
    makeSlider(spec),
    UiDomFactory.spec('<span class="${prefix}-toolbar-button ${prefix}-icon-large-font ${prefix}-icon"></span>')
  ];
};

const sketch = function (realm, editor) {
  const spec = {
    onChange (value) {
      FontSizes.apply(editor, value);
    },
    getInitialValue (/* slider */) {
      return FontSizes.get(editor);
    }
  };

  return ToolbarWidgets.button(realm, 'font-size', function () {
    return makeItems(spec);
  });
};

export default {
  makeItems,
  sketch
};