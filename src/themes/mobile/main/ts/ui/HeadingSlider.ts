/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import { Compare, Element, Node, PredicateFind } from '@ephox/sugar';

import Buttons from '../ui/Buttons';
import SizeSlider from './SizeSlider';
import * as ToolbarWidgets from './ToolbarWidgets';
import { SketchSpec } from '@ephox/alloy';

const headings = [ 'p', 'h3', 'h2', 'h1' ];

const makeSlider = function (spec) {
  return SizeSlider.sketch({
    category: 'heading',
    sizes: headings,
    onChange: spec.onChange,
    getInitialValue: spec.getInitialValue
  });
};

const sketch = function (realm, editor): SketchSpec {
  const spec = {
    onChange (value) {
      editor.execCommand('FormatBlock', null, headings[value].toLowerCase());
    },
    getInitialValue () {
      const node = editor.selection.getStart();
      const elem = Element.fromDom(node);
      const heading = PredicateFind.closest(elem, (e) => {
        const nodeName = Node.name(e);
        return Arr.contains(headings, nodeName);
      }, function (e) {
        return Compare.eq(e, Element.fromDom(editor.getBody()));
      });

      return heading.bind((elm) => Arr.indexOf(headings, Node.name(elm))).getOr(0);
    }
  };

  return ToolbarWidgets.button(realm, 'heading', function () {
    return [
      Buttons.getToolbarIconButton('small-heading', editor),
      makeSlider(spec),
      Buttons.getToolbarIconButton('large-heading', editor)
    ];
  }, editor);
};

export {
  sketch
};