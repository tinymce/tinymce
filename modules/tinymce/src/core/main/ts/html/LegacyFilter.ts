/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';

import DomParser, { DomParserSettings } from '../api/html/DomParser';
import AstNode from '../api/html/Node';
import Styles from '../api/html/Styles';
import Tools from '../api/util/Tools';

const removeAttrs = (node: AstNode, names: string[]): void => {
  Arr.each(names, (name) => {
    node.attr(name, null);
  });
};

const addFontToSpansFilter = (domParser: DomParser, styles: Styles, fontSizes: string[]): void => {
  domParser.addNodeFilter('font', (nodes) => {
    Arr.each(nodes, (node) => {
      const props = styles.parse(node.attr('style'));
      const color = node.attr('color');
      const face = node.attr('face');
      const size = node.attr('size');

      if (color) {
        props.color = color;
      }

      if (face) {
        props['font-family'] = face;
      }

      if (size) {
        props['font-size'] = fontSizes[parseInt(node.attr('size'), 10) - 1];
      }

      node.name = 'span';
      node.attr('style', styles.serialize(props));
      removeAttrs(node, [ 'color', 'face', 'size' ]);
    });
  });
};

const addStrikeToSpanFilter = (domParser: DomParser, styles: Styles): void => {
  domParser.addNodeFilter('strike', (nodes) => {
    Arr.each(nodes, (node) => {
      const props = styles.parse(node.attr('style'));

      props['text-decoration'] = 'line-through';

      node.name = 'span';
      node.attr('style', styles.serialize(props));
    });
  });
};

const addFilters = (domParser: DomParser, settings: DomParserSettings): void => {
  const styles = Styles();

  if (settings.convert_fonts_to_spans) {
    addFontToSpansFilter(domParser, styles, Tools.explode(settings.font_size_legacy_values));
  }

  addStrikeToSpanFilter(domParser, styles);
};

const register = (domParser: DomParser, settings: DomParserSettings): void => {
  if (settings.inline_styles) {
    addFilters(domParser, settings);
  }
};

export {
  register
};
