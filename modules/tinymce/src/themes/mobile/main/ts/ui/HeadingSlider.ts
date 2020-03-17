/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import { Compare, Element, Node, PredicateFind } from '@ephox/sugar';

import * as Buttons from '../ui/Buttons';
import * as SizeSlider from './SizeSlider';
import * as ToolbarWidgets from './ToolbarWidgets';
import { SketchSpec } from '@ephox/alloy';
import { MobileRealm } from '../ui/IosRealm';

const headings = [ 'p', 'h3', 'h2', 'h1' ];

const makeSlider = (spec): SketchSpec => SizeSlider.sketch({
  category: 'heading',
  sizes: headings,
  onChange: spec.onChange,
  getInitialValue: spec.getInitialValue
});

const sketch = (realm: MobileRealm, editor): SketchSpec => {
  const spec = {
    onChange(value) {
      editor.execCommand('FormatBlock', null, headings[value].toLowerCase());
    },
    getInitialValue() {
      const node = editor.selection.getStart();
      const elem = Element.fromDom(node);
      const heading = PredicateFind.closest(elem, (e) => {
        const nodeName = Node.name(e);
        return Arr.contains(headings, nodeName);
      }, (e) => Compare.eq(e, Element.fromDom(editor.getBody())));

      return heading.bind((elm) => Arr.indexOf(headings, Node.name(elm))).getOr(0);
    }
  };

  return ToolbarWidgets.button(realm, 'heading', () => [
    Buttons.getToolbarIconButton('small-heading', editor),
    makeSlider(spec),
    Buttons.getToolbarIconButton('large-heading', editor)
  ], editor);
};

export {
  sketch
};
