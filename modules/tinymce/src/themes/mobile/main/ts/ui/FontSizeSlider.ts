/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import SizeSlider from './SizeSlider';
import * as ToolbarWidgets from './ToolbarWidgets';
import FontSizes from '../util/FontSizes';
import * as UiDomFactory from '../util/UiDomFactory';
import { SketchSpec } from '@ephox/alloy';

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

const sketch = function (realm, editor): SketchSpec {
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
  }, editor);
};

export {
  makeItems,
  sketch
};